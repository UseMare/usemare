import { hasSupabase, restGet } from './supabaseLazy.js'
import { setCategories, setProducts } from './products.js'
import { store } from './store.js'
import { setContent } from './content.js'

// Catálogo, categorias, conteúdo e configurações vindos do Supabase.
// 1) Ao abrir, o site usa na hora a cópia salva da última visita (ou o catálogo local).
// 2) Em seguida busca a versão atual no banco, atualiza a tela e guarda a nova cópia.
// Se o Supabase estiver fora do ar, nada quebra: segue com o que já tinha.

const CACHE_KEY = 'mare-catalogo-v2'

const PRODUCT_FIELDS = `id, code, slug, old_slugs, name, kind, brand, price, old_price, available, sort_order, description,
  colors, sizes, details, flavors, package_size, usage, notice, installments_times, installment_value, installment_note,
  product_images ( path, thumb_path, position ),
  product_categories ( category_id )`

const CATEGORY_FIELDS = `id, slug, name, kind, sort_order, active, home_card, home_card_order, home_title, home_image, home_tone,
  banner_eyebrow, banner_title, banner_text`

const SETTINGS_FIELDS = `whatsapp, instagram_url, instagram_handle, installments_max, announcement,
  logo_url, logo_footer_url, social, footer_text, spotlight_enabled, spotlight_ids`

// Linha do banco → mesmo formato do catálogo local (id = código '01', '02'…; uuid = id do banco).
const fromRow = (row, slugById) => {
  const images = [...(row.product_images || [])].sort((a, b) => a.position - b.position)
  return {
    id: row.code,
    uuid: row.id,
    slug: row.slug,
    oldSlugs: row.old_slugs || [], // endereços antigos: ainda abrem e redirecionam para o atual
    name: row.name,
    kind: row.kind,
    brand: row.brand,
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    available: row.available,
    description: row.description,
    colors: row.colors || [],
    sizes: row.sizes || [],
    details: row.details || [],
    categorySlugs: (row.product_categories || []).map(pc => slugById[pc.category_id]).filter(Boolean),
    flavors: row.flavors?.length ? row.flavors : undefined,
    size: row.package_size,
    usage: row.usage,
    notice: row.notice,
    installmentsTimes: row.installments_times || undefined, // vazio = padrão da loja
    installmentValue: row.installment_value ? Number(row.installment_value) : undefined,
    installmentNote: row.installment_note || undefined,
    photos: images.length ? images.map(i => i.path) : ['/placeholder.svg'],
    thumbs: images.length ? images.map(i => i.thumb_path) : ['/placeholder.svg'],
  }
}

const applySettings = settings => {
  if (!settings) return
  store.whatsapp = settings.whatsapp || ''
  store.instagram = settings.instagram_url || store.instagram
  store.instagramHandle = settings.instagram_handle || store.instagramHandle
  store.installments = settings.installments_max || store.installments
  if (settings.announcement?.length) store.announcement = settings.announcement
  store.logo = settings.logo_url || store.logo
  store.logoFooter = settings.logo_footer_url || null
  store.social = settings.social || []
  if (settings.footer_text !== null && settings.footer_text !== undefined) store.footerText = settings.footer_text
  store.spotlight = { enabled: settings.spotlight_enabled !== false, ids: settings.spotlight_ids || [] }
}

const apply = ({ rows, categories, settings, content }) => {
  applySettings(settings) // antes dos produtos: as parcelas dependem dela
  if (categories?.length) setCategories(categories)
  setContent(content)
  const slugById = Object.fromEntries((categories || []).map(c => [c.id, c.slug]))
  setProducts(rows.map(row => fromRow(row, slugById)))
}

// Usa a cópia da última visita já no carregamento do módulo (antes da primeira tela).
try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
  if (cached?.rows?.length) apply(cached)
} catch { /* sem cache: segue com o catálogo local */ }

export async function refreshCatalog() {
  if (!hasSupabase) return false
  // Chamadas simples à API do banco (sem baixar o supabase-js na primeira tela).
  const q = fields => encodeURIComponent(fields.replace(/\s+/g, ''))
  let rows, categories, settings, content
  try {
    ;[rows, categories, settings, content] = await Promise.all([
      restGet(`products?select=${q(PRODUCT_FIELDS)}&active=eq.true&order=sort_order,name`),
      restGet(`categories?select=${q(CATEGORY_FIELDS)}&active=eq.true&order=sort_order`).catch(() => []),
      restGet(`store_settings?select=${q(SETTINGS_FIELDS)}&limit=1`).then(r => r[0] || null).catch(() => null),
      restGet('site_content?select=key,value').catch(() => []),
    ])
  } catch (error) {
    console.warn('Não foi possível carregar o catálogo do Supabase.', error)
    return false
  }
  if (!rows?.length) return false
  const payload = {
    rows,
    categories: categories || [],
    settings,
    content: Object.fromEntries((content || []).map(r => [r.key, r.value])),
  }
  apply(payload)
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)) } catch { /* navegação privada */ }
  return true
}

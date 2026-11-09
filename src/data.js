import { supabase } from './supabase.js'
import { setProducts } from './products.js'
import { store } from './store.js'

// Catálogo e configurações vindos do Supabase.
// 1) Ao abrir, o site usa na hora a cópia salva da última visita (ou o catálogo local).
// 2) Em seguida busca a versão atual no banco, atualiza a tela e guarda a nova cópia.
// Se o Supabase estiver fora do ar, nada quebra: segue com o que já tinha.

const CACHE_KEY = 'mare-catalogo-v1'

const PRODUCT_FIELDS = `id, code, slug, name, type, line, category_label, color, swatch, brand, price, old_price,
  available, spotlight, sort_order, description, flavors, package_size, usage, notice,
  product_images ( path, thumb_path, position )`

// Linha do banco → mesmo formato do catálogo local (id = código '01', '02'…; uuid = id do banco).
const fromRow = row => {
  const images = [...(row.product_images || [])].sort((a, b) => a.position - b.position)
  return {
    id: row.code,
    uuid: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    line: row.line,
    category: row.category_label,
    color: row.color,
    swatch: row.swatch,
    brand: row.brand,
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    available: row.available,
    spotlight: row.spotlight,
    description: row.description,
    flavors: row.flavors?.length ? row.flavors : undefined,
    size: row.package_size,
    usage: row.usage,
    notice: row.notice,
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
}

const apply = ({ rows, settings }) => {
  applySettings(settings) // antes dos produtos: as parcelas dependem dela
  setProducts(rows.map(fromRow))
}

// Usa a cópia da última visita já no carregamento do módulo (antes da primeira tela).
try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
  if (cached?.rows?.length) apply(cached)
} catch { /* sem cache: segue com o catálogo local */ }

export async function refreshCatalog() {
  if (!supabase) return false
  const [productsRes, settingsRes] = await Promise.all([
    supabase.from('products').select(PRODUCT_FIELDS).order('sort_order').order('name'),
    supabase.from('store_settings').select('whatsapp, instagram_url, instagram_handle, installments_max').maybeSingle(),
  ])
  if (productsRes.error || !productsRes.data?.length) {
    console.warn('Não foi possível carregar o catálogo do Supabase.', productsRes.error)
    return false
  }
  const payload = { rows: productsRes.data, settings: settingsRes.data }
  apply(payload)
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)) } catch { /* navegação privada */ }
  return true
}

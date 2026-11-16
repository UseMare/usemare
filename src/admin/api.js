import { supabase } from '../supabase.js'

// Acesso ao banco usado pelo painel. Toda gravação passa pelas policies do Supabase
// (só contas admin conseguem criar, editar ou excluir).

const must = ({ data, error }) => { if (error) throw error; return data }

export const PRODUCT_COLUMNS = `id, code, slug, name, kind, brand, price, old_price, available, active, sort_order, description,
  colors, sizes, details, flavors, package_size, usage, notice, created_at, updated_at,
  product_images ( id, path, thumb_path, alt, position ),
  product_categories ( category_id )`

const sortImages = product => ({ ...product, product_images: [...(product.product_images || [])].sort((a, b) => a.position - b.position) })

// ---------- Produtos ----------
export async function listProducts() {
  const rows = must(await supabase.from('products').select(PRODUCT_COLUMNS).order('sort_order').order('name'))
  return rows.map(sortImages)
}

export async function getProduct(id) {
  const row = must(await supabase.from('products').select(PRODUCT_COLUMNS).eq('id', id).maybeSingle())
  return row ? sortImages(row) : null
}

export async function updateProduct(id, patch) {
  return must(await supabase.from('products').update(patch).eq('id', id).select('id').single())
}

// Grava a nova ordem: só os produtos que mudaram de posição.
export async function reorderProducts(orderedIds, current) {
  const changes = orderedIds
    .map((id, index) => ({ id, sort_order: (index + 1) * 10 }))
    .filter(({ id, sort_order }) => current.find(p => p.id === id)?.sort_order !== sort_order)
  await Promise.all(changes.map(c => supabase.from('products').update({ sort_order: c.sort_order }).eq('id', c.id).then(must)))
  return changes.length
}

// Próximo código livre ('24', '25'…), usado também como prefixo das fotos.
export async function nextProductCode() {
  const rows = must(await supabase.from('products').select('code'))
  const max = rows.reduce((m, r) => Math.max(m, parseInt(r.code, 10) || 0), 0)
  return String(max + 1).padStart(2, '0')
}

export const slugify = text => (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'produto'

// Endereço único: "vestido-azul", "vestido-azul-2"…
export async function uniqueSlug(base, table = 'products', ignoreId = null) {
  const root = slugify(base)
  const rows = must(await supabase.from(table).select('id, slug').like('slug', `${root}%`))
  const taken = new Set(rows.filter(r => r.id !== ignoreId).map(r => r.slug))
  if (!taken.has(root)) return root
  let n = 2
  while (taken.has(`${root}-${n}`)) n++
  return `${root}-${n}`
}

// Duplica: cópia fica OCULTA (não aparece no site até a dona revisar e ativar).
export async function duplicateProduct(product, sortOrder) {
  const code = await nextProductCode()
  const name = `${product.name} (cópia)`.slice(0, 120)
  const slug = await uniqueSlug(name)
  const { id, product_images, product_categories, created_at, updated_at, code: _c, slug: _s, ...fields } = product
  const copy = must(await supabase.from('products').insert({ ...fields, code, slug, name, active: false, sort_order: sortOrder }).select('id').single())
  if (product_categories?.length) {
    must(await supabase.from('product_categories').insert(product_categories.map(pc => ({ product_id: copy.id, category_id: pc.category_id }))))
  }
  if (product_images?.length) {
    // As fotos são as mesmas (mesmo arquivo); ao trocar fotos da cópia, as do original não são afetadas.
    must(await supabase.from('product_images').insert(product_images.map(img => ({ product_id: copy.id, path: img.path, thumb_path: img.thumb_path, alt: img.alt, position: img.position }))))
  }
  return copy.id
}

// ---------- Arquivos no Storage ----------
const STORAGE_MARK = '/storage/v1/object/public/'
// URL pública → { bucket, path } (só para arquivos do nosso Storage; fotos de /img/ do site ficam).
export const storageRef = url => {
  const i = (url || '').indexOf(STORAGE_MARK)
  if (i < 0) return null
  const [bucket, ...rest] = url.slice(i + STORAGE_MARK.length).split('?')[0].split('/')
  return { bucket, path: decodeURIComponent(rest.join('/')) }
}

// Apaga do Storage os arquivos que nenhum produto usa mais.
export async function removeUnusedFiles(urls) {
  const unique = [...new Set(urls.filter(Boolean))]
  if (!unique.length) return
  const stillUsed = new Set()
  for (const column of ['path', 'thumb_path']) {
    const rows = must(await supabase.from('product_images').select(column).in(column, unique))
    rows.forEach(r => stillUsed.add(r[column]))
  }
  const byBucket = {}
  unique.filter(u => !stillUsed.has(u)).map(storageRef).filter(Boolean).forEach(({ bucket, path }) => {
    (byBucket[bucket] ||= []).push(path)
  })
  const results = await Promise.all(Object.entries(byBucket).map(([bucket, paths]) => supabase.storage.from(bucket).remove(paths)))
  results.forEach(({ error }) => { if (error) console.warn('Não foi possível apagar arquivo do Storage:', error.message) })
}

export async function deleteProduct(product) {
  const files = (product.product_images || []).flatMap(img => [img.path, img.thumb_path])
  must(await supabase.from('products').delete().eq('id', product.id))
  // tira o produto dos destaques, se estiver lá
  const settings = must(await supabase.from('store_settings').select('spotlight_ids').eq('id', 1).maybeSingle())
  if (settings?.spotlight_ids?.includes(product.id)) {
    must(await supabase.from('store_settings').update({ spotlight_ids: settings.spotlight_ids.filter(x => x !== product.id) }).eq('id', 1))
  }
  await removeUnusedFiles(files).catch(() => { /* arquivo órfão não impede a exclusão */ })
}

// ---------- Categorias ----------
export async function listCategories() {
  return must(await supabase.from('categories').select('*').order('sort_order').order('name'))
}

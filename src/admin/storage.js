import { supabase } from '../supabase.js'

// Envio de imagens para o Storage do Supabase (buckets 'produtos' e 'site').
// Cada envio usa um nome novo, então o navegador nunca mostra uma versão antiga em cache.

const stamp = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export async function uploadImage(bucket, path, blob) {
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type || 'image/webp', cacheControl: '31536000', upsert: false })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

// Envia as versões de uma mesma imagem com o mesmo nome-base:
//   pasta/abc123.webp, pasta/abc123-480.webp …   (sufixos na mesma ordem dos blobs)
export async function uploadVariants(bucket, folder, blobs, suffixes) {
  const base = `${folder}/${stamp()}`
  return Promise.all(blobs.map((blob, i) => uploadImage(bucket, `${base}${suffixes[i] ? `-${suffixes[i]}` : ''}.webp`, blob)))
}

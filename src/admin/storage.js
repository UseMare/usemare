import { supabase } from '../supabase.js'

// Envio de imagens para o Storage do Supabase (buckets 'produtos' e 'site').
// Cada envio usa um nome novo, então o navegador nunca mostra uma versão antiga em cache.

const stamp = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export async function uploadImage(bucket, path, blob) {
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type || 'image/webp', cacheControl: '31536000', upsert: false })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

// Logo enviado sem recorte: reduz para no máx. `maxWidth` px em WebP (mantém a transparência) e
// grava o tamanho no nome (logo/abc-300x197.webp): o site lê dali a largura/altura da <img>.
// SVG e GIF vão como vieram.
export async function uploadShrunk(bucket, folder, file, maxWidth = 300) {
  if (/svg|gif/i.test(file.type)) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
    return uploadImage(bucket, `${folder}/${stamp()}.${ext}`, file)
  }
  const bitmap = await createImageBitmap(file)
  const w = Math.min(maxWidth, bitmap.width)
  const h = Math.round(bitmap.height * w / bitmap.width)
  const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h })
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.88))
  return uploadImage(bucket, `${folder}/${stamp()}-${w}x${h}.webp`, blob)
}

// Envia as versões de uma mesma imagem com o mesmo nome-base:
//   pasta/abc123.webp, pasta/abc123-480.webp …   (sufixos na mesma ordem dos blobs)
export async function uploadVariants(bucket, folder, blobs, suffixes) {
  const base = `${folder}/${stamp()}`
  return Promise.all(blobs.map((blob, i) => uploadImage(bucket, `${base}${suffixes[i] ? `-${suffixes[i]}` : ''}.webp`, blob)))
}

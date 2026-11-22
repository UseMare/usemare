import React, { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Crop, ImagePlus, Star, Trash2 } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { removeUnusedFiles } from '../api.js'
import { uploadVariants } from '../storage.js'
import ImageCropper from './ImageCropper.jsx'

// Fotos do produto no editor.
// Cada foto escolhida passa pela janela de recorte (3 × 4) antes de entrar na lista.
// Nada é enviado ao Storage até a dona clicar em Salvar (syncPhotos).
//
// Formato de cada foto na lista:
//   já salva:  { id, path, thumb_path }
//   nova:      { key, preview, blobs: [grande, miniatura] }

export const PRODUCT_PHOTO = { aspect: 3 / 4, outputs: [{ width: 900, height: 1200, quality: 0.86, watermark: true }, { width: 480, height: 640, quality: 0.8 }, { width: 320, height: 427, quality: 0.78 }, { width: 900, height: 1200, quality: 0.86 }] }
// A grande leva o logo da Maré; a última (-orig, sem logo) serve só para reajustar o recorte sem duplicar o logo.
// Foto sem logo de uma foto salva: local NN-NN-m.webp -> NN-NN.webp; enviada pelo painel X.webp -> X-orig.webp.
const originalOf = path => /\/img\/produtos\/.+-m\.webp$/.test(path) ? path.replace(/-m\.webp$/, '.webp')
  : /^https?:/.test(path) ? path.replace(/\.webp$/, '-orig.webp') : path
const MAX_PHOTOS = 10
const MAX_FILE_MB = 25

export default function ProductPhotos({ photos, onChange }) {
  const input = useRef(null)
  const [queue, setQueue] = useState([])        // arquivos esperando o recorte
  const [queueTotal, setQueueTotal] = useState(0)
  const [recrop, setRecrop] = useState(null)    // { index, src } da foto sendo reajustada
  const [warning, setWarning] = useState(null)

  const pick = event => {
    const files = [...event.target.files]
    event.target.value = ''
    setWarning(null)
    const images = files.filter(f => f.type.startsWith('image/'))
    const tooBig = images.filter(f => f.size > MAX_FILE_MB * 1024 * 1024)
    const ok = images.filter(f => f.size <= MAX_FILE_MB * 1024 * 1024).slice(0, Math.max(0, MAX_PHOTOS - photos.length))
    if (images.length < files.length) setWarning('Alguns arquivos não são imagens e foram ignorados.')
    if (tooBig.length) setWarning(`Arquivo muito grande (máx. ${MAX_FILE_MB} MB): ${tooBig.map(f => f.name).join(', ')}.`)
    if (images.length - tooBig.length > ok.length) setWarning(`Cada produto pode ter até ${MAX_PHOTOS} fotos.`)
    if (!ok.length) return
    setQueue(ok.map(file => ({ file, url: URL.createObjectURL(file) })))
    setQueueTotal(ok.length)
  }

  const nextInQueue = () => setQueue(q => { URL.revokeObjectURL(q[0]?.url); return q.slice(1) })
  const cancelQueue = () => { queue.forEach(item => URL.revokeObjectURL(item.url)); setQueue([]) }

  const addCropped = blobs => {
    onChange([...photos, { key: Math.random().toString(36).slice(2), preview: URL.createObjectURL(blobs[1]), blobs }])
    nextInQueue()
  }

  const openRecrop = index => {
    const photo = photos[index]
    // foto nova: reajusta a partir da versão grande sem logo; foto salva: a partir do arquivo sem logo
    setRecrop({ index, src: photo.blobs ? URL.createObjectURL(photo.blobs[3] || photo.blobs[0]) : originalOf(photo.path), temp: Boolean(photo.blobs) })
  }
  const closeRecrop = () => { if (recrop?.temp) URL.revokeObjectURL(recrop.src); setRecrop(null) }
  const replaceCropped = blobs => {
    onChange(photos.map((p, i) => i === recrop.index ? { key: Math.random().toString(36).slice(2), preview: URL.createObjectURL(blobs[1]), blobs } : p))
    closeRecrop()
  }

  const move = (from, to) => {
    if (to < 0 || to >= photos.length) return
    const list = [...photos]
    const [item] = list.splice(from, 1)
    list.splice(to, 0, item)
    onChange(list)
  }

  const current = queue[0]

  return (
    <div className="adm-photos">
      {warning && <p className="adm-notice is-warn">{warning}</p>}
      <div className="adm-photo-grid">
        {photos.map((photo, i) => (
          <figure key={photo.id || photo.key} className="adm-photo">
            <img src={photo.preview || photo.thumb_path} alt={`Foto ${i + 1}`} />
            {i === 0 && <span className="adm-photo-cover"><Star /> Capa</span>}
            {photo.blobs && <span className="adm-photo-new">Nova</span>}
            <figcaption>
              <button type="button" className="adm-icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Mover para a esquerda" title="Mover para a esquerda"><ArrowLeft /></button>
              <button type="button" className="adm-icon-btn" onClick={() => openRecrop(i)} aria-label="Ajustar recorte" title="Ajustar recorte"><Crop /></button>
              {i > 0 && <button type="button" className="adm-icon-btn" onClick={() => move(i, 0)} aria-label="Usar como capa" title="Usar como capa"><Star /></button>}
              <button type="button" className="adm-icon-btn danger" onClick={() => onChange(photos.filter((_, j) => j !== i))} aria-label="Remover foto" title="Remover foto"><Trash2 /></button>
              <button type="button" className="adm-icon-btn" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} aria-label="Mover para a direita" title="Mover para a direita"><ArrowRight /></button>
            </figcaption>
          </figure>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button type="button" className="adm-photo-add" onClick={() => input.current.click()}>
            <ImagePlus />
            <span>Adicionar fotos</span>
            <small>JPG, PNG ou WebP · cada uma passa pelo ajuste</small>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={pick} />
      {!photos.length && <p className="adm-hint">Sem fotos, aparece uma imagem genérica.</p>}

      {current && (
        <ImageCropper
          key={current.url}
          src={current.url}
          {...PRODUCT_PHOTO}
          title="Ajustar foto do produto"
          step={queueTotal > 1 ? `Foto ${queueTotal - queue.length + 1} de ${queueTotal}` : null}
          onSkip={queueTotal > 1 ? nextInQueue : undefined}
          onCancel={cancelQueue}
          onConfirm={addCropped}
        />
      )}
      {recrop && (
        <ImageCropper
          key={recrop.src}
          src={recrop.src}
          {...PRODUCT_PHOTO}
          title="Ajustar recorte"
          confirmLabel="Aplicar ajuste"
          onCancel={closeRecrop}
          onConfirm={replaceCropped}
        />
      )}
    </div>
  )
}

// Ao salvar o produto: envia as fotos novas, regrava a lista na ordem e apaga do Storage
// os arquivos das fotos removidas (se nenhum outro produto usar).
export async function syncPhotos({ productId, code, name, photos, previous }) {
  const finalList = []
  for (const photo of photos) {
    if (photo.blobs) {
      const [path, thumb_path] = await uploadVariants('produtos', code, photo.blobs, ['', '480', '320', 'orig'])
      finalList.push({ path, thumb_path })
    } else {
      finalList.push({ path: photo.path, thumb_path: photo.thumb_path })
    }
  }

  const before = previous.map(p => `${p.position}|${p.path}`).join(',')
  const after = finalList.map((p, i) => `${i}|${p.path}`).join(',')
  if (before !== after) {
    const { error: delError } = await supabase.from('product_images').delete().eq('product_id', productId)
    if (delError) throw delError
    if (finalList.length) {
      const { error } = await supabase.from('product_images').insert(finalList.map((p, i) => ({ product_id: productId, path: p.path, thumb_path: p.thumb_path, alt: `${name} — foto ${i + 1}`, position: i })))
      if (error) throw error
    }
  }

  const kept = new Set(finalList.flatMap(p => [p.path, p.thumb_path]))
  const dropped = previous.flatMap(p => [p.path, p.thumb_path]).filter(u => !kept.has(u))
  if (dropped.length) await removeUnusedFiles(dropped).catch(() => {})
}

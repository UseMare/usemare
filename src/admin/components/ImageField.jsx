import React, { useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import { storageRef } from '../api.js'
import { supabase } from '../../supabase.js'
import { uploadImage, uploadShrunk, uploadVariants } from '../storage.js'
import ImageCropper from './ImageCropper.jsx'
import { InfoTip } from '../ui.jsx'

// Campo de imagem com prévia, usado em categorias, hero, banners e logo.
// value: URL salva | { preview, blobs } (recortada, ainda não enviada) | { preview, file } (sem recorte) | null
// Com `aspect` + `outputs`, a imagem passa pela janela de recorte; sem eles (logo), vai como está.
// Nada é enviado até a tela chamar resolveImage() ao salvar.

export default function ImageField({ label, hint, value, onChange, aspect, outputs, previewRatio, allowRemove = false, accept = 'image/*' }) {
  const input = useRef(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [error, setError] = useState(null)
  const preview = typeof value === 'string' ? value : value?.preview

  const pick = event => {
    const file = event.target.files[0]
    event.target.value = ''
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Escolha um arquivo de imagem (JPG, PNG, WebP ou SVG).')
    if (file.size > 25 * 1024 * 1024) return setError('Imagem muito grande (máximo 25 MB).')
    if (aspect && outputs) setCropSrc(URL.createObjectURL(file))
    else {
      if (file.size > 5 * 1024 * 1024) return setError('Para logo, use um arquivo de até 5 MB.')
      onChange({ preview: URL.createObjectURL(file), file })
    }
  }

  return (
    <div className="adm-field adm-imagefield">
      {label && <span>{label}{hint && <InfoTip>{hint}</InfoTip>}</span>}
      <div className="adm-imagefield-box">
        <div className="adm-imagefield-preview" style={{ aspectRatio: previewRatio || aspect || 'auto' }}>
          {preview ? <img src={preview} alt="" /> : <ImagePlus />}
        </div>
        <div className="adm-imagefield-actions">
          {!label && hint && <InfoTip>{hint}</InfoTip>}
          <button type="button" className="adm-btn outline small" onClick={() => input.current.click()}>
            {preview ? <><RefreshCw /> Trocar imagem</> : <><ImagePlus /> Escolher imagem</>}
          </button>
          {preview && aspect && outputs && typeof value === 'string' && (
            <button type="button" className="adm-btn ghost small" onClick={() => setCropSrc(value)}>Ajustar recorte</button>
          )}
          {preview && allowRemove && <button type="button" className="adm-btn danger-text small" onClick={() => onChange(null)}><Trash2 /> Remover</button>}
          {error && <small className="adm-field-error">{error}</small>}
        </div>
      </div>
      <input ref={input} type="file" accept={accept} hidden onChange={pick} />
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          outputs={outputs}
          title={label ? `Ajustar: ${label}` : 'Ajustar imagem'}
          confirmLabel="Usar esta imagem"
          onCancel={() => setCropSrc(null)}
          onConfirm={blobs => { onChange({ preview: URL.createObjectURL(blobs[0]), blobs }); setCropSrc(null) }}
        />
      )}
    </div>
  )
}

// Envia a imagem pendente (se houver) e devolve a URL final.
// suffixes: nomes das versões geradas no recorte (ex.: ['', '800'] → foto.webp e foto-800.webp)
export async function resolveImage(value, folder, suffixes = ['']) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value.blobs) return (await uploadVariants('site', folder, value.blobs, suffixes))[0]
  if (value.file && folder === 'logo') return uploadShrunk('site', folder, value.file) // logo leve, com o tamanho no nome
  if (value.file) {
    const ext = (value.file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
    return uploadImage('site', `${folder}/${Date.now().toString(36)}.${ext}`, value.file)
  }
  return null
}

// Apaga do Storage uma imagem do site que foi trocada (e as versões leves dela).
export async function removeSiteImage(url, suffixes = ['']) {
  const ref = storageRef(url)
  if (!ref || ref.bucket !== 'site') return
  const paths = suffixes.map(s => s ? ref.path.replace(/(\.[a-z0-9]+)$/i, `-${s}$1`) : ref.path)
  const { error } = await supabase.storage.from('site').remove(paths)
  if (error) console.warn('Não foi possível apagar a imagem antiga:', error.message)
}

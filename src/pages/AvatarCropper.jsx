import React, { useEffect, useRef, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'

// Ajuste da foto de perfil (Minha conta): moldura redonda 1:1, arrastar para posicionar e
// zoom (barra, roda do mouse ou dois dedos). Ao confirmar, gera um WebP pequeno e leve
// (SIZE × SIZE, qualidade 50%) — ~10–20 KB por cliente.

const SIZE = 320
const QUALITY = 0.5

export default function AvatarCropper({ file, onCancel, onConfirm }) {
  const [src, setSrc] = useState(null)
  const [img, setImg] = useState(null)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const drag = useRef(null)
  const pinch = useRef(null)
  const frame = Math.round(Math.min(300, (typeof window !== 'undefined' ? window.innerWidth : 400) - 88))

  useEffect(() => {
    let alive = true // ignora a resposta de uma carga já desfeita (ex.: montagem dupla do React)
    const url = URL.createObjectURL(file)
    setSrc(url)
    setError(null)
    const image = new Image()
    image.onload = () => { if (alive) setImg(image) }
    image.onerror = () => { if (alive) setError('Não foi possível abrir esta foto. Use JPG, PNG ou WEBP.') }
    image.src = url
    return () => { alive = false; URL.revokeObjectURL(url) }
  }, [file])

  // Esc fecha; a página atrás não rola enquanto a janela está aberta
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && !busy) onCancel() }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [busy, onCancel])

  const base = img ? Math.max(frame / img.naturalWidth, frame / img.naturalHeight) : 1
  const scale = base * zoom
  const w = img ? img.naturalWidth * scale : 0
  const h = img ? img.naturalHeight * scale : 0
  const clamp = (p, ww = w, hh = h) => ({ x: Math.min(0, Math.max(frame - ww, p.x)), y: Math.min(0, Math.max(frame - hh, p.y)) })

  useEffect(() => {
    if (!img) return
    setPos({ x: (frame - img.naturalWidth * base) / 2, y: (frame - img.naturalHeight * base) / 2 })
  }, [img, frame]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyZoom = next => {
    if (!img) return
    const z = Math.min(4, Math.max(1, next))
    const c = frame / 2, ratio = z / zoom
    setPos(p => clamp({ x: c - (c - p.x) * ratio, y: c - (c - p.y) * ratio }, img.naturalWidth * base * z, img.naturalHeight * base * z))
    setZoom(z)
  }

  const onPointerDown = e => {
    if (!img) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: pos }
  }
  const onPointerMove = e => {
    if (!drag.current || drag.current.id !== e.pointerId || pinch.current) return
    const { x, y, start } = drag.current
    setPos(clamp({ x: start.x + e.clientX - x, y: start.y + e.clientY - y }))
  }
  const onPointerUp = () => { drag.current = null }
  const onWheel = e => { e.preventDefault(); applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)) }
  const onTouchMove = e => {
    if (e.touches.length !== 2) return
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    if (!pinch.current) pinch.current = { d, zoom }
    else applyZoom(pinch.current.zoom * d / pinch.current.d)
  }
  const onTouchEnd = e => { if (e.touches.length < 2) pinch.current = null }

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, -pos.x / scale, -pos.y / scale, frame / scale, frame / scale, 0, 0, SIZE, SIZE)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', QUALITY))
      if (!blob || blob.type !== 'image/webp') throw new Error('webp')
      await onConfirm(blob)
    } catch {
      setError('Não deu para preparar a foto. Tente de novo. 🤍')
      setBusy(false)
    }
  }

  return (
    <div className="avatar-crop-overlay" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title">
      <div className="avatar-crop">
        <header>
          <h2 id="avatar-crop-title">Ajustar foto</h2>
          <button type="button" className="icon-button" onClick={onCancel} disabled={busy} aria-label="Cancelar"><X /></button>
        </header>
        <p className="avatar-crop-hint">Arraste para posicionar e use o zoom para enquadrar.</p>

        <div className="avatar-crop-frame" style={{ width: frame, height: frame }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onWheel={onWheel} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          {img && src && <img src={src} alt="" draggable={false} style={{ width: w, height: h, transform: `translate(${pos.x}px, ${pos.y}px)` }} />}
          <span className="avatar-crop-mask" aria-hidden="true" />
        </div>

        <div className="avatar-crop-zoom">
          <button type="button" onClick={() => applyZoom(zoom / 1.15)} disabled={!img || zoom <= 1} aria-label="Diminuir zoom"><Minus /></button>
          <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={e => applyZoom(Number(e.target.value))} disabled={!img} aria-label="Zoom" />
          <button type="button" onClick={() => applyZoom(zoom * 1.15)} disabled={!img || zoom >= 4} aria-label="Aumentar zoom"><Plus /></button>
        </div>

        {error && <p className="login-notice is-error" role="alert">{error}</p>}

        <div className="avatar-crop-actions">
          <button type="button" className="button outline" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="button dark" onClick={confirm} disabled={!img || busy}>{busy ? 'Salvando…' : 'Salvar foto'}</button>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { Minus, Move, Plus, RotateCcw } from 'lucide-react'
import { Modal } from '../ui.jsx'

// Janela de ajuste de proporção.
// A foto aparece atrás de uma moldura na proporção exigida pelo site; a dona arrasta para
// posicionar e usa o zoom para enquadrar. Ao confirmar, gera as versões pedidas em `outputs`
// (ex.: grande 900×1200 e miniatura 480×640), já em WebP leve.
//
// props: src (URL ou objectURL), aspect (largura/altura), outputs [{ width, height, quality }],
//        title, step ("Foto 1 de 3"), onCancel, onSkip?, onConfirm(blobs[])

const FRAME_MAX_W = 420
const FRAME_MAX_H = 460

export default function ImageCropper({ src, aspect = 3 / 4, outputs, title = 'Ajustar foto', step, onCancel, onSkip, onConfirm, confirmLabel = 'Usar esta foto' }) {
  const [img, setImg] = useState(null)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const drag = useRef(null)
  const pinch = useRef(null)

  // tamanho da moldura na tela, respeitando a proporção
  const frameW = Math.round(Math.min(FRAME_MAX_W, FRAME_MAX_H * aspect, typeof window !== 'undefined' ? window.innerWidth - 72 : FRAME_MAX_W))
  const frameH = Math.round(frameW / aspect)

  useEffect(() => {
    setImg(null); setError(null); setZoom(1)
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => setImg(image)
    image.onerror = () => setError('Não foi possível abrir esta imagem. Use uma foto JPG, PNG ou WebP.')
    image.src = src
  }, [src])

  // escala base: a foto cobre a moldura inteira
  const base = img ? Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight) : 1
  const scale = base * zoom
  const dispW = img ? img.naturalWidth * scale : 0
  const dispH = img ? img.naturalHeight * scale : 0

  // mantém a foto cobrindo a moldura (sem bordas vazias)
  const clamp = (p, w = dispW, h = dispH) => ({
    x: Math.min(0, Math.max(frameW - w, p.x)),
    y: Math.min(0, Math.max(frameH - h, p.y)),
  })

  // ao abrir: centraliza
  useEffect(() => {
    if (!img) return
    const w = img.naturalWidth * base, h = img.naturalHeight * base
    setPos({ x: (frameW - w) / 2, y: (frameH - h) / 2 })
  }, [img, frameW, frameH])

  // zoom mantendo o centro da moldura no mesmo ponto da foto
  const applyZoom = next => {
    const z = Math.min(4, Math.max(1, next))
    const cx = frameW / 2, cy = frameH / 2
    const ratio = z / zoom
    const w = img.naturalWidth * base * z, h = img.naturalHeight * base * z
    setPos(p => clamp({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }, w, h))
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
  const onWheel = e => { if (img) { e.preventDefault(); applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)) } }

  // pinça (dois dedos) no celular
  const onTouchMove = e => {
    if (e.touches.length !== 2 || !img) return
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    if (!pinch.current) pinch.current = { d, zoom }
    else applyZoom(pinch.current.zoom * d / pinch.current.d)
  }
  const onTouchEnd = e => { if (e.touches.length < 2) pinch.current = null }

  const reset = () => { setZoom(1); const w = img.naturalWidth * base, h = img.naturalHeight * base; setPos({ x: (frameW - w) / 2, y: (frameH - h) / 2 }) }

  const confirm = async () => {
    setBusy(true)
    try {
      // área da foto original que está dentro da moldura
      const sx = -pos.x / scale, sy = -pos.y / scale, sw = frameW / scale, sh = frameH / scale
      const blobs = []
      for (const out of outputs) {
        const canvas = document.createElement('canvas')
        canvas.width = out.width; canvas.height = out.height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, out.width, out.height)
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', out.quality ?? 0.85))
        if (!blob) throw new Error('O navegador não conseguiu gerar a imagem.')
        blobs.push(blob)
      }
      await onConfirm(blobs)
    } catch (e) {
      setError(e.message || 'Não foi possível preparar a foto.')
    }
    setBusy(false)
  }

  const ratioLabel = aspect === 3 / 4 ? '3 × 4 (retrato)' : aspect >= 1 ? `${Math.round(aspect * 100) / 100} : 1 (paisagem)` : `${Math.round(aspect * 100) / 100} : 1`

  return (
    <Modal
      title={title}
      onClose={busy ? undefined : onCancel}
      closeOnBackdrop={false}
      footer={<>
        {step && <span className="adm-crop-step">{step}</span>}
        {onSkip && <button className="adm-btn ghost" onClick={onSkip} disabled={busy}>Pular esta foto</button>}
        <button className="adm-btn outline" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button className="adm-btn primary" onClick={confirm} disabled={!img || busy}>{busy ? 'Preparando…' : confirmLabel}</button>
      </>}
    >
      <p className="adm-hint adm-crop-hint"><Move /> Arraste a foto para posicionar e use o zoom para enquadrar. O que está dentro da moldura é o que aparece no site (proporção {ratioLabel}).</p>
      {error && <p className="adm-notice is-error">{error}</p>}
      <div className="adm-crop-stage">
        <div
          className="adm-crop-frame"
          style={{ width: frameW, height: frameH }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onWheel={onWheel} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          {img ? (
            <img src={src} alt="" draggable={false} style={{ width: dispW, height: dispH, transform: `translate(${pos.x}px, ${pos.y}px)` }} />
          ) : !error && <span className="adm-spinner" />}
          <span className="adm-crop-grid" aria-hidden="true" />
        </div>
      </div>
      <div className="adm-crop-controls">
        <button className="adm-icon-btn" onClick={() => applyZoom(zoom / 1.15)} disabled={!img || zoom <= 1} aria-label="Diminuir zoom"><Minus /></button>
        <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={e => applyZoom(Number(e.target.value))} disabled={!img} aria-label="Zoom" />
        <button className="adm-icon-btn" onClick={() => applyZoom(zoom * 1.15)} disabled={!img || zoom >= 4} aria-label="Aumentar zoom"><Plus /></button>
        <button className="adm-btn ghost small" onClick={reset} disabled={!img}><RotateCcw /> Centralizar</button>
      </div>
    </Modal>
  )
}

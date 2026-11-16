import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SiteIcon, siteIcons } from '../../icons.jsx'

// Seletor de ícone (benefícios do hero e quadro de serviços): botão com o ícone atual
// que abre uma grade com todos os desenhos disponíveis.
export default function IconPicker({ value, onChange, label = 'Ícone' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey) }
  }, [open])
  const current = siteIcons[value] || siteIcons.sparkles

  return (
    <div className="adm-field adm-iconpicker" ref={ref}>
      <span>{label}</span>
      <button type="button" className="adm-iconpicker-current" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={`${label}: ${current.label}. Trocar ícone`}>
        <SiteIcon name={value} /> <span>{current.label}</span> <ChevronDown />
      </button>
      {open && (
        <div className="adm-iconpicker-grid" role="radiogroup" aria-label={label}>
          {Object.entries(siteIcons).map(([key, { label: name }]) => (
            <button key={key} type="button" role="radio" aria-checked={value === key} aria-label={name} title={name}
              className={value === key ? 'active' : ''} onClick={() => { onChange(key); setOpen(false) }}>
              <SiteIcon name={key} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

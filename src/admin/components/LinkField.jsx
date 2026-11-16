import React, { useEffect, useMemo, useState } from 'react'
import { listCategories } from '../api.js'

// Escolha do destino de um botão do site: páginas da loja, categorias ou outro endereço.
// value: '/produtos', '/produtos?categoria=vestidos', '/sobre', '{instagram}', 'https://…'
const fixed = [
  { value: '/produtos', label: 'Catálogo completo' },
  { value: '/promocoes', label: 'Promoções' },
  { value: '/sobre', label: 'Sobre a Maré' },
  { value: '{instagram}', label: 'Instagram da loja' },
]

// Categorias do banco, buscadas uma vez e compartilhadas por todos os campos da tela.
let categoriesPromise = null
const loadCategories = () => (categoriesPromise ||= listCategories().catch(() => { categoriesPromise = null; return [] }))

export default function LinkField({ label = 'Para onde o botão leva', value, onChange, allowNone = false }) {
  const [categories, setCategories] = useState([])
  useEffect(() => { let alive = true; loadCategories().then(list => { if (alive) setCategories(list) }); return () => { alive = false } }, [])
  const options = useMemo(() => [
    ...fixed,
    ...categories.filter(c => c.active).map(c => ({ value: `/produtos?categoria=${c.slug}`, label: `Categoria: ${c.name}` })),
  ], [categories])
  const known = options.some(o => o.value === value) || (allowNone && !value)
  const select = known ? (value || '') : '__outro'

  return (
    <div className="adm-field">
      <span>{label}</span>
      <select value={select} onChange={e => onChange(e.target.value === '__outro' ? (known ? 'https://' : value) : e.target.value)}>
        {allowNone && <option value="">Sem link</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        <option value="__outro">Outro endereço…</option>
      </select>
      {select === '__outro' && (
        <input value={value} onChange={e => onChange(e.target.value.trim())} placeholder="https://… ou /produtos?categoria=…" aria-label="Endereço do link" />
      )}
      {value === '{instagram}' && <small>Usa o link do Instagram salvo em Configurações.</small>}
      {select === '__outro' && value && !/^(https?:\/\/|\/)/.test(value) && <small className="adm-field-error">Comece com https:// (outro site) ou / (página da loja).</small>}
    </div>
  )
}

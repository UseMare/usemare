import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, ImageOff, Plus, Search, Sparkles, X } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { listProducts } from '../api.js'
import { Loading, Switch, errorText, formatBRL, useToast, useUnsavedGuard } from '../ui.jsx'

// Destaques: card flutuante que aparece no canto do site e alterna entre até 5 produtos.
// Grava store_settings.spotlight_enabled e spotlight_ids (na ordem escolhida).

const MAX = 5
const normalize = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Por que um produto escolhido não vai aparecer no card (ou null se aparece).
const problem = p => !p.active ? 'Oculto no site — não aparece no card' : !p.available ? 'Esgotado — não aparece no card' : null

function Thumb({ product }) {
  const src = product.product_images[0]?.thumb_path
  return <span className="adm-thumb">{src ? <img src={src} alt="" /> : <ImageOff />}</span>
}

// Prévia do card como a cliente vê (primeiro destaque que aparece).
function Preview({ product, count }) {
  if (!product) return <p className="adm-muted">Nenhum destaque aparece no momento.</p>
  return (
    <div className="adm-spot-preview" aria-label="Prévia do card de destaques">
      <span className="adm-spot-preview-img">{product.product_images[0] ? <img src={product.product_images[0].thumb_path} alt="" /> : <ImageOff />}</span>
      <span className="adm-spot-preview-text">
        <small>Destaque da Maré</small>
        <b>{product.name}</b>
        <span>{formatBRL(product.price)} · Ver peça <ArrowUpRight /></span>
      </span>
      <span className="adm-spot-preview-dots">{Array.from({ length: count }, (_, i) => <i key={i} className={i === 0 ? 'active' : ''} />)}</span>
    </div>
  )
}

export default function Spotlight() {
  const toast = useToast()
  const [products, setProducts] = useState(null)
  const [saved, setSaved] = useState(null)      // { enabled, ids } como está no banco
  const [enabled, setEnabled] = useState(true)
  const [ids, setIds] = useState([])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    try {
      const [list, { data, error }] = await Promise.all([
        listProducts(),
        supabase.from('store_settings').select('spotlight_enabled, spotlight_ids').eq('id', 1).maybeSingle(),
      ])
      if (error) throw error
      const known = new Set(list.map(p => p.id))
      const current = { enabled: data?.spotlight_enabled !== false, ids: (data?.spotlight_ids || []).filter(id => known.has(id)) }
      setProducts(list); setSaved(current); setEnabled(current.enabled); setIds(current.ids); setLoadError(null)
    } catch (e) { setLoadError(errorText(e)) }
  }
  useEffect(() => { load() }, [])

  const dirty = Boolean(saved) && (enabled !== saved.enabled || ids.join() !== saved.ids.join())
  useUnsavedGuard(dirty && !saving, 'Você mudou os destaques e ainda não salvou. Se sair agora, as mudanças serão perdidas.')

  const byId = useMemo(() => Object.fromEntries((products || []).map(p => [p.id, p])), [products])
  const chosen = ids.map(id => byId[id]).filter(Boolean)
  const showing = chosen.filter(p => !problem(p))

  const options = useMemo(() => {
    if (!products) return []
    const term = normalize(search.trim())
    return products.filter(p => !ids.includes(p.id) && (!term || normalize(`${p.name} ${p.code}`).includes(term)))
  }, [products, ids, search])

  const add = id => setIds(list => list.length >= MAX ? list : [...list, id])
  const remove = id => setIds(list => list.filter(x => x !== id))
  const move = (i, delta) => setIds(list => {
    const j = i + delta
    if (j < 0 || j >= list.length) return list
    const next = [...list];[next[i], next[j]] = [next[j], next[i]]
    return next
  })

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('store_settings').update({ spotlight_enabled: enabled, spotlight_ids: ids }).eq('id', 1)
    setSaving(false)
    if (error) return toast(errorText(error), 'error')
    setSaved({ enabled, ids })
    toast(enabled ? 'Destaques salvos. O site já mostra o card novo.' : 'Destaques salvos. O card está desligado no site.')
  }

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!products) return <Loading text="Carregando destaques…" />

  return (
    <>
      <p className="adm-muted adm-intro">Até {MAX} produtos que aparecem em um card no canto do site, trocando a cada 5 segundos.</p>

      <div className="adm-spot-grid">
        <section className="adm-card">
          <div className="adm-card-head">
            <div><h2>Destaques escolhidos ({ids.length}/{MAX})</h2><p>O primeiro da lista aparece primeiro.</p></div>
            <Switch checked={enabled} onChange={setEnabled} label={enabled ? 'Card ligado' : 'Card desligado'} />
          </div>
          {!enabled && <p className="adm-notice is-warn">O card está desligado: nenhum destaque aparece no site até você ligar de novo.</p>}
          {chosen.length === 0 ? (
            <div className="adm-empty"><Sparkles /><b>Nenhum destaque escolhido</b>Adicione produtos na lista ao lado.</div>
          ) : (
            <ol className="adm-spot-list">
              {chosen.map((p, i) => (
                <li key={p.id} className={problem(p) ? 'is-hidden' : ''}>
                  <span className="adm-spot-pos">{i + 1}</span>
                  <Thumb product={p} />
                  <span className="adm-cat-info">
                    <b>{p.name}</b>
                    <small>{formatBRL(p.price)} · código {p.code}</small>
                    {problem(p) && <span className="adm-badge warn">{problem(p)}</span>}
                  </span>
                  <span className="adm-prow-order">
                    <button className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${p.name}`}><ArrowUp /></button>
                    <button className="adm-icon-btn" onClick={() => move(i, 1)} disabled={i === chosen.length - 1} aria-label={`Descer ${p.name}`}><ArrowDown /></button>
                  </span>
                  <button className="adm-icon-btn danger" onClick={() => remove(p.id)} aria-label={`Tirar ${p.name} dos destaques`} title="Tirar dos destaques"><X /></button>
                </li>
              ))}
            </ol>
          )}
          {enabled && chosen.length > 0 && (
            <>
              <h3 className="adm-subtitle">Prévia</h3>
              <Preview product={showing[0]} count={showing.length} />
              {showing.length < chosen.length && <p className="adm-hint">Produtos ocultos ou esgotados ficam fora do card automaticamente e voltam sozinhos quando estiverem disponíveis.</p>}
            </>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Adicionar produto</h2><p>{ids.length >= MAX ? `Já tem ${MAX} destaques. Tire um para adicionar outro.` : 'Clique em um produto para colocar nos destaques.'}</p></div></div>
          <label className="adm-search"><Search /><input className="adm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou código" aria-label="Buscar produto" /></label>
          <ul className="adm-spot-options">
            {options.length === 0 && <li className="adm-muted">Nenhum produto encontrado.</li>}
            {options.map(p => (
              <li key={p.id}>
                <button type="button" onClick={() => add(p.id)} disabled={ids.length >= MAX} className={problem(p) ? 'is-hidden' : ''}>
                  <Thumb product={p} />
                  <span className="adm-cat-info"><b>{p.name}</b><small>{formatBRL(p.price)}{!p.active ? ' · oculto' : !p.available ? ' · esgotado' : ''}</small></span>
                  <Plus />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="adm-savebar">
        <span className="adm-savebar-msg">{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</span>
        <button className="adm-btn outline" onClick={() => { setEnabled(saved.enabled); setIds(saved.ids) }} disabled={!dirty || saving}>Desfazer</button>
        <button className="adm-btn primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Salvando…' : 'Salvar destaques'}</button>
      </div>
    </>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronDown, Copy, ExternalLink, GripVertical, ImageOff, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { deleteProduct, duplicateProduct, listCategories, listProducts, reorderProducts, updateProduct } from '../api.js'
import { BASE } from '../sections.js'
import { Loading, Switch, errorText, formatBRL, useConfirm, useToast } from '../ui.jsx'

const STATUS = [
  { key: 'todos', label: 'Todos os status', test: () => true },
  { key: 'visiveis', label: 'Visíveis no site', test: p => p.active },
  { key: 'ocultos', label: 'Ocultos', test: p => !p.active },
  { key: 'esgotados', label: 'Esgotados', test: p => !p.available },
  { key: 'promocao', label: 'Em promoção', test: p => p.old_price > p.price },
]

// Quantos produtos aparecem de cada vez (o resto vem no "Ver mais").
const PAGE = 7

const normalize = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function ProductsList() {
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('todos')
  const [order, setOrder] = useState(null)          // ids na ordem nova (enquanto não salvou)
  const [dragId, setDragId] = useState(null)
  const [busy, setBusy] = useState(null)
  const [shown, setShown] = useState(PAGE)          // quantos produtos estão na tela

  const load = async () => {
    try {
      const [p, c] = await Promise.all([listProducts(), listCategories()])
      setProducts(p); setCategories(c); setOrder(null); setLoadError(null)
    } catch (error) { setLoadError(errorText(error)) }
  }
  useEffect(() => { load() }, [])

  const categoryName = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories])
  const filtering = Boolean(search.trim() || category || status !== 'todos')

  const visible = useMemo(() => {
    if (!products) return []
    const list = order ? order.map(id => products.find(p => p.id === id)).filter(Boolean) : products
    const term = normalize(search.trim())
    const st = STATUS.find(s => s.key === status)
    return list.filter(p =>
      (!term || normalize(`${p.name} ${p.code} ${p.slug}`).includes(term)) &&
      (!category || p.product_categories.some(pc => pc.category_id === category)) &&
      st.test(p))
  }, [products, order, search, category, status])

  // Mudou a busca ou os filtros: volta a mostrar só o começo da lista.
  useEffect(() => { setShown(PAGE) }, [search, category, status])
  const onScreen = visible.slice(0, shown)
  const remaining = visible.length - onScreen.length

  // Altera um campo na hora (com volta atrás se der erro).
  const patch = async (product, fields, okText) => {
    setProducts(list => list.map(p => p.id === product.id ? { ...p, ...fields } : p))
    try {
      await updateProduct(product.id, fields)
      toast(okText)
    } catch (error) {
      setProducts(list => list.map(p => p.id === product.id ? product : p))
      toast(errorText(error), 'error')
    }
  }

  // ---------- Ordem ----------
  const currentIds = () => order || products.map(p => p.id)
  const move = (id, to) => {
    const ids = currentIds().filter(x => x !== id)
    ids.splice(Math.max(0, Math.min(to, ids.length)), 0, id)
    setOrder(ids)
  }
  const moveBy = (id, delta) => {
    const to = currentIds().indexOf(id) + delta
    move(id, to)
    setShown(n => Math.max(n, to + 1)) // desceu o último da tela: mostra mais um para ele não sumir
  }
  const saveOrder = async () => {
    setBusy('order')
    try {
      const n = await reorderProducts(order, products)
      toast(n ? 'Ordem salva. O site já mostra os produtos nessa ordem.' : 'A ordem não mudou.')
      await load()
    } catch (error) { toast(errorText(error), 'error') }
    setBusy(null)
  }

  const duplicate = async product => {
    setBusy(product.id)
    try {
      const newId = await duplicateProduct(product, product.sort_order + 1)
      toast('Cópia criada (oculta no site). Revise e ative quando quiser.')
      navigate(`${BASE}/produtos/${newId}`)
    } catch (error) { toast(errorText(error), 'error') }
    setBusy(null)
  }

  const remove = async product => {
    const ok = await confirm({
      title: 'Excluir produto',
      text: `"${product.name}" será excluído do site e do painel, junto com as fotos dele. Essa ação não pode ser desfeita. Se quiser só tirar do site por um tempo, use "No site" (ocultar).`,
      confirmLabel: 'Excluir de vez',
      danger: true,
    })
    if (!ok) return
    setBusy(product.id)
    try {
      await deleteProduct(product)
      setProducts(list => list.filter(p => p.id !== product.id))
      setOrder(o => o && o.filter(id => id !== product.id))
      toast('Produto excluído.')
    } catch (error) { toast(errorText(error), 'error') }
    setBusy(null)
  }

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!products) return <Loading text="Carregando produtos…" />

  const counts = { total: products.length, ocultos: products.filter(p => !p.active).length, esgotados: products.filter(p => !p.available).length }

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p className="adm-muted">{counts.total} produtos · {counts.ocultos} ocultos · {counts.esgotados} esgotados</p>
        </div>
        <Link className="adm-btn primary" to={`${BASE}/produtos/novo`}><Plus /> Novo produto</Link>
      </div>

      <div className="adm-toolbar">
        <label className="adm-search">
          <Search />
          <input className="adm-input" type="search" placeholder="Buscar por nome ou código" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <select className="adm-input" value={category} onChange={e => setCategory(e.target.value)} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="adm-input" value={status} onChange={e => setStatus(e.target.value)} aria-label="Filtrar por status">
          {STATUS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {order && (
        <div className="adm-notice is-warn adm-order-bar">
          <span>Você mudou a ordem dos produtos.</span>
          <span>
            <button className="adm-btn ghost small" onClick={() => setOrder(null)} disabled={busy === 'order'}>Desfazer</button>
            <button className="adm-btn primary small" onClick={saveOrder} disabled={busy === 'order'}>{busy === 'order' ? 'Salvando…' : 'Salvar ordem'}</button>
          </span>
        </div>
      )}
      {!filtering && !order && products.length > 1 && <p className="adm-hint adm-order-hint"><GripVertical /> Arraste pelos pontinhos (ou use as setas) para mudar a ordem em que os produtos aparecem no site.</p>}

      {visible.length === 0 ? (
        <div className="adm-card adm-empty">
          <Package />
          <b>{filtering ? 'Nenhum produto encontrado' : 'Nenhum produto ainda'}</b>
          {filtering ? 'Tente outra busca ou tire os filtros.' : 'Clique em "Novo produto" para cadastrar o primeiro.'}
        </div>
      ) : (
        <ul className="adm-plist">
          {onScreen.map((p, index) => {
            const thumb = p.product_images[0]?.thumb_path
            const cats = p.product_categories.map(pc => categoryName[pc.category_id]).filter(Boolean)
            const promo = p.old_price > p.price
            return (
              <li
                key={p.id}
                className={`adm-prow ${dragId === p.id ? 'dragging' : ''} ${!p.active ? 'is-hidden' : ''}`}
                draggable={!filtering}
                onDragStart={e => { setDragId(p.id); e.dataTransfer.effectAllowed = 'move' }}
                onDragOver={e => { if (dragId && dragId !== p.id) { e.preventDefault(); move(dragId, currentIds().indexOf(p.id)) } }}
                onDragEnd={() => setDragId(null)}
              >
                {!filtering && (
                  <span className="adm-prow-order">
                    <GripVertical className="adm-grip" aria-hidden="true" />
                    <button className="adm-icon-btn" onClick={() => moveBy(p.id, -1)} disabled={index === 0} aria-label={`Subir ${p.name}`}><ArrowUp /></button>
                    <button className="adm-icon-btn" onClick={() => moveBy(p.id, 1)} disabled={index === visible.length - 1} aria-label={`Descer ${p.name}`}><ArrowDown /></button>
                  </span>
                )}
                <Link to={`${BASE}/produtos/${p.id}`} className="adm-prow-main">
                  <span className="adm-thumb">{thumb ? <img src={thumb} alt="" loading="lazy" /> : <ImageOff />}</span>
                  <span className="adm-prow-info">
                    <b>{p.name}</b>
                    <small>Cód. {p.code}{cats.length ? ` · ${cats.join(', ')}` : ' · sem categoria'}</small>
                    <span className="adm-prow-badges">
                      {!p.active && <span className="adm-badge">Oculto</span>}
                      {!p.available && <span className="adm-badge warn">Esgotado</span>}
                      {promo && <span className="adm-badge ok">Promoção</span>}
                      {!p.product_images.length && <span className="adm-badge danger">Sem foto</span>}
                    </span>
                  </span>
                </Link>
                <span className="adm-prow-price">
                  {promo && <s>{formatBRL(p.old_price)}</s>}
                  <b>{formatBRL(p.price)}</b>
                </span>
                <span className="adm-prow-switches">
                  <Switch checked={p.active} onChange={v => patch(p, { active: v }, v ? 'Produto visível no site.' : 'Produto oculto: não aparece mais no site.')} label="No site" />
                  <Switch checked={p.available} onChange={v => patch(p, { available: v }, v ? 'Produto disponível para compra.' : 'Produto marcado como esgotado.')} label="Disponível" />
                </span>
                <span className="adm-prow-actions">
                  <Link className="adm-icon-btn" to={`${BASE}/produtos/${p.id}`} title="Editar" aria-label={`Editar ${p.name}`}><Pencil /></Link>
                  <a className="adm-icon-btn" href={`/produto/${p.slug}`} target="_blank" rel="noreferrer" title="Ver no site" aria-label={`Ver ${p.name} no site`}><ExternalLink /></a>
                  <button className="adm-icon-btn" onClick={() => duplicate(p)} disabled={busy === p.id} title="Duplicar" aria-label={`Duplicar ${p.name}`}><Copy /></button>
                  <button className="adm-icon-btn danger" onClick={() => remove(p)} disabled={busy === p.id} title="Excluir" aria-label={`Excluir ${p.name}`}><Trash2 /></button>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {remaining > 0 && (
        <div className="adm-more">
          <span className="adm-muted">Mostrando {onScreen.length} de {visible.length}</span>
          <button className="adm-btn outline" onClick={() => setShown(n => n + PAGE)}><ChevronDown /> Ver mais {Math.min(PAGE, remaining)}</button>
        </div>
      )}
    </>
  )
}

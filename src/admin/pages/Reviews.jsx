import React, { useEffect, useMemo, useState } from 'react'
import { Check, ExternalLink, ImageOff, MessageSquareText, Star, Trash2, X } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { InfoTip, Loading, errorText, useConfirm, useToast } from '../ui.jsx'

// Avaliações enviadas pelas clientes na página do produto. Chegam como "pendente"
// (o banco garante isso) e só aparecem no site depois de aprovadas aqui.

const FILTERS = [
  { key: 'pendente', label: 'Pendentes' },
  { key: 'aprovada', label: 'Aprovadas' },
  { key: 'rejeitada', label: 'Recusadas' },
  { key: 'todas', label: 'Todas' },
]
const STATUS_LABEL = { pendente: 'Pendente', aprovada: 'Aprovada', rejeitada: 'Recusada' }
const STATUS_CLASS = { pendente: 'warn', aprovada: 'ok', rejeitada: 'danger' }

const formatDate = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Avisa o menu lateral para atualizar o contador de pendentes.
export const notifyReviewsChanged = () => window.dispatchEvent(new Event('mare:reviews-changed'))

function Stars({ rating }) {
  return <span className="adm-stars" aria-label={`${rating} de 5 estrelas`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} className={n <= rating ? 'on' : ''} />)}</span>
}

export default function Reviews() {
  const toast = useToast()
  const confirm = useConfirm()
  const [reviews, setReviews] = useState(null)
  const [filter, setFilter] = useState('pendente')
  const [busy, setBusy] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    const { data, error } = await supabase.from('reviews')
      .select('id, author_name, rating, comment, status, created_at, products ( id, name, slug, product_images ( thumb_path, position ) )')
      .order('created_at', { ascending: false })
    if (error) return setLoadError(errorText(error))
    setReviews(data); setLoadError(null)
  }
  useEffect(() => { load() }, [])

  const counts = useMemo(() => (reviews || []).reduce((m, r) => ({ ...m, [r.status]: (m[r.status] || 0) + 1 }), {}), [reviews])
  const list = (reviews || []).filter(r => filter === 'todas' || r.status === filter)

  const setStatus = async (review, status) => {
    setBusy(review.id)
    const { error } = await supabase.from('reviews').update({ status }).eq('id', review.id)
    setBusy(null)
    if (error) return toast(errorText(error), 'error')
    setReviews(rs => rs.map(r => r.id === review.id ? { ...r, status } : r))
    notifyReviewsChanged()
    toast(status === 'aprovada' ? 'Avaliação aprovada. Já aparece na página do produto.' : status === 'rejeitada' ? 'Avaliação recusada. Não aparece no site.' : 'Avaliação voltou para pendente.')
  }

  const remove = async review => {
    if (!(await confirm({ title: 'Excluir avaliação', danger: true, confirmLabel: 'Excluir', text: `A avaliação de ${review.author_name} será apagada de vez. Para só esconder do site, use "Recusar".` }))) return
    setBusy(review.id)
    const { error } = await supabase.from('reviews').delete().eq('id', review.id)
    setBusy(null)
    if (error) return toast(errorText(error), 'error')
    setReviews(rs => rs.filter(r => r.id !== review.id))
    notifyReviewsChanged()
    toast('Avaliação excluída.')
  }

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!reviews) return <Loading text="Carregando avaliações…" />

  return (
    <>
      <p className="adm-muted adm-intro adm-title-info">Só aparecem no site depois de aprovadas.<InfoTip>As clientes avaliam pela página do produto (precisam estar logadas). Nada aparece no site antes de você aprovar.</InfoTip></p>
      <nav className="adm-tabs" aria-label="Filtrar avaliações">
        {FILTERS.map(f => {
          const n = f.key === 'todas' ? reviews.length : counts[f.key] || 0
          return <button key={f.key} type="button" className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>{f.label} <span className={`adm-count ${f.key === 'pendente' && n ? 'hot' : ''}`}>{n}</span></button>
        })}
      </nav>

      {list.length === 0 ? (
        <div className="adm-card adm-empty"><MessageSquareText /><b>{filter === 'pendente' ? 'Nenhuma avaliação esperando' : 'Nada por aqui'}</b>{filter === 'pendente' ? 'Quando uma cliente avaliar uma peça, ela aparece aqui para você aprovar.' : 'Nenhuma avaliação com esse status.'}</div>
      ) : (
        <ul className="adm-reviews">
          {list.map(r => {
            const product = r.products
            const thumb = [...(product?.product_images || [])].sort((a, b) => a.position - b.position)[0]?.thumb_path
            return (
              <li key={r.id} className="adm-card">
                <div className="adm-review-product">
                  <span className="adm-thumb">{thumb ? <img src={thumb} alt="" /> : <ImageOff />}</span>
                  <span className="adm-cat-info">
                    <b>{product?.name || 'Produto excluído'}</b>
                    {product && <a href={`/produto/${product.slug}#reviews-title`} target="_blank" rel="noreferrer" className="adm-link-small">Ver no site <ExternalLink /></a>}
                  </span>
                  <span className={`adm-badge ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                </div>
                <div className="adm-review-body">
                  <div className="adm-review-meta"><Stars rating={r.rating} /><b>{r.author_name}</b><small>{formatDate(r.created_at)}</small></div>
                  {r.comment ? <p>{r.comment}</p> : <p className="adm-muted">(sem comentário, só a nota)</p>}
                </div>
                <div className="adm-review-actions">
                  {r.status !== 'aprovada' && <button className="adm-btn primary small" onClick={() => setStatus(r, 'aprovada')} disabled={busy === r.id}><Check /> Aprovar</button>}
                  {r.status !== 'rejeitada' && <button className="adm-btn outline small" onClick={() => setStatus(r, 'rejeitada')} disabled={busy === r.id}><X /> Recusar</button>}
                  <button className="adm-icon-btn danger" onClick={() => remove(r)} disabled={busy === r.id} aria-label="Excluir avaliação" title="Excluir"><Trash2 /></button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

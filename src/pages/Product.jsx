import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, MessageCircleHeart, Ruler, ShoppingBag, Star, Truck, X, ZoomIn } from 'lucide-react'
import { findProduct, lineInfo, products, typeLabels } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { Instagram, Price, ProductCard, SectionHeading, WhatsApp } from '../ui.jsx'
import { productMessage, restockMessage, store, whatsappLink } from '../store.js'
import NotFound from './NotFound.jsx'
import { supabase } from '../supabase.js'

const lineLabel = product => lineInfo[product.line]?.label || 'Produtos'
const lineLink = product => `/produtos?categoria=${lineInfo[product.line]?.key || ''}`

function Gallery({ product }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const strip = useRef(null)
  const total = product.photos.length
  const go = step => setActive(index => (index + step + total) % total)

  // No celular a galeria é deslizável: sincroniza a bolinha com a foto visível.
  const onScroll = () => {
    const el = strip.current
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth))
  }
  const select = index => {
    setActive(index)
    strip.current?.scrollTo({ left: index * strip.current.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!zoom) return
    const onKey = e => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [zoom])

  return (
    <div className="pdp-gallery" data-reveal="left">
      <div className="pdp-thumbs">
        {product.thumbs.map((thumb, index) => (
          <button key={thumb} className={index === active ? 'active' : ''} onClick={() => select(index)} aria-label={`Ver foto ${index + 1}`}>
            <img src={thumb} alt="" />
          </button>
        ))}
      </div>
      <div className="pdp-main">
        <div className="pdp-strip" ref={strip} onScroll={onScroll}>
          {product.photos.map((photo, index) => (
            <img key={photo} src={photo} alt={`${product.name} — foto ${index + 1} de ${total}`} className={index === active ? 'active' : ''} loading={index ? 'lazy' : 'eager'} />
          ))}
        </div>
        {!product.available && <span className="badge-soldout">Esgotado</span>}
        {total > 1 && <>
          <button className="gallery-arrow left" onClick={() => select((active - 1 + total) % total)} aria-label="Foto anterior"><ChevronLeft /></button>
          <button className="gallery-arrow right" onClick={() => select((active + 1) % total)} aria-label="Próxima foto"><ChevronRight /></button>
        </>}
        <button className="zoom-button" onClick={() => setZoom(true)} aria-label="Ampliar foto"><ZoomIn /></button>
        <div className="pdp-dots">{product.photos.map((p, i) => <i key={p} className={i === active ? 'active' : ''} />)}</div>
      </div>

      {/* Renderizado direto no <body>: dentro da galeria animada, o "position: fixed" ficava preso a ela. */}
      {zoom && createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={event => { if (event.target === event.currentTarget) setZoom(false) }}>
          <button className="lightbox-close" onClick={() => setZoom(false)} aria-label="Fechar"><X /></button>
          <img src={product.photos[active]} alt={`${product.name} — foto ampliada`} />
          {total > 1 && <>
            <button className="gallery-arrow left" onClick={() => go(-1)} aria-label="Foto anterior"><ChevronLeft /></button>
            <button className="gallery-arrow right" onClick={() => go(1)} aria-label="Próxima foto"><ChevronRight /></button>
          </>}
          <span className="lightbox-count">{active + 1} / {total}</span>
        </div>,
        document.body
      )}
    </div>
  )
}

const tabsFor = product => [
  { key: 'peca', label: product.flavors ? 'Sobre o produto' : 'Sobre a peça' },
  product.flavors ? { key: 'uso', label: 'Modo de uso' } : { key: 'tamanhos', label: 'Tamanhos' },
  { key: 'comprar', label: 'Como comprar' },
  { key: 'envio', label: 'Envio' },
]

function InfoTabs({ product }) {
  const [tab, setTab] = useState('peca')
  const tabs = tabsFor(product)
  return (
    <div className="pdp-tabs" data-reveal>
      <div className="tab-list" role="tablist">
        {tabs.map(t => <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      <div className="tab-panel" role="tabpanel" key={tab}>
        {tab === 'peca' && <>
          <p>{product.description.split('\n\n')[1] || product.description}</p>
          <ul className="spec-list">
            <li><span>Linha</span><b>{lineLabel(product)}</b></li>
            <li><span>Tipo</span><b>{typeLabels[product.type]}</b></li>
            {product.brand && <li><span>Marca</span><b>{product.brand}</b></li>}
            {product.flavors ? <li><span>{product.flavors.length > 1 ? 'Sabores' : 'Sabor'}</span><b>{product.flavors.join(', ')}</b></li> : <li><span>Cor</span><b>{product.color}</b></li>}
            {product.size ? <li><span>Embalagem</span><b>{product.size}</b></li> : <li><span>Fotos</span><b>{product.photos.length} ângulos da peça</b></li>}
          </ul>
        </>}
        {tab === 'tamanhos' && <>
          <p>Os tamanhos são combinados com carinho direto no WhatsApp: a gente te ajuda a escolher o caimento ideal para o seu corpo. 🤎</p>
          <p className="muted">Tem dúvida entre dois tamanhos? Manda suas medidas na conversa que a gente indica.</p>
        </>}
        {tab === 'uso' && <>
          <p>{product.usage}</p>
          <p className="muted">{product.notice}</p>
        </>}
        {tab === 'comprar' && (
          <ol className="steps-mini">
            <li><b>1</b><span>Toque em <strong>Comprar pelo WhatsApp</strong> (ou junte várias peças na sacola).</span></li>
            <li><b>2</b><span>A mensagem já vai pronta com a peça escolhida — é só enviar.</span></li>
            <li><b>3</b><span>Combinamos {product.flavors ? 'sabor' : 'tamanho'}, pagamento e entrega na conversa. 💬</span></li>
          </ol>
        )}
        {tab === 'envio' && <>
          <p>📦 Enviamos para todo o Brasil.</p>
          <p className="muted">Valor e prazo do frete são calculados para o seu CEP e combinados no WhatsApp junto com o pedido.</p>
        </>}
      </div>
    </div>
  )
}

// Avaliações: lidas e gravadas no Supabase (tabela reviews).
// A cliente logada avalia; a avaliação fica "em análise" até a loja aprovar no painel.
const formatDate = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

function StarsInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars-input" role="radiogroup" aria-label="Sua nota" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
          className={(hover || value) >= n ? 'on' : ''} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
          <Star />
        </button>
      ))}
    </div>
  )
}

function Reviews({ product }) {
  const { user } = useShop()
  const [list, setList] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const noun = product.flavors ? 'deste produto' : 'desta peça'

  useEffect(() => {
    if (!supabase || !product.uuid) { setLoaded(true); return }
    let alive = true
    supabase.from('reviews')
      .select('id, user_id, author_name, rating, comment, status, created_at')
      .eq('product_id', product.uuid)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (alive) { setList(data || []); setLoaded(true) } })
    return () => { alive = false }
  }, [product.uuid, user?.id])

  const approved = list.filter(r => r.status === 'aprovada')
  const mine = user ? list.find(r => r.user_id === user.id) : null
  const average = approved.length ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length : 0

  useEffect(() => {
    setRating(mine?.rating || 0)
    setComment(mine?.comment || '')
  }, [mine?.id])

  const submit = async event => {
    event.preventDefault()
    if (!rating) { setNotice({ type: 'error', text: 'Escolha de 1 a 5 estrelas. ⭐' }); return }
    setBusy(true)
    const { data, error } = await supabase.from('reviews')
      .upsert({ product_id: product.uuid, user_id: user.id, rating, comment: comment.trim() || null }, { onConflict: 'product_id,user_id' })
      .select('id, user_id, author_name, rating, comment, status, created_at')
      .single()
    setBusy(false)
    if (error) { setNotice({ type: 'error', text: 'Não conseguimos enviar agora. Tente de novo em instantes. 🤍' }); return }
    setList(current => [data, ...current.filter(r => r.id !== data.id)])
    setNotice({ type: 'ok', text: 'Obrigada! Sua avaliação foi enviada e aparece aqui assim que a Maré aprovar. 🤎' })
  }

  return (
    <section className="reviews shell" aria-labelledby="reviews-title">
      <SectionHeading id="reviews-title" title="Avaliações" />
      <div className="reviews-box" data-reveal>
        <div className="reviews-score">
          <div className="stars" aria-hidden="true">{[1, 2, 3, 4, 5].map(i => <Star key={i} className={approved.length && Math.round(average) >= i ? 'on' : ''} />)}</div>
          {approved.length ? <>
            <strong>{average.toFixed(1).replace('.', ',')} de 5</strong>
            <p>{approved.length} {approved.length === 1 ? 'avaliação' : 'avaliações'} de clientes Maré. 🤎</p>
          </> : <>
            <strong>Ainda sem avaliações</strong>
            <p>Seja a primeira a contar o que achou {noun}. 🤎</p>
          </>}
        </div>

        {!product.uuid || !supabase ? (
          <div className="reviews-cta">
            <MessageCircleHeart />
            <div><b>Avaliações indisponíveis no momento</b><p>Enquanto isso, marque a gente no Instagram vestindo Maré!</p></div>
            <a className="button outline small" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> {store.instagramHandle}</a>
          </div>
        ) : user ? (
          <form className="reviews-form" onSubmit={submit}>
            <b>{mine ? 'Sua avaliação' : `O que você achou ${noun}?`}</b>
            {mine && mine.status !== 'aprovada' && <span className={`review-status ${mine.status}`}>{mine.status === 'pendente' ? 'Em análise' : 'Não publicada'}</span>}
            <StarsInput value={rating} onChange={value => { setRating(value); setNotice(null) }} />
            <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} rows={3} placeholder="Conta pra gente: caimento, tecido, tamanho… (opcional)" />
            {notice && <p className={`login-notice ${notice.type === 'error' ? 'is-error' : ''}`} role="status">{notice.text}</p>}
            <button className="button dark small" type="submit" disabled={busy}>{busy ? 'Enviando…' : mine ? 'Atualizar avaliação' : 'Enviar avaliação'}</button>
          </form>
        ) : (
          <div className="reviews-cta">
            <MessageCircleHeart />
            <div><b>Comprou na Maré? Conta pra gente!</b><p>Entre na sua conta para deixar sua nota e seu comentário.</p></div>
            <Link className="button outline small" to="/entrar">Entrar para avaliar</Link>
          </div>
        )}
      </div>

      {loaded && approved.length > 0 && (
        <ul className="reviews-list">
          {approved.map(r => (
            <li key={r.id} data-reveal>
              <div className="stars small" aria-label={`${r.rating} de 5 estrelas`}>{[1, 2, 3, 4, 5].map(i => <Star key={i} className={r.rating >= i ? 'on' : ''} />)}</div>
              {r.comment && <p>{r.comment}</p>}
              <span><b>{r.author_name}</b> · {formatDate(r.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Product() {
  const { slug } = useParams()
  const product = findProduct(slug)
  const { addToBag, liked, toggleLike } = useShop()
  usePageTitle(product?.name)
  if (!product) return <NotFound />

  const isLiked = liked.includes(product.id)
  const [intro, ...rest] = product.description.split('\n\n')
  const related = [
    ...products.filter(p => p.id !== product.id && p.available && p.line === product.line),
    ...products.filter(p => p.id !== product.id && p.available && p.line !== product.line),
  ].slice(0, 4)
  const detailPhoto = product.photos[product.photos.length - 1]

  return (
    <div className="pdp-page" key={product.id}>
      <div className="shell">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link to="/">Início</Link><span>/</span><Link to="/produtos">Produtos</Link><span>/</span><Link to={lineLink(product)}>{lineLabel(product)}</Link><span>/</span><b>{product.name}</b>
        </nav>

        <div className="pdp">
          <Gallery product={product} />

          <div className="pdp-info" data-reveal="right">
            <Link className="tag" to={lineLink(product)}>{lineLabel(product)}</Link>
            <h1>{product.name}</h1>
            <div className="pdp-price">
              <Price product={product} />
              {product.available && <small>ou {product.installments} sem juros</small>}
            </div>
            <p className="pdp-intro">{intro}</p>
            <p className="pdp-description">{rest.join('\n\n')}</p>

            {product.flavors ? (
              <div className="pdp-option flavors">
                <span>{product.flavors.length > 1 ? 'Sabores' : 'Sabor'}:</span>
                <div>{product.flavors.map(f => <i key={f}>{f}</i>)}</div>
              </div>
            ) : (
              <div className="pdp-option">
                <span>Cor: <b>{product.color}</b></span>
                <i className="swatch-dot" style={{ background: product.swatch }} />
              </div>
            )}
            <div className="pdp-option">
              {product.size
                ? <span><Ruler /> Embalagem: <b>{product.size}</b></span>
                : <span><Ruler /> Tamanho: <b>combinado no WhatsApp</b></span>}
            </div>
            {product.notice && <p className="supp-notice">{product.notice}</p>}

            {product.available ? (
              <>
                <div className="pdp-actions">
                  <a className="button whatsapp big pulse-green" href={whatsappLink(productMessage(product))} target="_blank" rel="noreferrer"><WhatsApp /> Comprar pelo WhatsApp</a>
                  <button className="button outline" onClick={() => addToBag(product)}><ShoppingBag /> Adicionar à sacola</button>
                  <button className={`like-big ${isLiked ? 'liked' : ''}`} onClick={() => toggleLike(product.id)} aria-label={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}><Heart fill={isLiked ? 'currentColor' : 'none'} /></button>
                </div>
                <p className="modal-note">{product.flavors ? 'Sabor' : 'Tamanho'}, pagamento e entrega você combina com a gente direto no WhatsApp. 💬</p>
              </>
            ) : (
              <div className="soldout-notice" role="status">
                <strong>Esta peça esgotou 🤍</strong>
                <p>No momento ela está indisponível, mas fica registrada aqui para você se inspirar. Novidades chegam sempre primeiro no nosso Instagram.</p>
                <div className="modal-actions">
                  <a className="button outline" href={whatsappLink(restockMessage(product))} target="_blank" rel="noreferrer"><WhatsApp /> Avise-me se voltar</a>
                  <a className="button dark" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> Ver novidades</a>
                </div>
              </div>
            )}

            <ul className="pdp-perks">
              <li><Truck /><span><b>Envio para todo o Brasil</b>Frete combinado no WhatsApp</span></li>
              <li><WhatsApp /><span><b>Atendimento humano</b>Ajuda para escolher o tamanho</span></li>
              <li><Heart /><span><b>Feito com carinho</b>Cada pedido é especial</span></li>
            </ul>
          </div>
        </div>

        <div className="pdp-details">
          <InfoTabs product={product} />
          <figure className="pdp-detail-photo" data-reveal="zoom">
            <img src={detailPhoto} alt={`Detalhe de ${product.name}`} loading="lazy" />
            <figcaption>Cada detalhe pensado para você. ✨</figcaption>
          </figure>
        </div>
      </div>

      <Reviews product={product} />

      <section className="related shell" aria-labelledby="related-title">
        <SectionHeading id="related-title" title="Você também pode gostar" to={lineLink(product)} />
        <div className="related-grid">
          {related.map((p, index) => <ProductCard key={p.id} product={p} index={index} sizes="(max-width: 900px) 46vw, 300px" />)}
        </div>
      </section>

      {product.available && (
        <div className="pdp-sticky">
          <div><b>{product.name}</b><span>{product.priceLabel}</span></div>
          <a className="button whatsapp small" href={whatsappLink(productMessage(product))} target="_blank" rel="noreferrer"><WhatsApp /> Comprar</a>
        </div>
      )}
    </div>
  )
}

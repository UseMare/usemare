import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CreditCard, LockKeyhole, Menu, Minus, Plus, Search, ShoppingBag, Trash2, Truck, UserRound, X } from 'lucide-react'
import { useRevealObserver, useShop } from './shop.jsx'
import { Brand, Instagram, WhatsApp } from './ui.jsx'
import { bagMessage, helloMessage, spotlightIds, store, whatsappLink } from './store.js'
import { products } from './products.js'

export const navItems = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Moda feminina', to: '/produtos?categoria=moda-feminina' },
  { label: 'Promoções', to: '/promocoes' },
  { label: 'Sobre nós', to: '/sobre' },
]

// Marca o item do menu certo também quando a página é /produtos com categoria.
function isActive(item, location, params) {
  const [path, query] = item.to.split('?')
  if (path !== location.pathname) return false
  const categoria = params.get('categoria')
  if (query) return query === `categoria=${categoria}`
  return path !== '/produtos' || !categoria || !['moda-feminina'].includes(categoria)
}

function SearchBox({ onDone }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [term, setTerm] = useState(params.get('busca') || '')
  useEffect(() => { setTerm(params.get('busca') || '') }, [params])
  const submit = event => {
    event.preventDefault()
    navigate(term.trim() ? `/produtos?busca=${encodeURIComponent(term.trim())}` : '/produtos')
    onDone?.()
  }
  return (
    <form className="search" role="search" onSubmit={submit}>
      <Search />
      <input value={term} onChange={e => setTerm(e.target.value)} aria-label="Buscar produtos" placeholder="O que você procura?" />
    </form>
  )
}

function BagDrawer() {
  const { bagItems, bagOpen, closeBag, changeQuantity, removeFromBag } = useShop()
  const total = bagItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  useEffect(() => {
    if (!bagOpen) return
    const onKey = event => { if (event.key === 'Escape') closeBag() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bagOpen, closeBag])

  return (
    <>
      <aside className={`bag ${bagOpen ? 'open' : ''}`} aria-hidden={!bagOpen} aria-label="Sacola">
        <div className="bag-head">
          <h2>Minha sacola</h2>
          <button className="icon-button" onClick={closeBag} aria-label="Fechar sacola"><X /></button>
        </div>
        {bagItems.length === 0 ? (
          <div className="bag-empty">
            <ShoppingBag />
            <p>Sua sacola está vazia por enquanto.</p>
            <span>Escolha suas peças favoritas e finalize tudo de uma vez pelo WhatsApp. 🤎</span>
            <Link className="button dark small" to="/produtos" onClick={closeBag}>Ver peças <ArrowRight /></Link>
          </div>
        ) : (
          <>
            <ul className="bag-list">
              {bagItems.map(({ product, quantity }) => (
                <li key={product.id}>
                  <Link to={`/produto/${product.slug}`} onClick={closeBag}><img src={product.thumbs[0]} alt="" /></Link>
                  <div>
                    <h3><Link to={`/produto/${product.slug}`} onClick={closeBag}>{product.name}</Link></h3>
                    <strong>{product.priceLabel}</strong>
                    <div className="bag-qty">
                      <button onClick={() => changeQuantity(product.id, quantity - 1)} aria-label="Diminuir quantidade"><Minus /></button>
                      <span aria-live="polite">{quantity}</span>
                      <button onClick={() => changeQuantity(product.id, quantity + 1)} aria-label="Aumentar quantidade"><Plus /></button>
                    </div>
                  </div>
                  <button className="bag-remove" onClick={() => removeFromBag(product.id)} aria-label={`Remover ${product.name}`}><Trash2 /></button>
                </li>
              ))}
            </ul>
            <div className="bag-foot">
              <p><span>Total estimado</span><strong>R$ {total.toFixed(2).replace('.', ',')}</strong></p>
              <a className="button whatsapp" href={whatsappLink(bagMessage(bagItems))} target="_blank" rel="noreferrer"><WhatsApp /> Finalizar pelo WhatsApp</a>
              <small>Você será levada para o WhatsApp da Maré com a lista pronta. Lá a gente combina tamanhos, pagamento e entrega.</small>
            </div>
          </>
        )}
      </aside>
      {bagOpen && <button className="bag-backdrop" onClick={closeBag} aria-label="Fechar sacola" />}
    </>
  )
}

// Card flutuante de destaques: 5 produtos que alternam a cada 5 s.
// Fechou? Some até a próxima vez que o site for carregado (F5 ou abrir de novo) —
// o estado vive só na memória, então trocar de página não traz o card de volta.
function Spotlight() {
  const items = spotlightIds.map(id => products.find(p => p.id === id)).filter(p => p && p.available)
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState('next')
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)
  const [paused, setPaused] = useState(false)
  const [offset, setOffset] = useState(0)
  const dragStart = useRef(null)
  const dragged = useRef(false)

  const go = step => {
    setDir(step > 0 ? 'next' : 'prev')
    setIndex(i => (i + step + items.length) % items.length)
  }

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible || closed || paused || items.length < 2) return
    const timer = setInterval(() => go(1), 5000)
    return () => clearInterval(timer)
  }, [visible, closed, paused, items.length, index])

  if (closed || !items.length) return null
  const product = items[index]

  // Arrastar para o lado (mouse ou dedo): esquerda = próximo, direita = anterior.
  const onPointerDown = event => {
    if (event.button !== undefined && event.button !== 0) return
    dragStart.current = event.clientX
    dragged.current = false
    setPaused(true)
  }
  const onPointerMove = event => {
    if (dragStart.current === null) return
    const dx = event.clientX - dragStart.current
    if (Math.abs(dx) > 6) dragged.current = true
    setOffset(Math.max(-90, Math.min(90, dx)))
  }
  const endDrag = event => {
    if (dragStart.current === null) return
    const dx = event.clientX - dragStart.current
    dragStart.current = null
    setOffset(0)
    if (event.pointerType !== 'mouse') setPaused(false)
    if (dx <= -40) go(1)
    else if (dx >= 40) go(-1)
  }

  return (
    <aside className={`spotlight ${visible ? 'show' : ''} ${offset ? 'dragging' : ''}`} aria-label="Destaques da Maré"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); dragStart.current = null; setOffset(0) }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={() => { dragStart.current = null; setOffset(0) }}>
      <div className="spotlight-viewport">
        <Link to={`/produto/${product.slug}`} className={`spotlight-body from-${dir}`} key={product.id}
          style={{ transform: offset ? `translateX(${offset}px)` : undefined, opacity: offset ? 1 - Math.abs(offset) / 220 : undefined }}
          onClick={event => { if (dragged.current) event.preventDefault() }} draggable={false}>
          <img src={product.thumbs[0]} alt="" draggable={false} />
          <div>
            <span className="spotlight-eyebrow">Destaque da Maré</span>
            <strong>{product.name}</strong>
            <span className="spotlight-link">{product.priceLabel} · Ver peça <ArrowUpRight /></span>
          </div>
        </Link>
      </div>
      <button className="spotlight-close" onClick={() => setClosed(true)} onPointerDown={event => event.stopPropagation()} aria-label="Fechar destaques"><X /></button>
      <div className="spotlight-dots" role="tablist" aria-label="Escolher destaque" onPointerDown={event => event.stopPropagation()}>
        {items.map((item, i) => (
          <button key={item.id} role="tab" aria-selected={i === index} aria-label={item.name} className={i === index ? 'active' : ''} onClick={() => { setDir(i > index ? 'next' : 'prev'); setIndex(i) }}>
            {i === index && !paused && <i key={index} />}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default function Layout() {
  const location = useLocation()
  const [params] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const { bagCount, openBag, toast, dismissToast } = useShop()
  useRevealObserver()

  // Ao trocar de página: volta ao topo (ou rola até a âncora #) e fecha o menu.
  // Filtros, ordenação e chips do catálogo atualizam a URL com "replace" — nesses casos
  // a página fica exatamente onde está (sem pular para o topo).
  const navigationType = useNavigationType()
  useEffect(() => {
    setMenuOpen(false)
    if (navigationType === 'REPLACE') return
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="announcement" aria-label="Vantagens da loja">
        <div className="shell announcement-inner">
          <span><Truck /> Envio para todo o Brasil</span>
          <span><CreditCard /> Parcele em até 6x sem juros</span>
          <span><LockKeyhole /> Compra 100% segura</span>
          <a href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> Siga nosso Instagram</a>
        </div>
      </div>

      <header className="header">
        <div className="shell header-inner">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
          <Brand />
          <nav className="main-nav" aria-label="Menu principal">
            {navItems.map(item => (
              <NavLink key={item.label} to={item.to} className={() => isActive(item, location, params) ? 'active' : ''} end>{item.label}</NavLink>
            ))}
          </nav>
          <SearchBox />
          <div className="header-actions">
            <Link to="/entrar" className={`icon-button hide-small ${location.pathname === '/entrar' ? 'active' : ''}`} aria-label="Entrar na minha conta" title="Entrar / criar conta"><UserRound /></Link>
            <button className="icon-button cart" onClick={openBag} aria-label={`Sacola com ${bagCount} itens`}><ShoppingBag /><b key={bagCount} className={bagCount ? 'bump' : ''}>{bagCount}</b></button>
            <a className="header-whats" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer" aria-label="Falar com a Maré no WhatsApp">
              <WhatsApp />
              <span><small>Fale com a gente</small>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <div className={`drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="drawer-head"><Brand onClick={() => setMenuOpen(false)} /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X /></button></div>
        {navItems.map(item => <Link to={item.to} key={item.label} className={isActive(item, location, params) ? 'active' : ''}>{item.label}<ArrowRight /></Link>)}
        <Link to="/entrar" className="drawer-account"><UserRound /> Entrar / criar conta</Link>
        <a className="drawer-whats" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Fale com a gente</a>
      </div>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <main id="conteudo" key={location.pathname}>
        <Outlet />
      </main>

      <footer>
        <div className="shell footer-inner">
          <div className="footer-brand" data-reveal><Brand /><p>Moda que acompanha seu ritmo,<br />com leveza e personalidade.</p><p className="footer-handle"><a href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> {store.instagramHandle}</a></p></div>
          <div data-reveal style={{ '--i': 1 }}><h3>Loja</h3><Link to="/produtos">Todos os produtos</Link><Link to="/produtos?categoria=moda-feminina">Moda feminina</Link><Link to="/promocoes">Promoções</Link></div>
          <div data-reveal style={{ '--i': 2 }}><h3>Atendimento</h3><Link to="/sobre#como-comprar">Como comprar</Link><a href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer">Fale no WhatsApp</a><Link to="/sobre">Sobre a Maré</Link></div>
          <div data-reveal style={{ '--i': 3 }}><h3>Receba novidades</h3><p>Lançamentos e promoções em primeira mão.</p><form onSubmit={e => e.preventDefault()}><input type="email" aria-label="Seu e-mail" placeholder="Seu melhor e-mail" required /><button aria-label="Cadastrar e-mail"><ArrowRight /></button></form></div>
        </div>
        <div className="copyright"><div className="shell">© 2026 Maré. Todos os direitos reservados.</div></div>
      </footer>

      <BagDrawer />

      {toast && (
        <div className="toast" key={toast.key} role="status">
          <ShoppingBag /> <span><b>{toast.name}</b> foi para a sacola</span>
          <button onClick={() => { dismissToast(); openBag() }}>Ver sacola</button>
        </div>
      )}

      {location.pathname !== '/entrar' && <Spotlight />}

    </>
  )
}

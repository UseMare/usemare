import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CreditCard, LockKeyhole, Menu, Minus, Plus, Search, ShoppingBag, Trash2, Truck, UserRound, X } from 'lucide-react'
import { useRevealObserver, useShop } from './shop.jsx'
import { Brand, Instagram, SmartLink, WhatsApp, thumb320 } from './ui.jsx'
import { helloMessage, store, whatsappLink } from './store.js'
import { CheckoutButton } from './checkout.jsx'
import { spotlightProducts } from './products.js'
import { hasSupabase, restRpc } from './supabaseLazy.js'
import { trackPage } from './track.js'
import AlphaCredit from './alpha-credit/AlphaCredit.jsx'
import { pageContent } from './content.js'
import { SiteIcon, SocialIcon, socialHref, socialNetworks } from './icons.jsx'

// Colunas e textos do rodapé (painel → Logo e rodapé). Logo, texto da marca e redes ficam em store_settings.
// Links: '{whatsapp}' = conversa no WhatsApp da loja; '{instagram}' = Instagram da loja. {ano} = ano atual.
export const footerDefaults = {
  columns: [
    { title: 'Loja', links: [{ label: 'Todos os produtos', link: '/produtos' }, { label: 'Moda feminina', link: '/produtos?categoria=moda-feminina' }, { label: 'Promoções', link: '/promocoes' }] },
    { title: 'Atendimento', links: [{ label: 'Como comprar', link: '/sobre#como-comprar' }, { label: 'Fale no WhatsApp', link: '{whatsapp}' }, { label: 'Sobre a Maré', link: '/sobre' }] },
    { title: 'Políticas', links: [{ label: 'Trocas e Devoluções', link: '/trocas-e-devolucoes' }, { label: 'Política de Privacidade', link: '/politica-de-privacidade' }, { label: 'Termos de Uso', link: '/termos-de-uso' }] },
  ],
  newsletterTitle: 'Receba novidades',
  newsletterText: 'Lançamentos e promoções em primeira mão.',
  copyright: '© {ano} Maré. Todos os direitos reservados.',
}

const FooterLink = ({ item }) => <SmartLink to={item.link} fallback="/">{item.label}</SmartLink>

// Faixa de avisos do topo (painel → Textos das páginas → Faixa do topo). No celular só o 1º aparece.
// {parcelas} = parcelas das Configurações; link '{instagram}' = Instagram da loja.
export const announcementDefaults = {
  items: [
    { icon: 'truck', text: 'Envio para todo o Brasil', link: '' },
    { icon: 'card', text: 'Parcele em até {parcelas}x sem juros', link: '' },
    { icon: 'lock', text: 'Compra 100% segura', link: '' },
    { icon: 'instagram', text: 'Siga nosso Instagram', link: '{instagram}' },
  ],
}

// Menu do topo: os endereços são fixos; os nomes vêm do painel (Menu do site → chave 'menu').
export const menuDefaults = { inicio: 'Início', produtos: 'Produtos', colecao: 'Coleção Dezembro', promocoes: 'Promoções', sobre: 'Sobre nós' }
const menuLinks = [['inicio', '/'], ['produtos', '/produtos'], ['colecao', '/colecao'], ['promocoes', '/promocoes'], ['sobre', '/sobre']]
export const getNavItems = () => {
  const names = pageContent('menu', menuDefaults)
  // O nome da coleção vem do painel → Coleção (é o mesmo nome do menu, da página e da aba).
  const collectionName = String(pageContent('collection', { name: '' }).name || '').trim()
  if (collectionName) names.colecao = collectionName
  return menuLinks.map(([key, to]) => ({ label: String(names[key] || '').trim() || menuDefaults[key], to }))
}

// Marca o item do menu certo também quando a página é /produtos com categoria.
function isActive(item, location, params) {
  const [path, query] = item.to.split('?')
  if (path !== location.pathname) return false
  const categoria = params.get('categoria')
  if (query) return query === `categoria=${categoria}`
  return path !== '/produtos' || !categoria
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
      <aside className={`bag ${bagOpen ? 'open' : ''}`} inert={!bagOpen} aria-label="Sacola">
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
                  <Link to={`/produto/${product.slug}`} onClick={closeBag}><img src={thumb320(product.thumbs[0])} alt="" /></Link>
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
              <CheckoutButton items={bagItems} onLeave={closeBag}><WhatsApp /> Finalizar pedido</CheckoutButton>
              <small>Seu pedido vai pronto para o WhatsApp da Maré.</small>
            </div>
          </>
        )}
      </aside>
      {bagOpen && <button className="bag-backdrop" onClick={closeBag} aria-label="Fechar sacola" />}
    </>
  )
}

// Faixa do topo: os avisos deslizam em esteira infinita (caixa alta, separados por ✦).
// Duas metades idênticas andam de 0 a -50% e recomeçam sem emenda; cada metade repete os avisos
// para cobrir telas largas. Para leitores de tela vai uma lista simples (a esteira é decorativa).
// Pausa com o mouse em cima; parada para quem pede menos movimento no aparelho.
function Announcement() {
  const items = pageContent('announcement', announcementDefaults).items
    .filter(item => item?.text && !(store.installments <= 1 && item.text.includes('{parcelas}')))
    .map(item => ({ ...item, text: item.text.replace(/\{parcelas\}/g, store.installments) }))
  if (!items.length) return null
  const reps = items.length >= 4 ? 3 : items.length >= 2 ? 5 : 10 // cada metade passa de ~3.000px (cobre monitores largos)
  const run = Array.from({ length: reps }, () => items).flat()
  const piece = (item, key, hidden) => {
    const content = <><SiteIcon name={item.icon} /> {item.text}</>
    return (
      <React.Fragment key={key}>
        {item.link
          ? <SmartLink to={item.link} className="marquee-item" tabIndex={hidden ? -1 : undefined}>{content}</SmartLink>
          : <span className="marquee-item">{content}</span>}
        <span className="marquee-sep" aria-hidden="true">✦</span>
      </React.Fragment>
    )
  }
  return (
    <div className="announcement" aria-label="Vantagens da loja">
      <ul className="sr-only">{items.map((item, i) => <li key={i}>{item.link ? <SmartLink to={item.link}>{item.text}</SmartLink> : item.text}</li>)}</ul>
      <div className="marquee" aria-hidden="true" style={{ '--marquee-time': `${Math.round(Math.max(24, run.length * 5) / 0.65)}s` }} /* velocidade: 65% da original (pedido: 35% mais devagar) */>
        <div className="marquee-track">
          {[0, 1].map(half => <div className="marquee-group" key={half}>{run.map((item, i) => piece(item, i, true))}</div>)}
        </div>
      </div>
    </div>
  )
}

// "Receba novidades" do rodapé: grava o e-mail no Supabase (função subscribe_newsletter).
function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'ok' | 'error'
  const submit = async event => {
    event.preventDefault()
    if (!hasSupabase) { setStatus('error'); return }
    setStatus('sending')
    const { error } = await restRpc('subscribe_newsletter', { p_email: email, p_source: 'rodape' })
    setStatus(error ? 'error' : 'ok')
    if (!error) setEmail('')
  }
  if (status === 'ok') return <p className="newsletter-ok" role="status">Prontinho! Você vai receber as novidades da Maré em primeira mão. 🌊</p>
  return (
    <>
      <form onSubmit={submit}>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus(null) }} aria-label="Seu e-mail" placeholder="Seu melhor e-mail" required disabled={status === 'sending'} />
        <button aria-label="Cadastrar e-mail" disabled={status === 'sending'}><ArrowRight /></button>
      </form>
      {status === 'error' && <p className="newsletter-error" role="alert">Não deu certo agora. Confere o e-mail e tenta de novo? 🤍</p>}
    </>
  )
}

// Card flutuante de destaques: 5 produtos que alternam a cada 5 s.
// Fechou? Some até a próxima vez que o site for carregado (F5 ou abrir de novo) —
// o estado vive só na memória, então trocar de página não traz o card de volta.
function Spotlight() {
  // Até 5 produtos escolhidos no painel (Destaques), na ordem escolhida.
  const items = spotlightProducts()
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
  const product = items[index % items.length]

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
          <img src={thumb320(product.thumbs[0])} alt="" draggable={false} />
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
  // A página entra com um efeito de surgir só ao navegar. Na primeira abertura do site ela já
  // aparece pronta: o efeito começava transparente e atrasava a foto principal (nota do PageSpeed).
  const firstEntry = useRef(location.key)
  const [params] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const { bagCount, openBag, toast, dismissToast, user, profile } = useShop()
  const accountIcon = profile?.avatar_url ? <img className="account-photo" src={profile.avatar_url} alt="" /> : <UserRound />
  const footer = pageContent('footer', footerDefaults)
  // Outras redes (o Instagram principal já aparece com o @ e não se repete).
  const sameUrl = (a, b) => String(a || '').replace(/\/+$/, '').toLowerCase() === String(b || '').replace(/\/+$/, '').toLowerCase()
  const social = (store.social || []).filter(s => s?.url && !sameUrl(s.url, store.instagram))
  useRevealObserver()

  // Ao trocar de página: volta ao topo (ou rola até a âncora #) e fecha o menu.
  // Filtros, ordenação e chips do catálogo atualizam a URL com "replace" — nesses casos
  // a página fica exatamente onde está (sem pular para o topo).
  const navigationType = useNavigationType()
  useEffect(() => {
    setMenuOpen(false)
    if (navigationType === 'REPLACE' || location.state?.keepScroll) return // keepScroll: troca de página do catálogo (ela mesma rola)
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.search, location.hash])

  // Contador de acessos do painel (anônimo).
  useEffect(() => { trackPage(location.pathname) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Announcement />

      <header className="header">
        <div className="shell header-inner">
          <div className="header-left mobile-only">
            <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
            <Link to="/entrar" className={`icon-button account-link ${user ? 'logged' : ''}`} aria-label={user ? 'Minha conta' : 'Entrar na minha conta'}>{accountIcon}{user && <i aria-hidden="true" />}</Link>
          </div>
          <Brand />
          <nav className="main-nav" aria-label="Menu principal">
            {getNavItems().map(item => (
              <NavLink key={item.label} to={item.to} className={() => isActive(item, location, params) ? 'active' : ''} end>{item.label}</NavLink>
            ))}
          </nav>
          <SearchBox />
          <div className="header-actions">
            <Link to="/entrar" className={`icon-button hide-small account-link ${location.pathname === '/entrar' ? 'active' : ''} ${user ? 'logged' : ''}`} aria-label={user ? 'Minha conta' : 'Entrar na minha conta'} title={user ? 'Minha conta' : 'Entrar / criar conta'}>{accountIcon}{user && <i aria-hidden="true" />}</Link>
            <button className="icon-button cart" onClick={openBag} aria-label={`Sacola com ${bagCount} itens`}><ShoppingBag /><b key={bagCount} className={bagCount ? 'bump' : ''}>{bagCount}</b></button>
            <a className="header-whats" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer" aria-label="Falar com a Maré no WhatsApp">
              <WhatsApp />
              <span><small>Fale com a gente</small>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <div className={`drawer ${menuOpen ? 'open' : ''}`} inert={!menuOpen}>
        <div className="drawer-head"><Brand onClick={() => setMenuOpen(false)} /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X /></button></div>
        {getNavItems().map(item => <Link to={item.to} key={item.label} className={isActive(item, location, params) ? 'active' : ''}>{item.label}<ArrowRight /></Link>)}
        <Link to="/entrar" className="drawer-account"><UserRound /> {user ? 'Minha conta' : 'Entrar / criar conta'}</Link>
        <a className="drawer-whats" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Fale com a gente</a>
      </div>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <main id="conteudo" key={location.pathname} className={location.key === firstEntry.current ? 'first-entry' : undefined}>
        {/* As páginas (menos o Início) baixam só quando abertas; enquanto chegam, fica um espaço reservado. */}
        <React.Suspense fallback={<div className="page-loading" aria-busy="true" />}><Outlet /></React.Suspense>
      </main>

      <footer>
        <div className="shell footer-inner" style={{ '--footer-cols': footer.columns.length }}>
          <div className="footer-brand" data-reveal>
            <Brand footer />
            {store.footerText && <p className="footer-text">{store.footerText}</p>}
            <p className="footer-handle"><a href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> {store.instagramHandle}</a></p>
            {social.length > 0 && (
              <ul className="footer-social" aria-label="Redes sociais">
                {social.map((s, i) => (
                  <li key={i}><a href={socialHref(s)} target={s.network === 'email' ? undefined : '_blank'} rel="noreferrer" aria-label={s.label || socialNetworks[s.network]?.label || 'Rede social'} title={s.label || socialNetworks[s.network]?.label}><SocialIcon network={s.network} /></a></li>
                ))}
              </ul>
            )}
          </div>
          {footer.columns.map((column, c) => (
            <div key={c} data-reveal style={{ '--i': c + 1 }}>
              <h3>{column.title}</h3>
              {(column.links || []).filter(l => l?.label).map((l, i) => <FooterLink key={i} item={l} />)}
            </div>
          ))}
          <div data-reveal style={{ '--i': footer.columns.length + 1 }}><h3>{footer.newsletterTitle}</h3>{footer.newsletterText && <p>{footer.newsletterText}</p>}<Newsletter /></div>
        </div>
        <div className="copyright"><div className="shell">
          <p>{footer.copyright.replace(/\{ano\}/g, new Date().getFullYear())}</p>
          <AlphaCredit />
        </div></div>
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

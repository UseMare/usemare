import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, ExternalLink, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import './admin.css'
import { logo } from '../ui.jsx'
import AdminLogin, { AdminDenied, AdminOffline } from './AdminLogin.jsx'
import { signOut, useAdminAuth } from './useAdminAuth.js'
import { BASE, navGroups, sections } from './sections.js'
import Dashboard from './pages/Dashboard.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import ProductsList from './pages/ProductsList.jsx'
import ProductEditor from './pages/ProductEditor.jsx'
import Categories from './pages/Categories.jsx'
import Spotlight from './pages/Spotlight.jsx'
import HomePage from './pages/HomePage.jsx'
import PageTexts from './pages/PageTexts.jsx'
import { ConfirmProvider, ToastProvider } from './ui.jsx'
import PasswordModal from './components/PasswordModal.jsx'

// Painel da loja (/painel-loja). Carregado só quando alguém abre essa área,
// então não pesa no site das clientes.

// Telas já prontas; as demais mostram o aviso "em construção" até a etapa delas.
const pages = {
  inicio: Dashboard,
  produtos: ProductsList,
  categorias: Categories,
  destaques: Spotlight,
  paginaInicial: HomePage,
  paginas: PageTexts,
}

// Página atual = seção cujo endereço é o maior prefixo do endereço aberto.
const sectionFor = pathname => {
  const clean = pathname.replace(/\/$/, '')
  return Object.values(sections)
    .filter(s => clean === s.path || clean.startsWith(`${s.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0] || sections.inicio
}

function Sidebar({ open, onClose, collapsed, onToggle }) {
  const settings = sections.configuracoes
  return (
    <>
      <aside className={`adm-sidebar ${open ? 'open' : ''}`} aria-label="Menu do painel">
        <div className="adm-sidebar-head">
          <Link to={BASE} className="adm-brand" onClick={onClose} title="Início"><img src={logo} alt="Maré" /><span>Painel</span><b className="adm-brand-mark" aria-hidden="true">M</b></Link>
          <button className="adm-icon-btn adm-only-mobile" onClick={onClose} aria-label="Fechar menu"><X /></button>
          <button className="adm-icon-btn adm-only-desktop" onClick={onToggle} aria-label={collapsed ? 'Abrir menu' : 'Recolher menu'} title={collapsed ? 'Abrir menu' : 'Recolher menu'}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
        </div>
        <nav className="adm-nav">
          {navGroups.map(group => (
            <div key={group.label || 'main'} className="adm-nav-group">
              {group.label && <p>{group.label}</p>}
              {group.items.map(key => {
                const { label, icon: Icon, path } = sections[key]
                return (
                  <NavLink key={key} to={path} end={key === 'inicio'} onClick={onClose} title={collapsed ? label : undefined}>
                    <Icon /> <span>{label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="adm-nav-foot">
          <NavLink to={settings.path} onClick={onClose} title={collapsed ? settings.label : undefined}><settings.icon /> <span>{settings.label}</span><ChevronRight /></NavLink>
        </div>
      </aside>
      {open && <button className="adm-backdrop" onClick={onClose} aria-label="Fechar menu" />}
    </>
  )
}

// Nome da pessoa no canto superior direito. Abre um menu no formato da Nuvemshop:
// atalhos da loja, dados da conta (alterar senha) e sair.
function UserMenu({ email, name }) {
  const [open, setOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const ref = useRef(null)
  const location = useLocation()
  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const close = event => { if (!ref.current?.contains(event.target)) setOpen(false) }
    const onKey = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey) }
  }, [open])
  const display = name || email?.split('@')[0] || 'Administração'
  return (
    <div className={`adm-usermenu ${open ? 'open' : ''}`} ref={ref}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">
        <span className="adm-avatar" aria-hidden="true">{display.trim().charAt(0).toUpperCase()}</span>
        <span className="adm-usermenu-name">{display}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="adm-usermenu-pop" role="menu">
          <div className="adm-usermenu-group">
            <a href="/" target="_blank" rel="noreferrer" role="menuitem">Ver loja <ExternalLink /></a>
            <Link to={sections.configuracoes.path} role="menuitem">Configurações da loja</Link>
            <Link to={sections.aparencia.path} role="menuitem">Logo e rodapé</Link>
          </div>
          <div className="adm-usermenu-group">
            <p className="adm-usermenu-who"><b>{display}</b><small>{email}</small></p>
            <button type="button" role="menuitem" onClick={() => { setOpen(false); setPasswordOpen(true) }}>Alterar senha</button>
          </div>
          <div className="adm-usermenu-group">
            <button type="button" role="menuitem" onClick={signOut}>Sair</button>
          </div>
        </div>
      )}
      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
    </div>
  )
}

const COLLAPSE_KEY = 'mare-painel-menu-recolhido'
const readCollapsed = () => { try { return localStorage.getItem(COLLAPSE_KEY) === '1' } catch { return false } }

function Shell({ session, profile }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const current = sectionFor(location.pathname)
  // Título grande da página (o editor de produto tem o seu).
  const title = /\/produtos\/novo\/?$/.test(location.pathname) ? 'Novo produto'
    : /\/produtos\/[^/]+\/?$/.test(location.pathname) ? 'Editar produto' : current.label

  const toggleCollapsed = value => {
    setCollapsed(value)
    try { localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0') } catch { /* navegação privada */ }
  }

  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => { document.title = `${title} · Painel Maré` }, [title])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`adm ${collapsed ? 'is-collapsed' : ''}`}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} collapsed={collapsed} onToggle={() => toggleCollapsed(!collapsed)} />
      <div className="adm-main">
        <header className={`adm-topbar ${scrolled ? 'scrolled' : ''}`}>
          <button className="adm-icon-btn adm-only-mobile" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
          <span className="adm-topbar-title">{title}</span>
          <a className="adm-btn outline small" href="/" target="_blank" rel="noreferrer"><ExternalLink /> <span>Ver loja</span></a>
          <UserMenu email={session.user.email} name={profile?.full_name} />
        </header>
        <main className="adm-content">
          <h1 className="adm-page-title">{title}</h1>
          <Routes>
            {Object.entries(sections).map(([key, section]) => {
              const Page = pages[key] || ComingSoon
              const rel = section.path.slice(BASE.length + 1)
              return <Route key={key} {...(rel ? { path: rel } : { index: true })} element={<Page section={section} />} />
            })}
            <Route path="produtos/novo" element={<ProductEditor />} />
            <Route path="produtos/:id" element={<ProductEditor />} />
            <Route path="*" element={<Navigate to={BASE} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const auth = useAdminAuth()

  // O painel não deve aparecer no Google.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  if (auth.status === 'loading') return <div className="adm-loading" role="status"><span className="adm-spinner" /> Carregando painel…</div>
  if (auth.status === 'offline') return <AdminOffline />
  if (auth.status === 'signed-out') return <AdminLogin />
  if (auth.status === 'denied') return <AdminDenied email={auth.session.user.email} />
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Shell session={auth.session} profile={auth.profile} />
      </ConfirmProvider>
    </ToastProvider>
  )
}

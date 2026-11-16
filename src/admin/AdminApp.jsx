import React, { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ExternalLink, LogOut, Menu, X } from 'lucide-react'
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
import { ConfirmProvider, ToastProvider } from './ui.jsx'

// Painel da loja (/painel-loja). Carregado só quando alguém abre essa área,
// então não pesa no site das clientes.

// Telas já prontas; as demais mostram o aviso "em construção" até a etapa delas.
const pages = {
  inicio: Dashboard,
  produtos: ProductsList,
  categorias: Categories,
  destaques: Spotlight,
}

// Página atual = seção cujo endereço é o maior prefixo do endereço aberto.
const sectionFor = pathname => {
  const clean = pathname.replace(/\/$/, '')
  return Object.values(sections)
    .filter(s => clean === s.path || clean.startsWith(`${s.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0] || sections.inicio
}

function Sidebar({ open, onClose, email, name }) {
  return (
    <>
      <aside className={`adm-sidebar ${open ? 'open' : ''}`} aria-label="Menu do painel">
        <div className="adm-sidebar-head">
          <Link to={BASE} className="adm-brand" onClick={onClose}><img src={logo} alt="Maré" /><span>Painel</span></Link>
          <button className="adm-icon-btn adm-only-mobile" onClick={onClose} aria-label="Fechar menu"><X /></button>
        </div>
        <nav className="adm-nav">
          {navGroups.map(group => (
            <div key={group.label || 'main'} className="adm-nav-group">
              {group.label && <p>{group.label}</p>}
              {group.items.map(key => {
                const { label, icon: Icon, path } = sections[key]
                return (
                  <NavLink key={key} to={path} end={key === 'inicio'} onClick={onClose}>
                    <Icon /> <span>{label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <div className="adm-user">
            <span className="adm-avatar" aria-hidden="true">{(name || email || '?').trim().charAt(0).toUpperCase()}</span>
            <span><b>{name || 'Administração'}</b><small>{email}</small></span>
          </div>
          <button className="adm-btn ghost block" onClick={signOut}><LogOut /> Sair</button>
        </div>
      </aside>
      {open && <button className="adm-backdrop" onClick={onClose} aria-label="Fechar menu" />}
    </>
  )
}

function Shell({ session, profile }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const current = sectionFor(location.pathname)

  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => { document.title = `${current.label} · Painel Maré` }, [current])

  return (
    <div className="adm">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} email={session.user.email} name={profile?.full_name} />
      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-icon-btn adm-only-mobile" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
          <h1>{current.label}</h1>
          <a className="adm-btn outline small" href="/" target="_blank" rel="noreferrer"><ExternalLink /> <span>Ver loja</span></a>
        </header>
        <main className="adm-content">
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

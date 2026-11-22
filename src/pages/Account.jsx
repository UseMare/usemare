import React, { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, ChevronRight, Heart, KeyRound, LayoutGrid, LockKeyhole, LogOut, Mail, Pencil, Save, ShieldCheck, Trash2, UserRound, Zap } from 'lucide-react'
import { usePageTitle, useShop } from '../shop.jsx'
import { ProductCard, WhatsApp } from '../ui.jsx'
import { helloMessage, whatsappLink } from '../store.js'
import { products } from '../products.js'
import { supabase } from '../supabase.js'
import AvatarCropper from './AvatarCropper.jsx'
import { backHere, emailOk, formatPhone, friendly, PasswordField, PHONE_ERROR, phoneDigits, phoneOk } from './authShared.jsx'
import './account.css'

// Minha conta (cliente logada): cabeçalho com foto, abas Perfil / Favoritos / E-mail e senha
// e o cartão de ações rápidas. A foto fica no bucket "avatares", na pasta com o id da cliente.

const TABS = [
  { id: 'perfil', label: 'Perfil', Icon: UserRound },
  { id: 'favoritos', label: 'Favoritos', Icon: Heart },
  { id: 'acesso', label: 'E-mail e senha', Icon: LockKeyhole },
]

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX = 15 * 1024 * 1024 // arquivo escolhido no aparelho; o enviado é um WebP de ~10–20 KB

// Caminho do arquivo dentro do bucket, a partir do link público.
const avatarPath = url => (url || '').split('/storage/v1/object/public/avatares/')[1]?.split('?')[0]

const memberSince = date => date
  ? new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  : null

function Notice({ notice }) {
  if (!notice) return null
  return <p className={`login-notice ${notice.type === 'error' ? 'is-error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>
}

export function Avatar({ profile, user, className = '' }) {
  const name = profile?.full_name || user?.email || ''
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <span className={`acc-avatar ${className}`}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <b>{initials || <UserRound />}</b>}
    </span>
  )
}

// ---------- Foto de perfil (botões + envio) ----------
function useAvatarUpload() {
  const { user, profile, setProfile } = useShop()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [picked, setPicked] = useState(null) // foto escolhida, esperando o ajuste

  // Cada cliente tem um único arquivo: avatares/<id>/avatar.webp (a nova substitui a antiga).
  // O ?v= no link faz o navegador buscar a versão nova.
  const saveUrl = async avatar_url => {
    const { error } = await supabase.from('profiles').update({ avatar_url }).eq('id', user.id)
    if (error) throw error
    const old = avatarPath(profile?.avatar_url)
    const now = avatarPath(avatar_url)
    if (old && old !== now) supabase.storage.from('avatares').remove([old]) // limpa a foto antiga (sem travar a tela)
    setProfile(p => ({ ...p, avatar_url }))
  }

  const onFile = event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) { setNotice({ type: 'error', text: 'Use uma foto JPG, PNG ou WEBP.' }); return }
    if (file.size > AVATAR_MAX) { setNotice({ type: 'error', text: 'Essa foto é muito grande. Escolha uma de até 15 MB.' }); return }
    setNotice(null)
    setPicked(file)
  }

  const upload = async blob => {
    setBusy(true)
    try {
      const path = `${user.id}/avatar.webp`
      const { error } = await supabase.storage.from('avatares').upload(path, blob, { contentType: 'image/webp', cacheControl: '3600', upsert: true })
      if (error) throw error
      await saveUrl(`${supabase.storage.from('avatares').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`)
      setPicked(null)
      setNotice({ type: 'ok', text: 'Foto atualizada! 📸' })
    } catch (error) {
      console.warn('Foto de perfil:', error)
      setPicked(null)
      setNotice({ type: 'error', text: 'Não deu para enviar a foto agora. Tente de novo. 🤍' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setNotice(null)
    try {
      await saveUrl(null)
      setNotice({ type: 'ok', text: 'Foto removida.' })
    } catch {
      setNotice({ type: 'error', text: 'Não deu para remover agora. Tente de novo. 🤍' })
    } finally {
      setBusy(false)
    }
  }

  const input = <>
    <input ref={inputRef} type="file" accept={AVATAR_TYPES.join(',')} hidden onChange={onFile} />
    {picked && <AvatarCropper file={picked} onCancel={() => !busy && setPicked(null)} onConfirm={upload} />}
  </>
  return { input, pick: () => inputRef.current?.click(), remove, busy, notice, has: !!profile?.avatar_url }
}

// ---------- Aba Perfil ----------
function ProfileTab({ avatar, goTo }) {
  const { user, profile, setProfile } = useShop()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setForm({ full_name: profile?.full_name || '', phone: formatPhone(profile?.phone) })
  }, [profile?.full_name, profile?.phone])

  const dirty = form.full_name.trim() !== (profile?.full_name || '') || phoneDigits(form.phone) !== phoneDigits(profile?.phone)

  const save = async event => {
    event.preventDefault()
    const phone = phoneDigits(form.phone)
    if (form.full_name.trim().length < 2) { setNotice({ type: 'error', text: 'Conta pra gente o seu nome 🤍' }); return }
    if (phone && !phoneOk(phone)) { setNotice({ type: 'error', text: PHONE_ERROR }); return }
    setBusy(true)
    const changes = { full_name: form.full_name.trim(), phone: phone || null }
    const { error } = await supabase.from('profiles').update(changes).eq('id', user.id)
    setBusy(false)
    if (error) { setNotice({ type: 'error', text: friendly(error) }); return }
    setProfile(p => ({ ...p, ...changes }))
    setNotice({ type: 'ok', text: 'Dados salvos! 🤎' })
  }

  const set = key => event => {
    const value = key === 'phone' ? formatPhone(event.target.value) : event.target.value
    setForm(f => ({ ...f, [key]: value })); setNotice(null)
  }

  return (
    <section className="acc-card">
      <header><UserRound /><h2>Informações da conta</h2></header>
      <form className="acc-body" onSubmit={save} noValidate>
        <div className="acc-grid">
          <label className="acc-field">
            <span>Nome completo</span>
            <div className="acc-input editable"><input value={form.full_name} onChange={set('full_name')} autoComplete="name" /><Pencil /></div>
          </label>
          <div className="acc-field">
            <span>E-mail</span>
            <div className="acc-input readonly">
              <p>{user.email}</p>
              <button type="button" className="acc-inline-link" onClick={() => goTo('acesso')}>Alterar</button>
            </div>
          </div>
          <label className="acc-field">
            <span>WhatsApp</span>
            <div className="acc-input editable"><input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel-national" inputMode="numeric" placeholder="(85) 99999-9999" maxLength={15} /><Pencil /></div>
          </label>
          <div className="acc-field">
            <span>Tipo de conta</span>
            <div className="acc-input readonly"><p className="acc-status"><i />{profile?.role === 'admin' ? 'Administradora da loja' : 'Cliente Maré'}</p></div>
          </div>
        </div>

        <Notice notice={notice} />
        <div className="acc-actions">
          <button className="button dark small" type="submit" disabled={busy || !dirty}><Save /> {busy ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>

        <div className="acc-photo-row">
          <Avatar profile={profile} user={user} className="small" />
          <div>
            <b>Foto de perfil</b>
            <small>JPG, PNG ou WEBP · Máx. 5 MB</small>
          </div>
          <div className="acc-photo-buttons">
            <button type="button" className="button dark small" onClick={avatar.pick} disabled={avatar.busy}><Camera /> {avatar.busy ? 'Enviando…' : avatar.has ? 'Alterar foto' : 'Adicionar foto'}</button>
            {avatar.has && <button type="button" className="button outline small" onClick={avatar.remove} disabled={avatar.busy}><Trash2 /> Remover</button>}
          </div>
        </div>
        <Notice notice={avatar.notice} />
      </form>
    </section>
  )
}

// ---------- Aba Favoritos ----------
function FavoritesTab() {
  const { liked } = useShop()
  const favorites = products.filter(p => liked.includes(p.id))
  return (
    <section className="acc-card">
      <header><Heart /><h2>Meus favoritos</h2><small className="acc-count">{favorites.length}</small></header>
      <div className="acc-body">
        {favorites.length ? (
          <div className="acc-fav-grid">
            {favorites.map((p, i) => <ProductCard key={p.id} product={p} index={i} sizes="(max-width: 900px) 42vw, 200px" />)}
          </div>
        ) : (
          <div className="acc-empty">
            <Heart />
            <p>Toque no coração das peças que você amar — elas ficam guardadas aqui.</p>
            <Link className="button dark small" to="/produtos">Ver peças</Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ---------- Aba E-mail e senha ----------
function AccessTab() {
  const { user } = useShop()
  const [email, setEmail] = useState('')
  const [emailNotice, setEmailNotice] = useState(null)
  const [emailBusy, setEmailBusy] = useState(false)
  const [pass, setPass] = useState({ atual: '', nova: '', repetir: '' })
  const [passErrors, setPassErrors] = useState({})
  const [passNotice, setPassNotice] = useState(null)
  const [passBusy, setPassBusy] = useState(false)

  const changeEmail = async event => {
    event.preventDefault()
    const next = email.trim().toLowerCase()
    if (!emailOk(next)) { setEmailNotice({ type: 'error', text: 'Digite um e-mail válido.' }); return }
    if (next === user.email) { setEmailNotice({ type: 'error', text: 'Esse já é o seu e-mail atual.' }); return }
    setEmailBusy(true)
    const { error } = await supabase.auth.updateUser({ email: next }, { emailRedirectTo: backHere() })
    setEmailBusy(false)
    if (error) { setEmailNotice({ type: 'error', text: friendly(error) }); return }
    setEmail('')
    setEmailNotice({ type: 'ok', text: 'Quase lá! Enviamos um link de confirmação. A troca só vale depois que você clicar nele. 💌' })
  }

  const setP = key => event => { setPass(p => ({ ...p, [key]: event.target.value })); setPassErrors(e => ({ ...e, [key]: null })); setPassNotice(null) }

  const changePassword = async event => {
    event.preventDefault()
    const errors = {}
    if (!pass.atual) errors.atual = 'Digite sua senha atual.'
    if (pass.nova.length < 8) errors.nova = 'A nova senha precisa ter pelo menos 8 caracteres.'
    if (pass.repetir !== pass.nova) errors.repetir = 'As senhas não são iguais.'
    setPassErrors(errors)
    if (Object.keys(errors).length) return
    setPassBusy(true)
    // Confere a senha atual antes de trocar.
    const check = await supabase.auth.signInWithPassword({ email: user.email, password: pass.atual })
    if (check.error) { setPassBusy(false); setPassErrors({ atual: 'Senha atual incorreta.' }); return }
    const { error } = await supabase.auth.updateUser({ password: pass.nova })
    setPassBusy(false)
    if (error) { setPassNotice({ type: 'error', text: friendly(error) }); return }
    setPass({ atual: '', nova: '', repetir: '' })
    setPassNotice({ type: 'ok', text: 'Senha alterada! 🔒' })
  }

  return (
    <>
      <section className="acc-card">
        <header><Mail /><h2>Alterar e-mail</h2></header>
        <form className="acc-body acc-form" onSubmit={changeEmail} noValidate>
          <p className="acc-hint">Seu e-mail atual é <b>{user.email}</b>. Vamos mandar um link de confirmação antes de trocar.</p>
          <label className="field">
            <span>Novo e-mail</span>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailNotice(null) }} autoComplete="email" placeholder="seuemail@exemplo.com" />
          </label>
          <Notice notice={emailNotice} />
          <button className="button dark small" type="submit" disabled={emailBusy}><Mail /> {emailBusy ? 'Enviando…' : 'Enviar confirmação'}</button>
        </form>
      </section>

      <section className="acc-card">
        <header><KeyRound /><h2>Alterar senha</h2></header>
        <form className="acc-body acc-form" onSubmit={changePassword} noValidate>
          <PasswordField label="Senha atual" value={pass.atual} onChange={setP('atual')} error={passErrors.atual} autoComplete="current-password" placeholder="Sua senha de hoje" />
          <div className="acc-grid">
            <PasswordField label="Nova senha" value={pass.nova} onChange={setP('nova')} error={passErrors.nova} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" />
            <PasswordField label="Repetir nova senha" value={pass.repetir} onChange={setP('repetir')} error={passErrors.repetir} autoComplete="new-password" placeholder="Digite de novo" />
          </div>
          <Notice notice={passNotice} />
          <button className="button dark small" type="submit" disabled={passBusy}><KeyRound /> {passBusy ? 'Salvando…' : 'Salvar nova senha'}</button>
        </form>
      </section>
    </>
  )
}

// ---------- Página ----------
export default function Account() {
  const { user, profile, signOut, liked } = useShop()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(t => t.id === params.get('aba')) ? params.get('aba') : 'perfil'
  const avatar = useAvatarUpload()
  const isAdmin = profile?.role === 'admin'
  usePageTitle('Minha conta')

  const goTo = id => {
    setParams(id === 'perfil' ? {} : { aba: id }, { replace: true })
    document.querySelector('.acc-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const name = profile?.full_name || user.email.split('@')[0]
  const since = memberSince(profile?.created_at || user.created_at)

  const quick = [
    isAdmin && { key: 'painel', to: '/painel-loja', Icon: LayoutGrid, title: 'Painel da loja', text: 'Produtos, textos e acessos', accent: true },
    { key: 'favoritos', onClick: () => goTo('favoritos'), Icon: Heart, title: 'Meus favoritos', text: liked.length ? `${liked.length} ${liked.length === 1 ? 'peça guardada' : 'peças guardadas'}` : 'Nenhuma peça ainda' },
    { key: 'acesso', onClick: () => goTo('acesso'), Icon: LockKeyhole, title: 'E-mail e senha', text: 'Altere seus dados de acesso' },
    { key: 'whats', href: whatsappLink(helloMessage), Icon: WhatsApp, title: 'Fale com a Maré', text: 'Tire dúvidas pelo WhatsApp' },
    { key: 'sair', onClick: signOut, Icon: LogOut, title: 'Sair da conta', text: 'Encerrar sessão' },
  ].filter(Boolean)

  return (
    <div className="acc-page">
      {avatar.input}
      <section className="acc-hero">
        <div className="shell acc-hero-inner">
          <button type="button" className="acc-hero-photo" onClick={avatar.pick} disabled={avatar.busy} aria-label="Alterar foto de perfil">
            <Avatar profile={profile} user={user} className="large" />
            <span className="acc-camera"><Camera /></span>
          </button>
          <div className="acc-hero-text">
            <h1>{name} <span className="acc-online"><i />Online</span></h1>
            <p>{isAdmin ? 'Administradora da loja' : 'Cliente Maré'}{since ? ` · desde ${since}` : ''}</p>
          </div>
          <div className="acc-hero-buttons">
            <button type="button" className="button dark small" onClick={avatar.pick} disabled={avatar.busy}><Camera /> {avatar.busy ? 'Enviando…' : 'Alterar foto'}</button>
            {isAdmin
              ? <Link className="button outline small" to="/painel-loja"><LayoutGrid /> Painel da loja</Link>
              : <Link className="button outline small" to="/produtos"><Heart /> Ver peças</Link>}
          </div>
        </div>

        <div className="shell">
          <nav className="acc-tabs" role="tablist" aria-label="Seções da conta">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => goTo(id)}>
                <Icon /> {label}{id === 'favoritos' && liked.length > 0 && <small>{liked.length}</small>}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <div className="acc-content">
        <div className="shell acc-layout">
          <div className="acc-main" key={tab}>
            {tab === 'perfil' && <ProfileTab avatar={avatar} goTo={goTo} />}
            {tab === 'favoritos' && <FavoritesTab />}
            {tab === 'acesso' && <AccessTab />}
          </div>

          <aside className="acc-card acc-quick">
            <header><Zap /><h2>Ações rápidas</h2></header>
            <ul className="acc-body">
              {quick.map(({ key, to, href, onClick, Icon, title, text, accent }) => {
                const inner = <><span className={`acc-quick-icon ${accent ? 'accent' : ''}`}><Icon /></span><span><b>{title}</b><small>{text}</small></span><ChevronRight className="acc-chevron" /></>
                return (
                  <li key={key}>
                    {to ? <Link to={to}>{inner}</Link>
                      : href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a>
                      : <button type="button" onClick={onClick}>{inner}</button>}
                  </li>
                )
              })}
            </ul>
            {isAdmin && <p className="acc-admin-note"><ShieldCheck /> Só você vê o atalho do painel.</p>}
          </aside>
        </div>
      </div>
    </div>
  )
}

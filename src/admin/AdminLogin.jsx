import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogOut, ShieldAlert } from 'lucide-react'
import { supabase } from '../supabase.js'
import { logo } from '../ui.jsx'
import { signOut } from './useAdminAuth.js'

const friendlyError = message => {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
  if (/rate limit|too many/i.test(message)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.'
  return 'Não foi possível entrar agora. Tente de novo em instantes.'
}

function AuthCard({ children }) {
  return (
    <div className="adm-auth">
      <div className="adm-auth-card">
        <img className="adm-auth-logo" src={logo} alt="Maré" />
        {children}
      </div>
      <Link className="adm-auth-back" to="/"><ArrowLeft /> Voltar para a loja</Link>
    </div>
  )
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const submit = async event => {
    event.preventDefault()
    if (!email.trim() || !password) return setNotice({ type: 'error', text: 'Preencha e-mail e senha.' })
    setBusy(true)
    setNotice(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setNotice({ type: 'error', text: friendlyError(error.message) })
  }

  const forgot = async () => {
    if (!email.trim()) return setNotice({ type: 'error', text: 'Digite seu e-mail acima para receber o link de nova senha.' })
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/entrar` })
    setBusy(false)
    setNotice(error
      ? { type: 'error', text: friendlyError(error.message) }
      : { type: 'ok', text: 'Se esse e-mail tiver acesso, enviamos um link para criar uma nova senha.' })
  }

  return (
    <AuthCard>
      <p className="adm-eyebrow"><LockKeyhole /> Painel da loja</p>
      <h1>Entrar no painel</h1>
      <p className="adm-auth-sub">Área restrita para a administração da Maré.</p>

      <form onSubmit={submit} noValidate>
        <label className="adm-field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" autoFocus />
        </label>
        <label className="adm-field">
          <span>Senha</span>
          <div className="adm-input-icon">
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>{show ? <EyeOff /> : <Eye />}</button>
          </div>
        </label>

        {notice && <p className={`adm-notice ${notice.type === 'error' ? 'is-error' : 'is-ok'}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>}

        <button className="adm-btn primary block" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <button type="button" className="adm-link" onClick={forgot} disabled={busy}>Esqueci minha senha</button>
      </form>
    </AuthCard>
  )
}

export function AdminDenied({ email }) {
  return (
    <AuthCard>
      <p className="adm-eyebrow is-warn"><ShieldAlert /> Acesso restrito</p>
      <h1>Esta conta não tem acesso</h1>
      <p className="adm-auth-sub">Você entrou como <b>{email}</b>, mas só a administração da loja pode usar o painel.</p>
      <button className="adm-btn outline block" onClick={signOut}><LogOut /> Sair e entrar com outra conta</button>
    </AuthCard>
  )
}

export function AdminOffline() {
  return (
    <AuthCard>
      <p className="adm-eyebrow is-warn"><ShieldAlert /> Sem conexão</p>
      <h1>Painel indisponível</h1>
      <p className="adm-auth-sub">O site não está conectado ao banco de dados (Supabase). Verifique o arquivo .env.</p>
    </AuthCard>
  )
}

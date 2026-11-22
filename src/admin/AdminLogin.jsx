import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogOut, MailCheck, ShieldAlert } from 'lucide-react'
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
    if (error) return setNotice({ type: 'error', text: friendlyError(error.message) })
    window.location.replace('/') // entrou: sempre vai para o Início do site (o painel fica no atalho de Minha conta)
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

// Convite de admin (/painel-loja/convite?token_hash=...&type=invite), vindo do e-mail
// "Aceitar convite". Valida o convite, a pessoa cria a senha e já entra no painel.
// Quem vira admin é decidido no banco (só contas criadas por convite), não aqui.
export function AcceptInvite() {
  const [step, setStep] = useState('checking') // checking | password | invalid
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return // o link só pode ser usado uma vez; evita validar duas vezes
    started.current = true
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')
    if (!token_hash || params.get('type') !== 'invite') { setStep('invalid'); return }
    supabase.auth.verifyOtp({ token_hash, type: 'invite' }).then(({ data, error: e }) => {
      if (e || !data.session) { setStep('invalid'); return }
      window.history.replaceState(null, '', window.location.pathname) // tira o código do endereço
      setEmail(data.user?.email || '')
      setStep('password')
    })
  }, [])

  const save = async event => {
    event.preventDefault()
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.')
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return setError('Use letras e números na senha.')
    if (password !== repeat) return setError('As duas senhas não são iguais.')
    setBusy(true); setError(null)
    const { error: e } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (e) return setError(/weak|characters/i.test(e.message) ? 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.' : 'Não foi possível salvar a senha. Tente de novo.')
    window.location.replace('/') // senha criada: vai para o Início do site, já logada
  }

  if (step === 'checking') return <div className="adm-loading" role="status"><span className="adm-spinner" /> Validando convite…</div>

  if (step === 'invalid') return (
    <AuthCard>
      <p className="adm-eyebrow is-warn"><ShieldAlert /> Convite inválido</p>
      <h1>Este convite não vale mais</h1>
      <p className="adm-auth-sub">O link já foi usado ou expirou. Peça para a administração enviar um novo convite. Se você já criou sua senha, é só entrar normalmente.</p>
      <Link className="adm-btn primary block" to="/painel-loja">Ir para o login do painel</Link>
    </AuthCard>
  )

  return (
    <AuthCard>
      <p className="adm-eyebrow"><MailCheck /> Convite aceito</p>
      <h1>Crie sua senha</h1>
      <p className="adm-auth-sub">Bem-vinda à equipe da Maré! Escolha a senha que você vai usar para entrar no painel com <b>{email}</b>.</p>
      <form onSubmit={save} noValidate>
        <label className="adm-field">
          <span>Nova senha</span>
          <div className="adm-input-icon">
            <input type={show ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(null) }} autoComplete="new-password" autoFocus />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>{show ? <EyeOff /> : <Eye />}</button>
          </div>
          <small>Pelo menos 8 caracteres, com letras e números.</small>
        </label>
        <label className="adm-field">
          <span>Repita a senha</span>
          <input type={show ? 'text' : 'password'} value={repeat} onChange={e => { setRepeat(e.target.value); setError(null) }} autoComplete="new-password" />
        </label>
        {error && <p className="adm-notice is-error" role="alert">{error}</p>}
        <button className="adm-btn primary block" disabled={busy}>{busy ? 'Salvando…' : 'Salvar senha e entrar'}</button>
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

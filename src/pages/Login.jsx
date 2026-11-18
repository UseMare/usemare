import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, KeyRound, LogIn, Mail, UserPlus } from 'lucide-react'
import { usePageTitle, useShop } from '../shop.jsx'
import { HandHeart, WhatsApp } from '../ui.jsx'
import { helloMessage, whatsappLink } from '../store.js'
import { supabase } from '../supabase.js'
import { backHere, emailOk, friendly, PasswordField } from './authShared.jsx'
import Account from './Account.jsx'

// Login / criar conta / recuperar senha — tudo pelo Supabase Auth. Logada, mostra Minha conta (Account.jsx).
// O nome vai em options.data.full_name: o banco cria o perfil (public.profiles) sozinho.

// ---------- Formulário de entrada / cadastro / esqueci a senha ----------
function AuthForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('entrar') // entrar | criar | esqueci
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  usePageTitle(mode === 'criar' ? 'Criar conta' : mode === 'esqueci' ? 'Recuperar senha' : 'Entrar')

  const isSignup = mode === 'criar'
  const isForgot = mode === 'esqueci'
  const set = key => event => { setForm(f => ({ ...f, [key]: event.target.value })); setErrors(e => ({ ...e, [key]: null })) }
  const switchMode = value => { setMode(value); setErrors({}); setNotice(null) }

  const submit = async event => {
    event.preventDefault()
    const next = {}
    if (isSignup && form.nome.trim().length < 2) next.nome = 'Conta pra gente o seu nome 🤍'
    if (!emailOk(form.email)) next.email = 'Digite um e-mail válido.'
    if (!isForgot && form.senha.length < (isSignup ? 8 : 1)) next.senha = isSignup ? 'A senha precisa ter pelo menos 8 caracteres.' : 'Digite sua senha.'
    setErrors(next)
    setNotice(null)
    if (Object.keys(next).length) return
    if (!supabase) { setNotice({ type: 'error', text: 'Login indisponível no momento.' }); return }

    setBusy(true)
    const email = form.email.trim()
    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: backHere() })
        if (error) throw error
        setNotice({ type: 'ok', text: 'Se esse e-mail tiver conta, enviamos um link para criar uma nova senha. Confira também o spam. 💌' })
      } else if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email, password: form.senha,
          options: { data: { full_name: form.nome.trim() }, emailRedirectTo: backHere() },
        })
        if (error) throw error
        if (data.user && !data.user.identities?.length) throw { code: 'user_already_exists' }
        if (!data.session) setNotice({ type: 'ok', text: 'Conta criada! Enviamos um link de confirmação para o seu e-mail. É só clicar nele para entrar. 🌊' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: form.senha })
        if (error) throw error
      }
    } catch (error) {
      setNotice({ type: 'error', text: friendly(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-card">
      <button className="login-back" onClick={() => (isForgot ? switchMode('entrar') : navigate(-1))}><ChevronLeft /> Voltar</button>

      {!isForgot && (
        <div className="login-tabs" role="tablist">
          <button role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => switchMode('entrar')}>Entrar</button>
          <button role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => switchMode('criar')}>Criar conta</button>
          <span className="login-tabs-ink" style={{ transform: `translateX(${isSignup ? 100 : 0}%)` }} />
        </div>
      )}

      <h2>{isForgot ? 'Recuperar senha' : isSignup ? 'Criar sua conta' : 'Entrar na sua conta'}</h2>
      <p className="login-sub">{isForgot ? 'Digite seu e-mail e enviaremos um link para criar uma nova senha.' : isSignup ? 'Leva menos de um minuto. 💕' : 'Use seu e-mail e senha para acessar.'}</p>

      <form onSubmit={submit} noValidate key={mode}>
        {isSignup && (
          <label className={`field ${errors.nome ? 'invalid' : ''}`}>
            <span>Nome</span>
            <input value={form.nome} onChange={set('nome')} autoComplete="name" placeholder="Como podemos te chamar?" />
            {errors.nome && <small>{errors.nome}</small>}
          </label>
        )}
        <label className={`field ${errors.email ? 'invalid' : ''}`}>
          <span>E-mail</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="seuemail@exemplo.com" />
          {errors.email && <small>{errors.email}</small>}
        </label>
        {!isForgot && (
          <PasswordField value={form.senha} onChange={set('senha')} error={errors.senha}
            autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Mínimo de 8 caracteres' : 'Sua senha'} />
        )}

        {mode === 'entrar' && <button type="button" className="login-forgot link-button" onClick={() => switchMode('esqueci')}>Esqueci minha senha</button>}

        {notice && <p className={`login-notice ${notice.type === 'error' ? 'is-error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>}

        <button className="button dark login-submit" type="submit" disabled={busy}>
          {busy ? 'Aguarde…' : isForgot ? <><Mail /> Enviar link</> : isSignup ? <><UserPlus /> Criar minha conta</> : <><LogIn /> Entrar</>}
        </button>
      </form>

      {!isForgot && (
        <p className="login-switch">
          {isSignup ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
          <button type="button" onClick={() => switchMode(isSignup ? 'entrar' : 'criar')}>{isSignup ? 'Entrar' : 'Criar conta'}</button>
        </p>
      )}

      <div className="login-or"><span>ou</span></div>
      <a className="button outline login-whats" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Fale com a Maré</a>
    </div>
  )
}

// ---------- Nova senha (chegou pelo link do e-mail) ----------
function NewPassword() {
  const { endRecovery } = useShop()
  const [senha, setSenha] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  usePageTitle('Nova senha')

  const submit = async event => {
    event.preventDefault()
    if (senha.length < 8) { setError('A senha precisa ter pelo menos 8 caracteres.'); return }
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password: senha })
    setBusy(false)
    if (err) { setNotice({ type: 'error', text: friendly(err) }); return }
    setNotice({ type: 'ok', text: 'Senha atualizada! 🤎' })
    setTimeout(endRecovery, 1500)
  }

  return (
    <div className="login-card">
      <h2>Criar nova senha</h2>
      <p className="login-sub">Escolha uma senha com pelo menos 8 caracteres.</p>
      <form onSubmit={submit} noValidate>
        <PasswordField label="Nova senha" value={senha} onChange={e => { setSenha(e.target.value); setError(null) }} error={error} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" />
        {notice && <p className={`login-notice ${notice.type === 'error' ? 'is-error' : ''}`} role="status">{notice.text}</p>}
        <button className="button dark login-submit" type="submit" disabled={busy}><KeyRound /> {busy ? 'Salvando…' : 'Salvar nova senha'}</button>
      </form>
    </div>
  )
}

export default function Login() {
  const { user, authReady, recovering } = useShop()
  const view = recovering ? 'nova-senha' : user ? 'conta' : 'entrar'
  if (authReady && view === 'conta') return <Account />

  return (
    <section className="login-page">
      <div className="login-brand">
        <span className="login-script" aria-hidden="true">maré</span>
        <div className="login-brand-inner">
          <p className="eyebrow">Sua conta Maré</p>
          <h1>Faça parte<br /><em>da nossa história.</em></h1>
          <div className="login-photos" aria-hidden="true">
            {['04-01', '02-01', '08-01'].map(id => <img key={id} src={`/img/produtos/${id}-480.webp`} alt="" />)}
            <p>Vista sua melhor versão<HandHeart className="hand-heart small" /></p>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        {!authReady ? <p className="login-sub">Carregando…</p>
          : view === 'nova-senha' ? <NewPassword />
          : <AuthForm />}
      </div>
    </section>
  )
}

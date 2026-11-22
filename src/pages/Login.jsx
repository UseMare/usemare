import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, KeyRound, LogIn, Mail, ShoppingBag, UserPlus } from 'lucide-react'
import { orderLink, takePendingOrder } from '../checkout.jsx'
import { usePageTitle, useShop } from '../shop.jsx'
import { HandHeart, WhatsApp } from '../ui.jsx'
import { helloMessage, whatsappLink } from '../store.js'
import { supabase } from '../supabase.js'
import { backHere, emailOk, formatPhone, friendly, PasswordField, PHONE_ERROR, phoneDigits, phoneOk } from './authShared.jsx'
import Account from './Account.jsx'

// Login / criar conta / recuperar senha — tudo pelo Supabase Auth. Logada, mostra Minha conta (Account.jsx).
// O nome vai em options.data.full_name: o banco cria o perfil (public.profiles) sozinho.

// A conta logada é da administração? (o banco decide; aqui só serve para escolher a tela de destino)
const isAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
  return data?.role === 'admin'
}

// ---------- Formulário de entrada / cadastro / esqueci a senha ----------
function AuthForm({ checkout }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState(checkout ? 'criar' : 'entrar') // entrar | criar | esqueci
  const [form, setForm] = useState({ nome: '', whatsapp: '', email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  usePageTitle(mode === 'criar' ? 'Criar conta' : mode === 'esqueci' ? 'Recuperar senha' : 'Entrar')

  const isSignup = mode === 'criar'
  const isForgot = mode === 'esqueci'
  const set = key => event => {
    const value = key === 'whatsapp' ? formatPhone(event.target.value) : event.target.value
    setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: null }))
  }
  const switchMode = value => { setMode(value); setErrors({}); setNotice(null) }

  const submit = async event => {
    event.preventDefault()
    const next = {}
    if (isSignup && form.nome.trim().length < 2) next.nome = 'Conta pra gente o seu nome 🤍'
    if (isSignup && !phoneOk(form.whatsapp)) next.whatsapp = PHONE_ERROR
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
          // phone: o banco grava no perfil (handle_new_user), só os 11 dígitos.
          options: { data: { full_name: form.nome.trim(), phone: phoneDigits(form.whatsapp) }, emailRedirectTo: window.location.origin + '/' },
        })
        if (error) throw error
        if (data.user && !data.user.identities?.length) throw { code: 'user_already_exists' }
        if (data.session && checkout) return // a página (Login) finaliza o pedido ao ver a sessão
        if (data.session) { navigate('/', { replace: true }); return }
        setNotice({ type: 'ok', text: 'Conta criada! Enviamos um link de confirmação para o seu e-mail. É só clicar nele para entrar. 🌊' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: form.senha })
        if (error) throw error
        if (checkout) return // a página (Login) finaliza o pedido ao ver a sessão
        if (await isAdmin()) { navigate('/painel-loja', { replace: true }); return } // admin: vai direto para o painel
        navigate('/', { replace: true }) // cliente: vai para o Início
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

      {checkout && !isForgot && (
        <p className="login-checkout" role="status">
          <ShoppingBag />
          <span><b>Falta só isso para finalizar!</b> {isSignup ? 'Crie sua conta' : 'Entre na sua conta'} e seu pedido vai pronto para o WhatsApp da Maré.</span>
        </p>
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
        {isSignup && (
          <label className={`field ${errors.whatsapp ? 'invalid' : ''}`}>
            <span>WhatsApp</span>
            <input type="tel" inputMode="numeric" value={form.whatsapp} onChange={set('whatsapp')} autoComplete="tel-national"
              placeholder="(85) 99999-9999" maxLength={15} />
            {errors.whatsapp && <small>{errors.whatsapp}</small>}
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
    // Admin que trocou a senha (ex.: "Esqueci minha senha" do painel) volta para o painel.
    if (await isAdmin()) { setTimeout(() => window.location.replace('/painel-loja'), 1200); return }
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

// ---------- Pedido pronto (depois de entrar pelo botão "Finalizar pedido") ----------
function OrderReady({ link, opened }) {
  usePageTitle('Pedido pronto')
  return (
    <section className="order-ready">
      <div className="order-ready-card">
        <span className="order-ready-icon"><WhatsApp /></span>
        <p className="eyebrow">Conta pronta 🤍</p>
        <h1>Seu pedido está pronto!</h1>
        <p>{opened
          ? 'Abrimos o WhatsApp da Maré com seu pedido completo. É só tocar em enviar por lá. Se a conversa não abriu, use o botão abaixo.'
          : 'Toque no botão abaixo para enviar seu pedido completo para o WhatsApp da Maré.'}</p>
        <a className="button whatsapp big" href={link} target="_blank" rel="noreferrer"><WhatsApp /> Enviar pedido no WhatsApp</a>
        <Link className="button outline" to="/produtos">Continuar navegando</Link>
      </div>
    </section>
  )
}

export default function Login() {
  const { user, authReady, recovering } = useShop()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const checkout = params.get('finalizar') === '1'
  const [order, setOrder] = useState(null) // { link, opened }
  const view = recovering ? 'nova-senha' : user ? 'conta' : 'entrar'

  // Veio do "Finalizar pedido" e agora está logada (criou a conta ou entrou): monta o pedido
  // guardado e abre o WhatsApp. O navegador costuma permitir abrir a aba logo após o clique em
  // "Criar conta"/"Entrar"; se bloquear, a tela OrderReady mostra o botão.
  const finishing = checkout && authReady && user && !order
  const started = React.useRef(false)
  React.useEffect(() => {
    if (!finishing || started.current) return
    started.current = true // o pedido guardado é usado uma vez só
    ;(async () => {
      const items = takePendingOrder()
      if (!items.length) { navigate('/entrar', { replace: true }); return }
      const { data: prof } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle()
      const link = orderLink(items, {
        name: prof?.full_name || user.user_metadata?.full_name || '',
        email: user.email,
        phone: prof?.phone || '',
      })
      const win = window.open(link, '_blank') // sem "noopener": com ele o navegador sempre devolve null
      if (win) win.opener = null
      setOrder({ link, opened: !!win })
    })()
  }, [finishing]) // eslint-disable-line react-hooks/exhaustive-deps

  if (order) return <OrderReady {...order} />
  if (finishing) return <section className="login-page"><p className="login-sub" role="status">Preparando seu pedido…</p></section>
  if (authReady && view === 'conta') return <Account />

  return (
    <section className={`login-page ${checkout ? 'is-checkout' : ''}`}>
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
          : <AuthForm checkout={checkout} />}
      </div>
    </section>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { usePageTitle } from '../shop.jsx'
import { HandHeart, WhatsApp } from '../ui.jsx'
import { helloMessage, whatsappLink } from '../store.js'

// Tela de login / criar conta.
// IMPORTANTE: ainda sem servidor — o formulário valida os campos e mostra um aviso.
// Quando o banco de dados for conectado, o envio passa a autenticar de verdade.

const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('entrar')
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  usePageTitle(mode === 'entrar' ? 'Entrar' : 'Criar conta')

  const isSignup = mode === 'criar'
  const set = key => event => { setForm(f => ({ ...f, [key]: event.target.value })); setErrors(e => ({ ...e, [key]: null })) }

  const submit = event => {
    event.preventDefault()
    const next = {}
    if (isSignup && form.nome.trim().length < 2) next.nome = 'Conta pra gente o seu nome 🤍'
    if (!emailOk(form.email)) next.email = 'Digite um e-mail válido.'
    if (form.senha.length < (isSignup ? 8 : 1)) next.senha = isSignup ? 'A senha precisa ter pelo menos 8 caracteres.' : 'Digite sua senha.'
    setErrors(next)
    if (Object.keys(next).length) return
    setNotice(isSignup
      ? 'Cadastro liberado em breve! 🌊'
      : 'Acesso liberado em breve! 🤎')
  }

  const switchMode = value => { setMode(value); setErrors({}); setNotice(null) }

  return (
    <section className="login-page">
      <div className="login-brand">
        <span className="login-script" aria-hidden="true">maré</span>
        <div className="login-brand-inner">
          <p className="eyebrow">Sua conta Maré</p>
          <h1>{isSignup ? <>Faça parte<br /><em>da nossa história.</em></> : <>Que bom te ver<br /><em>de novo.</em></>}</h1>
          <div className="login-photos" aria-hidden="true">
            {['04-01', '02-01', '08-01'].map(id => <img key={id} src={`/img/produtos/${id}-480.webp`} alt="" />)}
            <p>Vista sua melhor versão<HandHeart className="hand-heart small" /></p>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <button className="login-back" onClick={() => navigate(-1)}><ChevronLeft /> Voltar</button>

          <div className="login-tabs" role="tablist">
            <button role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => switchMode('entrar')}>Entrar</button>
            <button role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => switchMode('criar')}>Criar conta</button>
            <span className="login-tabs-ink" style={{ transform: `translateX(${isSignup ? 100 : 0}%)` }} />
          </div>

          <h2>{isSignup ? 'Criar sua conta' : 'Entrar na sua conta'}</h2>
          <p className="login-sub">{isSignup ? 'Leva menos de um minuto. 💕' : 'Use seu e-mail e senha para acessar.'}</p>

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
            <label className={`field ${errors.senha ? 'invalid' : ''}`}>
              <span>Senha</span>
              <div className="field-password">
                <input type={show ? 'text' : 'password'} value={form.senha} onChange={set('senha')} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Mínimo de 8 caracteres' : 'Sua senha'} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>{show ? <EyeOff /> : <Eye />}</button>
              </div>
              {errors.senha && <small>{errors.senha}</small>}
            </label>

            {!isSignup && <a className="login-forgot" href={whatsappLink('Oi, Maré! 🌊 Esqueci a senha da minha conta no site. Pode me ajudar? 🤎')} target="_blank" rel="noreferrer">Esqueci minha senha</a>}

            {notice && <p className="login-notice" role="status">{notice}</p>}

            <button className="button dark login-submit" type="submit">{isSignup ? <><UserPlus /> Criar minha conta</> : <><LogIn /> Entrar</>}</button>
          </form>

          <p className="login-switch">
            {isSignup ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <button type="button" onClick={() => switchMode(isSignup ? 'entrar' : 'criar')}>{isSignup ? 'Entrar' : 'Criar conta'}</button>
          </p>

          <div className="login-or"><span>ou</span></div>
          <a className="button outline login-whats" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Fale com a Maré</a>
        </div>
      </div>
    </section>
  )
}

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Peças comuns da tela de login e da página Minha conta.

export const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
export const backHere = () => `${window.location.origin}/entrar`

// Celular/WhatsApp: DDD (2 dígitos) + 9 dígitos começando com 9 → "(85) 99951-9515".
// No banco fica só com os dígitos: "85999519515".
export const phoneDigits = value => String(value || '').replace(/\D/g, '').replace(/^55(?=\d{11}$)/, '').slice(0, 11)
export const phoneOk = value => /^[1-9]{2}9\d{8}$/.test(phoneDigits(value))
export const formatPhone = value => {
  const d = phoneDigits(value)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
export const PHONE_ERROR = 'Digite o WhatsApp com DDD: 2 dígitos do DDD + 9 dígitos do número. Ex.: (85) 99951-9515'

// Mensagens do Supabase traduzidas para o tom da Maré.
export const friendly = error => {
  const code = error?.code || ''
  const text = (error?.message || '').toLowerCase()
  if (code === 'invalid_credentials' || text.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (code === 'email_not_confirmed' || text.includes('not confirmed')) return 'Falta confirmar seu e-mail: abra o link que enviamos para a sua caixa de entrada. 💌'
  if (code === 'user_already_exists' || code === 'email_exists' || text.includes('already registered')) return 'Esse e-mail já tem conta. Que tal entrar?'
  if (code === 'weak_password') return 'Escolha uma senha mais forte (misture letras e números).'
  if (code.includes('rate_limit') || text.includes('rate limit')) return 'Muitas tentativas seguidas. Espere alguns minutinhos e tente de novo.'
  if (code === 'same_password') return 'A nova senha precisa ser diferente da atual.'
  return 'Não deu certo agora. Tente de novo em instantes. 🤍'
}

export function PasswordField({ value, onChange, error, autoComplete, placeholder, label = 'Senha' }) {
  const [show, setShow] = useState(false)
  return (
    <label className={`field ${error ? 'invalid' : ''}`}>
      <span>{label}</span>
      <div className="field-password">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>{show ? <EyeOff /> : <Eye />}</button>
      </div>
      {error && <small>{error}</small>}
    </label>
  )
}

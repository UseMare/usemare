import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Peças comuns da tela de login e da página Minha conta.

export const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
export const backHere = () => `${window.location.origin}/entrar`

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

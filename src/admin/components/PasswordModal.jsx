import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { Modal, errorText, useToast } from '../ui.jsx'

// Troca a senha de quem está logado no painel (menu do usuário → Alterar senha).
const passwordError = error => {
  const msg = error?.message || ''
  if (/different from the old/i.test(msg)) return 'A nova senha precisa ser diferente da senha atual.'
  if (/weak|at least|characters/i.test(msg)) return 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.'
  if (/reauthentication|recent/i.test(msg)) return 'Por segurança, saia e entre de novo no painel antes de trocar a senha.'
  return errorText(error).replace('Não foi possível salvar', 'Não foi possível trocar a senha')
}

export default function PasswordModal({ onClose }) {
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const save = async event => {
    event?.preventDefault()
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.')
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return setError('Use letras e números na senha.')
    if (password !== repeat) return setError('As duas senhas não são iguais.')
    setSaving(true); setError(null)
    const { error: e } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (e) return setError(passwordError(e))
    toast('Senha alterada. Use a nova senha no próximo acesso.')
    onClose()
  }

  return (
    <Modal title="Alterar senha" onClose={saving ? undefined : onClose} closeOnBackdrop={false}
      footer={<>
        <button className="adm-btn outline" onClick={onClose} disabled={saving}>Cancelar</button>
        <button className="adm-btn primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar nova senha'}</button>
      </>}>
      <form onSubmit={save} className="adm-password-form">
        {error && <p className="adm-notice is-error">{error}</p>}
        <label className="adm-field"><span>Nova senha</span>
          <div className="adm-input-icon">
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            <button type="button" className="adm-icon-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>{show ? <EyeOff /> : <Eye />}</button>
          </div>
          <small>Pelo menos 8 caracteres, com letras e números.</small>
        </label>
        <label className="adm-field"><span>Repita a nova senha</span>
          <input type={show ? 'text' : 'password'} value={repeat} onChange={e => setRepeat(e.target.value)} autoComplete="new-password" />
        </label>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

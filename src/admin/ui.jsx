import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react'

// Componentes compartilhados do painel: avisos rápidos (toast), confirmação e janela (modal).

// ---------- Avisos rápidos ----------
const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const show = useCallback((text, type = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(list => [...list, { id, text, type }])
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), type === 'error' ? 6000 : 3200)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      {createPortal(
        <div className="adm adm-toasts-root" style={{ display: 'contents' }}>
          <div className="adm-toasts" role="status" aria-live="polite">
            {toasts.map(t => (
              <div key={t.id} className={`adm-toast ${t.type}`}>
                {t.type === 'error' ? <XCircle /> : <CheckCircle2 />}<span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

// ---------- Janela ----------
export function Modal({ title, onClose, children, footer, wide = false, closeOnBackdrop = true }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector('input, textarea, select, button')?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous }
  }, [onClose])
  return createPortal(
    <div className="adm-modal-root" onMouseDown={e => { if (closeOnBackdrop && e.target === e.currentTarget) onClose?.() }}>
      <div className={`adm-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="adm-modal-head">
          <h2>{title}</h2>
          {onClose && <button className="adm-icon-btn" onClick={onClose} aria-label="Fechar"><X /></button>}
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

// ---------- Confirmação ----------
// const confirm = useConfirm();  if (await confirm({ title, text, confirmLabel, danger })) { ... }
const ConfirmContext = createContext(async () => false)
export const useConfirm = () => useContext(ConfirmContext)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const confirm = useCallback(options => new Promise(resolve => setState({ ...options, resolve })), [])
  const close = answer => { state?.resolve(answer); setState(null) }
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal
          title={state.title || 'Confirmar'}
          onClose={() => close(false)}
          footer={<>
            <button className="adm-btn outline" onClick={() => close(false)}>{state.cancelLabel || 'Cancelar'}</button>
            <button className={`adm-btn ${state.danger ? 'danger' : 'primary'}`} onClick={() => close(true)}>{state.confirmLabel || 'Confirmar'}</button>
          </>}
        >
          <div className="adm-confirm">
            {state.danger && <span className="adm-confirm-icon"><AlertTriangle /></span>}
            <p>{state.text}</p>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

// ---------- Alterações não salvas ----------
// Pergunta antes de sair da tela com alterações não salvas (links do painel e fechar/recarregar a aba).
export function useUnsavedGuard(dirty, text = 'Você fez alterações que ainda não foram salvas. Se sair agora, elas serão perdidas.') {
  const confirm = useConfirm()
  const navigate = useNavigate()
  useEffect(() => {
    if (!dirty) return
    const onClick = async event => {
      const link = event.target.closest?.('a[href]')
      if (!link || link.target === '_blank' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      event.preventDefault()
      event.stopPropagation()
      const ok = await confirm({ title: 'Sair sem salvar?', text, confirmLabel: 'Sair sem salvar', cancelLabel: 'Continuar editando', danger: true })
      if (ok) navigate(url.pathname + url.search)
    }
    const onUnload = e => { e.preventDefault(); e.returnValue = '' }
    document.addEventListener('click', onClick, true)
    window.addEventListener('beforeunload', onUnload)
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('beforeunload', onUnload) }
  }, [dirty, text, confirm, navigate])
}

// ---------- Pequenos utilitários ----------
export const formatBRL = value => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className="adm-switch">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <i aria-hidden="true" />{label && <span>{label}</span>}
    </label>
  )
}

export function Loading({ text = 'Carregando…' }) {
  return <div className="adm-loading" role="status"><span className="adm-spinner" /> {text}</div>
}

// Transforma o erro do Supabase numa frase em português.
export const errorText = error => {
  const msg = error?.message || String(error || '')
  if (/duplicate key.*slug/i.test(msg)) return 'Já existe outro item com esse endereço (slug). Mude o nome ou o endereço.'
  if (/duplicate key.*code/i.test(msg)) return 'Já existe outro produto com esse código.'
  if (/row-level security|permission denied|42501/i.test(msg)) return 'Sua conta não tem permissão para isso. Entre de novo no painel.'
  if (/JWT|expired/i.test(msg)) return 'Sua sessão expirou. Entre de novo no painel.'
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Sem conexão com a internet. Tente de novo.'
  if (/old_price/i.test(msg)) return 'O preço antigo (promoção) precisa ser maior que o preço atual.'
  if (/price/i.test(msg) && /check/i.test(msg)) return 'O preço precisa ser maior que zero.'
  return `Não foi possível salvar: ${msg}`
}

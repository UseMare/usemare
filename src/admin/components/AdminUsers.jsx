import React, { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { CardHead, errorText, useConfirm, useToast } from '../ui.jsx'

// Configurações → Administração: todas as contas do site com o nível de acesso.
// Admin abre o painel; Usuário comum só usa o site. Regras no banco (admin_set_role):
// ninguém rebaixa a si mesma e a loja nunca fica sem admin.

const PAGE = 5
const LEVELS = [{ value: 'cliente', label: 'Usuário comum' }, { value: 'admin', label: 'Admin' }]
const normalize = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const formatDateTime = iso => iso
  ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')
  : '—'

export default function AdminUsers({ currentUserId }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [busy, setBusy] = useState(null)

  const load = async () => {
    const { data, error: e } = await supabase.rpc('admin_list_users')
    if (e) return setError(errorText(e))
    setRows(data || []); setError(null)
  }
  useEffect(() => { load() }, [])
  useEffect(() => { setLimit(PAGE) }, [search])

  const filtered = useMemo(() => {
    const q = normalize(search.trim())
    return !q ? rows || [] : (rows || []).filter(r => normalize(r.full_name).includes(q) || normalize(r.email).includes(q))
  }, [rows, search])

  const change = async (row, role) => {
    if (role === row.role) return
    const name = row.full_name || row.email
    const ok = await confirm(role === 'admin'
      ? { title: 'Tornar admin', confirmLabel: 'Tornar admin', text: `${name} vai poder abrir o painel e mudar tudo na loja.` }
      : { title: 'Tirar acesso de admin', confirmLabel: 'Tirar acesso', danger: true, text: `${name} não vai mais abrir o painel. A conta no site continua.` })
    if (!ok) return
    setBusy(row.id)
    const { error: e } = await supabase.rpc('admin_set_role', { p_user: row.id, p_role: role })
    setBusy(null)
    if (e) return toast(errorText(e), 'error')
    setRows(list => list.map(r => r.id === row.id ? { ...r, role } : r))
    toast(role === 'admin' ? `${name} agora é admin.` : `${name} agora é usuário comum.`)
  }

  const visible = filtered.slice(0, limit)
  const rest = filtered.length - visible.length

  return (
    <section className="adm-card">
      <CardHead title="Administração" text="Quem pode abrir o painel." info="Admin abre o painel e muda tudo na loja. Usuário comum só usa o site. Você não pode tirar o seu próprio acesso, e a loja sempre fica com pelo menos uma admin." />
      {error ? (
        <><p className="adm-notice is-error">{error}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></>
      ) : !rows ? (
        <p className="adm-muted">Carregando contas…</p>
      ) : (
        <>
          <div className="adm-users-search">
            <label className="adm-search"><Search /><input className="adm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail…" aria-label="Buscar conta" /></label>
            <span className="adm-muted">{visible.length} de {filtered.length}</span>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table adm-users">
              <thead><tr><th>Usuário</th><th>Nível</th><th>Último acesso</th></tr></thead>
              <tbody>
                {visible.map(r => {
                  const self = r.id === currentUserId
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="adm-users-who">
                          <b className="adm-users-name">{r.full_name || '—'}{self && <em> (você)</em>}</b>
                          <small className="adm-muted">{r.email}</small>
                        </span>
                      </td>
                      <td>
                        <select className={`adm-users-level ${r.role === 'admin' ? 'is-admin' : ''}`} value={r.role} disabled={self || busy === r.id}
                          onChange={e => change(r, e.target.value)} aria-label={`Nível de ${r.full_name || r.email}`}
                          title={self ? 'Você não pode mudar o seu próprio nível.' : undefined}>
                          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </td>
                      <td className="adm-muted adm-c-date" data-label="Último acesso">{formatDateTime(r.last_sign_in_at)}</td>
                    </tr>
                  )
                })}
                {visible.length === 0 && <tr><td colSpan={3} className="adm-muted">Nenhuma conta com "{search}".</td></tr>}
              </tbody>
            </table>
          </div>
          {rest > 0 && <div className="adm-more"><button className="adm-btn outline small" onClick={() => setLimit(l => l + 10)}>Ver mais ({rest})</button></div>}
        </>
      )}
    </section>
  )
}

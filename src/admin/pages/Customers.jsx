import React, { useEffect, useMemo, useState } from 'react'
import { Download, Heart, Search, Users } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { Loading, errorText } from '../ui.jsx'
import { WhatsApp } from '../../ui.jsx'
import { formatPhone } from '../../pages/authShared.jsx'

// Clientes: todas as contas criadas no site (nome, e-mail, WhatsApp, cadastro, último acesso,
// favoritos). Os dados vêm da função admin_list_clientes, que só responde para admin.
// Clicar no WhatsApp abre a conversa com a cliente já com um "oi" pronto.

const formatDate = iso => iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const normalize = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const firstName = name => (name || '').trim().split(/\s+/)[0] || ''
const whatsappTo = row => {
  const text = `Oi${firstName(row.full_name) ? `, ${firstName(row.full_name)}` : ''}! Aqui é a Maré 🌊`
  return `https://api.whatsapp.com/send?${new URLSearchParams({ phone: `55${row.phone}`, text }).toString().replace(/\+/g, '%20')}`
}

// Planilha que abre direto no Excel/Google Planilhas (separador ";" e acentos corretos).
function downloadCsv(rows) {
  const lines = [['Nome', 'E-mail', 'WhatsApp', 'Cadastro', 'Último acesso', 'Favoritos'],
    ...rows.map(r => [r.full_name || '', r.email, r.phone ? formatPhone(r.phone) : '', formatDate(r.created_at), formatDate(r.last_sign_in_at), r.favorites])]
  const csv = lines.map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `clientes-mare-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Customers() {
  const [rows, setRows] = useState(null)
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    const { data, error } = await supabase.rpc('admin_list_clientes')
    if (error) return setLoadError(errorText(error))
    setRows(data || []); setLoadError(null)
  }
  useEffect(() => { load() }, [])

  const visible = useMemo(() => {
    const q = normalize(search.trim())
    const digits = search.replace(/\D/g, '')
    if (!q) return rows || []
    return (rows || []).filter(r => normalize(r.full_name).includes(q) || normalize(r.email).includes(q) || (digits && (r.phone || '').includes(digits)))
  }, [rows, search])

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!rows) return <Loading text="Carregando clientes…" />

  const last30 = rows.filter(r => Date.now() - new Date(r.created_at) < 30 * 864e5).length
  const withPhone = rows.filter(r => r.phone).length

  return (
    <>
      <div className="adm-stats adm-stats-small">
        <div className="adm-stat"><span>Clientes</span><b>{rows.length}</b></div>
        <div className="adm-stat"><span>Novas em 30 dias</span><b>{last30}</b></div>
        <div className="adm-stat"><span>Com WhatsApp</span><b>{withPhone}</b></div>
      </div>

      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>Clientes cadastradas</h2><p>Todas as contas criadas no site. Clique no WhatsApp para abrir a conversa com a cliente.</p></div>
          <span className="adm-head-actions">
            <button className="adm-btn primary small" onClick={() => downloadCsv(visible)} disabled={!visible.length}><Download /> Baixar planilha</button>
          </span>
        </div>
        {rows.length > 0 && <label className="adm-search adm-search-block"><Search /><input className="adm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou WhatsApp" aria-label="Buscar cliente" /></label>}
        {rows.length === 0 ? (
          <div className="adm-empty"><Users /><b>Nenhuma cliente ainda</b>As contas criadas no site (ao finalizar um pedido ou em "Entrar") aparecem aqui.</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table adm-customers">
              <thead><tr><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Cadastro</th><th>Último acesso</th><th title="Peças favoritadas"><Heart className="adm-th-icon" /></th></tr></thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span className="adm-customer">
                        {r.avatar_url ? <img src={r.avatar_url} alt="" /> : <i aria-hidden="true">{(firstName(r.full_name) || r.email)[0]?.toUpperCase()}</i>}
                        <b>{r.full_name || '—'}</b>
                      </span>
                    </td>
                    <td className="adm-c-email"><a href={`mailto:${r.email}`}>{r.email}</a></td>
                    <td>{r.phone
                      ? <a className="adm-whats-link" href={whatsappTo(r)} target="_blank" rel="noreferrer" title="Abrir conversa no WhatsApp"><WhatsApp /> {formatPhone(r.phone)}</a>
                      : <span className="adm-muted">—</span>}</td>
                    <td className="adm-c-date" data-label="Cadastro">{formatDate(r.created_at)}</td>
                    <td className="adm-muted adm-c-date" data-label="Último acesso">{formatDate(r.last_sign_in_at)}</td>
                    <td className="adm-muted adm-c-fav" data-label="Favoritos">{r.favorites}</td>
                  </tr>
                ))}
                {visible.length === 0 && <tr><td colSpan={6} className="adm-muted">Nenhuma cliente com "{search}".</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

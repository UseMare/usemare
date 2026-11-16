import React, { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Mail, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { Loading, errorText, useConfirm, useToast } from '../ui.jsx'

// E-mails cadastrados no campo "Receba novidades" do rodapé.

const SOURCES = { rodape: 'Rodapé do site' }
const formatDate = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const normalize = t => (t || '').toLowerCase()

// Planilha que abre direto no Excel/Google Planilhas (separador ";" e acentos corretos).
function downloadCsv(rows) {
  const lines = [['E-mail', 'Cadastrado em', 'Origem'], ...rows.map(r => [r.email, formatDate(r.created_at), SOURCES[r.source] || r.source || ''])]
  const csv = lines.map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `newsletter-mare-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Newsletter() {
  const toast = useToast()
  const confirm = useConfirm()
  const [rows, setRows] = useState(null)
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    const { data, error } = await supabase.from('newsletter_subscribers').select('id, email, source, created_at, unsubscribed_at').is('unsubscribed_at', null).order('created_at', { ascending: false })
    if (error) return setLoadError(errorText(error))
    setRows(data); setLoadError(null)
  }
  useEffect(() => { load() }, [])

  const visible = useMemo(() => (rows || []).filter(r => !search.trim() || normalize(r.email).includes(normalize(search.trim()))), [rows, search])
  const last30 = (rows || []).filter(r => Date.now() - new Date(r.created_at) < 30 * 864e5).length

  const copyAll = async () => {
    try { await navigator.clipboard.writeText(visible.map(r => r.email).join(', ')); toast(`${visible.length} e-mail(s) copiados. É só colar no campo "Para" (use Cco para não mostrar os e-mails entre si).`) }
    catch { toast('Não foi possível copiar. Use "Baixar planilha".', 'error') }
  }

  const remove = async row => {
    if (!(await confirm({ title: 'Remover e-mail', danger: true, confirmLabel: 'Remover', text: `${row.email} sai da lista. Use quando a pessoa pedir para não receber mais.` }))) return
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', row.id)
    if (error) return toast(errorText(error), 'error')
    setRows(rs => rs.filter(r => r.id !== row.id))
    toast('E-mail removido da lista.')
  }

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!rows) return <Loading text="Carregando e-mails…" />

  return (
    <>
      <div className="adm-stats adm-stats-small">
        <div className="adm-stat"><span>Inscritos</span><b>{rows.length}</b></div>
        <div className="adm-stat"><span>Últimos 30 dias</span><b>{last30}</b></div>
      </div>

      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>E-mails cadastrados</h2><p>Para mandar novidades, baixe a planilha ou copie os e-mails para o seu e-mail ou ferramenta de envio.</p></div>
          <span className="adm-head-actions">
            <button className="adm-btn outline small" onClick={copyAll} disabled={!visible.length}><Copy /> Copiar e-mails</button>
            <button className="adm-btn primary small" onClick={() => downloadCsv(visible)} disabled={!visible.length}><Download /> Baixar planilha</button>
          </span>
        </div>
        {rows.length > 0 && <label className="adm-search adm-search-block"><Search /><input className="adm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar e-mail" aria-label="Buscar e-mail" /></label>}
        {rows.length === 0 ? (
          <div className="adm-empty"><Mail /><b>Nenhum e-mail ainda</b>Os cadastros feitos no rodapé do site aparecem aqui.</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>E-mail</th><th>Cadastrado em</th><th>Origem</th><th aria-label="Ações" /></tr></thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id}>
                    <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                    <td>{formatDate(r.created_at)}</td>
                    <td className="adm-muted">{SOURCES[r.source] || r.source || '—'}</td>
                    <td className="adm-table-actions"><button className="adm-icon-btn danger" onClick={() => remove(r)} aria-label={`Remover ${r.email}`} title="Remover"><Trash2 /></button></td>
                  </tr>
                ))}
                {visible.length === 0 && <tr><td colSpan={4} className="adm-muted">Nenhum e-mail com "{search}".</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

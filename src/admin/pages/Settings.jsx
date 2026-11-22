import React, { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { CardHead, InfoTip, Loading, errorText, useToast, useUnsavedGuard } from '../ui.jsx'
import { Instagram } from '../../ui.jsx'

// Configurações da loja (store_settings): WhatsApp, Instagram e parcelamento.
// O WhatsApp daqui é usado em todos os botões do site (produto, sacola, rodapé, avisos).

const digits = text => String(text || '').replace(/\D/g, '')
// '5511999998888' → '(11) 99999-8888'
const formatPhone = local => {
  const d = digits(local).slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
const localFromStored = stored => { const d = digits(stored); return d.startsWith('55') && d.length >= 12 ? d.slice(2) : d }

// '@maré', 'instagram.com/mare', 'https://www.instagram.com/mare/?hl=pt' → 'mare'
const instagramUser = text => {
  const t = String(text || '').trim()
  const fromUrl = t.match(/instagram\.com\/([A-Za-z0-9._]+)/i)
  const user = fromUrl ? fromUrl[1] : t.replace(/^@/, '')
  return /^[A-Za-z0-9._]{1,30}$/.test(user) ? user : ''
}

export default function Settings() {
  const toast = useToast()
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    const { data, error: e } = await supabase.from('store_settings').select('whatsapp, instagram_url, instagram_handle, installments_max').eq('id', 1).maybeSingle()
    if (e) return setLoadError(errorText(e))
    const value = {
      phone: formatPhone(localFromStored(data?.whatsapp)),
      instagram: data?.instagram_handle || data?.instagram_url || '',
      installments: String(data?.installments_max || 6),
    }
    setSaved(value); setForm(value); setLoadError(null)
  }
  useEffect(() => { load() }, [])

  const dirty = useMemo(() => form && saved && JSON.stringify(form) !== JSON.stringify(saved), [form, saved])
  useUnsavedGuard(dirty && !saving)

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!form) return <Loading text="Carregando configurações…" />

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const phoneDigits = digits(form.phone)
  const phoneOk = phoneDigits.length === 0 || phoneDigits.length === 10 || phoneDigits.length === 11
  const whatsapp = phoneDigits ? `55${phoneDigits}` : ''
  const igUser = instagramUser(form.instagram)
  const testLink = `https://api.whatsapp.com/send?${new URLSearchParams({ ...(whatsapp ? { phone: whatsapp } : {}), text: 'Teste do painel da Maré 🌊' }).toString().replace(/\+/g, '%20')}`

  const save = async () => {
    setError(null)
    if (!phoneOk) return setError('O WhatsApp precisa ter DDD + número (10 ou 11 dígitos). Ex.: (11) 99999-8888.')
    if (form.instagram.trim() && !igUser) return setError('Não entendi o Instagram. Escreva o @ (ex.: @uusemaree.br) ou cole o link do perfil.')
    setSaving(true)
    const fields = {
      whatsapp: whatsapp || null,
      instagram_url: igUser ? `https://www.instagram.com/${igUser}/` : null,
      instagram_handle: igUser ? `@${igUser}` : null,
      installments_max: Number(form.installments),
    }
    const { error: e } = await supabase.from('store_settings').update(fields).eq('id', 1)
    setSaving(false)
    if (e) return setError(errorText(e))
    const value = { phone: formatPhone(phoneDigits), instagram: fields.instagram_handle || '', installments: form.installments }
    setSaved(value); setForm(value)
    toast('Configurações salvas. Todos os botões do site já usam os dados novos.')
  }

  return (
    <div className="adm-editor">
      {error && <p className="adm-notice is-error" role="alert">{error}</p>}

      <section className="adm-card">
        <CardHead title="WhatsApp da loja" text="Onde as clientes fecham as compras." info="Vale para todos os botões de WhatsApp do site (peça, sacola, rodapé)." />
        <div className="adm-grid-2">
          <label className="adm-field">
            <span>Número com DDD<InfoTip>Número do Brasil. As mensagens das clientes chegam neste WhatsApp.</InfoTip></span>
            <div className="adm-phone">
              <b>+55</b>
              <input value={form.phone} onChange={e => set('phone', formatPhone(e.target.value))} inputMode="tel" placeholder="(11) 99999-8888" aria-invalid={!phoneOk} />
            </div>
            {!phoneOk ? <small className="adm-field-error">Faltam dígitos: DDD + número (10 ou 11 dígitos).</small>
              : !phoneDigits ? <small className="adm-field-error">Preencha para as mensagens chegarem na loja.</small>
              : null}
          </label>
          <div className="adm-field">
            <span>Testar<InfoTip>Abre o WhatsApp com uma mensagem de teste para este número (não envia nada sozinho).</InfoTip></span>
            <a className={`adm-btn outline ${phoneOk ? '' : 'is-disabled'}`} href={phoneOk ? testLink : undefined} target="_blank" rel="noreferrer" aria-disabled={!phoneOk}><MessageCircle /> Abrir conversa de teste</a>
          </div>
        </div>
      </section>

      <section className="adm-card">
        <CardHead title="Instagram" info={'Aparece no rodapé, na faixa do topo, na página Sobre e nos botões "Seguir".'} />
        <div className="adm-grid-2">
          <label className="adm-field">
            <span>@ ou link do perfil<InfoTip>Pode colar o link inteiro do perfil: o painel entende sozinho.</InfoTip></span>
            <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@uusemaree.br" />
            {form.instagram.trim() && !igUser && <small className="adm-field-error">Escreva o @ do perfil ou cole o link dele.</small>}
          </label>
          {igUser && (
            <div className="adm-field">
              <span>Como vai aparecer</span>
              <a className="adm-ig-preview" href={`https://www.instagram.com/${igUser}/`} target="_blank" rel="noreferrer"><Instagram /> @{igUser} <ExternalLink /></a>
            </div>
          )}
        </div>
      </section>

      <section className="adm-card">
        <CardHead title="Parcelamento" info={'Aparece nos preços ("ou 6x de R$ …") e nos textos onde houver {parcelas}.'} />
        <label className="adm-field adm-field-narrow">
          <span>Parcelas sem juros</span>
          <select value={form.installments} onChange={e => set('installments', e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(n => <option key={n} value={n}>{n === '1' ? 'Só à vista (sem parcelamento)' : `Até ${n}x sem juros`}</option>)}
          </select>
        </label>
      </section>

      <div className="adm-savebar">
        <span className="adm-savebar-msg">{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</span>
        <button className="adm-btn outline" onClick={() => { setForm(saved); setError(null) }} disabled={!dirty || saving}>Desfazer</button>
        <button className="adm-btn primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Salvando…' : 'Salvar configurações'}</button>
      </div>
    </div>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { getSiteContent, saveSiteContent } from '../api.js'
import { Loading, errorText, useConfirm, useToast, useUnsavedGuard } from '../ui.jsx'
import ImageField, { removeSiteImage, resolveImage } from '../components/ImageField.jsx'
import { Fields, clean, finalize, mergePage, plain, validate } from '../components/ContentEditor.jsx'
import { footerDefaults } from '../../Layout.jsx'
import { socialNetworks } from '../../icons.jsx'
import { logo as defaultLogo } from '../../ui.jsx'

// Logo e rodapé: logos e texto da marca + redes sociais (store_settings) e colunas/textos do rodapé (site_content 'footer').

const DEFAULT_FOOTER_TEXT = 'Moda que acompanha seu ritmo,\ncom leveza e personalidade.'
const networkOptions = Object.entries(socialNetworks).filter(([key]) => key !== 'instagram').map(([value, { label }]) => ({ value, label }))

const footerSchema = [
  { key: 'columns', label: 'Colunas de links', type: 'list', min: 1, max: 3, itemLabel: 'Coluna', addLabel: 'Adicionar coluna', columns: 2, item: [
    { key: 'title', label: 'Título da coluna', type: 'text', required: true, max: 30 },
    { key: 'links', label: 'Links', type: 'list', min: 1, max: 6, itemLabel: 'Link', addLabel: 'Adicionar link', item: [
      { key: 'label', label: 'Texto', type: 'text', required: true, max: 40 },
      { key: 'link', label: 'Leva para', type: 'link' },
    ] },
  ] },
  { type: 'heading', label: 'Newsletter' },
  { key: 'newsletterTitle', label: 'Título', type: 'text', required: true, max: 40 },
  { key: 'newsletterText', label: 'Texto', type: 'textarea', rows: 2, max: 120 },
  { type: 'heading', label: 'Linha final' },
  { key: 'copyright', label: 'Direitos autorais', type: 'text', required: true, max: 100, hint: '{ano} vira o ano atual automaticamente.' },
]

const socialSchema = [
  { key: 'social', label: 'Outras redes', type: 'list', min: 0, max: 6, itemLabel: 'Rede', addLabel: 'Adicionar rede', columns: 2,
    hint: 'Aparecem como ícones no rodapé, abaixo do Instagram (que é configurado em Configurações).', item: [
      { key: 'network', label: 'Rede', type: 'select', options: networkOptions },
      { key: 'url', label: 'Link do perfil (ou e-mail)', type: 'text', required: true, max: 200 },
    ] },
]

const SUFFIX = ['']

export default function Appearance() {
  const toast = useToast()
  const confirm = useConfirm()
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    try {
      const [{ data, error: e }, footer] = await Promise.all([
        supabase.from('store_settings').select('logo_url, logo_footer_url, footer_text, social').eq('id', 1).maybeSingle(),
        getSiteContent('footer'),
      ])
      if (e) throw e
      const value = {
        logo: data?.logo_url || defaultLogo,
        logoFooter: data?.logo_footer_url || null,
        footerText: data?.footer_text ?? DEFAULT_FOOTER_TEXT,
        social: (data?.social || []).map(s => ({ network: s.network in socialNetworks ? s.network : 'site', url: s.url || '' })),
        ...mergePage(footerDefaults, footer),
      }
      setSaved(value); setForm(plain(value)); setLoadError(null)
    } catch (e) { setLoadError(errorText(e)) }
  }
  useEffect(() => { load() }, [])

  const snapshot = value => JSON.stringify(value, (k, v) => (v && typeof v === 'object' && v.preview ? `nova:${v.preview}` : v))
  const dirty = useMemo(() => Boolean(form && saved && snapshot(form) !== snapshot(saved)), [form, saved])
  useUnsavedGuard(dirty && !saving)

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!form) return <Loading text="Carregando logo e rodapé…" />

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setError(null)
    if (!form.logo) return setError('Escolha o logo do topo do site.')
    const problem = validate(socialSchema, form) || validate(footerSchema, form)
    if (problem) return setError(problem)
    const badSocial = form.social.find(s => s.network === 'email' ? !/^\S+@\S+\.\S+$/.test(s.url.replace(/^mailto:/i, '')) : !/^https?:\/\/\S+\.\S+/.test(s.url.trim()))
    if (badSocial) return setError(badSocial.network === 'email' ? `"${badSocial.url}" não parece um e-mail.` : `O link de ${socialNetworks[badSocial.network].label} precisa começar com https:// (copie o endereço do perfil).`)
    setSaving(true)
    try {
      const logo = await resolveImage(form.logo, 'logo', SUFFIX)
      const logoFooter = await resolveImage(form.logoFooter, 'logo', SUFFIX)
      const settings = {
        logo_url: logo === defaultLogo ? null : logo,
        logo_footer_url: logoFooter || null,
        footer_text: clean(form.footerText),   // '' = não mostra; null = nunca salvo (padrão)
        social: form.social.map(s => ({ network: s.network, url: s.url.trim(), label: socialNetworks[s.network].label })),
      }
      const { error: e } = await supabase.from('store_settings').update(settings).eq('id', 1)
      if (e) throw e
      const footer = await finalize(footerSchema, form, 'paginas')
      await saveSiteContent('footer', footer)
      for (const [old, now] of [[saved.logo, logo], [saved.logoFooter, logoFooter]]) if (old && old !== now) await removeSiteImage(old, SUFFIX)
      const value = { logo, logoFooter, footerText: settings.footer_text ?? '', social: form.social.map(s => ({ network: s.network, url: s.url.trim() })), ...mergePage(footerDefaults, footer) }
      setSaved(value); setForm(plain(value))
      toast('Logo e rodapé salvos. O site já mostra a versão nova.')
    } catch (e) { setError(errorText(e)) }
    setSaving(false)
  }

  const restoreFooter = async () => {
    if (await confirm({ title: 'Voltar o rodapé ao padrão', confirmLabel: 'Voltar ao padrão', danger: true, text: 'Colunas de links, newsletter, linha final e texto da marca voltam ao original. Logos e redes não mudam. Você ainda pode revisar antes de salvar.' })) {
      setForm(f => ({ ...f, ...plain(footerDefaults), footerText: DEFAULT_FOOTER_TEXT }))
    }
  }

  return (
    <div className="adm-editor">
      <div className="adm-page-head">
        <p className="adm-muted">Logotipo do site e tudo o que aparece no rodapé.</p>
        <span className="adm-head-actions">
          <button className="adm-btn ghost small" onClick={restoreFooter} disabled={saving}>Voltar o rodapé ao padrão</button>
          <a className="adm-btn outline small" href="/#conteudo" target="_blank" rel="noreferrer"><ExternalLink /> Ver no site</a>
        </span>
      </div>
      {error && <p className="adm-notice is-error" role="alert">{error}</p>}

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Logotipo</h2><p>PNG, WebP ou SVG com fundo transparente ficam melhores. O arquivo vai como está, sem recorte.</p></div></div>
        <div className="adm-logos">
          <div className="adm-logo-box">
            <ImageField label="Logo do topo *" value={form.logo} onChange={v => set('logo', v)} previewRatio="16 / 9" hint="Aparece no cabeçalho e no menu do celular." />
            {typeof form.logo === 'string' && form.logo !== defaultLogo && <button type="button" className="adm-btn ghost small" onClick={() => set('logo', defaultLogo)}>Usar o logo original</button>}
          </div>
          <div className="adm-logo-box is-footer">
            <ImageField label="Logo do rodapé" value={form.logoFooter} onChange={v => set('logoFooter', v)} previewRatio="16 / 9" allowRemove hint="Opcional. Vazio = usa o mesmo logo do topo." />
          </div>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Texto e redes do rodapé</h2></div></div>
        <label className="adm-field">
          <span>Texto abaixo do logo</span>
          <textarea rows={2} value={form.footerText} onChange={e => set('footerText', e.target.value)} maxLength={160} />
          <small>Enter = quebra de linha. Vazio = não mostra.</small>
        </label>
        <Fields schema={socialSchema} value={form} onChange={setForm} />
      </section>

      <section className="adm-card adm-content-card">
        <div className="adm-card-head"><div><h2>Colunas do rodapé</h2><p>"WhatsApp da loja" abre a conversa com o número das Configurações.</p></div></div>
        <Fields schema={footerSchema} value={form} onChange={setForm} />
      </section>

      <div className="adm-savebar">
        <span className="adm-savebar-msg">{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</span>
        <button className="adm-btn outline" onClick={() => { setForm(plain(saved)); setError(null) }} disabled={!dirty || saving}>Desfazer</button>
        <button className="adm-btn primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Salvando…' : 'Salvar logo e rodapé'}</button>
      </div>
    </div>
  )
}

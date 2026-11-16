import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { getSiteContent, saveSiteContent } from '../api.js'
import { Loading, errorText, useConfirm, useToast, useUnsavedGuard } from '../ui.jsx'
import ImageField, { removeSiteImage, resolveImage } from './ImageField.jsx'
import LinkField from './LinkField.jsx'
import IconPicker from './IconPicker.jsx'

// Editor genérico de textos/imagens do site, guiado por um esquema de campos.
// Grava em site_content[contentKey]. O site lê com pageContent(key, defaults):
// o que for salvo vale como está (campo opcional vazio some do site); nunca salvo = padrão do código.
//
// Campo:  { key, label, type: 'text' | 'textarea' | 'icon' | 'link' | 'image', required, hint, max, rows, placeholder, image: { aspect, outputs, suffixes }, allowNone }
// Lista:  { key, label, type: 'list', item: [campos], min, max, itemLabel, addLabel, columns }
// Título: { type: 'heading', label, text }

const LINK_RE = /^(https?:\/\/\S+|\/\S*|\{instagram\})$/

export const mergePage = (defaults, saved = {}) => {
  const result = { ...defaults }
  Object.keys(defaults).forEach(k => { if (saved?.[k] !== undefined && saved?.[k] !== null) result[k] = saved[k] })
  return result
}

const plain = value => JSON.parse(JSON.stringify(value, (k, v) => (v instanceof Blob ? undefined : v)))
const clean = text => String(text ?? '').replace(/\r/g, '').split('\n').map(l => l.trimEnd()).join('\n').trim()
const blankValue = (field, item) => field.type === 'item' ? {} : Object.fromEntries(field.item.map(f => [f.key, f.type === 'icon' ? 'sparkles' : f.type === 'image' ? null : '']))

// Percorre os campos de imagem (inclusive dentro de listas).
const imagesOf = (schema, value) => schema.flatMap(f => {
  if (f.type === 'image') return typeof value?.[f.key] === 'string' ? [{ url: value[f.key], suffixes: f.image.suffixes || [''] }] : []
  if (f.type === 'list') return (value?.[f.key] || []).flatMap(item => imagesOf(f.item, item))
  return []
})

// Confere obrigatórios e links; devolve a primeira mensagem de erro.
const validate = (schema, value, where = '') => {
  for (const f of schema) {
    if (f.type === 'heading') continue
    const v = value?.[f.key]
    const name = `${where}${f.label}`
    if (f.type === 'list') {
      const list = v || []
      if (f.min && list.length < f.min) return `${name}: precisa de pelo menos ${f.min}.`
      for (let i = 0; i < list.length; i++) {
        const err = validate(f.item, list[i], `${f.itemLabel || f.label} ${i + 1} → `)
        if (err) return err
      }
    } else if (f.required && (f.type === 'image' ? !v : !clean(v))) return `${name}: não pode ficar vazio.`
    else if (f.type === 'link' && v && !LINK_RE.test(v)) return `${name}: o link "${v}" não é válido. Use https://… (outro site) ou /… (página da loja).`
  }
  return null
}

// Monta o valor final: limpa textos e envia as imagens novas.
const finalize = async (schema, value, folder) => {
  const out = {}
  for (const f of schema) {
    if (f.type === 'heading') continue
    const v = value?.[f.key]
    if (f.type === 'list') {
      out[f.key] = []
      for (const item of v || []) out[f.key].push(await finalize(f.item, item, folder))
    } else if (f.type === 'image') out[f.key] = await resolveImage(v, folder, f.image.suffixes || [''])
    else if (f.type === 'text' || f.type === 'textarea') out[f.key] = clean(v)
    else out[f.key] = v ?? ''
  }
  return out
}

function Input({ field, value, onChange }) {
  const { type, label, hint, max, rows, placeholder, required } = field
  const title = `${label}${required ? ' *' : ''}`
  if (type === 'icon') return <IconPicker label={title} value={value} onChange={onChange} />
  if (type === 'link') return <LinkField label={title} value={value || ''} onChange={onChange} allowNone={field.allowNone} />
  if (type === 'image') return <ImageField label={title} value={value} onChange={onChange} hint={hint} {...field.image} />
  return (
    <label className="adm-field">
      <span>{title}</span>
      {type === 'textarea'
        ? <textarea rows={rows || 3} value={value ?? ''} onChange={e => onChange(e.target.value)} maxLength={max} placeholder={placeholder} />
        : <input value={value ?? ''} onChange={e => onChange(e.target.value)} maxLength={max} placeholder={placeholder} />}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function Fields({ schema, value, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v })
  return schema.map((f, idx) => {
    if (f.type === 'heading') return <div key={`h${idx}`} className="adm-content-heading"><h3 className="adm-subtitle">{f.label}</h3>{f.text && <p className="adm-hint">{f.text}</p>}</div>
    if (f.type !== 'list') return <Input key={f.key} field={f} value={value?.[f.key]} onChange={v => set(f.key, v)} />
    const list = value?.[f.key] || []
    const setList = next => set(f.key, next)
    const move = (i, d) => { const j = i + d; if (j < 0 || j >= list.length) return; const next = [...list];[next[i], next[j]] = [next[j], next[i]]; setList(next) }
    const fixed = f.min && f.max && f.min === f.max
    return (
      <div key={f.key} className="adm-field adm-content-list">
        <span>{f.label}</span>
        {f.hint && <small className="adm-hint">{f.hint}</small>}
        <ul className={`adm-repeat-list cols-${f.columns || 1}`}>
          {list.map((item, i) => (
            <li key={i}>
              <div className="adm-repeat-head">
                <b>{f.itemLabel || 'Item'} {i + 1}</b>
                <span>
                  {!fixed && <>
                    <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Mover ${f.itemLabel || 'item'} ${i + 1} para cima`}><ArrowUp /></button>
                    <button type="button" className="adm-icon-btn" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Mover ${f.itemLabel || 'item'} ${i + 1} para baixo`}><ArrowDown /></button>
                    <button type="button" className="adm-icon-btn danger" onClick={() => setList(list.filter((_, k) => k !== i))} disabled={list.length <= (f.min || 0)} aria-label={`Remover ${f.itemLabel || 'item'} ${i + 1}`}><Trash2 /></button>
                  </>}
                </span>
              </div>
              <div className="adm-repeat-body">
                <Fields schema={f.item} value={item} onChange={next => setList(list.map((x, k) => k === i ? next : x))} />
              </div>
            </li>
          ))}
        </ul>
        {!fixed && (!f.max || list.length < f.max) && (
          <button type="button" className="adm-btn outline small" onClick={() => setList([...list, blankValue(f)])}><Plus /> {f.addLabel || 'Adicionar'}</button>
        )}
      </div>
    )
  })
}

export default function ContentEditor({ contentKey, defaults, schema, intro, previewUrl, folder = 'paginas', saveLabel = 'Salvar', onDirtyChange }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    try {
      const merged = mergePage(defaults, await getSiteContent(contentKey))
      setSaved(merged); setForm(plain(merged)); setLoadError(null); setError(null)
    } catch (e) { setLoadError(errorText(e)) }
  }
  useEffect(() => { setForm(null); load() }, [contentKey])

  const snapshot = value => JSON.stringify(value, (k, v) => (v && typeof v === 'object' && v.preview ? `nova:${v.preview}` : v))
  const dirty = useMemo(() => Boolean(form && saved && snapshot(form) !== snapshot(saved)), [form, saved])
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty])
  useUnsavedGuard(dirty && !saving)

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!form) return <Loading text="Carregando textos…" />

  const save = async () => {
    const problem = validate(schema, form)
    if (problem) return setError(problem)
    setSaving(true); setError(null)
    try {
      const value = await finalize(schema, form, folder)
      await saveSiteContent(contentKey, value)
      const now = new Set(imagesOf(schema, value).map(i => i.url))
      await Promise.all(imagesOf(schema, saved).filter(i => !now.has(i.url)).map(i => removeSiteImage(i.url, i.suffixes)))
      const merged = mergePage(defaults, value)
      setSaved(merged); setForm(plain(merged))
      toast('Textos salvos. O site já mostra a versão nova.')
    } catch (e) { setError(errorText(e)) }
    setSaving(false)
  }

  const restore = async () => {
    const ok = await confirm({ title: 'Voltar ao padrão', confirmLabel: 'Voltar ao padrão', danger: true,
      text: 'Todos os campos desta página voltam aos textos e imagens originais do site. Você ainda pode revisar antes de salvar.' })
    if (ok) { setForm(plain(defaults)); setError(null) }
  }

  return (
    <div className="adm-editor">
      <div className="adm-page-head">
        <p className="adm-muted">{intro} Campos com * não podem ficar vazios; os outros, se apagados, somem do site.</p>
        <span className="adm-head-actions">
          <button className="adm-btn ghost small" onClick={restore} disabled={saving}>Voltar ao padrão</button>
          {previewUrl && <a className="adm-btn outline small" href={previewUrl} target="_blank" rel="noreferrer"><ExternalLink /> Ver no site</a>}
        </span>
      </div>
      {error && <p className="adm-notice is-error" role="alert">{error}</p>}
      <section className="adm-card adm-content-card">
        <Fields schema={schema} value={form} onChange={setForm} />
      </section>
      <div className="adm-savebar">
        <span className="adm-savebar-msg">{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</span>
        <button className="adm-btn outline" onClick={() => { setForm(plain(saved)); setError(null) }} disabled={!dirty || saving}>Desfazer</button>
        <button className="adm-btn primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Salvando…' : saveLabel}</button>
      </div>
    </div>
  )
}

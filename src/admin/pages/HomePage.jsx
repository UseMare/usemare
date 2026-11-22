import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { getSiteContent, saveSiteContent } from '../api.js'
import { BASE } from '../sections.js'
import { CardHead, InfoTip, Loading, errorText, useConfirm, useToast, useUnsavedGuard } from '../ui.jsx'
import ImageField, { removeSiteImage, resolveImage } from '../components/ImageField.jsx'
import LinkField from '../components/LinkField.jsx'
import IconPicker from '../components/IconPicker.jsx'
import { heroMobileOf, homeDefaults, mergeHome } from '../../pages/Home.jsx'

// Página inicial do site: banner principal (hero), benefícios, vitrine, banners do meio e quadro de serviços.
// Tudo fica em site_content, chave 'home'. O que estiver vazio volta ao texto padrão (campos obrigatórios)
// ou some do site (campos opcionais) — ver mergeHome em src/pages/Home.jsx.

const MAX_SLIDES = 5
const MAX_BENEFITS = 3
// Hero: mesma proporção da foto atual (2245 × 650) + versão leve de 1200 px.
const HERO_IMAGE = { aspect: 2245 / 650, outputs: [{ width: 2245, height: 650, quality: 0.84 }, { width: 1200, height: 347, quality: 0.8 }] }
const HERO_SUFFIXES = ['', '1200']
// Recorte do celular: quadrado, em 1200 / 800 / 600 px (o celular baixa só o tamanho da tela).
const HERO_MOBILE_IMAGE = { aspect: 1, outputs: [{ width: 1200, height: 1200, quality: 0.82 }, { width: 800, height: 800, quality: 0.8 }, { width: 600, height: 600, quality: 0.78 }] }
const HERO_MOBILE_SUFFIXES = ['', '800', '600']
// Banners do meio: 1525 × 561 + versão de 800 px.
const PROMO_IMAGE = { aspect: 1525 / 561, outputs: [{ width: 1525, height: 561, quality: 0.84 }, { width: 800, height: 294, quality: 0.8 }] }
const PROMO_SUFFIXES = ['', '800']

const copy = value => JSON.parse(JSON.stringify(value, (k, v) => (v instanceof Blob ? undefined : v)))
const clean = text => String(text ?? '').replace(/\r/g, '').split('\n').map(l => l.trimEnd()).join('\n').trim()
const storageImages = content => [
  ...(content.heroSlides || []).map(s => ({ url: s.image, suffixes: HERO_SUFFIXES })),
  ...(content.heroSlides || []).map(s => ({ url: s.mobile, suffixes: HERO_MOBILE_SUFFIXES })),
  ...(content.promos || []).map(p => ({ url: p.image, suffixes: PROMO_SUFFIXES })),
].filter(i => typeof i.url === 'string')

function Field({ label, hint, children }) {
  return <label className="adm-field"><span>{label}{hint && <InfoTip>{hint}</InfoTip>}</span>{children}</label>
}

function Section({ title, text, info, children, aside }) {
  return (
    <section className="adm-card">
      <CardHead title={title} text={text} info={info} aside={aside} />
      {children}
    </section>
  )
}

export default function HomePage() {
  const toast = useToast()
  const confirm = useConfirm()
  const [saved, setSaved] = useState(null)       // conteúdo como está no site
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    try {
      const merged = mergeHome(await getSiteContent('home'))
      // Mostra no formulário o mesmo recorte de celular que o site usa (inclusive o padrão).
      merged.heroSlides = merged.heroSlides.map(s => ({ ...s, mobile: heroMobileOf(s) }))
      setSaved(merged); setForm(copy(merged)); setLoadError(null)
    } catch (e) { setLoadError(errorText(e)) }
  }
  useEffect(() => { load() }, [])

  // Imagens pendentes (objeto com blobs) não entram no JSON; a prévia muda, então conta como alteração.
  const snapshot = value => JSON.stringify(value, (k, v) => (v && typeof v === 'object' && v.preview ? `nova:${v.preview}` : v))
  const dirty = useMemo(() => form && saved && snapshot(form) !== snapshot(saved), [form, saved])
  useUnsavedGuard(dirty && !saving, 'Você mudou a página inicial e ainda não salvou. Se sair agora, as mudanças serão perdidas.')

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!form) return <Loading text="Carregando página inicial…" />

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const setItem = (key, index, field, value) => setForm(f => ({ ...f, [key]: f[key].map((item, i) => i === index ? { ...item, [field]: value } : item) }))
  const moveItem = (key, index, delta) => setForm(f => {
    const list = [...f[key]], j = index + delta
    if (j < 0 || j >= list.length) return f
    ;[list[index], list[j]] = [list[j], list[index]]
    return { ...f, [key]: list }
  })
  const removeItem = (key, index) => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }))

  const restoreDefaults = async () => {
    const ok = await confirm({ title: 'Voltar ao padrão', confirmLabel: 'Voltar ao padrão', danger: true,
      text: 'Todos os textos e imagens da página inicial voltam a ser os originais do site. Você ainda pode revisar antes de salvar.' })
    if (ok) setForm(copy(mergeHome({})))
  }

  const save = async () => {
    setError(null)
    if (!form.heroSlides.length) return setError('O banner principal precisa de pelo menos uma foto.')
    const empty = form.heroSlides.findIndex(s => !s.image)
    if (empty >= 0) return setError(`Escolha a imagem da foto ${empty + 1} do banner principal (ou remova essa foto).`)
    if (!clean(form.heroTitle)) return setError('Escreva o título do banner principal.')
    if (form.promos.some(p => !p.image)) return setError('Os dois banners do meio precisam de imagem.')
    const badLink = [form.heroButton && form.heroLink, ...form.promos.map(p => p.button && p.link), ...form.services.map(s => s.link)]
      .find(l => l && !/^(https?:\/\/\S+|\/\S*|\{instagram\})$/.test(l))
    if (badLink) return setError(`O link "${badLink}" não é válido. Use https://… (outro site) ou /… (página da loja).`)
    setSaving(true)
    try {
      const heroSlides = []
      for (const slide of form.heroSlides) heroSlides.push({
        image: await resolveImage(slide.image, 'home', HERO_SUFFIXES),
        mobile: (await resolveImage(slide.mobile, 'home', HERO_MOBILE_SUFFIXES)) || null,
        alt: clean(slide.alt),
      })
      const promos = []
      for (const p of form.promos) promos.push({ image: await resolveImage(p.image, 'home', PROMO_SUFFIXES), title: clean(p.title), text: clean(p.text), button: clean(p.button), link: p.button ? p.link : '' })
      const value = {
        heroSlides,
        heroEyebrow: clean(form.heroEyebrow),
        heroTitle: clean(form.heroTitle),
        heroText: clean(form.heroText),
        heroButton: clean(form.heroButton),
        heroLink: form.heroLink || '/produtos',
        heroBenefits: form.heroBenefits.map(b => ({ icon: b.icon, text: clean(b.text) })).filter(b => b.text),
        heroScript: clean(form.heroScript),
        highlightsTitle: clean(form.highlightsTitle),
        promos,
        services: form.services.map(s => ({ icon: s.icon, top: clean(s.top), bold: clean(s.bold), link: s.link || '' })),
      }
      await saveSiteContent('home', value)
      // apaga do Storage as imagens que saíram da página
      const now = new Set(storageImages(value).map(i => i.url))
      await Promise.all(storageImages(saved).filter(i => !now.has(i.url)).map(i => removeSiteImage(i.url, i.suffixes)))
      const merged = mergeHome(value)
      setSaved(merged); setForm(copy(merged))
      toast('Página inicial salva. O site já mostra a versão nova.')
    } catch (e) { setError(errorText(e)) }
    setSaving(false)
  }

  return (
    <div className="adm-editor adm-home">
      <div className="adm-page-head">
        <p className="adm-muted adm-title-info">Textos e imagens do Início.<InfoTip>Campos marcados com * não podem ficar vazios.</InfoTip></p>
        <span className="adm-head-actions">
          <button className="adm-btn ghost small" onClick={restoreDefaults} disabled={saving}>Voltar ao padrão</button>
          <a className="adm-btn outline small" href="/" target="_blank" rel="noreferrer"><ExternalLink /> Ver página inicial</a>
        </span>
      </div>
      {error && <p className="adm-notice is-error" role="alert">{error}</p>}

      <Section title="Banner principal" text="Fotos e textos do topo do site."
        info={`Com mais de uma foto, elas trocam sozinhas a cada 7 segundos (até ${MAX_SLIDES}).

Deixe o lado esquerdo da foto mais liso e claro: é onde ficam os textos. No celular a foto aparece abaixo dos textos.`}>
        <ul className="adm-slides">
          {form.heroSlides.map((slide, i) => (
            <li key={i}>
              <ImageField label={`Foto ${i + 1} · computador`} value={slide.image} {...HERO_IMAGE} previewRatio={2245 / 650}
                onChange={v => setForm(f => ({ ...f, heroSlides: f.heroSlides.map((s, k) => k === i ? { ...s, image: v, mobile: v && typeof v === 'object' ? null : s.mobile } : s) }))} />
              <Field label="Descrição da foto" hint="Para quem usa leitor de tela. Ex.: Duas amigas com conjuntos Maré Move.">
                <input value={slide.alt || ''} onChange={e => setItem('heroSlides', i, 'alt', e.target.value)} maxLength={140} />
              </Field>
              <div className="adm-slide-mobile">
                <ImageField label="Recorte para celular" value={slide.mobile} onChange={v => setItem('heroSlides', i, 'mobile', v)} {...HERO_MOBILE_IMAGE} previewRatio={1} allowRemove
                  hint={'No celular a foto aparece quadrada, abaixo dos textos. Escolha aqui o enquadramento.\n\nSem recorte, o celular usa a foto do computador cortada no centro. Ao trocar a foto do computador, o recorte antigo sai sozinho.'} />
                {!slide.mobile && <p className="adm-hint">Sem recorte: usa a foto acima.</p>}
              </div>
              <span className="adm-slide-actions">
                <button type="button" className="adm-icon-btn" onClick={() => moveItem('heroSlides', i, -1)} disabled={i === 0} aria-label={`Mover foto ${i + 1} para antes`}><ArrowUp /></button>
                <button type="button" className="adm-icon-btn" onClick={() => moveItem('heroSlides', i, 1)} disabled={i === form.heroSlides.length - 1} aria-label={`Mover foto ${i + 1} para depois`}><ArrowDown /></button>
                <button type="button" className="adm-icon-btn danger" onClick={() => removeItem('heroSlides', i)} disabled={form.heroSlides.length === 1} aria-label={`Remover foto ${i + 1}`} title={form.heroSlides.length === 1 ? 'O banner precisa de pelo menos uma foto' : 'Remover foto'}><Trash2 /></button>
              </span>
            </li>
          ))}
        </ul>
        {form.heroSlides.length < MAX_SLIDES && (
          <button type="button" className="adm-btn outline small" onClick={() => set('heroSlides', [...form.heroSlides, { image: null, mobile: null, alt: '' }])}><Plus /> Adicionar foto</button>
        )}

        <h3 className="adm-subtitle">Textos do banner</h3>
        <div className="adm-grid-2">
          <Field label="Texto pequeno (acima do título)" hint="Vazio = não mostra."><input value={form.heroEyebrow} onChange={e => set('heroEyebrow', e.target.value)} placeholder={homeDefaults.heroEyebrow} maxLength={60} /></Field>
          <Field label="Título *" hint="Enter = quebra de linha."><textarea rows={2} value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} maxLength={80} /></Field>
        </div>
        <div className="adm-grid-2">
          <Field label="Texto de apoio" hint="Enter = quebra de linha (só no computador). Vazio = não mostra."><textarea rows={2} value={form.heroText} onChange={e => set('heroText', e.target.value)} maxLength={180} /></Field>
          <Field label="Frase em letra cursiva (lado direito)" hint="Cada linha com Enter. Aparece só no computador, sobre a foto. Vazio = não mostra.">
            <textarea rows={3} value={form.heroScript} onChange={e => set('heroScript', e.target.value)} maxLength={60} />
          </Field>
        </div>
        <div className="adm-grid-2">
          <Field label="Texto do botão" hint="Vazio = sem botão."><input value={form.heroButton} onChange={e => set('heroButton', e.target.value)} maxLength={40} /></Field>
          {form.heroButton.trim() ? <LinkField value={form.heroLink} onChange={v => set('heroLink', v)} /> : <span />}
        </div>

        <h3 className="adm-subtitle adm-title-info">Benefícios (abaixo do botão)<InfoTip>Até {MAX_BENEFITS}, cada um com ícone. Enter = quebra de linha.</InfoTip></h3>
        <ul className="adm-repeat adm-benefits">
          {form.heroBenefits.map((b, i) => (
            <li key={i}>
              <IconPicker value={b.icon} onChange={v => setItem('heroBenefits', i, 'icon', v)} />
              <Field label={`Benefício ${i + 1}`}><textarea rows={2} value={b.text} onChange={e => setItem('heroBenefits', i, 'text', e.target.value)} maxLength={50} /></Field>
              <button type="button" className="adm-icon-btn danger" onClick={() => removeItem('heroBenefits', i)} aria-label={`Remover benefício ${i + 1}`}><Trash2 /></button>
            </li>
          ))}
        </ul>
        {form.heroBenefits.length < MAX_BENEFITS && (
          <button type="button" className="adm-btn outline small" onClick={() => set('heroBenefits', [...form.heroBenefits, { icon: 'sparkles', text: '' }])}><Plus /> Adicionar benefício</button>
        )}
      </Section>

      <Section title="Cards de categoria" text="Editados em Categorias." info="Os cards logo abaixo do banner (imagem, texto e ordem) são editados em Categorias."
        aside={<Link className="adm-btn outline small" to={`${BASE}/categorias`}>Abrir Categorias <ArrowRight /></Link>} />

      <Section title="Vitrine de produtos" text="As 4 primeiras peças de Produtos." info="Mostra as 4 primeiras peças da lista de Produtos (a ordem é a da lista). As indisponíveis aparecem com o selo.">
        <Field label="Título da vitrine *"><input value={form.highlightsTitle} onChange={e => set('highlightsTitle', e.target.value)} maxLength={50} /></Field>
      </Section>

      <Section title="Banners do meio" text="Os dois banners ao lado do quadro de serviços.">
        <div className="adm-promos">
          {form.promos.map((p, i) => (
            <div key={i} className="adm-promo-edit">
              <h3>{i === 0 ? 'Banner da esquerda' : 'Banner da direita'}</h3>
              <ImageField label="Imagem *" value={p.image} onChange={v => setItem('promos', i, 'image', v)} {...PROMO_IMAGE}
                hint={i === 0 ? 'O texto fica do lado esquerdo: deixe esse lado mais limpo.' : 'O texto fica do lado direito: deixe esse lado mais limpo.'} />
              <Field label="Título *" hint="Enter = quebra de linha."><textarea rows={2} value={p.title} onChange={e => setItem('promos', i, 'title', e.target.value)} maxLength={60} /></Field>
              <Field label="Texto" hint="Vazio = não mostra."><textarea rows={2} value={p.text} onChange={e => setItem('promos', i, 'text', e.target.value)} maxLength={120} /></Field>
              <Field label="Texto do botão" hint="Vazio = sem botão."><input value={p.button} onChange={e => setItem('promos', i, 'button', e.target.value)} maxLength={30} /></Field>
              {p.button.trim() && <LinkField value={p.link} onChange={v => setItem('promos', i, 'link', v)} />}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Quadro de serviços" text="Os 4 itens entre os banners do meio."
        info={'Use {parcelas} para mostrar o número de parcelas das Configurações (ex.: "{parcelas}x sem juros" vira "6x sem juros").'}>
        <ul className="adm-repeat adm-services">
          {form.services.map((s, i) => (
            <li key={i}>
              <IconPicker value={s.icon} onChange={v => setItem('services', i, 'icon', v)} />
              <Field label="Linha de cima"><input value={s.top} onChange={e => setItem('services', i, 'top', e.target.value)} maxLength={30} /></Field>
              <Field label="Linha em destaque"><input value={s.bold} onChange={e => setItem('services', i, 'bold', e.target.value)} maxLength={30} /></Field>
              <LinkField label="Link (opcional)" value={s.link} onChange={v => setItem('services', i, 'link', v)} allowNone />
            </li>
          ))}
        </ul>
      </Section>

      <div className="adm-savebar">
        <span className="adm-savebar-msg">{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</span>
        <button className="adm-btn outline" onClick={() => { setForm(copy(saved)); setError(null) }} disabled={!dirty || saving}>Desfazer</button>
        <button className="adm-btn primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Salvando…' : 'Salvar página inicial'}</button>
      </div>
    </div>
  )
}

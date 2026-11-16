import React, { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, House, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { listCategories, slugify, uniqueSlug } from '../api.js'
import { Loading, Modal, Switch, errorText, useConfirm, useToast } from '../ui.jsx'
import ImageField, { removeSiteImage, resolveImage } from '../components/ImageField.jsx'

// Imagem do card da página inicial: mesma proporção dos banners atuais (1525 × 1005),
// com versão leve de 800 px (o site escolhe a ideal pelo tamanho da tela).
const CARD_IMAGE = { aspect: 1525 / 1005, outputs: [{ width: 1525, height: 1005, quality: 0.84 }, { width: 800, height: 527, quality: 0.8 }] }
const CARD_SUFFIXES = ['', '800']

const blank = kind => ({ name: '', slug: '', kind, active: true, home_card: false, home_title: '', home_image: null, home_tone: 'light', banner_eyebrow: '', banner_title: '', banner_text: '' })

function CategoryModal({ category, onClose, onSaved }) {
  const toast = useToast()
  const isNew = !category.id
  const [form, setForm] = useState({ ...category, home_title: category.home_title || '', banner_eyebrow: category.banner_eyebrow || '', banner_title: category.banner_title || '', banner_text: category.banner_text || '' })
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (form.name.trim().length < 2) return setError('Escreva o nome da categoria.')
    if (form.home_card && !form.home_image) return setError('Para aparecer na página inicial, escolha uma imagem para o card.')
    setSaving(true); setError(null)
    try {
      const home_image = await resolveImage(form.home_image, 'categorias', CARD_SUFFIXES)
      const fields = {
        name: form.name.trim(),
        slug: await uniqueSlug(form.slug || form.name, 'categories', category.id),
        kind: form.kind,
        active: form.active,
        home_card: form.home_card,
        home_title: form.home_title.trim() || null,
        home_image,
        home_tone: form.home_tone,
        banner_eyebrow: form.banner_eyebrow.trim() || null,
        banner_title: form.banner_title.trim() || null,
        banner_text: form.banner_text.trim() || null,
      }
      if (isNew) {
        const { data: all } = await supabase.from('categories').select('sort_order, home_card_order')
        const max = key => (all || []).reduce((m, c) => Math.max(m, c[key] || 0), 0)
        const { error: e } = await supabase.from('categories').insert({ ...fields, sort_order: max('sort_order') + 10, home_card_order: max('home_card_order') + 1 })
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('categories').update(fields).eq('id', category.id)
        if (e) throw e
        if (category.home_image && category.home_image !== home_image) await removeSiteImage(category.home_image, CARD_SUFFIXES)
      }
      toast(isNew ? 'Categoria criada.' : 'Categoria salva. O site já mostra a versão nova.')
      onSaved()
    } catch (e) { setError(errorText(e)) }
    setSaving(false)
  }

  return (
    <Modal title={isNew ? 'Nova categoria' : `Editar: ${category.name}`} onClose={saving ? undefined : onClose} wide closeOnBackdrop={false}
      footer={<><button className="adm-btn outline" onClick={onClose} disabled={saving}>Cancelar</button><button className="adm-btn primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar categoria'}</button></>}>
      {error && <p className="adm-notice is-error">{error}</p>}
      <div className="adm-grid-2">
        <label className="adm-field"><span>Nome *</span>
          <input value={form.name} onChange={e => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)) }} placeholder="Ex.: Macaquinhos" maxLength={60} />
        </label>
        <label className="adm-field"><span>Endereço</span>
          <input value={form.slug} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)) }} />
          <small>/produtos?categoria={form.slug || '…'}{!isNew && ' — mudar quebra links antigos já compartilhados.'}</small>
        </label>
      </div>
      <div className="adm-field">
        <span>Tipo</span>
        <div className="adm-segmented">
          <button type="button" className={form.kind === 'colecao' ? 'active' : ''} onClick={() => set('kind', 'colecao')}>Coleção (ex.: Maré Move)</button>
          <button type="button" className={form.kind === 'tipo' ? 'active' : ''} onClick={() => set('kind', 'tipo')}>Tipo de peça (ex.: Vestidos)</button>
        </div>
        <small>Coleção aparece no selo e no caminho da página do produto. Tipo de peça aparece no filtro do catálogo.</small>
      </div>
      <Switch checked={form.active} onChange={v => set('active', v)} label={form.active ? 'Ativa (aparece no site)' : 'Oculta (não aparece no site)'} />

      <h3 className="adm-subtitle">Banner da página da categoria</h3>
      <p className="adm-hint">Textos do topo de /produtos?categoria={form.slug || '…'}. Vazio = usa o texto geral do catálogo.</p>
      <div className="adm-grid-2">
        <label className="adm-field"><span>Texto pequeno (acima do título)</span><input value={form.banner_eyebrow} onChange={e => set('banner_eyebrow', e.target.value)} placeholder={form.name || 'Maré Move'} /></label>
        <label className="adm-field"><span>Título</span><textarea rows={2} value={form.banner_title} onChange={e => set('banner_title', e.target.value)} placeholder={'Seu movimento,\nsua melhor versão.'} /><small>Enter = quebra de linha.</small></label>
      </div>
      <label className="adm-field"><span>Texto</span><textarea rows={2} value={form.banner_text} onChange={e => set('banner_text', e.target.value)} /></label>

      <h3 className="adm-subtitle">Card na página inicial</h3>
      <Switch checked={form.home_card} onChange={v => set('home_card', v)} label={form.home_card ? 'Aparece na página inicial' : 'Não aparece na página inicial'} />
      {form.home_card && (
        <div className="adm-home-card-fields">
          <ImageField label="Imagem do card" value={form.home_image} onChange={v => set('home_image', v)} {...CARD_IMAGE} hint="Formato paisagem. Deixe o lado esquerdo mais livre: é onde fica o texto." />
          <div className="adm-grid-2">
            <label className="adm-field"><span>Texto do card</span><textarea rows={2} value={form.home_title} onChange={e => set('home_title', e.target.value)} placeholder={form.name} /><small>Enter = quebra de linha (ex.: "Conjuntos" / "Fitness").</small></label>
            <div className="adm-field"><span>Cor do texto</span>
              <div className="adm-segmented">
                <button type="button" className={form.home_tone === 'light' ? 'active' : ''} onClick={() => set('home_tone', 'light')}>Branco (foto escura)</button>
                <button type="button" className={form.home_tone === 'dark' ? 'active' : ''} onClick={() => set('home_tone', 'dark')}>Vinho (foto clara)</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Categories() {
  const toast = useToast()
  const confirm = useConfirm()
  const [categories, setCategories] = useState(null)
  const [counts, setCounts] = useState({})
  const [editing, setEditing] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = async () => {
    try {
      const [cats, { data: links, error }] = await Promise.all([listCategories(), supabase.from('product_categories').select('category_id')])
      if (error) throw error
      setCategories(cats)
      setCounts(links.reduce((m, l) => ({ ...m, [l.category_id]: (m[l.category_id] || 0) + 1 }), {}))
      setLoadError(null)
    } catch (e) { setLoadError(errorText(e)) }
  }
  useEffect(() => { load() }, [])

  const update = async (cat, fields, ok) => {
    setCategories(list => list.map(c => c.id === cat.id ? { ...c, ...fields } : c))
    const { error } = await supabase.from('categories').update(fields).eq('id', cat.id)
    if (error) { toast(errorText(error), 'error'); load() } else if (ok) toast(ok)
  }

  // troca a posição de duas categorias (mesma lista) e grava
  const swap = async (list, i, j, field) => {
    if (j < 0 || j >= list.length) return
    const a = list[i], b = list[j]
    const orderA = a[field], orderB = b[field] === a[field] ? a[field] + 1 : b[field]
    setCategories(cs => cs.map(c => c.id === a.id ? { ...c, [field]: orderB } : c.id === b.id ? { ...c, [field]: orderA } : c))
    const results = await Promise.all([
      supabase.from('categories').update({ [field]: orderB }).eq('id', a.id),
      supabase.from('categories').update({ [field]: orderA }).eq('id', b.id),
    ])
    const err = results.find(r => r.error)?.error
    if (err) { toast(errorText(err), 'error'); load() }
  }

  const remove = async cat => {
    const n = counts[cat.id] || 0
    const ok = await confirm({ title: 'Excluir categoria', danger: true, confirmLabel: 'Excluir categoria',
      text: `"${cat.name}" será excluída.${n ? ` ${n} produto(s) estão nela: eles continuam no site, só deixam de estar nesta categoria.` : ''} Links antigos para ela vão abrir o catálogo completo. Para só esconder, desligue "Ativa".` })
    if (!ok) return
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) return toast(errorText(error), 'error')
    if (cat.home_image) await removeSiteImage(cat.home_image, CARD_SUFFIXES)
    toast('Categoria excluída.')
    load()
  }

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><button className="adm-btn outline" onClick={load}>Tentar de novo</button></div>
  if (!categories) return <Loading text="Carregando categorias…" />

  const bySort = (a, b) => a.sort_order - b.sort_order
  const groups = [
    { kind: 'colecao', title: 'Coleções', text: 'Linhas da loja: aparecem no selo e no caminho da página do produto.' },
    { kind: 'tipo', title: 'Tipos de peça', text: 'Aparecem no filtro "Tipo de peça" do catálogo.' },
  ]
  const homeCards = categories.filter(c => c.home_card).sort((a, b) => a.home_card_order - b.home_card_order)

  return (
    <>
      <div className="adm-page-head">
        <p className="adm-muted">A ordem aqui é a ordem dos botões de categoria no catálogo do site.</p>
        <span className="adm-head-actions">
          <button className="adm-btn outline" onClick={() => setEditing(blank('tipo'))}><Plus /> Novo tipo de peça</button>
          <button className="adm-btn primary" onClick={() => setEditing(blank('colecao'))}><Plus /> Nova coleção</button>
        </span>
      </div>

      {groups.map(group => {
        const list = categories.filter(c => c.kind === group.kind).sort(bySort)
        return (
          <section key={group.kind} className="adm-card">
            <div className="adm-card-head"><div><h2>{group.title}</h2><p>{group.text}</p></div></div>
            {list.length === 0 ? <p className="adm-muted">Nenhuma ainda.</p> : (
              <ul className="adm-catlist">
                {list.map((c, i) => (
                  <li key={c.id} className={!c.active ? 'is-hidden' : ''}>
                    <span className="adm-prow-order">
                      <button className="adm-icon-btn" onClick={() => swap(list, i, i - 1, 'sort_order')} disabled={i === 0} aria-label={`Subir ${c.name}`}><ArrowUp /></button>
                      <button className="adm-icon-btn" onClick={() => swap(list, i, i + 1, 'sort_order')} disabled={i === list.length - 1} aria-label={`Descer ${c.name}`}><ArrowDown /></button>
                    </span>
                    <span className="adm-cat-info">
                      <b>{c.name}</b>
                      <small>{counts[c.id] || 0} produto(s) · /produtos?categoria={c.slug}</small>
                    </span>
                    {c.home_card && <span className="adm-badge" title="Aparece na página inicial"><House /> Início</span>}
                    <Switch checked={c.active} onChange={v => update(c, { active: v }, v ? 'Categoria visível no site.' : 'Categoria oculta no site.')} label="Ativa" />
                    <span className="adm-prow-actions">
                      <button className="adm-icon-btn" onClick={() => setEditing(c)} aria-label={`Editar ${c.name}`} title="Editar"><Pencil /></button>
                      <button className="adm-icon-btn danger" onClick={() => remove(c)} aria-label={`Excluir ${c.name}`} title="Excluir"><Trash2 /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Cards da página inicial</h2><p>Categorias com "Card na página inicial" ligado, nesta ordem. Para incluir outra, edite a categoria.</p></div></div>
        {homeCards.length === 0 ? <p className="adm-muted"><Tags /> Nenhum card ligado.</p> : (
          <ul className="adm-homecards">
            {homeCards.map((c, i) => (
              <li key={c.id}>
                <span className="adm-homecard-img">{c.home_image && <img src={c.home_image} alt="" />}<b className={c.home_tone}>{(c.home_title || c.name).split('\n').map((l, k) => <React.Fragment key={k}>{k > 0 && <br />}{l}</React.Fragment>)}</b></span>
                <span className="adm-homecard-actions">
                  <button className="adm-icon-btn" onClick={() => swap(homeCards, i, i - 1, 'home_card_order')} disabled={i === 0} aria-label="Mover para antes"><ArrowUp /></button>
                  <button className="adm-icon-btn" onClick={() => swap(homeCards, i, i + 1, 'home_card_order')} disabled={i === homeCards.length - 1} aria-label="Mover para depois"><ArrowDown /></button>
                  <button className="adm-icon-btn" onClick={() => setEditing(c)} aria-label="Editar card"><Pencil /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Plus, Trash2, X } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { deleteProduct, getProduct, listCategories, nextProductCode, uniqueSlug, slugify } from '../api.js'
import { BASE } from '../sections.js'
import { Loading, Switch, errorText, useConfirm, useToast, useUnsavedGuard } from '../ui.jsx'
import ProductPhotos, { syncPhotos } from '../components/ProductPhotos.jsx'

const COMMON_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único', '36', '38', '40', '42', '44']
const DEFAULT_SIZES = ['P', 'M', 'G']

const emptyProduct = () => ({
  name: '', slug: '', kind: 'roupa', price: '', old_price: '', description: '',
  colors: [{ name: '', hex: '#c9a99a' }], sizes: [...DEFAULT_SIZES], details: [],
  brand: '', flavors: [], package_size: '', usage: '', notice: '',
  active: true, available: true, categoryIds: [], photos: [],
})

// Linha do banco → formulário
const toForm = row => ({
  name: row.name, slug: row.slug, kind: row.kind,
  price: moneyText(row.price), old_price: moneyText(row.old_price),
  description: row.description || '',
  colors: row.colors?.length ? row.colors : [], sizes: row.sizes || [], details: row.details || [],
  brand: row.brand || '', flavors: row.flavors || [], package_size: row.package_size || '', usage: row.usage || '', notice: row.notice || '',
  active: row.active, available: row.available,
  categoryIds: (row.product_categories || []).map(pc => pc.category_id),
  photos: (row.product_images || []).map(img => ({ id: img.id, path: img.path, thumb_path: img.thumb_path })),
})

// "89,90", "89.90", "1.299,90" → número. Vírgula é sempre o decimal; ponto só é decimal em "89.90".
const toNumber = value => {
  let s = String(value ?? '').trim()
  if (!s) return NaN
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (!/^\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '')
  return Number(s)
}
const moneyText = value => value === null || value === undefined || value === '' ? '' : Number(value).toFixed(2).replace('.', ',')
const sortSizes = sizes => [...sizes].sort((a, b) => {
  const ia = COMMON_SIZES.indexOf(a), ib = COMMON_SIZES.indexOf(b)
  return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
})


// Confere o formulário e devolve os problemas (campo → mensagem).
const validate = (form, categories) => {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Escreva o nome do produto.'
  const price = toNumber(form.price)
  if (!form.price || !(price > 0)) errors.price = 'Informe um preço maior que zero (ex.: 89,90).'
  if (form.old_price) {
    const old = toNumber(form.old_price)
    if (!(old > 0)) errors.old_price = 'Preço antigo inválido.'
    else if (old <= price) errors.old_price = 'Para entrar em promoção, o preço antigo precisa ser MAIOR que o preço atual.'
  }
  if (!form.categoryIds.some(id => categories.find(c => c.id === id)?.kind === 'colecao')) errors.categories = 'Marque pelo menos uma coleção (ex.: Maré Move ou Moda feminina).'
  if (form.kind === 'roupa' && form.colors.some(c => !c.name.trim())) errors.colors = 'Dê um nome para cada cor (ou remova a cor vazia).'
  if (form.details.some(d => !d.label.trim() || !d.value.trim())) errors.details = 'Preencha os dois campos de cada detalhe (ou remova a linha).'
  return errors
}

function Field({ label, hint, error, children }) {
  return (
    <label className={`adm-field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error ? <small className="adm-field-error">{error}</small> : hint && <small>{hint}</small>}
    </label>
  )
}

// Lista de etiquetas com campo para adicionar (sabores, tamanhos extras).
function TagInput({ values, onChange, placeholder }) {
  const [text, setText] = useState('')
  const add = () => {
    const v = text.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setText('')
  }
  return (
    <div className="adm-tags">
      {values.map(v => <span key={v} className="adm-tag">{v}<button type="button" onClick={() => onChange(values.filter(x => x !== v))} aria-label={`Remover ${v}`}><X /></button></span>)}
      <input className="adm-input" value={text} onChange={e => setText(e.target.value)} placeholder={placeholder}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }} onBlur={add} />
    </div>
  )
}

export default function ProductEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(null)          // última versão gravada (para saber se há mudanças)
  const [row, setRow] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const cats = await listCategories()
        if (!alive) return
        setCategories(cats)
        if (isNew) {
          const blank = emptyProduct()
          setForm(blank); setSaved(blank); setRow(null)
        } else {
          const product = await getProduct(id)
          if (!alive) return
          if (!product) { setLoadError('Produto não encontrado (pode ter sido excluído).'); return }
          const f = toForm(product)
          setForm(f); setSaved(f); setRow(product)
        }
      } catch (error) { if (alive) setLoadError(errorText(error)) }
    })()
    return () => { alive = false }
  }, [id, isNew])

  const dirty = useMemo(() => form && saved && JSON.stringify(form) !== JSON.stringify(saved), [form, saved])

  // Avisa antes de sair com alterações não salvas (links do painel e ao fechar/recarregar a aba).
  useUnsavedGuard(dirty && !saving, 'Você fez alterações neste produto que ainda não foram salvas. Se sair agora, elas serão perdidas.')

  if (loadError) return <div className="adm-card"><p className="adm-notice is-error">{loadError}</p><Link className="adm-btn outline" to={`${BASE}/produtos`}><ArrowLeft /> Voltar para produtos</Link></div>
  if (!form) return <Loading text="Carregando produto…" />

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const setName = name => setForm(f => ({ ...f, name }))
  const toggleCategory = cid => set('categoryIds', form.categoryIds.includes(cid) ? form.categoryIds.filter(x => x !== cid) : [...form.categoryIds, cid])
  const setKind = kind => setForm(f => ({ ...f, kind, sizes: kind === 'suplemento' ? [] : (f.sizes.length ? f.sizes : [...DEFAULT_SIZES]) }))

  const colecoes = categories.filter(c => c.kind === 'colecao')
  const tipos = categories.filter(c => c.kind === 'tipo')

  const save = async () => {
    const problems = validate(form, categories)
    setErrors(problems)
    if (Object.keys(problems).length) {
      toast('Confira os campos destacados em vermelho.', 'error')
      document.querySelector('.adm-field.has-error, .adm-field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSaving(true)
    try {
      const isRoupa = form.kind === 'roupa'
      const fields = {
        name: form.name.trim(),
        // Endereço da página: criado sozinho pelo nome no cadastro e depois fixo (renomear o produto
        // não muda o link, para não quebrar links já compartilhados ou guardados pelo Google).
        slug: isNew ? await uniqueSlug(form.name, 'products') : row.slug,
        kind: form.kind,
        price: toNumber(form.price),
        old_price: form.old_price ? toNumber(form.old_price) : null,
        description: form.description.trim(),
        colors: isRoupa ? form.colors.map(c => ({ name: c.name.trim(), hex: c.hex })) : [],
        sizes: isRoupa ? form.sizes : [],
        details: form.details.map(d => ({ label: d.label.trim(), value: d.value.trim() })),
        brand: form.brand.trim() || null,
        flavors: !isRoupa && form.flavors.length ? form.flavors : null,
        package_size: !isRoupa ? form.package_size.trim() || null : null,
        usage: !isRoupa ? form.usage.trim() || null : null,
        notice: !isRoupa ? form.notice.trim() || null : null,
        active: form.active,
        available: form.available,
      }

      let productId = row?.id
      let code = row?.code
      if (isNew) {
        code = await nextProductCode()
        const { data: first } = await supabase.from('products').select('sort_order').order('sort_order').limit(1).maybeSingle()
        const { data, error } = await supabase.from('products').insert({ ...fields, code, sort_order: (first?.sort_order ?? 10) - 10 }).select('id').single()
        if (error) throw error
        productId = data.id
      } else {
        const { error } = await supabase.from('products').update(fields).eq('id', productId)
        if (error) throw error
      }

      // categorias: tira as desmarcadas e inclui as novas
      const before = isNew ? [] : (row.product_categories || []).map(pc => pc.category_id)
      const removed = before.filter(c => !form.categoryIds.includes(c))
      const added = form.categoryIds.filter(c => !before.includes(c))
      if (removed.length) { const { error } = await supabase.from('product_categories').delete().eq('product_id', productId).in('category_id', removed); if (error) throw error }
      if (added.length) { const { error } = await supabase.from('product_categories').insert(added.map(category_id => ({ product_id: productId, category_id }))); if (error) throw error }

      // fotos (etapa 6): envia as novas, grava a ordem e apaga as removidas
      await syncPhotos({ productId, code, name: fields.name, photos: form.photos, previous: row?.product_images || [] })

      const fresh = await getProduct(productId)
      const f = toForm(fresh)
      setRow(fresh); setForm(f); setSaved(f); setErrors({})
      toast(isNew ? 'Produto criado! Ele já aparece no site.' : 'Alterações salvas. O site já mostra a versão nova.')
      if (isNew) navigate(`${BASE}/produtos/${productId}`, { replace: true })
    } catch (error) {
      toast(errorText(error), 'error')
    }
    setSaving(false)
  }

  const remove = async () => {
    const ok = await confirm({ title: 'Excluir produto', text: `"${row.name}" será excluído do site e do painel, junto com as fotos dele. Essa ação não pode ser desfeita.`, confirmLabel: 'Excluir de vez', danger: true })
    if (!ok) return
    setSaving(true)
    try {
      await deleteProduct(row)
      setSaved(form)
      toast('Produto excluído.')
      navigate(`${BASE}/produtos`, { replace: true })
    } catch (error) { toast(errorText(error), 'error'); setSaving(false) }
  }

  const promo = form.old_price && toNumber(form.old_price) > toNumber(form.price)

  return (
    <div className="adm-editor">
      <div className="adm-page-head">
        <Link className="adm-btn ghost small" to={`${BASE}/produtos`}><ArrowLeft /> Produtos</Link>
        {!isNew && row?.active && <a className="adm-btn outline small" href={`/produto/${row.slug}`} target="_blank" rel="noreferrer"><ExternalLink /> Ver no site</a>}
      </div>

      <div className="adm-editor-grid">
        <div className="adm-editor-main">
          <section className="adm-card adm-ed-info">
            <div className="adm-card-head"><div><h2>{isNew ? 'Novo produto' : 'Informações'}</h2>{!isNew && <p>Código {row.code}</p>}</div></div>
            <Field label="Nome do produto *" error={errors.name}>
              <input value={form.name} onChange={e => setName(e.target.value)} placeholder="Ex.: Conjunto Maré Move Lilás" maxLength={120} />
            </Field>
            <p className="adm-hint adm-slug-info">
              Endereço da página: <b>usemare.com.br/produto/{isNew ? (slugify(form.name) || '…') : row.slug}</b>
              {isNew ? ' — criado sozinho a partir do nome.' : ' — fica fixo mesmo se o nome mudar, para não quebrar links já compartilhados.'}
            </p>
            <div className="adm-field">
              <span>Tipo de ficha</span>
              <div className="adm-segmented" role="radiogroup">
                <button type="button" role="radio" aria-checked={form.kind === 'roupa'} className={form.kind === 'roupa' ? 'active' : ''} onClick={() => setKind('roupa')} title="Roupa (cores e tamanhos)">Roupa (cores e tamanhos)</button>
                <button type="button" role="radio" aria-checked={form.kind === 'suplemento'} className={form.kind === 'suplemento' ? 'active' : ''} onClick={() => setKind('suplemento')} title="Suplemento (sabores e embalagem)">Suplemento (sabores e embalagem)</button>
              </div>
            </div>
            <Field label="Descrição" hint="A primeira frase (até a primeira linha em branco) aparece em destaque. Deixe uma linha em branco entre os parágrafos.">
              <textarea rows={9} value={form.description} onChange={e => set('description', e.target.value)} placeholder={'Treino com elegância? A gente ama! ✨\n\nBlusa de manga curta com modelagem ajustadinha…\n\nMARÉ MOVE — seu movimento, sua melhor versão.'} />
            </Field>
          </section>

          <section className="adm-card adm-ed-photos">
            <div className="adm-card-head"><div><h2>Fotos</h2><p>Proporção do site: 3 × 4 (retrato). A primeira foto é a capa.</p></div></div>
            <ProductPhotos photos={form.photos} onChange={photos => set('photos', photos)} />
          </section>

          {form.kind === 'roupa' ? (
            <section className="adm-card adm-ed-kind">
              <div className="adm-card-head"><div><h2>Cores e tamanhos</h2><p>Aparecem na página do produto.</p></div></div>
              <div className={`adm-field ${errors.colors ? 'has-error' : ''}`}>
                <span>Cores</span>
                <div className="adm-colors">
                  {form.colors.map((c, i) => (
                    <div key={i} className="adm-color-row">
                      <input type="color" value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : '#cccccc'} onChange={e => set('colors', form.colors.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))} aria-label="Escolher a cor" />
                      <input className="adm-input" value={c.name} onChange={e => set('colors', form.colors.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Nome da cor (ex.: Vinho)" />
                      <button type="button" className="adm-icon-btn danger" onClick={() => set('colors', form.colors.filter((_, j) => j !== i))} aria-label="Remover cor"><Trash2 /></button>
                    </div>
                  ))}
                  <button type="button" className="adm-btn outline small" onClick={() => set('colors', [...form.colors, { name: '', hex: '#c9a99a' }])}><Plus /> Adicionar cor</button>
                </div>
                {errors.colors && <small className="adm-field-error">{errors.colors}</small>}
              </div>
              <div className="adm-field">
                <span>Tamanhos disponíveis</span>
                <div className="adm-chips">
                  {sortSizes([...new Set([...COMMON_SIZES, ...form.sizes])]).map(s => (
                    <button type="button" key={s} className={form.sizes.includes(s) ? 'active' : ''} aria-pressed={form.sizes.includes(s)}
                      onClick={() => set('sizes', form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : sortSizes([...form.sizes, s]))}>{s}</button>
                  ))}
                </div>
                <small>Toque para marcar ou desmarcar. Precisa de outro? Digite abaixo e aperte Enter.</small>
                <TagInput values={[]} onChange={([s]) => s && !form.sizes.includes(s) && set('sizes', [...form.sizes, s])} placeholder="Novo tamanho (ex.: 46, Plus)" />
              </div>
            </section>
          ) : (
            <section className="adm-card adm-ed-kind">
              <div className="adm-card-head"><div><h2>Ficha do suplemento</h2></div></div>
              <div className="adm-grid-2">
                <Field label="Marca"><input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Ex.: Lifemore" /></Field>
                <Field label="Embalagem"><input value={form.package_size} onChange={e => set('package_size', e.target.value)} placeholder="Ex.: Pote de 210 g" /></Field>
              </div>
              <div className="adm-field"><span>Sabores</span><TagInput values={form.flavors} onChange={v => set('flavors', v)} placeholder="Digite um sabor e aperte Enter" /></div>
              <Field label="Modo de uso"><textarea rows={3} value={form.usage} onChange={e => set('usage', e.target.value)} /></Field>
              <Field label="Aviso (aparece em letra menor)"><textarea rows={3} value={form.notice} onChange={e => set('notice', e.target.value)} /></Field>
            </section>
          )}

          <section className="adm-card adm-ed-details">
            <div className="adm-card-head"><div><h2>Detalhes extras</h2><p>Linhas a mais na aba "Sobre a peça" (ex.: Tecido → Suplex; Forro → Sim).</p></div></div>
            <div className={`adm-details ${errors.details ? 'has-error' : ''}`}>
              {form.details.map((d, i) => (
                <div key={i} className="adm-detail-row">
                  <input className="adm-input" value={d.label} onChange={e => set('details', form.details.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Nome (ex.: Tecido)" />
                  <input className="adm-input" value={d.value} onChange={e => set('details', form.details.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="Valor (ex.: Suplex)" />
                  <button type="button" className="adm-icon-btn danger" onClick={() => set('details', form.details.filter((_, j) => j !== i))} aria-label="Remover detalhe"><Trash2 /></button>
                </div>
              ))}
              {errors.details && <small className="adm-field-error">{errors.details}</small>}
              <button type="button" className="adm-btn outline small" onClick={() => set('details', [...form.details, { label: '', value: '' }])}><Plus /> Adicionar detalhe</button>
            </div>
          </section>
        </div>

        <aside className="adm-editor-side">
          <section className="adm-card adm-ed-visibility">
            <h2>Visibilidade</h2>
            <div className="adm-side-switches">
              <Switch checked={form.active} onChange={v => set('active', v)} label={form.active ? 'Aparece no site' : 'Oculto (não aparece no site)'} />
              <Switch checked={form.available} onChange={v => set('available', v)} label={form.available ? 'Disponível para compra' : 'Indisponível (no site, sem preço)'} />
            </div>
          </section>

          <section className="adm-card adm-ed-price">
            <h2>Preço</h2>
            <div className="adm-price-pair">
              <Field label="Preço *" error={errors.price}>
                <div className="adm-money"><span>R$</span><input inputMode="decimal" value={form.price} onChange={e => set('price', e.target.value.replace(/[^0-9,.]/g, ''))} placeholder="89,90" /></div>
              </Field>
              <Field label="Preço antigo" error={errors.old_price}>
                <div className="adm-money"><span>R$</span><input inputMode="decimal" value={form.old_price} onChange={e => set('old_price', e.target.value.replace(/[^0-9,.]/g, ''))} placeholder="119,90" /></div>
              </Field>
            </div>
            <p className={`adm-hint adm-price-hint ${promo ? 'is-promo' : ''}`}>{promo ? 'Em promoção: aparece riscado e o produto entra em Promoções.' : 'Preço antigo é opcional. Preencha com um valor MAIOR para colocar em promoção.'}</p>
          </section>

          <section className={`adm-card adm-ed-cats ${errors.categories ? 'has-error-card' : ''}`}>
            <h2>Categorias</h2>
            <p className="adm-hint">Coleção = selo e caminho da página. Tipo = filtro "Tipo de peça".</p>
            <p className="adm-group-label">Coleção</p>
            <div className="adm-check-grid">{colecoes.map(c => <label key={c.id} className="adm-check" title={c.name}><input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} /> <span>{c.name}{!c.active && <em> (oculta)</em>}</span></label>)}</div>
            <p className="adm-group-label">Tipo de peça</p>
            <div className="adm-check-grid">{tipos.map(c => <label key={c.id} className="adm-check" title={c.name}><input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} /> <span>{c.name}{!c.active && <em> (oculta)</em>}</span></label>)}</div>
            {errors.categories && <small className="adm-field-error">{errors.categories}</small>}
            <Link className="adm-link" to={`${BASE}/categorias`}>Gerenciar categorias</Link>
          </section>

          {!isNew && (
            <section className="adm-card adm-ed-delete">
              <p className="adm-hint">Para tirar do site só por um tempo, prefira desligar "Aparece no site".</p>
              <button className="adm-btn danger-text" onClick={remove} disabled={saving}><Trash2 /> Excluir produto</button>
            </section>
          )}
        </aside>
      </div>

      <div className="adm-savebar">
        <span className="adm-savebar-msg">{dirty ? 'Você tem alterações não salvas.' : isNew ? 'Preencha e clique em Criar produto.' : 'Tudo salvo.'}</span>
        <Link className="adm-btn outline" to={`${BASE}/produtos`}>Cancelar</Link>
        <button className="adm-btn primary" onClick={save} disabled={saving || (!dirty && !isNew)}>{saving ? 'Salvando…' : isNew ? 'Criar produto' : 'Salvar alterações'}</button>
      </div>
    </div>
  )
}

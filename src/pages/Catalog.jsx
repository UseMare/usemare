import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, SlidersHorizontal, Truck, X } from 'lucide-react'
import { categories, categoryBySlug, collections, productTypeName, products } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { PageIntro, ProductCard, WhatsApp } from '../ui.jsx'
import { helloMessage, whatsappLink } from '../store.js'
import { pageContent } from '../content.js'

// Textos do cabeçalho da página: os da categoria (painel → Categorias) ou, em "Todos",
// os textos gerais do catálogo (painel → Textos das páginas).
export const catalogDefaults = {
  eyebrow: 'Nossa coleção',
  title: 'Vista sua\nmelhor versão.',
  text: 'Moda feminina e Maré Move: peças leves, versáteis e escolhidas com carinho para cada momento.',
  script: 'com carinho',
  shippingBadge: 'Envio para todo o Brasil',
  whatsappBadge: 'Compra pelo WhatsApp',
}
const bannerFor = slug => {
  const general = pageContent('catalog', catalogDefaults)
  const category = categoryBySlug(slug)
  if (!category) return general
  return {
    eyebrow: category.banner_eyebrow || category.name,
    title: category.banner_title || general.title,
    text: category.banner_text || general.text,
    script: general.script,
    shippingBadge: general.shippingBadge,
    whatsappBadge: general.whatsappBadge,
  }
}

const sorts = [
  { key: 'destaques', label: 'Destaques' },
  { key: 'menor-preco', label: 'Menor preço' },
  { key: 'maior-preco', label: 'Maior preço' },
  { key: 'a-z', label: 'Nome (A–Z)' },
]

// Opções dos filtros, calculadas a partir do catálogo atual.
const filterOptions = () => ({
  // tipos na ordem das categorias
  allTypes: [...new Set([...categories].sort((a, b) => a.sort_order - b.sort_order).filter(c => c.kind === 'tipo').map(c => c.name))]
    .filter(name => products.some(p => productTypeName(p) === name))
    .concat(products.some(p => productTypeName(p) === 'Suplementos') && !categories.some(c => c.kind === 'tipo' && c.name === 'Suplementos') ? ['Suplementos'] : []),
  priceFloor: Math.floor(Math.min(...products.map(p => p.price)) / 10) * 10,
  priceCeil: Math.ceil(Math.max(...products.map(p => p.price)) / 10) * 10,
})

const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const listParam = (params, key) => (params.get(key) || '').split(',').filter(Boolean)
// Tipo de peça no endereço vai como código sem vírgula (ex.: "Saias, calças & shorts" → saias-calcas-shorts),
// porque a vírgula separa os tipos marcados. Endereços antigos com o nome continuam valendo.
const typeKey = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`filter-group ${open ? 'open' : ''}`}>
      <button className="filter-title" onClick={() => setOpen(!open)} aria-expanded={open}>{title}<ChevronDown /></button>
      <div className="filter-body">{children}</div>
    </div>
  )
}

// Quantas peças por página (12 = linhas cheias com 2, 3 ou 4 colunas).
const PAGE_SIZE = 12

// Números que aparecem na paginação: 1 … 4 5 6 … 20 (sempre a primeira, a última e as vizinhas da atual).
function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1].filter(n => n >= 1 && n <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? ['…', n] : [n]))
}

function Pagination({ page, total, onChange }) {
  if (total < 2) return null
  return (
    <nav className="pagination" aria-label="Páginas de produtos">
      <button className="pagination-arrow" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Página anterior"><ChevronLeft /></button>
      {pageList(page, total).map((n, i) => n === '…'
        ? <span key={`gap-${i}`} className="pagination-gap" aria-hidden="true">…</span>
        : <button key={n} className={n === page ? 'active' : ''} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Página ${n}`}>{n}</button>)}
      <button className="pagination-arrow" onClick={() => onChange(page + 1)} disabled={page === total} aria-label="Próxima página"><ChevronRight /></button>
    </nav>
  )
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { catalogVersion } = useShop()
  const { allTypes, priceFloor, priceCeil } = useMemo(filterOptions, [catalogVersion])

  const categoria = params.get('categoria') || 'todos'
  const busca = params.get('busca') || ''
  const tipos = listParam(params, 'tipo').map(v => allTypes.find(name => typeKey(name) === v || name === v)).filter(Boolean)
  const maxPrice = Number(params.get('ate')) || priceCeil
  const onlyAvailable = params.get('disponiveis') === '1'
  const sort = params.get('ordem') || 'destaques'

  const collection = collections.find(c => c.key === categoria) || collections[0]
  const banner = bannerFor(categoria)
  usePageTitle(busca ? `Busca: ${busca}` : collection.key === 'todos' ? 'Produtos' : collection.label)

  // Atualiza um filtro na URL (assim o link filtrado pode ser compartilhado).
  const update = (changes, { keepFilters = true } = {}) => {
    const next = new URLSearchParams(keepFilters ? params : {})
    next.delete('pagina') // qualquer filtro novo volta para a página 1
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && !value.length)) next.delete(key)
      else next.set(key, Array.isArray(value) ? value.join(',') : value)
    })
    setParams(next, { replace: true })
  }
  const toggleIn = (key, list, value) => update({ [key]: list.includes(value) ? list.filter(v => v !== value) : [...list, value] })
  const clearFilters = () => update({ tipo: null, cor: null, ate: null, disponiveis: null, busca: null })

  const result = useMemo(() => {
    const term = normalize(busca.trim())
    const list = products.filter(p =>
      collection.test(p) &&
      (!term || normalize(`${p.name} ${p.colors.map(c => c.name).join(' ')} ${(p.flavors || []).join(' ')} ${productTypeName(p)} ${p.categorySlugs.map(s => categoryBySlug(s)?.name || '').join(' ')}`).includes(term)) &&
      (!tipos.length || tipos.includes(productTypeName(p))) &&
      p.price <= maxPrice &&
      (!onlyAvailable || p.available))
    const sorted = [...list]
    if (sort === 'menor-preco') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'maior-preco') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'a-z') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return sorted // indisponíveis ficam no lugar delas, sem preço (ver Price em ui.jsx)
  }, [collection, busca, tipos.join(), maxPrice, onlyAvailable, sort, catalogVersion])

  // Paginação: ?pagina=2 na URL (o botão voltar do navegador funciona).
  const totalPages = Math.max(1, Math.ceil(result.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(params.get('pagina')) || 1), totalPages)
  const shown = result.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  // Troca de página suave: os cards atuais somem enquanto a tela desliza até o topo da lista;
  // depois entram os novos (com o data-reveal, um após o outro). keepScroll impede o Layout de pular para o topo do site.
  const [leaving, setLeaving] = useState(false)
  const goToPage = n => {
    if (leaving || n === page) return
    const next = new URLSearchParams(params)
    if (n <= 1) next.delete('pagina'); else next.set('pagina', n)
    setLeaving(true)
    document.querySelector('.catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      setParams(next, { state: { keepScroll: true } })
      setLeaving(false)
    }, 450)
  }

  const activeCount = tipos.length + (maxPrice < priceCeil ? 1 : 0) + (onlyAvailable ? 1 : 0) + (busca ? 1 : 0)

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filtersOpen])

  return (
    <div className="catalog-page">
      <PageIntro
        crumbs={[{ label: 'Produtos', to: '/produtos' }, ...(collection.key !== 'todos' ? [{ label: collection.label }] : [])]}
        eyebrow={banner.eyebrow}
        title={banner.title}
        text={banner.text}
        images={products.filter(p => collection.test(p) && p.available).slice(0, 3).map(p => p.photos[0])}
        script={banner.script}
        variant="fan"
        aside={(
          <ul className="intro-meta">
            <li><b>{products.filter(collection.test).length}</b> {products.filter(collection.test).length === 1 ? 'peça' : 'peças'}</li>
            {banner.shippingBadge && <li><Truck /> {banner.shippingBadge}</li>}
            {banner.whatsappBadge && <li><WhatsApp /> {banner.whatsappBadge}</li>}
          </ul>
        )}
      />

      <div className="shell">
        <div className="chips" role="tablist" aria-label="Categorias">
          {collections.filter(c => c.key === 'todos' || c.key === collection.key || products.some(c.test)).map((c, index) => (
            <button key={c.key} role="tab" aria-selected={c.key === collection.key} className={c.key === collection.key ? 'active' : ''} onClick={() => update({ categoria: c.key === 'todos' ? null : c.key })} style={{ '--i': index }}>
              {c.label}
              <small>{products.filter(c.test).length}</small>
            </button>
          ))}
        </div>

        <div className="catalog">
          <aside className={`filters ${filtersOpen ? 'open' : ''}`} aria-label="Filtros">
            <div className="filters-head">
              <h2>Filtros</h2>
              {activeCount > 0 && <button className="link-button" onClick={clearFilters}>Limpar tudo</button>}
              <button className="icon-button filters-close" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros"><X /></button>
            </div>

            <FilterGroup title="Tipo de peça">
              {allTypes.map(type => (
                <label key={type} className="check">
                  <input type="checkbox" checked={tipos.includes(type)} onChange={() => update({ tipo: (tipos.includes(type) ? tipos.filter(t => t !== type) : [...tipos, type]).map(typeKey) })} />
                  <span className="box"><Check /></span>{type}
                  <small>{products.filter(p => productTypeName(p) === type && collection.test(p)).length}</small>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Preço">
              <div className="price-range">
                <input type="range" min={priceFloor} max={priceCeil} step="10" value={maxPrice} onChange={e => update({ ate: Number(e.target.value) >= priceCeil ? null : e.target.value })} aria-label="Preço máximo" style={{ '--fill': `${((maxPrice - priceFloor) / (priceCeil - priceFloor)) * 100}%` }} />
                <div><span>R$ {priceFloor}</span><b>até R$ {maxPrice}</b></div>
              </div>
            </FilterGroup>

            <FilterGroup title="Disponibilidade">
              <label className="toggle">
                <input type="checkbox" checked={onlyAvailable} onChange={() => update({ disponiveis: onlyAvailable ? null : '1' })} />
                <span className="track"><span /></span> Só peças disponíveis
              </label>
            </FilterGroup>

            <div className="filters-help">
              <p>Ficou com dúvida sobre tamanho ou cor?</p>
              <a href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Chama a gente no WhatsApp</a>
            </div>

            <button className="button dark filters-apply" onClick={() => setFiltersOpen(false)}>Ver {result.length} {result.length === 1 ? 'peça' : 'peças'}</button>
          </aside>
          {filtersOpen && <button className="backdrop filters-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros" />}

          <section className="catalog-results" aria-live="polite">
            <div className="results-bar">
              <div>
                <h2>{busca ? <>Resultados para “{busca}”</> : collection.key === 'todos' ? 'Todos os produtos' : collection.label}</h2>
                <span>{result.length} {result.length === 1 ? 'peça encontrada' : 'peças encontradas'}</span>
              </div>
              <button className="button outline small filters-toggle" onClick={() => setFiltersOpen(true)}><SlidersHorizontal /> Filtros{activeCount > 0 && <b>{activeCount}</b>}</button>
              <label className="sort">
                <span>Ordenar</span>
                <select value={sort} onChange={e => update({ ordem: e.target.value === 'destaques' ? null : e.target.value })}>
                  {sorts.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <ChevronDown />
              </label>
            </div>

            {activeCount > 0 && (
              <div className="active-filters">
                {busca && <button onClick={() => update({ busca: null })}>“{busca}” <X /></button>}
                {tipos.map(t => <button key={t} onClick={() => update({ tipo: tipos.filter(x => x !== t).map(typeKey) })}>{t} <X /></button>)}
                {maxPrice < priceCeil && <button onClick={() => update({ ate: null })}>Até R$ {maxPrice} <X /></button>}
                {onlyAvailable && <button onClick={() => update({ disponiveis: null })}>Disponíveis <X /></button>}
              </div>
            )}

            {result.length ? (
              <div className={`catalog-grid ${leaving ? 'is-leaving' : ''}`} key={`${categoria}-${sort}-${page}`}>
                {shown.map((product, index) => <ProductCard key={product.id} product={product} index={index % 3} sizes="(max-width: 900px) 46vw, (max-width: 1200px) 30vw, 300px" />)}
              </div>
            ) : (
              <div className="empty-state" data-reveal>
                <Heart />
                <h3>Nenhuma peça por aqui… ainda!</h3>
                <p>Tente tirar algum filtro ou fale com a gente: às vezes a peça que você procura está chegando. 🌊</p>
                <div>
                  <button className="button outline small" onClick={() => update({ categoria: null }, { keepFilters: false })}>Ver todos os produtos</button>
                  <a className="button whatsapp small" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Perguntar no WhatsApp</a>
                </div>
              </div>
            )}

            <Pagination page={page} total={totalPages} onChange={goToPage} />
          </section>
        </div>
      </div>

      <section className="service-band" aria-label="Como funciona">
        <div className="shell">
          <div data-reveal><Truck /><span><b>Enviamos para todo o Brasil</b>Frete combinado no WhatsApp</span></div>
          <div data-reveal style={{ '--i': 1 }}><WhatsApp /><span><b>Compra pelo WhatsApp</b>Atendimento pertinho de você</span></div>
          <div data-reveal style={{ '--i': 2 }}><Heart /><span><b>Escolhidas com carinho</b>Cada peça pensada para você</span></div>
          <Link to="/sobre#como-comprar" data-reveal style={{ '--i': 3 }}>Como comprar <ArrowRight /></Link>
        </div>
      </section>
    </div>
  )
}

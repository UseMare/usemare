import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Heart, SlidersHorizontal, Truck, X } from 'lucide-react'
import { collections, products, typeLabels } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { PageIntro, ProductCard, WhatsApp } from '../ui.jsx'
import { helloMessage, whatsappLink } from '../store.js'

// Textos do cabeçalho da página, conforme a categoria.
const banners = {
  'mare-move': { eyebrow: 'Maré Move', title: 'Seu movimento,\nsua melhor versão.', text: 'Conjuntos que unem conforto, segurança e aquele caimento que faz você se sentir linda para treinar.' },
  'moda-feminina': { eyebrow: 'Moda feminina', title: 'Leve, feminina\ne do seu jeito.', text: 'Peças escolhidas para trazer mais estilo para os seus dias — daquelas que você veste e se sente linda.' },
  blusas: { eyebrow: 'Blusas', title: 'O básico que não\ntem nada de básico.', text: 'Detalhes que fazem toda a diferença no look do dia a dia.' },
  'saias-calcas': { eyebrow: 'Saias & calças', title: 'Elegância que\nnasce do simples.', text: 'Modelagens que acompanham você do trabalho ao fim de semana.' },
  suplementos: { eyebrow: 'Suplementos', title: 'Seu momento de\ncuidado é na Maré.', text: 'Opções para complementar a sua rotina, escolhidas com o mesmo carinho das nossas peças.' },
  default: { eyebrow: 'Nossa coleção', title: 'Vista sua\nmelhor versão.', text: 'Moda feminina e Maré Move: peças leves, versáteis e escolhidas com carinho para cada momento.' },
}

const sorts = [
  { key: 'destaques', label: 'Destaques' },
  { key: 'menor-preco', label: 'Menor preço' },
  { key: 'maior-preco', label: 'Maior preço' },
  { key: 'a-z', label: 'Nome (A–Z)' },
]

// Opções dos filtros, calculadas a partir do catálogo atual.
const filterOptions = () => ({
  allTypes: [...new Set(products.map(p => typeLabels[p.type]))],
  allColors: [...new Map(products.filter(p => p.color).map(p => [p.color, p.swatch])).entries()],
  priceFloor: Math.floor(Math.min(...products.map(p => p.price)) / 10) * 10,
  priceCeil: Math.ceil(Math.max(...products.map(p => p.price)) / 10) * 10,
})

const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const listParam = (params, key) => (params.get(key) || '').split(',').filter(Boolean)

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`filter-group ${open ? 'open' : ''}`}>
      <button className="filter-title" onClick={() => setOpen(!open)} aria-expanded={open}>{title}<ChevronDown /></button>
      <div className="filter-body">{children}</div>
    </div>
  )
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { catalogVersion } = useShop()
  const { allTypes, allColors, priceFloor, priceCeil } = useMemo(filterOptions, [catalogVersion])

  const categoria = params.get('categoria') || 'todos'
  const busca = params.get('busca') || ''
  const tipos = listParam(params, 'tipo')
  const cores = listParam(params, 'cor')
  const maxPrice = Number(params.get('ate')) || priceCeil
  const onlyAvailable = params.get('disponiveis') === '1'
  const sort = params.get('ordem') || 'destaques'

  const collection = collections.find(c => c.key === categoria) || collections[0]
  const banner = banners[categoria] || banners.default
  usePageTitle(busca ? `Busca: ${busca}` : collection.key === 'todos' ? 'Produtos' : collection.label)

  // Atualiza um filtro na URL (assim o link filtrado pode ser compartilhado).
  const update = (changes, { keepFilters = true } = {}) => {
    const next = new URLSearchParams(keepFilters ? params : {})
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
      (!term || normalize(`${p.name} ${p.color || ''} ${(p.flavors || []).join(' ')} ${typeLabels[p.type]} ${p.category}`).includes(term)) &&
      (!tipos.length || tipos.includes(typeLabels[p.type])) &&
      (!cores.length || cores.includes(p.color)) &&
      p.price <= maxPrice &&
      (!onlyAvailable || p.available))
    const sorted = [...list]
    if (sort === 'menor-preco') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'maior-preco') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'a-z') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return sorted.sort((a, b) => Number(b.available) - Number(a.available))
  }, [collection, busca, tipos.join(), cores.join(), maxPrice, onlyAvailable, sort, catalogVersion])

  const activeCount = tipos.length + cores.length + (maxPrice < priceCeil ? 1 : 0) + (onlyAvailable ? 1 : 0) + (busca ? 1 : 0)

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
        script="com carinho"
        variant="fan"
        aside={(
          <ul className="intro-meta">
            <li><b>{products.filter(collection.test).length}</b> {products.filter(collection.test).length === 1 ? 'peça' : 'peças'}</li>
            <li><Truck /> Envio para todo o Brasil</li>
            <li><WhatsApp /> Compra pelo WhatsApp</li>
          </ul>
        )}
      />

      <div className="shell">
        <div className="chips" role="tablist" aria-label="Categorias">
          {collections.map((c, index) => (
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
                  <input type="checkbox" checked={tipos.includes(type)} onChange={() => toggleIn('tipo', tipos, type)} />
                  <span className="box"><Check /></span>{type}
                  <small>{products.filter(p => typeLabels[p.type] === type && collection.test(p)).length}</small>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Cor">
              <div className="swatches">
                {allColors.map(([color, swatch]) => (
                  <button key={color} className={`swatch ${cores.includes(color) ? 'active' : ''}`} onClick={() => toggleIn('cor', cores, color)} aria-pressed={cores.includes(color)} title={color}>
                    <i style={{ background: swatch }} /><span>{color}</span>
                  </button>
                ))}
              </div>
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
                {tipos.map(t => <button key={t} onClick={() => toggleIn('tipo', tipos, t)}>{t} <X /></button>)}
                {cores.map(c => <button key={c} onClick={() => toggleIn('cor', cores, c)}>{c} <X /></button>)}
                {maxPrice < priceCeil && <button onClick={() => update({ ate: null })}>Até R$ {maxPrice} <X /></button>}
                {onlyAvailable && <button onClick={() => update({ disponiveis: null })}>Disponíveis <X /></button>}
              </div>
            )}

            {result.length ? (
              <div className="catalog-grid" key={`${categoria}-${sort}`}>
                {result.map((product, index) => <ProductCard key={product.id} product={product} index={index % 3} sizes="(max-width: 900px) 46vw, (max-width: 1200px) 30vw, 300px" />)}
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

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { categories, products } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { HandHeart, ProductCard, SectionHeading, SmartLink, responsive } from '../ui.jsx'
import { store } from '../store.js'
import { savedContent } from '../content.js'
import { SiteIcon } from '../icons.jsx'

// Recortes do banner feitos para o celular (quadrados, em alta), por foto do computador.
// Várias larguras: o celular baixa só o tamanho que a tela precisa (600, 800 ou 1200px).
// O index.html pede esta mesma foto logo no início (preload) — se trocar aqui, troque lá também.
const MOBILE_HERO = {
  '/img/banners/hero.webp': '/img/banners/hero-mobile-600.webp 600w, /img/banners/hero-mobile-800.webp 800w, /img/banners/hero-mobile.webp 1200w',
}

// Cards de categoria: as fotos padrão têm também uma versão de 560px (no celular o card tem ~170px).
const CATEGORY_560 = new Set(['conjuntos-fitness', 'moda-feminina', 'blusas', 'saias-calcas'].map(n => `/img/banners/${n}.webp`))
const categorySrcSet = image => CATEGORY_560.has(image)
  ? `${image.replace(/\.webp$/, '-560.webp')} 560w, ${responsive(image, 800)}`
  : responsive(image, 800)

// Textos e imagens da página inicial. Este é o padrão; o painel (Página inicial) substitui
// campo a campo pelo que a dona salvar (tabela site_content, chave 'home').
// Nos textos, Enter (\n) vira quebra de linha. No texto de apoio do hero a quebra só vale no computador.
export const homeDefaults = {
  heroSlides: [
    { image: '/img/banners/hero.webp', alt: 'Duas amigas sorrindo com os conjuntos Maré Move lilás e amarelo' },
  ],
  heroEyebrow: 'Moda feminina • Fitness',
  heroTitle: 'Vista sua\nmelhor versão.',
  heroText: 'Peças que unem conforto, estilo e\nliberdade para o seu dia a dia.',
  heroButton: 'Conferir coleção',
  heroLink: '/produtos',
  heroBenefits: [
    { icon: 'leaf', text: 'Conforto\nem cada detalhe' },
    { icon: 'gem', text: 'Peças versáteis\npara o seu estilo' },
    { icon: 'truck', text: 'Enviamos para\ntodo o Brasil' },
  ],
  heroScript: 'Estilo\npara cada\nmomento',
  highlightsTitle: 'Nossos destaques',
  promos: [
    { image: '/img/banners/conforto.webp', title: 'Conforto\nque te acompanha', text: 'Peças pensadas para o seu dia a dia,\ndo treino ao casual.', button: 'Ver conjuntos', link: '/produtos?categoria=conjuntos' },
    { image: '/img/banners/mare-movimento.webp', title: 'Maré\né movimento', text: 'Moda feminina e fitness\npara todas as suas fases.', button: 'Conheça a Maré', link: '/sobre' },
  ],
  // {parcelas} = número de parcelas das Configurações da loja; {instagram} = link do Instagram da loja.
  services: [
    { icon: 'truck', top: 'Envio para', bold: 'todo o Brasil', link: '' },
    { icon: 'card', top: 'Parcele em até', bold: '{parcelas}x sem juros', link: '' },
    { icon: 'lock', top: 'Compra', bold: '100% segura', link: '' },
    { icon: 'instagram', top: 'Acompanhe', bold: 'no Instagram', link: '{instagram}' },
  ],
}

// Campos obrigatórios: vazio = texto padrão. Campos opcionais: se a dona apagou, o site não mostra.
const blank = v => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)
const OPTIONAL = ['heroEyebrow', 'heroText', 'heroButton', 'heroScript', 'heroBenefits']
const OPTIONAL_ITEM = ['text', 'button', 'link']
const pick = (key, saved, base, optional) => optional.includes(key)
  ? (saved === undefined || saved === null ? base : saved)
  : (blank(saved) ? base : saved)

// Banners e serviços: quantidade fixa, item a item com o padrão.
const withDefaults = (list, defaults) => defaults.map((base, i) => {
  const item = list?.[i] || {}
  return Object.fromEntries(Object.keys({ ...base, ...item }).map(k => [k, pick(k, item[k], base[k] ?? '', OPTIONAL_ITEM)]))
})

// O que o site mostra = padrão + o que foi salvo no painel (o painel usa o mesmo para montar o formulário).
export const mergeHome = (saved = {}) => {
  const c = { ...homeDefaults }
  Object.entries(saved || {}).forEach(([k, v]) => { c[k] = pick(k, v, homeDefaults[k], OPTIONAL) })
  const slides = (c.heroSlides || []).filter(s => s?.image)
  return {
    ...c,
    heroSlides: slides.length ? slides : homeDefaults.heroSlides,
    heroBenefits: (c.heroBenefits || []).filter(b => b?.text),
    promos: withDefaults(c.promos, homeDefaults.promos),
    services: withDefaults(c.services, homeDefaults.services),
  }
}

export const homeContent = () => mergeHome(savedContent('home'))

// Texto com Enter → linhas com <br />. `brClass` deixa a quebra só no computador.
export const Lines = ({ text, brClass }) => String(text || '').split('\n').map((line, i) => (
  <React.Fragment key={i}>{i > 0 && <br className={brClass} />}{i > 0 && brClass ? ' ' : ''}{line}</React.Fragment>
))

const fill = text => String(text || '').replace(/\{parcelas\}/g, store.installments)

// Cards de categoria: categorias marcadas "mostrar na página inicial" no painel, na ordem escolhida.
const homeCategories = () => categories
  .filter(c => c.active && c.home_card && c.home_image)
  .sort((a, b) => a.home_card_order - b.home_card_order)
  .map(c => ({ name: (c.home_title || c.name).split('\n'), image: c.home_image, tone: c.home_tone, to: `/produtos?categoria=${c.slug}` }))

function Hero({ content }) {
  const slides = content.heroSlides
  const [current, setCurrent] = useState(0)
  const multiple = slides.length > 1
  const go = step => setCurrent(index => (index + step + slides.length) % slides.length)
  const [first, ...rest] = String(content.heroScript || '').split('\n')

  useEffect(() => { if (current >= slides.length) setCurrent(0) }, [slides.length, current])
  useEffect(() => {
    if (!multiple) return
    const timer = setInterval(() => go(1), 7000)
    return () => clearInterval(timer)
  }, [multiple, current])

  return (
    <section className="hero" id="inicio">
      {slides.map((slide, index) => (
        // No celular a foto aparece quase quadrada e cortada: usa um recorte próprio em alta (MOBILE_HERO)
        // ou, se não houver, a versão grande da foto, para não ficar esticada e borrada.
        <picture key={slide.image}>
          <source media="(max-width: 600px)" srcSet={MOBILE_HERO[slide.image] || slide.image} sizes="100vw" />
          <img className={`hero-photo ${index === current ? 'active' : ''}`} src={slide.image} srcSet={responsive(slide.image, 1200)} sizes="100vw" alt={index === current ? (slide.alt || '') : ''} fetchPriority={index === 0 ? 'high' : 'auto'} />
        </picture>
      ))}
      <div className="hero-inner">
        <div className="hero-copy">
          {content.heroEyebrow && <p className="eyebrow">{content.heroEyebrow}</p>}
          <h1><Lines text={content.heroTitle} /></h1>
          {content.heroText && <h2><Lines text={content.heroText} brClass="desktop-break" /></h2>}
          {content.heroButton && <SmartLink className="button dark pulse" to={content.heroLink}>{content.heroButton} <ArrowRight /></SmartLink>}
          {content.heroBenefits.length > 0 && (
            <ul className="hero-benefits">
              {content.heroBenefits.map((benefit, i) => <li key={i}><SiteIcon name={benefit.icon} /> <span><Lines text={benefit.text} /></span></li>)}
            </ul>
          )}
        </div>
      </div>
      {first && (
        <p className="hero-script" aria-hidden="true">
          {first}{rest.map((line, i) => <React.Fragment key={i}><br /><span>{line}</span></React.Fragment>)}<HandHeart />
        </p>
      )}
      {multiple && <>
        <button className="slider-arrow left" onClick={() => go(-1)} aria-label="Slide anterior"><ChevronLeft /></button>
        <button className="slider-arrow right" onClick={() => go(1)} aria-label="Próximo slide"><ChevronRight /></button>
        <div className="hero-dots">
          {slides.map((slide, index) => <button key={slide.image} className={index === current ? 'active' : ''} onClick={() => setCurrent(index)} aria-label={`Ir para o slide ${index + 1}`} />)}
        </div>
      </>}
    </section>
  )
}

function Promo({ promo, className, reveal, index }) {
  return (
    <article className={`promo ${className}`} data-reveal={reveal} style={index ? { '--i': index } : undefined}>
      <img src={promo.image} srcSet={responsive(promo.image, 800)} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 36vw" alt="" loading="lazy" />
      <div>
        <h2><Lines text={promo.title} /></h2>
        {promo.text && <p><Lines text={promo.text} /></p>}
        {promo.button && <SmartLink className="button dark small" to={promo.link}>{promo.button} <ArrowRight /></SmartLink>}
      </div>
    </article>
  )
}

export default function Home() {
  usePageTitle(null)
  useShop() // redesenha quando o catálogo do Supabase chega
  const content = homeContent()
  // Prévia na página inicial: as 4 primeiras peças da lista (indisponíveis aparecem com o selo). O catálogo completo fica em /produtos.
  const highlights = products.slice(0, 4)
  const [comfort, movement] = content.promos

  return (
    <>
      <Hero content={content} />

      <section className="categories" aria-label="Categorias">
        {homeCategories().map((category, index) => (
          <Link to={category.to} className={`category ${category.tone}`} key={category.to} data-reveal="zoom" style={{ '--i': index }}>
            <img src={category.image} srcSet={categorySrcSet(category.image)} sizes="(max-width: 600px) 46vw, (max-width: 1100px) 50vw, 25vw" alt="" loading="lazy" />
            <div>
              <h3>{category.name.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}</h3>
              <span className="pill">Ver produtos <ArrowRight /></span>
            </div>
          </Link>
        ))}
      </section>

      <section className="highlights" id="destaques" aria-labelledby="highlights-title">
        <div className="shell">
          <SectionHeading id="highlights-title" title={content.highlightsTitle} to="/produtos" />
          <div className="highlight-grid">
            {highlights.map((product, index) => <ProductCard key={product.id} product={product} index={index} sizes="(max-width: 900px) 46vw, 300px" />)}
          </div>
          <div className="highlights-more" data-reveal>
            <Link className="button outline" to="/produtos">Ver todos os produtos <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="promo-row" aria-label="Seleções Maré">
        <Promo promo={comfort} className="comfort" reveal="left" />
        <ul className="promo services" data-reveal style={{ '--i': 1 }}>
          {content.services.map((service, i) => {
            const inner = <><SiteIcon name={service.icon} /><span>{fill(service.top)}<br /><b>{fill(service.bold)}</b></span></>
            return <li key={i}>{service.link ? <SmartLink to={service.link}>{inner}</SmartLink> : inner}</li>
          })}
        </ul>
        <Promo promo={movement} className="movement" reveal="right" index={2} />
      </section>
    </>
  )
}

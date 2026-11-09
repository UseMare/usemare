import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, CreditCard, Gem, Leaf, LockKeyhole, Truck } from 'lucide-react'
import { products } from '../products.js'
import { usePageTitle } from '../shop.jsx'
import { HandHeart, Instagram, ProductCard, SectionHeading, responsive } from '../ui.jsx'
import { store } from '../store.js'

// Para adicionar novos slides no hero, basta incluir itens aqui — setas e bolinhas aparecem sozinhas.
const heroSlides = [
  { image: '/img/banners/hero.webp', alt: 'Duas amigas sorrindo com os conjuntos Maré Move lilás e amarelo' },
]

const categories = [
  { name: ['Conjuntos', 'Fitness'], image: '/img/banners/conjuntos-fitness.webp', tone: 'light', to: '/produtos?categoria=mare-move' },
  { name: ['Moda', 'Feminina'], image: '/img/banners/moda-feminina.webp', tone: 'light', to: '/produtos?categoria=moda-feminina' },
  { name: ['Blusas'], image: '/img/banners/blusas.webp', tone: 'dark', to: '/produtos?categoria=blusas' },
  { name: ['Saias &', 'Calças'], image: '/img/banners/saias-calcas.webp', tone: 'dark', to: '/produtos?categoria=saias-calcas' },
]

function Hero() {
  const [current, setCurrent] = useState(0)
  const multiple = heroSlides.length > 1
  const go = step => setCurrent(index => (index + step + heroSlides.length) % heroSlides.length)

  useEffect(() => {
    if (!multiple) return
    const timer = setInterval(() => go(1), 7000)
    return () => clearInterval(timer)
  }, [multiple, current])

  return (
    <section className="hero" id="inicio">
      {heroSlides.map((slide, index) => (
        <img key={slide.image} className={index === current ? 'active' : ''} src={slide.image} srcSet={responsive(slide.image, 1200)} sizes="100vw" alt={index === current ? slide.alt : ''} fetchPriority={index === 0 ? 'high' : 'auto'} />
      ))}
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">Moda feminina • Fitness</p>
          <h1>Vista sua<br />melhor versão.</h1>
          <h2>Peças que unem conforto, estilo e<br className="desktop-break" /> liberdade para o seu dia a dia.</h2>
          <Link className="button dark pulse" to="/produtos">Conferir coleção <ArrowRight /></Link>
          <ul className="hero-benefits">
            <li><Leaf /> <span>Conforto<br />em cada detalhe</span></li>
            <li><Gem /> <span>Peças versáteis<br />para o seu estilo</span></li>
            <li><Truck /> <span>Enviamos para<br />todo o Brasil</span></li>
          </ul>
        </div>
      </div>
      <p className="hero-script" aria-hidden="true">Estilo<br /><span>para cada</span><br /><span>momento</span><HandHeart /></p>
      {multiple && <>
        <button className="slider-arrow left" onClick={() => go(-1)} aria-label="Slide anterior"><ChevronLeft /></button>
        <button className="slider-arrow right" onClick={() => go(1)} aria-label="Próximo slide"><ChevronRight /></button>
        <div className="hero-dots">
          {heroSlides.map((slide, index) => <button key={slide.image} className={index === current ? 'active' : ''} onClick={() => setCurrent(index)} aria-label={`Ir para o slide ${index + 1}`} />)}
        </div>
      </>}
    </section>
  )
}

export default function Home() {
  usePageTitle(null)
  // Prévia na página inicial: só as 4 primeiras peças disponíveis. O catálogo completo fica em /produtos.
  const highlights = products.filter(product => product.available).slice(0, 4)

  return (
    <>
      <Hero />

      <section className="categories" aria-label="Categorias">
        {categories.map((category, index) => (
          <Link to={category.to} className={`category ${category.tone}`} key={category.to} data-reveal="zoom" style={{ '--i': index }}>
            <img src={category.image} srcSet={responsive(category.image, 800)} sizes="(max-width: 1100px) 50vw, 25vw" alt="" loading="lazy" />
            <div>
              <h3>{category.name.map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h3>
              <span className="pill">Ver produtos <ArrowRight /></span>
            </div>
          </Link>
        ))}
      </section>

      <section className="highlights" id="destaques" aria-labelledby="highlights-title">
        <div className="shell">
          <SectionHeading id="highlights-title" title="Nossos destaques" to="/produtos" />
          <div className="highlight-grid">
            {highlights.map((product, index) => <ProductCard key={product.id} product={product} index={index} sizes="(max-width: 900px) 46vw, 300px" />)}
          </div>
          <div className="highlights-more" data-reveal>
            <Link className="button outline" to="/produtos">Ver todos os produtos <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="promo-row" aria-label="Seleções Maré">
        <article className="promo comfort" data-reveal="left">
          <img src="/img/banners/conforto.webp" srcSet={responsive('/img/banners/conforto.webp', 800)} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 36vw" alt="" loading="lazy" />
          <div>
            <h2>Conforto<br />que te acompanha</h2>
            <p>Peças pensadas para o seu dia a dia,<br />do treino ao casual.</p>
            <Link className="button dark small" to="/produtos?categoria=conjuntos">Ver conjuntos <ArrowRight /></Link>
          </div>
        </article>
        <ul className="promo services" data-reveal style={{ '--i': 1 }}>
          <li><Truck /><span>Envio para<br /><b>todo o Brasil</b></span></li>
          <li><CreditCard /><span>Parcele em até<br /><b>6x sem juros</b></span></li>
          <li><LockKeyhole /><span>Compra<br /><b>100% segura</b></span></li>
          <li><a href={store.instagram} target="_blank" rel="noreferrer"><Instagram /><span>Acompanhe<br /><b>no Instagram</b></span></a></li>
        </ul>
        <article className="promo movement" data-reveal="right" style={{ '--i': 2 }}>
          <img src="/img/banners/mare-movimento.webp" srcSet={responsive('/img/banners/mare-movimento.webp', 800)} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 36vw" alt="" loading="lazy" />
          <div>
            <h2>Maré<br />é movimento</h2>
            <p>Moda feminina e fitness<br />para todas as suas fases.</p>
            <Link className="button dark small" to="/sobre">Conheça a Maré <ArrowRight /></Link>
          </div>
        </article>
      </section>
    </>
  )
}

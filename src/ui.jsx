import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react'
import { useShop } from './shop.jsx'

// Imagens otimizadas em /public/img. Cada banner tem duas versões (leve e grande); o navegador escolhe a ideal.
export const logo = '/img/logo/mare.webp'
export const responsive = (image, small) =>
  `${image.replace(/\.webp$/, `-${small}.webp`)} ${small}w, ${image} ${small === 1200 ? 2245 : 1525}w`

export function Instagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
    </svg>
  )
}

export function WhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  )
}

// Coraçãozinho desenhado à mão que acompanha a frase manuscrita.
export function HandHeart({ className = 'hand-heart' }) {
  return (
    <svg className={className} viewBox="0 0 40 36" aria-hidden="true">
      <path d="M20 33C14 27 4 21 4.5 12.5 5 6.5 11 3.5 15.5 6.5 18 8.2 19.4 10.8 20 12.6 21 9.6 23.4 6 27.6 5 33.4 3.8 37 8.8 35.4 14.6 33.6 21 25.6 26.6 19.4 34.2" />
    </svg>
  )
}

export function Brand({ onClick }) {
  return <Link to="/" className="brand" aria-label="Maré, página inicial" onClick={onClick}><img src={logo} alt="Maré — Moda feminina e fitness" /></Link>
}

export function Price({ product, className = '' }) {
  return (
    <span className={`price ${className}`}>
      {product.oldPriceLabel && <s>{product.oldPriceLabel}</s>}
      <strong className={product.available ? '' : 'struck'}>{product.priceLabel}</strong>
    </span>
  )
}

const defaultSizes = '(max-width: 900px) 42vw, (max-width: 1100px) 24vw, 210px'

export function ProductCard({ product, index = 0, sizes = defaultSizes }) {
  const { liked, toggleLike, addToBag } = useShop()
  const isLiked = liked.includes(product.id)
  const url = `/produto/${product.slug}`
  return (
    <article className={`product ${product.available ? '' : 'sold-out'}`} data-reveal style={{ '--i': index % 6 }}>
      <div className="product-image">
        <Link className="product-open" to={url} aria-label={`Ver detalhes de ${product.name}`}>
          <img src={product.thumbs[0]} srcSet={`${product.thumbs[0]} 480w, ${product.photos[0]} 1000w`} sizes={sizes} alt={product.name} loading="lazy" />
          {product.photos[1] && <img className="alt" src={product.thumbs[1]} srcSet={`${product.thumbs[1]} 480w, ${product.photos[1]} 1000w`} sizes={sizes} alt="" loading="lazy" />}
        </Link>
        {product.oldPrice && product.available && <span className="badge-tag">Promo</span>}
        <button className={`like ${isLiked ? 'liked' : ''}`} onClick={() => toggleLike(product.id)} aria-label={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}><Heart fill={isLiked ? 'currentColor' : 'none'} /></button>
        {product.available
          ? <button className="add" onClick={() => addToBag(product)} aria-label={`Adicionar ${product.name} à sacola`}><ShoppingBag /></button>
          : <span className="badge-soldout">Esgotado</span>}
      </div>
      <h3><Link to={url}>{product.name}</Link></h3>
      <Price product={product} />
      <small>{product.installments} sem juros</small>
    </article>
  )
}

export function SectionHeading({ title, to, linkLabel = 'Ver todos', id }) {
  return (
    <div className="section-heading" data-reveal>
      <h2 id={id}>{title}</h2>
      <span aria-hidden="true" />
      {to && <Link to={to}>{linkLabel} <ArrowRight /></Link>}
    </div>
  )
}

// Cabeçalho editorial das páginas internas (sem banner): texto à esquerda e, se houver `images`,
// um mosaico de fotos flutuando à direita (mesmo estilo do topo do "Sobre nós").
// variant: 'stack' (fotos sobrepostas) · 'fan' (leque de cartas) · 'polaroid' (fotos tortas + selo girando)
export function PageIntro({ crumbs = [], eyebrow, title, text, aside, images = [], script = 'maré', variant = 'stack' }) {
  const lines = String(title).split(/\n/)
  return (
    <section className={`page-intro ${images.length ? 'with-images' : ''}`}>
      <div className="shell page-intro-inner">
        <div className="page-intro-copy">
          <nav className="breadcrumb" aria-label="Você está em">
            <Link to="/">Início</Link>
            {crumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                <span>/</span>
                {crumb.to && i < crumbs.length - 1 ? <Link to={crumb.to}>{crumb.label}</Link> : <b>{crumb.label}</b>}
              </React.Fragment>
            ))}
          </nav>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{lines.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{i === lines.length - 1 && lines.length > 1 ? <em>{line}</em> : line}</React.Fragment>)}</h1>
          {text && <p className="page-intro-text">{text}</p>}
          {aside}
        </div>
        {images.length > 0 && (
          <div className={`intro-mosaic ${variant} count-${Math.min(images.length, 3)}`} aria-hidden="true">
            {images.slice(0, 3).map((src, i) => <img key={src} src={src} alt="" className={`m${i + 1}`} />)}
            {variant === 'polaroid' && (
              <div className="promo-seal">
                <svg viewBox="0 0 120 120">
                  <defs><path id="seal-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
                  <text><textPath href="#seal-path" textLength="286" lengthAdjust="spacing">ofertas • maré • com carinho •</textPath></text>
                </svg>
                <span>%</span>
              </div>
            )}
            {script && <p className="mosaic-script">{script}<HandHeart className="hand-heart small" /></p>}
          </div>
        )}
      </div>
    </section>
  )
}

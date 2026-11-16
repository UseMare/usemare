import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, Tag } from 'lucide-react'
import { products } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { Instagram, PageIntro, ProductCard, SectionHeading, WhatsApp } from '../ui.jsx'
import { store, whatsappLink } from '../store.js'
import { pageContent } from '../content.js'

// Promoções: qualquer peça com `oldPrice` no catálogo aparece aqui automaticamente.
const promoMessage = 'Oi, Maré! 🌊 Quero ficar sabendo das próximas promoções. Pode me avisar? 🤎'

// Textos e fotos da página (painel → Textos das páginas → Promoções). No título, a última linha fica em itálico.
export const promotionsDefaults = {
  eyebrow: 'Promoções Maré',
  title: 'Seu look favorito,\ncom carinho a mais.',
  text: 'Ofertas especiais em peças selecionadas — enquanto durarem os estoques. As novidades aparecem primeiro no nosso Instagram e no WhatsApp. 🌊',
  images: [{ image: '/img/produtos/05-01.webp' }, { image: '/img/produtos/09-01.webp' }, { image: '/img/produtos/03-01.webp' }],
  emptyTitle: 'Promoções chegando por aí… 🌊',
  emptyText: 'No momento não temos peças em promoção, mas as ofertas aparecem primeiro para quem acompanha a Maré de pertinho.',
  suggestionsTitle: 'Enquanto isso, você vai amar',
}

export default function Promotions() {
  usePageTitle('Promoções')
  useShop() // redesenha quando o catálogo do Supabase chega
  const c = pageContent('promotions', promotionsDefaults)
  const onSale = products.filter(p => p.oldPrice && p.available)
  const suggestions = products.filter(p => p.available).slice(0, 4)

  return (
    <div className="promo-page">
      <PageIntro
        crumbs={[{ label: 'Promoções' }]}
        eyebrow={c.eyebrow}
        title={c.title}
        text={c.text}
        images={(c.images || []).map(i => i?.image).filter(Boolean)}
        script={null}
        variant="polaroid"
      />

      <div className="shell">
        {onSale.length ? (
          <section className="promo-list">
            <SectionHeading title={`${onSale.length} ${onSale.length === 1 ? 'peça em promoção' : 'peças em promoção'}`} />
            <div className="catalog-grid">
              {onSale.map((p, i) => <ProductCard key={p.id} product={p} index={i % 3} sizes="(max-width: 900px) 46vw, 300px" />)}
            </div>
          </section>
        ) : (
          <section className="promo-soon" data-reveal>
            <div className="promo-soon-icon"><Tag /><span /></div>
            <h2>{c.emptyTitle}</h2>
            {c.emptyText && <p>{c.emptyText}</p>}
            <div className="promo-soon-actions">
              <a className="button whatsapp" href={whatsappLink(promoMessage)} target="_blank" rel="noreferrer"><BellRing /> Quero ser avisada</a>
              <a className="button outline" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> Seguir no Instagram</a>
            </div>
          </section>
        )}

        <section className="related">
          <SectionHeading title={c.suggestionsTitle} to="/produtos" />
          <div className="related-grid">
            {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} sizes="(max-width: 900px) 46vw, 300px" />)}
          </div>
        </section>
      </div>
    </div>
  )
}

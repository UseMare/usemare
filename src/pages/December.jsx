import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Gift } from 'lucide-react'
import { categoryBySlug, products } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { PageIntro, ProductCard, WhatsApp } from '../ui.jsx'
import { whatsappLink } from '../store.js'

// Coleção Dezembro (/colecao-dezembro): mostra as peças da categoria "colecao-dezembro".
// Textos do topo = os da categoria (painel → Categorias → Coleção Dezembro); as peças entram e
// saem da coleção marcando a categoria no produto. Detalhes de Natal bem discretos (estrelinhas
// douradas, "Boas festas" em letra cursiva, selo e um filete dourado).

export const DECEMBER_SLUG = 'colecao-dezembro'
const defaults = {
  name: 'Coleção Dezembro',
  banner_eyebrow: 'Edição de fim de ano',
  banner_title: 'Coleção\nDezembro.',
  banner_text: 'Peças escolhidas para brilhar nas festas: ceia de Natal, confraternizações e a virada do ano.',
}
const giftMessage = 'Oi, Maré! 🎁 Quero presentear alguém com uma peça da Coleção Dezembro. Pode me ajudar?'

export default function December() {
  useShop() // redesenha quando o catálogo do Supabase chega
  const category = { ...defaults, ...Object.fromEntries(Object.entries(categoryBySlug(DECEMBER_SLUG) || {}).filter(([, v]) => v)) }
  usePageTitle(category.name)
  const items = products.filter(p => p.categorySlugs.includes(DECEMBER_SLUG))
  const photos = items.map(p => p.photos[0]).filter(Boolean)

  return (
    <div className="xmas-page">
      <PageIntro
        className="is-xmas"
        crumbs={[{ label: category.name }]}
        eyebrow={category.banner_eyebrow}
        title={category.banner_title}
        text={category.banner_text}
        images={photos.slice(0, 3)}
        script="Boas festas"
        variant="polaroid"
        seal={{ text: 'boas festas • maré • dezembro •', mark: '✦' }}
      />

      <div className="shell">
        <section className="xmas-list">
          <div className="xmas-divider" aria-hidden="true"><span /><i>✦</i><span /></div>
          <h2 className="xmas-heading">{items.length ? `${items.length} ${items.length === 1 ? 'peça escolhida' : 'peças escolhidas'} para as festas` : 'A coleção está chegando…'}</h2>
          {items.length > 0 ? (
            <div className="catalog-grid xmas-grid">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i % 4} sizes="(max-width: 900px) 46vw, 300px" />)}
            </div>
          ) : (
            <p className="xmas-empty">Em breve, novidades especiais para dezembro. Enquanto isso, <Link to="/produtos">veja todas as peças</Link>.</p>
          )}
        </section>

        <section className="xmas-gift" data-reveal>
          <span className="xmas-gift-icon"><Gift /></span>
          <div>
            <h2>Vai presentear alguém?</h2>
            <p>Conta pra gente no WhatsApp: ajudamos a escolher o tamanho e preparamos tudo com carinho. 🤎</p>
          </div>
          <div className="xmas-gift-actions">
            <a className="button whatsapp" href={whatsappLink(giftMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Falar com a Maré</a>
            <Link className="button outline" to="/produtos">Ver todas as peças <ArrowRight /></Link>
          </div>
        </section>
      </div>
    </div>
  )
}

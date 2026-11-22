import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Gift } from 'lucide-react'
import { categoryBySlug, products } from '../products.js'
import { usePageTitle, useShop } from '../shop.jsx'
import { PageIntro, ProductCard, WhatsApp } from '../ui.jsx'
import { whatsappLink } from '../store.js'
import { pageContent } from '../content.js'

// Página da coleção (/colecao): tudo vem do painel → Coleção (site_content 'collection'):
// nome (também é o nome no menu), textos do topo, peças escolhidas e a ordem delas, enfeites
// dourados opcionais e o quadro do final. Serve para qualquer coleção: do mês, de estação etc.

export const COLLECTION_PATH = '/colecao'
const LEGACY_CATEGORY = 'colecao-dezembro' // antes do painel: as peças vinham desta categoria

export const collectionDefaults = {
  name: 'Coleção Dezembro',
  eyebrow: 'Edição de fim de ano',
  title: 'Coleção\nDezembro.',
  text: 'Peças escolhidas para brilhar nas festas: ceia de Natal, confraternizações e a virada do ano.',
  script: 'Boas festas',
  seal: 'boas festas • maré • dezembro •',
  festive: true,
  listSuffix: 'para as festas',
  emptyText: 'Em breve, novidades especiais.',
  giftShow: true,
  giftTitle: 'Vai presentear alguém?',
  giftText: 'Conta pra gente no WhatsApp: ajudamos a escolher o tamanho e preparamos tudo com carinho. 🤎',
  giftMessage: 'Oi, Maré! 🎁 Quero presentear alguém com uma peça da coleção. Pode me ajudar?',
  productIds: null, // null = nunca salvo no painel (usa a categoria antiga)
}

export const getCollection = () => {
  const c = pageContent('collection', collectionDefaults)
  return { ...c, name: String(c.name || '').trim() || collectionDefaults.name }
}

// Peças da coleção, na ordem escolhida no painel (ocultas não estão no catálogo e ficam de fora).
export const collectionProducts = c => Array.isArray(c.productIds)
  ? c.productIds.map(uuid => products.find(p => p.uuid === uuid)).filter(Boolean)
  : products.filter(p => p.categorySlugs.includes(LEGACY_CATEGORY))

export default function Collection() {
  useShop() // redesenha quando o catálogo do Supabase chega
  const c = getCollection()
  usePageTitle(c.name)
  const items = collectionProducts(c)
  const photos = items.map(p => p.photos[0]).filter(Boolean)
  const legacy = categoryBySlug(LEGACY_CATEGORY) // textos antigos da categoria, se o painel ainda não salvou nada
  const fromLegacy = !Array.isArray(c.productIds) && legacy
  const eyebrow = fromLegacy ? legacy.banner_eyebrow || c.eyebrow : c.eyebrow
  const title = fromLegacy ? legacy.banner_title || c.title : c.title
  const text = fromLegacy ? legacy.banner_text || c.text : c.text
  const seal = String(c.seal || '').trim()

  return (
    <div className={`xmas-page ${c.festive ? 'is-festive' : ''}`}>
      <PageIntro
        className={c.festive ? 'is-xmas' : ''}
        crumbs={[{ label: c.name }]}
        eyebrow={eyebrow}
        title={title || c.name}
        text={text}
        images={photos.slice(0, 3)}
        script={c.script || ''}
        variant="polaroid"
        seal={{ text: seal ? `${seal.replace(/\s*•\s*$/, '')} •` : 'maré • coleção •', mark: '✦' }}
      />

      <div className="shell">
        <section className="xmas-list">
          {c.festive && <div className="xmas-divider" aria-hidden="true"><span /><i>✦</i><span /></div>}
          <h2 className="xmas-heading">{items.length
            ? `${items.length} ${items.length === 1 ? 'peça escolhida' : 'peças escolhidas'}${c.listSuffix ? ` ${c.listSuffix}` : ''}`
            : 'A coleção está chegando…'}</h2>
          {items.length > 0 ? (
            <div className="catalog-grid xmas-grid">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i % 4} sizes="(max-width: 900px) 44vw, 300px" />)}
            </div>
          ) : (
            <p className="xmas-empty">{c.emptyText} Enquanto isso, <Link to="/produtos">veja todas as peças</Link>.</p>
          )}
        </section>

        {c.giftShow && (c.giftTitle || c.giftText) && (
          <section className="xmas-gift" data-reveal>
            <span className="xmas-gift-icon"><Gift /></span>
            <div>
              {c.giftTitle && <h2>{c.giftTitle}</h2>}
              {c.giftText && <p>{c.giftText}</p>}
            </div>
            <div className="xmas-gift-actions">
              <a className="button whatsapp" href={whatsappLink(c.giftMessage || collectionDefaults.giftMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Falar com a Maré</a>
              <Link className="button outline" to="/produtos">Ver todas as peças <ArrowRight /></Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

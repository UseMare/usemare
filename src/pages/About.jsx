import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, UserPlus } from 'lucide-react'
import { usePageTitle, useShop } from '../shop.jsx'
import { HandHeart, Instagram, WhatsApp, responsive } from '../ui.jsx'
import { helloMessage, store, whatsappLink } from '../store.js'
import { pageContent } from '../content.js'
import { SiteIcon } from '../icons.jsx'
import { Lines } from './Home.jsx'

// Textos baseados no que a própria Maré publica no Instagram (@uusemaree.br).
// Padrão do código; o painel (Textos das páginas → Sobre nós / Como comprar) substitui o que for salvo.
// Nos textos, Enter (\n) vira quebra de linha. No título, a última linha fica em itálico.
export const aboutDefaults = {
  heroEyebrow: 'Nossa história',
  heroTitle: 'Vista sua\nmelhor versão.',
  heroText: 'A Maré nasceu para vestir mulheres que vivem cada fase com leveza, força e personalidade. Moda feminina e fitness, escolhida com carinho para acompanhar todos os seus movimentos.',
  mosaic: [{ image: '/img/produtos/04-01.webp' }, { image: '/img/produtos/02-01.webp' }, { image: '/img/produtos/08-01.webp' }],
  mosaicScript: 'feito com\namor',
  quote: 'O que começou como um sonho no coração, Deus tem permitido viver de verdade.',
  story: [
    { text: 'Cada pedido, cada mensagem, cada cliente que escolhe a Maré carrega um pedacinho desse sonho. Por isso, vocês não são apenas clientes: são parte da história que a gente escreve todos os dias. 🌊🤎' },
    { text: 'A Maré mudou — e uma nova fase começou. Leve, feminina e feita para acompanhar você em cada versão: uma seleção de peças escolhidas para trazer mais estilo para os seus dias, daquelas que você veste e simplesmente se sente linda.' },
  ],
  signature: 'Seja sempre sua melhor escolha.',
  signatureName: 'Maré.',
  values: [
    { icon: 'gem', title: 'Elegância', text: 'Peças que valorizam quem você é, sem esforço — do treino ao jantar.' },
    { icon: 'sparkles', title: 'Personalidade', text: 'Detalhes que fazem toda a diferença: aquela peça que você olha e pensa “preciso dessa!”.' },
    { icon: 'handshake', title: 'Propósito', text: 'Cada pedido carrega um pedacinho do sonho que a Maré vive todos os dias.' },
  ],
  lines: [
    { image: '/img/banners/moda-feminina.webp', eyebrow: 'Moda feminina', title: 'Leve, feminina e\ndo seu jeito.', button: 'Ver coleção', link: '/produtos?categoria=moda-feminina' },
    { image: '/img/banners/conjuntos-fitness.webp', eyebrow: 'Maré Move', title: 'Seu movimento,\nsua melhor versão.', button: 'Ver conjuntos', link: '/produtos?categoria=mare-move' },
  ],
  verse: 'Reveste-se de força e dignidade;\nsorri diante do futuro.',
  verseRef: 'Provérbios 31:25',
  communityEyebrow: 'Vocês fazem parte de tudo isso',
  communityTitle: 'Ela vestiu Maré\ne entregou tudo. ✨',
  communityText: 'Acompanhe as novidades, os bastidores e as nossas clientes lindas no Instagram. Vestiu Maré? Marca a gente — você pode ser a próxima cliente do mês! 🤎',
  // Cartão no estilo do perfil do Instagram: os números são um retrato do perfil.
  igStats: [{ value: '23', label: 'posts' }, { value: '328', label: 'seguidores' }, { value: '107', label: 'seguindo' }],
  igName: 'MARÉ | Moda feminina • Fitness',
  igBio: [{ text: '☀️ Vista sua melhor versão.' }, { text: '📦 Enviamos para todo o Brasil' }, { text: '💌 Pedidos pelo Direct ou WhatsApp' }],
}

export const howtoDefaults = {
  eyebrow: 'Simples, leve e do seu jeito',
  title: 'Como comprar na Maré',
  steps: [
    { icon: 'bag', title: 'Escolha suas peças', text: 'Navegue pela coleção, veja todas as fotos e junte suas favoritas na sacola.' },
    { icon: 'chat', title: 'Chame no WhatsApp', text: 'Sua lista vai pronta para a nossa conversa. Lá combinamos tamanho, pagamento e entrega.' },
    { icon: 'package', title: 'Receba em casa', text: 'Enviamos para todo o Brasil, com todo o carinho em cada embalagem.' },
  ],
}

// Destaques do perfil (fotos fixas do Instagram).
const igHighlights = [
  ['Fit ☀️', '/img/produtos/01-01-480.webp'],
  ['Cliente do mês', '/img/produtos/08-01-480.webp'],
  ['Life ✨', '/img/produtos/13-01-480.webp'],
  ['Elas usam ✨', '/img/produtos/04-01-480.webp'],
  ['🎁', '/img/logo/perfil.webp'],
]

// Título com a última linha em itálico (quando tem mais de uma linha).
function ItalicLast({ text }) {
  const lines = String(text || '').split('\n')
  return lines.map((line, i) => (
    <React.Fragment key={i}>{i > 0 && <br />}{i === lines.length - 1 && lines.length > 1 ? <em>{line}</em> : line}</React.Fragment>
  ))
}

export default function About() {
  usePageTitle('Sobre nós')
  useShop() // redesenha quando as configurações (Instagram/WhatsApp) e os textos chegam
  const c = pageContent('about', aboutDefaults)
  const how = pageContent('howto', howtoDefaults)
  const mosaic = (c.mosaic || []).filter(m => m?.image).slice(0, 3)
  const story = (c.story || []).filter(p => p?.text)

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="shell about-hero-inner">
          <div className="about-hero-copy">
            <nav className="breadcrumb" aria-label="Você está em"><Link to="/">Início</Link><span>/</span><b>Sobre nós</b></nav>
            {c.heroEyebrow && <p className="eyebrow">{c.heroEyebrow}</p>}
            <h1><ItalicLast text={c.heroTitle} /></h1>
            {c.heroText && <p><Lines text={c.heroText} /></p>}
            <div className="about-hero-actions">
              <Link className="button dark" to="/produtos">Conhecer a coleção <ArrowRight /></Link>
              <a className="button outline" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> {store.instagramHandle}</a>
            </div>
          </div>
          <div className="about-mosaic" aria-hidden="true">
            {mosaic.map((m, i) => <img key={`${m.image}-${i}`} src={m.image} alt="" className={`m${i + 1}`} />)}
            {c.mosaicScript && <p className="mosaic-script"><Lines text={c.mosaicScript} /><HandHeart className="hand-heart small" /></p>}
          </div>
        </div>
      </section>

      <section className="story shell">
        {c.quote && (
          <div className="story-quote" data-reveal>
            <span className="quote-mark">“</span>
            <blockquote>{c.quote}</blockquote>
          </div>
        )}
        <div className="story-text">
          {story.map((p, i) => <p key={i} data-reveal style={i ? { '--i': i } : undefined}><Lines text={p.text} /></p>)}
          {c.signature && <p className="signature" data-reveal style={{ '--i': story.length }}>{c.signature} {c.signatureName && <span>{c.signatureName}</span>}</p>}
        </div>
      </section>

      {c.values?.length > 0 && (
        <section className="values shell" aria-label="O que nos move">
          {c.values.map((v, i) => (
            <article key={i} data-reveal style={{ '--i': i }}>
              <SiteIcon name={v.icon} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </section>
      )}

      <section className="lines shell" aria-label="Nossas linhas">
        {(c.lines || []).map((line, i) => (
          <Link key={i} to={line.link || '/produtos'} className="line-card" data-reveal={i % 2 ? 'right' : 'left'}>
            <img src={line.image} srcSet={responsive(line.image, 800)} sizes="(max-width: 900px) 100vw, 50vw" alt="" loading="lazy" />
            <div>
              {line.eyebrow && <p className="eyebrow">{line.eyebrow}</p>}
              <h2><Lines text={line.title} /></h2>
              {line.button && <span className="pill">{line.button} <ArrowRight /></span>}
            </div>
          </Link>
        ))}
      </section>

      {c.verse && (
        <section className="verse" aria-label="Versículo">
          <div className="shell" data-reveal>
            <p className="verse-script"><Lines text={c.verse} /></p>
            {c.verseRef && <span>{c.verseRef}</span>}
          </div>
        </section>
      )}

      <section className="how shell" id="como-comprar" aria-labelledby="how-title">
        <div className="editorial-heading" data-reveal>
          {how.eyebrow && <p className="eyebrow">{how.eyebrow}</p>}
          <h2 id="how-title">{how.title}</h2>
        </div>
        <ol className="how-steps">
          {(how.steps || []).map((step, i) => (
            <li key={i} data-reveal style={{ '--i': i }}>
              <span className="how-number">0{i + 1}</span>
              <SiteIcon name={step.icon} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="how-cta" data-reveal>
          <a className="button whatsapp" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> Falar com a Maré</a>
          <Link className="button outline" to="/produtos">Escolher minhas peças <ArrowRight /></Link>
        </div>
      </section>

      <section className="community">
        <div className="shell community-inner">
          <div className="community-copy" data-reveal="left">
            {c.communityEyebrow && <p className="eyebrow">{c.communityEyebrow}</p>}
            <h2><Lines text={c.communityTitle} /></h2>
            {c.communityText && <p><Lines text={c.communityText} /></p>}
            <a className="button dark" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> Seguir {store.instagramHandle}</a>
          </div>
          <div className="ig-profile" data-reveal="right">
            <div className="ig-head">
              <a className="ig-avatar" href={store.instagram} target="_blank" rel="noreferrer" aria-label="Perfil da Maré no Instagram"><img src="/img/logo/perfil.webp" alt="" /></a>
              <div className="ig-info">
                <div className="ig-name"><b>{store.instagramHandle.replace('@', '')}</b><span>•••</span></div>
                <ul className="ig-stats">
                  {(c.igStats || []).map((s, i) => <li key={i}><b>{s.value}</b> {s.label}</li>)}
                </ul>
                <div className="ig-bio">
                  {c.igName && <p><b>{c.igName}</b></p>}
                  {(c.igBio || []).filter(l => l?.text).map((line, i) => <p key={i}>{line.text}</p>)}
                </div>
              </div>
            </div>
            <div className="ig-actions">
              <a href={store.instagram} target="_blank" rel="noreferrer" className="ig-follow">Seguir</a>
              <a href={`https://ig.me/m/${store.instagramHandle.replace('@', '')}`} target="_blank" rel="noreferrer">Enviar mensagem</a>
              <a href={store.instagram} target="_blank" rel="noreferrer" className="ig-icon" aria-label="Abrir perfil"><UserPlus /></a>
            </div>
            <ul className="ig-highlights">
              {igHighlights.map(([label, img]) => (
                <li key={label}><a href={store.instagram} target="_blank" rel="noreferrer"><span><img src={img} alt="" loading="lazy" /></span>{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

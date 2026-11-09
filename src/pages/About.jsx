import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Gem, HeartHandshake, MessageCircle, Package, ShoppingBag, Sparkles, UserPlus } from 'lucide-react'
import { usePageTitle, useShop } from '../shop.jsx'
import { HandHeart, Instagram, WhatsApp, responsive } from '../ui.jsx'
import { helloMessage, store, whatsappLink } from '../store.js'

// Textos baseados no que a própria Maré publica no Instagram (@uusemaree.br).

const values = [
  { icon: Gem, title: 'Elegância', text: 'Peças que valorizam quem você é, sem esforço — do treino ao jantar.' },
  { icon: Sparkles, title: 'Personalidade', text: 'Detalhes que fazem toda a diferença: aquela peça que você olha e pensa “preciso dessa!”.' },
  { icon: HeartHandshake, title: 'Propósito', text: 'Cada pedido carrega um pedacinho do sonho que a Maré vive todos os dias.' },
]

const steps = [
  { icon: ShoppingBag, title: 'Escolha suas peças', text: 'Navegue pela coleção, veja todas as fotos e junte suas favoritas na sacola.' },
  { icon: MessageCircle, title: 'Chame no WhatsApp', text: 'Sua lista vai pronta para a nossa conversa. Lá combinamos tamanho, pagamento e entrega.' },
  { icon: Package, title: 'Receba em casa', text: 'Enviamos para todo o Brasil, com todo o carinho em cada embalagem.' },
]

const mosaic = ['/img/produtos/04-01.webp', '/img/produtos/02-01.webp', '/img/produtos/08-01.webp']
// Cartão no estilo do perfil do Instagram (@uusemaree.br).
// Os números são um retrato do perfil — atualize aqui quando quiser.
const igProfile = {
  stats: [['23', 'posts'], ['328', 'seguidores'], ['107', 'seguindo']],
  bio: ['☀️ Vista sua melhor versão.', '📦 Enviamos para todo o Brasil', '💌 Pedidos pelo Direct ou WhatsApp'],
  highlights: [
    ['Fit ☀️', '/img/produtos/01-01-480.webp'],
    ['Cliente do mês', '/img/produtos/08-01-480.webp'],
    ['Life ✨', '/img/produtos/13-01-480.webp'],
    ['Elas usam ✨', '/img/produtos/04-01-480.webp'],
    ['🎁', '/img/logo/perfil.webp'],
  ],
}

export default function About() {
  usePageTitle('Sobre nós')
  useShop() // redesenha quando as configurações (Instagram/WhatsApp) chegam
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="shell about-hero-inner">
          <div className="about-hero-copy">
            <nav className="breadcrumb" aria-label="Você está em"><Link to="/">Início</Link><span>/</span><b>Sobre nós</b></nav>
            <p className="eyebrow">Nossa história</p>
            <h1>Vista sua<br /><em>melhor versão.</em></h1>
            <p>A Maré nasceu para vestir mulheres que vivem cada fase com leveza, força e personalidade. Moda feminina e fitness, escolhida com carinho para acompanhar todos os seus movimentos.</p>
            <div className="about-hero-actions">
              <Link className="button dark" to="/produtos">Conhecer a coleção <ArrowRight /></Link>
              <a className="button outline" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> {store.instagramHandle}</a>
            </div>
          </div>
          <div className="about-mosaic" aria-hidden="true">
            {mosaic.map((src, i) => <img key={src} src={src} alt="" className={`m${i + 1}`} />)}
            <p className="mosaic-script">feito com<br />amor<HandHeart className="hand-heart small" /></p>
          </div>
        </div>
      </section>

      <section className="story shell">
        <div className="story-quote" data-reveal>
          <span className="quote-mark">“</span>
          <blockquote>O que começou como um sonho no coração, Deus tem permitido viver de verdade.</blockquote>
        </div>
        <div className="story-text">
          <p data-reveal>Cada pedido, cada mensagem, cada cliente que escolhe a Maré carrega um pedacinho desse sonho. Por isso, vocês não são apenas clientes: são parte da história que a gente escreve todos os dias. 🌊🤎</p>
          <p data-reveal style={{ '--i': 1 }}>A Maré mudou — e uma nova fase começou. Leve, feminina e feita para acompanhar você em cada versão: uma seleção de peças escolhidas para trazer mais estilo para os seus dias, daquelas que você veste e simplesmente se sente linda.</p>
          <p className="signature" data-reveal style={{ '--i': 2 }}>Seja sempre sua melhor escolha. <span>Maré.</span></p>
        </div>
      </section>

      <section className="values shell" aria-label="O que nos move">
        {values.map(({ icon: Icon, title, text }, i) => (
          <article key={title} data-reveal style={{ '--i': i }}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="lines shell" aria-label="Nossas linhas">
        <Link to="/produtos?categoria=moda-feminina" className="line-card" data-reveal="left">
          <img src="/img/banners/moda-feminina.webp" srcSet={responsive('/img/banners/moda-feminina.webp', 800)} sizes="(max-width: 900px) 100vw, 50vw" alt="" loading="lazy" />
          <div>
            <p className="eyebrow">Moda feminina</p>
            <h2>Leve, feminina e<br />do seu jeito.</h2>
            <span className="pill">Ver coleção <ArrowRight /></span>
          </div>
        </Link>
        <Link to="/produtos?categoria=mare-move" className="line-card" data-reveal="right">
          <img src="/img/banners/conjuntos-fitness.webp" srcSet={responsive('/img/banners/conjuntos-fitness.webp', 800)} sizes="(max-width: 900px) 100vw, 50vw" alt="" loading="lazy" />
          <div>
            <p className="eyebrow">Maré Move</p>
            <h2>Seu movimento,<br />sua melhor versão.</h2>
            <span className="pill">Ver conjuntos <ArrowRight /></span>
          </div>
        </Link>
      </section>

      <section className="verse" aria-label="Versículo">
        <div className="shell" data-reveal>
          <p className="verse-script">Reveste-se de força e dignidade;<br />sorri diante do futuro.</p>
          <span>Provérbios 31:25</span>
        </div>
      </section>

      <section className="how shell" id="como-comprar" aria-labelledby="how-title">
        <div className="editorial-heading" data-reveal>
          <p className="eyebrow">Simples, leve e do seu jeito</p>
          <h2 id="how-title">Como comprar na Maré</h2>
        </div>
        <ol className="how-steps">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} data-reveal style={{ '--i': i }}>
              <span className="how-number">0{i + 1}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
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
            <p className="eyebrow">Vocês fazem parte de tudo isso</p>
            <h2>Ela vestiu Maré<br />e entregou tudo. ✨</h2>
            <p>Acompanhe as novidades, os bastidores e as nossas clientes lindas no Instagram. Vestiu Maré? Marca a gente — você pode ser a próxima cliente do mês! 🤎</p>
            <a className="button dark" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> Seguir {store.instagramHandle}</a>
          </div>
          <div className="ig-profile" data-reveal="right">
            <div className="ig-head">
              <a className="ig-avatar" href={store.instagram} target="_blank" rel="noreferrer" aria-label="Perfil da Maré no Instagram"><img src="/img/logo/perfil.webp" alt="" /></a>
              <div className="ig-info">
                <div className="ig-name"><b>{store.instagramHandle.replace('@', '')}</b><span>•••</span></div>
                <ul className="ig-stats">
                  {igProfile.stats.map(([n, label]) => <li key={label}><b>{n}</b> {label}</li>)}
                </ul>
                <div className="ig-bio">
                  <p><b>MARÉ | Moda feminina • Fitness</b></p>
                  {igProfile.bio.map(line => <p key={line}>{line}</p>)}
                </div>
              </div>
            </div>
            <div className="ig-actions">
              <a href={store.instagram} target="_blank" rel="noreferrer" className="ig-follow">Seguir</a>
              <a href={`https://ig.me/m/${store.instagramHandle.replace('@', '')}`} target="_blank" rel="noreferrer">Enviar mensagem</a>
              <a href={store.instagram} target="_blank" rel="noreferrer" className="ig-icon" aria-label="Abrir perfil"><UserPlus /></a>
            </div>
            <ul className="ig-highlights">
              {igProfile.highlights.map(([label, img]) => (
                <li key={label}><a href={store.instagram} target="_blank" rel="noreferrer"><span><img src={img} alt="" loading="lazy" /></span>{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

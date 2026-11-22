import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Eye, ImageOff, MousePointerClick, Shirt, Users } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { listProducts } from '../api.js'
import { BASE } from '../sections.js'
import { CardHead, InfoTip, errorText } from '../ui.jsx'

// Início do painel: acessos do site (contador próprio, tabela site_events) e o que precisa de atenção.

const PERIODS = [{ days: 1, label: 'Hoje' }, { days: 7, label: '7 dias' }, { days: 30, label: '30 dias' }]
const num = n => Number(n || 0).toLocaleString('pt-BR')
const count = async query => { const { count: n, error } = await query; if (error) throw error; return n || 0 }

function Change({ now, before }) {
  if (!before) return null
  const pct = Math.round(((now - before) / before) * 100)
  if (!pct) return <small className="adm-kpi-change">igual ao período anterior</small>
  const up = pct > 0
  return <small className={`adm-kpi-change ${up ? 'up' : 'down'}`}>{up ? <ArrowUpRight /> : <ArrowDownRight />}{Math.abs(pct)}% vs. período anterior</small>
}

// Gráfico de barras simples: visitantes por hora (hoje) ou por dia.
function Chart({ series, hourly }) {
  const max = Math.max(1, ...series.map(s => s.visitors))
  const label = t => {
    const d = new Date(t)
    return hourly ? `${String(d.getHours()).padStart(2, '0')}h` : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  const every = Math.ceil(series.length / 7)
  return (
    <div className="adm-chart" role="img" aria-label="Visitantes no período">
      <div className="adm-chart-bars">
        {series.map((s, i) => (
          <div key={s.t} className="adm-chart-col" title={`${label(s.t)}: ${num(s.visitors)} visitante(s), ${num(s.pageviews)} página(s)`}>
            <span className="adm-chart-bar" style={{ height: `${(s.visitors / max) * 100}%` }}>{s.visitors > 0 && <i>{s.visitors}</i>}</span>
            <small>{i % every === 0 || i === series.length - 1 ? label(s.t) : ''}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function Bars({ rows, total, empty }) {
  if (!rows.length) return <p className="adm-muted adm-dash-empty">{empty}</p>
  return (
    <ul className="adm-hbars">
      {rows.map(r => (
        <li key={r.name}>
          <span>{r.name}</span><b>{num(r.value)}</b>
          <i style={{ width: `${Math.max(4, (r.value / Math.max(1, total)) * 100)}%` }} />
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard({ session, profile }) {
  const [days, setDays] = useState(7)
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(null)
  const [store, setStore] = useState(null)

  useEffect(() => {
    let alive = true
    setStats(null); setStatsError(null)
    supabase.rpc('site_stats', { p_days: days }).then(({ data, error }) => {
      if (!alive) return
      if (error) setStatsError(errorText(error)); else setStats(data)
    })
    return () => { alive = false }
  }, [days])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [products, pending, settings] = await Promise.all([
          listProducts(),
          count(supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pendente')),
          supabase.from('store_settings').select('whatsapp, spotlight_enabled, spotlight_ids').eq('id', 1).maybeSingle().then(r => { if (r.error) throw r.error; return r.data }),
        ])
        if (alive) setStore({ products, pending, settings })
      } catch { if (alive) setStore({ products: [], pending: 0, settings: null }) }
    })()
    return () => { alive = false }
  }, [])

  const byId = useMemo(() => Object.fromEntries((store?.products || []).map(p => [p.id, p])), [store])
  const visible = (store?.products || []).filter(x => x.active)
  const todo = store ? [
    !store.settings?.whatsapp && { text: 'Cadastre o WhatsApp da loja.', to: `${BASE}/configuracoes`, action: 'Configurar' },
    store.pending > 0 && { text: `${store.pending} avaliação(ões) esperando aprovação.`, to: `${BASE}/avaliacoes`, action: 'Ver avaliações' },
    visible.filter(x => !x.product_images.length).length > 0 && { text: `${visible.filter(x => !x.product_images.length).length} produto(s) no site sem foto.`, to: `${BASE}/produtos`, action: 'Ver produtos' },
    store.settings?.spotlight_enabled && !(store.settings?.spotlight_ids || []).some(id => visible.find(x => x.id === id && x.available)) && { text: 'Card flutuante ligado, mas sem peça disponível.', to: `${BASE}/flutuantes`, action: 'Escolher flutuantes' },
  ].filter(Boolean) : []

  const s = stats
  const kpis = [
    { icon: MousePointerClick, tone: 'rose', label: 'Visitas', value: s?.visits },
    { icon: Eye, tone: 'lilac', label: 'Páginas vistas', value: s?.pageviews },
    { icon: Shirt, tone: 'sand', label: 'Peças vistas', value: s?.productViews },
  ]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = (profile?.full_name || session?.user?.email?.split('@')[0] || '').trim().split(/\s+/)[0]
  const periodLabel = PERIODS.find(p => p.days === days).label
  const topProducts = (s?.products || []).map(p => ({ ...p, product: byId[p.id] })).filter(p => p.product)
  const maxViews = Math.max(1, ...topProducts.map(p => p.views))
  const sources = (s?.sources || []).map(r => ({ name: r.name, value: r.visits }))
  const devices = (s?.devices || []).map(r => ({ name: r.name === 'celular' ? 'Celular' : 'Computador', value: r.visitors }))
  const total = arr => arr.reduce((a, r) => a + r.value, 0)
  const pageName = path => ({ '/': 'Início', '/produtos': 'Catálogo', '/colecao': 'Coleção', '/promocoes': 'Promoções', '/sobre': 'Sobre nós', '/como-comprar': 'Como comprar', '/entrar': 'Entrar / Minha conta' })[path] || path

  return (
    <div className="adm-dash">
      <header className="adm-hero">
        <div className="adm-hero-text">
          <span>{greeting},</span>
          <h1>Olá{firstName ? `, ${firstName}` : ''} <span aria-hidden="true">👋</span></h1>
          <p>Veja como a Maré está indo.</p>
        </div>
        <a href="/entrar" target="_blank" rel="noreferrer" className="adm-hero-photo" aria-label="Sua foto (troque em Minha conta, no site)" title="Trocar foto em Minha conta">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <b>{(firstName || 'M').charAt(0).toUpperCase()}</b>}
        </a>
      </header>

      <div className="adm-dash-periods" role="tablist" aria-label="Período">
        {PERIODS.map(p => <button key={p.days} role="tab" aria-selected={days === p.days} className={days === p.days ? 'active' : ''} onClick={() => setDays(p.days)}>{p.label}</button>)}
      </div>

      {statsError ? <p className="adm-notice is-error">{statsError}</p> : (
        <>
          <section className="adm-feature">
            <div className="adm-feature-top">
              <div>
                <span className="adm-feature-label"><Users /> Visitantes · {periodLabel}
                  <InfoTip label="Sobre os acessos">{'Contamos as visitas direto no seu banco, sem Google e sem cookies. Ninguém é identificado: cada aparelho recebe só um código aleatório.\n\nVocê (e quem administra a loja) não conta, nem robôs de busca.\n\nComeçou a contar em 22/11/2026.'}</InfoTip>
                </span>
                <b>{s ? num(s.visitors) : '–'}</b>
                {s && <Change now={s.visitors} before={s.prevVisitors} />}
              </div>
            </div>
            {s ? <Chart series={s.series} hourly={days === 1} /> : <div className="adm-chart adm-chart-loading" />}
          </section>

          <div className="adm-kpis">
            {kpis.map(k => (
              <div key={k.label} className={`adm-kpi tone-${k.tone}`}>
                <span className="adm-kpi-icon"><k.icon /></span>
                <b>{s ? num(k.value) : '–'}</b>
                <span className="adm-kpi-label">{k.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="adm-dash-grid">
        <section className="adm-card">
          <CardHead title="Peças mais vistas" text={periodLabel} />
          {!s ? <p className="adm-muted">Carregando…</p> : topProducts.length === 0 ? (
            <p className="adm-muted adm-dash-empty">Nenhuma peça vista neste período.</p>
          ) : (
            <ol className="adm-top">
              {topProducts.map((p, i) => (
                <li key={p.id}>
                  <span className="adm-top-pos">{i + 1}</span>
                  <span className="adm-top-img">{p.product.product_images[0] ? <img src={p.product.product_images[0].thumb_path} alt="" /> : <ImageOff />}</span>
                  <Link to={`${BASE}/produtos/${p.id}`} className="adm-top-name">
                    {p.product.name}
                    <i style={{ width: `${(p.views / maxViews) * 100}%` }} />
                  </Link>
                  <b title={`${num(p.visitors)} pessoa(s)`}>{num(p.views)}</b>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="adm-dash-side">
          <section className="adm-card">
            <CardHead title="De onde vêm" info={'Por onde a pessoa chegou ao site.\n\n"Direto" = digitou o endereço, salvou nos favoritos ou abriu um link sem origem (como alguns apps).\n\nDica: nos links do Instagram, use usemare.com.br/?utm_source=instagram para garantir.'} />
            <Bars rows={sources} total={total(sources)} empty="Sem visitas neste período." />
          </section>
          <section className="adm-card">
            <CardHead title="Aparelho" />
            <Bars rows={devices} total={total(devices)} empty="Sem visitas neste período." />
          </section>
          <section className="adm-card">
            <CardHead title="Páginas mais abertas" />
            <Bars rows={(s?.pages || []).map(r => ({ name: pageName(r.path), value: r.views }))} total={(s?.pages || []).reduce((a, r) => Math.max(a, r.views), 0)} empty="Sem visitas neste período." />
          </section>
        </div>
      </div>

      {store && (
        <section className="adm-card">
          <CardHead title="Precisa de atenção" />
          {todo.length === 0 ? (
            <p className="adm-allgood"><CheckCircle2 /> Tudo certo por aqui.</p>
          ) : (
            <ul className="adm-todo">
              {todo.map((t, i) => (
                <li key={i}><AlertTriangle /><span>{t.text}</span><Link className="adm-btn outline small" to={t.to}>{t.action} <ArrowRight /></Link></li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

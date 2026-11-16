import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../supabase.js'
import { listProducts } from '../api.js'
import { BASE, navGroups, sections } from '../sections.js'
import { errorText } from '../ui.jsx'

// Tela inicial do painel: a loja em números, o que precisa de atenção e atalhos.

const count = async query => { const { count: n, error } = await query; if (error) throw error; return n || 0 }

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [products, pending, subscribers, settings] = await Promise.all([
          listProducts(),
          count(supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pendente')),
          count(supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).is('unsubscribed_at', null)),
          supabase.from('store_settings').select('whatsapp, spotlight_enabled, spotlight_ids').eq('id', 1).maybeSingle().then(r => { if (r.error) throw r.error; return r.data }),
        ])
        if (alive) setData({ products, pending, subscribers, settings })
      } catch (e) { if (alive) setError(errorText(e)) }
    })()
    return () => { alive = false }
  }, [])

  const p = data?.products || []
  const visible = p.filter(x => x.active)
  const stats = data && [
    { label: 'Produtos no site', value: visible.length, to: `${BASE}/produtos` },
    { label: 'Esgotados', value: visible.filter(x => !x.available).length, to: `${BASE}/produtos` },
    { label: 'Em promoção', value: visible.filter(x => x.old_price > x.price).length, to: `${BASE}/produtos` },
    { label: 'Ocultos', value: p.filter(x => !x.active).length, to: `${BASE}/produtos` },
    { label: 'Avaliações pendentes', value: data.pending, to: `${BASE}/avaliacoes`, hot: data.pending > 0 },
    { label: 'Inscritos na newsletter', value: data.subscribers, to: `${BASE}/newsletter` },
  ]

  const todo = data ? [
    !data.settings?.whatsapp && { text: 'Cadastre o WhatsApp da loja: sem ele, as clientes precisam escolher o contato na hora de comprar.', to: `${BASE}/configuracoes`, action: 'Configurar' },
    data.pending > 0 && { text: `${data.pending} avaliação(ões) esperando aprovação.`, to: `${BASE}/avaliacoes`, action: 'Ver avaliações' },
    visible.filter(x => !x.product_images.length).length > 0 && { text: `${visible.filter(x => !x.product_images.length).length} produto(s) no site sem foto.`, to: `${BASE}/produtos`, action: 'Ver produtos' },
    data.settings?.spotlight_enabled && !(data.settings?.spotlight_ids || []).some(id => visible.find(x => x.id === id && x.available)) && { text: 'O card de destaques está ligado, mas nenhum destaque está disponível — ele não aparece no site.', to: `${BASE}/destaques`, action: 'Escolher destaques' },
  ].filter(Boolean) : []

  const shortcuts = [...navGroups.flatMap(g => g.items), 'configuracoes'].filter(key => key !== 'inicio')

  return (
    <>
      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Sua loja em números</h2><p>Atualizado agora, direto do banco.</p></div></div>
        {error ? <p className="adm-notice is-error">{error}</p> : (
          <div className="adm-stats">
            {(stats || Array.from({ length: 6 }, (_, i) => ({ label: '…', value: '–', to: '#', key: i }))).map((s, i) => (
              <Link key={i} to={s.to} className={`adm-stat ${s.hot ? 'hot' : ''}`}><span>{s.label}</span><b>{s.value}</b></Link>
            ))}
          </div>
        )}
      </section>

      {data && (
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Precisa de atenção</h2></div></div>
          {todo.length === 0 ? (
            <p className="adm-allgood"><CheckCircle2 /> Tudo certo por aqui. 🌊</p>
          ) : (
            <ul className="adm-todo">
              {todo.map((t, i) => (
                <li key={i}><AlertTriangle /><span>{t.text}</span><Link className="adm-btn outline small" to={t.to}>{t.action} <ArrowRight /></Link></li>
              ))}
            </ul>
          )}
        </section>
      )}

      <h2 className="adm-section-title">Atalhos</h2>
      <div className="adm-shortcuts">
        {shortcuts.map(key => {
          const { label, icon: Icon, path, description } = sections[key]
          return (
            <Link key={key} to={path} className="adm-card adm-shortcut">
              <span className="adm-shortcut-icon"><Icon /></span>
              <span><b>{label}</b><small>{description}</small></span>
              <ArrowRight className="adm-shortcut-arrow" />
            </Link>
          )
        })}
      </div>
    </>
  )
}

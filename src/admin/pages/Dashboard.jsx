import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { navGroups, sections } from '../sections.js'

// Tela inicial do painel. Na etapa 12 ganha o resumo com números da loja.
export default function Dashboard() {
  const shortcuts = navGroups.flatMap(g => g.items).filter(key => key !== 'inicio')
  return (
    <>
      <section className="adm-card adm-welcome">
        <p className="adm-eyebrow">Bem-vinda ao painel</p>
        <h2>Tudo da loja em um só lugar 🌊</h2>
        <p>Por aqui você cuida dos produtos, das fotos, dos destaques, dos textos do site e dos contatos da loja. O que for salvo aqui aparece no site na hora.</p>
      </section>

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

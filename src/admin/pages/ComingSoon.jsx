import React from 'react'
import { Hammer } from 'lucide-react'

// Aviso mostrado nas áreas do painel que ainda serão construídas.
export default function ComingSoon({ section }) {
  const Icon = section.icon
  return (
    <div className="adm-card adm-soon">
      <span className="adm-soon-icon"><Icon /></span>
      <h2>{section.label}</h2>
      <p>{section.description}</p>
      <span className="adm-badge"><Hammer /> Em construção · etapa {section.stage}</span>
    </div>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { usePageTitle } from '../shop.jsx'

export default function NotFound() {
  usePageTitle('Página não encontrada')
  return (
    <section className="not-found shell">
      <p className="script-big" aria-hidden="true">ops!</p>
      <h1>Essa onda passou… 🌊</h1>
      <p>A página que você procura não existe ou mudou de lugar. Mas tem muita coisa linda esperando por você.</p>
      <div>
        <Link className="button dark" to="/produtos">Ver produtos <ArrowRight /></Link>
        <Link className="button outline" to="/">Voltar ao início</Link>
      </div>
    </section>
  )
}

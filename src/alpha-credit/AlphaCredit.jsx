// Crédito Alpha Studio — versão React
// Uso:  import AlphaCredit from './AlphaCredit'
//       <AlphaCredit />  no final do <footer>
// Mantenha alpha-credit.css e a pasta assets/ ao lado deste arquivo.
// As cores vêm do site (veja o topo do alpha-credit.css).
import './alpha-credit.css'

const INSTAGRAM_URL = 'https://www.instagram.com/alphastudiobrand/'

export default function AlphaCredit({ href = INSTAGRAM_URL }) {
  return (
    <div className="alpha-credit">
      <span>Site desenvolvido pela empresa Alpha Studio</span>
      <a
        className="alpha-credit__logo"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram da Alpha Studio"
        title="Instagram da Alpha Studio"
      />
      <a
        className="alpha-credit__social"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram da Alpha Studio"
        title="Instagram da Alpha Studio"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="3" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </div>
  )
}

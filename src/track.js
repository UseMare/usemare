import { hasSupabase, restRpc } from './supabaseLazy.js'

// Contador de acessos próprio (aparece no Início do painel). Anônimo: só um código aleatório
// deste navegador, sem cookie, sem nome/e-mail e sem ligar a ninguém. Robôs e testes não contam.
const BOT = /bot|crawl|spider|slurp|lighthouse|headless|pagespeed|preview|facebookexternalhit|whatsapp\//i

const read = (store, key) => { try { return store.getItem(key) } catch { return null } }
const write = (store, key, value) => { try { store.setItem(key, value) } catch { /* modo privado */ } }

const visitorId = () => {
  let id = read(localStorage, 'mare-visitante')
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    id = crypto.randomUUID?.() || '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ (Math.random() * 16) >> (c / 4)).toString(16))
    write(localStorage, 'mare-visitante', id)
  }
  return id
}

// De onde a pessoa veio (só na primeira página da visita).
const origin = () => {
  const utm = new URLSearchParams(location.search).get('utm_source')
  if (utm) return utm
  const ua = navigator.userAgent
  if (/Instagram/i.test(ua)) return 'instagram'
  if (/FBAN|FBAV/i.test(ua)) return 'facebook'
  try {
    const host = document.referrer && new URL(document.referrer).hostname
    return host && host !== location.hostname ? host : ''
  } catch { return '' }
}

let last = ''
let firstLoad = true // origem (Instagram, Google…) vale para a página que abriu o site nesta aba
export function trackPage(path) {
  if (!hasSupabase || path === last || path.startsWith('/painel-loja')) return
  if (navigator.webdriver || BOT.test(navigator.userAgent)) return
  if (read(localStorage, 'mare-nao-contar')) return // aparelho de quem administra a loja
  last = path
  // Quem decide se é visita nova é o banco: só depois de 3 h sem acesso deste aparelho.
  const entry = firstLoad
  firstLoad = false
  const params = {
    p_visitor: visitorId(),
    p_path: path,
    p_entry: entry,
    p_ref: entry ? origin() : null,
    p_device: matchMedia('(max-width: 768px)').matches ? 'celular' : 'computador',
  }
  // Depois que a página já apareceu, para não pesar no carregamento.
  const send = () => restRpc('track_event', params, { keepalive: true })
  if ('requestIdleCallback' in window) requestIdleCallback(send, { timeout: 4000 })
  else setTimeout(send, 1500)
}

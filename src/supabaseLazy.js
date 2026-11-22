// Desempenho: o cliente do Supabase (supabase-js, ~50 KB) só é preciso para login, conta e
// favoritos. Por isso:
// - leituras públicas (catálogo, textos) e funções públicas (newsletter, contador) usam
//   chamadas simples à API do banco (restGet / restRpc), sem baixar o supabase-js;
// - o supabase-js só baixa quando há conta logada neste aparelho, ao abrir login/conta/produto
//   ou numa ação que precise dele (loadSupabase).
// As páginas baixadas sob demanda (produto, login, painel) podem importar ./supabase.js direto.
const URL_ = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const hasSupabase = Boolean(URL_ && KEY)

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }

// GET /rest/v1/<path> com a chave pública. Devolve os dados ou lança erro.
export async function restGet(path) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, { headers })
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`)
  return res.json()
}

// Chama uma função pública do banco. Devolve { error } como o supabase-js.
export async function restRpc(name, params, init = {}) {
  try {
    const res = await fetch(`${URL_}/rest/v1/rpc/${name}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(params), ...init })
    return res.ok ? { error: null } : { error: new Error(`${res.status}`) }
  } catch (error) { return { error } }
}

// Há sessão de login salva neste aparelho (ou o endereço traz um link de login/recuperação)?
const REF = hasSupabase ? new URL(URL_).hostname.split('.')[0] : ''
export function needsAuthNow() {
  if (!hasSupabase) return false
  try { if (localStorage.getItem(`sb-${REF}-auth-token`)) return true } catch { /* modo privado */ }
  return /access_token|refresh_token|error_description/.test(location.hash) || /[?&](code|token_hash)=/.test(location.search)
}

// Quem quiser saber quando o supabase-js foi carregado (por qualquer página) se inscreve aqui.
let client = null
const waiting = []
export function onSupabase(fn) { client ? fn(client) : waiting.push(fn) }
export function announceSupabase(sb) {
  if (!sb || client) return
  client = sb
  waiting.splice(0).forEach(fn => fn(sb))
}

let loading
export const loadSupabase = () => (loading ||= import('./supabase.js').then(m => m.supabase))

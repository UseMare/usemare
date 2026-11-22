// Gera dist/sitemap.xml depois do build (npm run build): páginas fixas + todos os produtos ativos
// (lidos do Supabase com a chave pública, a mesma que o site usa). Se o banco não responder,
// gera só com as páginas fixas — o build nunca falha por causa disso.
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://usemare.com.br'
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => /^[A-Z_]+=/.test(l)).map(l => l.split(/=(.*)/s).slice(0, 2)))

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/produtos', priority: '0.9', changefreq: 'daily' },
  { path: '/promocoes', priority: '0.7', changefreq: 'weekly' },
  { path: '/colecao', priority: '0.9', changefreq: 'weekly' },
  { path: '/sobre', priority: '0.6', changefreq: 'monthly' },
  { path: '/trocas-e-devolucoes', priority: '0.3', changefreq: 'yearly' },
  { path: '/politica-de-privacidade', priority: '0.3', changefreq: 'yearly' },
  { path: '/termos-de-uso', priority: '0.3', changefreq: 'yearly' },
]

let products = []
try {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/products?select=slug,updated_at&active=eq.true&order=sort_order`, {
    headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  products = (await res.json()).filter(p => /^[a-z0-9-]+$/.test(p.slug || ''))
} catch (error) {
  console.warn('sitemap: produtos não carregados, seguindo só com as páginas fixas.', error.message)
}

const url = (loc, extra) => `  <url><loc>${SITE}${loc}</loc>${extra}</url>`
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map(p => url(p.path, `<changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority>`)),
  ...products.map(p => url(`/produto/${p.slug}`, `${p.updated_at ? `<lastmod>${p.updated_at.slice(0, 10)}</lastmod>` : ''}<priority>0.8</priority>`)),
  '</urlset>',
  '',
].join('\n')

writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
console.log(`sitemap: ${pages.length} páginas + ${products.length} produtos`)

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Desempenho no celular: avisa o navegador logo no <head> para já baixar as duas fontes
// principais (DM Sans dos textos e Playfair dos títulos, subconjunto latino). Os nomes dos
// arquivos mudam a cada build (hash), por isso a tag é gerada aqui e não escrita à mão.
const preloadFonts = {
  name: 'mare-preload-fontes',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (!ctx.bundle) return html
      const fonts = Object.keys(ctx.bundle).filter(file =>
        /assets\/(dm-sans-latin|playfair-display-latin)-[\w-]+\.woff2$/.test(file) && !file.includes('-ext-'))
      return {
        html,
        tags: fonts.map(file => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
          injectTo: 'head-prepend',
        })),
      }
    },
  },
}

// Desempenho: o CSS principal não trava a primeira pintura. Vira um preload (baixa em paralelo
// com o JS) e o main.jsx o aplica e espera antes de desenhar. Sem onload no HTML: a CSP bloqueia.
const cssSemBloqueio = {
  name: 'mare-css-sem-bloqueio',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (!ctx.bundle) return html
      return html.replace(/<link rel="stylesheet" crossorigin href="(\/assets\/index-[\w-]+\.css)">/, (_, href) =>
        `<link rel="preload" as="style" crossorigin href="${href}" id="css-principal">` +
        `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`)
    },
  },
}

// O react-router só aponta para a versão de desenvolvimento (com avisos e checagens extras).
// No build do site usamos a versão de produção, que é menor e mais rápida.
const routerProd = name => fileURLToPath(new URL(`./node_modules/react-router/dist/production/${name}`, import.meta.url))

export default defineConfig(({ command }) => ({
  plugins: [preloadFonts, cssSemBloqueio],
  resolve: command === 'build' ? {
    alias: [
      { find: /^react-router$/, replacement: routerProd('index.mjs') },
      { find: /^react-router\/dom$/, replacement: routerProd('dom-export.mjs') },
    ],
  } : {},
}))

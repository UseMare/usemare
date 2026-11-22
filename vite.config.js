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

export default defineConfig({
  plugins: [preloadFonts],
})

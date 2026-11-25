// Pré-carrega a foto principal (só no Início, só se ainda for a foto padrão) e o logo (fora do painel).
// Arquivo separado porque a política de segurança do site (CSP) não permite script dentro do HTML.
(function () {
  var p = location.pathname, h = document.head
  if (p.indexOf('/painel-loja') === 0) return
  function pre(attrs) { var l = document.createElement('link'); l.rel = 'preload'; l.as = 'image'; for (var k in attrs) l.setAttribute(k, attrs[k]); h.appendChild(l) }
  pre({ imagesrcset: '/img/logo/mare-240.webp 240w, /img/logo/mare.webp 480w', imagesizes: '(max-width: 900px) 108px, 150px' })
  if (p !== '/') return
  var first
  try { first = JSON.parse(localStorage.getItem('mare-catalogo-v2')).content.home.heroSlides[0] } catch (e) {}
  if (first && first.image && first.image !== '/img/banners/hero.webp') return
  if (!first || !first.mobile || first.mobile === '/img/banners/hero-mobile.webp')
    pre({ media: '(max-width: 600px)', imagesrcset: '/img/banners/hero-mobile-600.webp 600w, /img/banners/hero-mobile-800.webp 800w, /img/banners/hero-mobile.webp 1200w', imagesizes: '100vw', fetchpriority: 'high' })
  pre({ media: '(min-width: 601px)', imagesrcset: '/img/banners/hero-1200.webp 1200w, /img/banners/hero.webp 2245w', imagesizes: '100vw', fetchpriority: 'high' })
})()

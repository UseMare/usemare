import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './fonts.css'
import './styles.css'
import './pages.css'
import { ShopProvider } from './shop.jsx'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import { legalPages } from './legalPages.js'

// Desempenho: só o Início vem no pacote principal. As outras páginas são baixadas quando
// abertas (o Suspense fica no Layout).
const loadCatalog = () => import('./pages/Catalog.jsx')
const loadProduct = () => import('./pages/Product.jsx')
const Catalog = lazy(loadCatalog)
const Product = lazy(loadProduct)
const About = lazy(() => import('./pages/About.jsx'))
const Promotions = lazy(() => import('./pages/Promotions.jsx'))
const Collection = lazy(() => import('./pages/Collection.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const LegalPage = lazy(() => import('./pages/Legal.jsx'))

// Pré-carga do catálogo e da página de produto na primeira interação (toque, rolagem, mouse,
// tecla): não disputa banda com a primeira tela e já está pronta quando a pessoa clicar.
const prefetchEvents = ['pointerdown', 'pointermove', 'scroll', 'keydown', 'touchstart']
const prefetch = () => {
  prefetchEvents.forEach(e => window.removeEventListener(e, prefetch))
  const later = window.requestIdleCallback || (fn => setTimeout(fn, 200))
  later(() => { loadCatalog(); loadProduct() })
}
prefetchEvents.forEach(e => window.addEventListener(e, prefetch, { once: true, passive: true }))

// Painel da loja: só é baixado quando alguém abre /painel-loja.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

// Páginas do site:
//   /                     Início (prévia de tudo)
//   /produtos             Catálogo completo (?categoria=, ?busca=, filtros)
//   /produto/:slug        Página individual de cada peça
//   /promocoes            Promoções
//   /colecao              Página da coleção (nome, textos e peças no painel → Coleção)
//                         (/colecao-dezembro, o endereço antigo, leva para /colecao)
//   /sobre                Sobre nós (+ #como-comprar)
//   /entrar               Login / criar conta
//   /politica-de-privacidade, /trocas-e-devolucoes, /termos-de-uso   (links só no rodapé)
//   /painel-loja          Painel de administração (só contas admin)
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/painel-loja/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
        <Route path="/*" element={
          <ShopProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="produtos" element={<Catalog />} />
                <Route path="produto/:slug" element={<Product />} />
                <Route path="promocoes" element={<Promotions />} />
                <Route path="colecao" element={<Collection />} />
                <Route path="colecao-dezembro" element={<Navigate to="/colecao" replace />} />
                <Route path="sobre" element={<About />} />
                <Route path="entrar" element={<Login />} />
                {legalPages.map(p => <Route key={p.path} path={p.path.slice(1)} element={<LegalPage contentKey={p.contentKey} />} />)}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ShopProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

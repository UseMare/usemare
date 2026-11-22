import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './fonts.css'
import './styles.css'
import './pages.css'
import { ShopProvider } from './shop.jsx'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import { legalPages } from './legalPages.js'

// Desempenho: só o Início vem no pacote principal. As outras páginas são baixadas quando
// abertas (o Suspense fica no Layout) e, assim que o Início termina de carregar, o navegador já
// busca em segundo plano o catálogo e a página de produto, para a navegação seguir instantânea.
const loadCatalog = () => import('./pages/Catalog.jsx')
const loadProduct = () => import('./pages/Product.jsx')
const Catalog = lazy(loadCatalog)
const Product = lazy(loadProduct)
const About = lazy(() => import('./pages/About.jsx'))
const Promotions = lazy(() => import('./pages/Promotions.jsx'))
const December = lazy(() => import('./pages/December.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const LegalPage = lazy(() => import('./pages/Legal.jsx'))

window.addEventListener('load', () => {
  const later = window.requestIdleCallback || (fn => setTimeout(fn, 1500))
  later(() => { loadCatalog(); loadProduct() })
}, { once: true })

// Painel da loja: só é baixado quando alguém abre /painel-loja.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

// Páginas do site:
//   /                     Início (prévia de tudo)
//   /produtos             Catálogo completo (?categoria=, ?busca=, filtros)
//   /produto/:slug        Página individual de cada peça
//   /promocoes            Promoções
//   /colecao-dezembro     Coleção Dezembro (peças da categoria colecao-dezembro)
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
                <Route path="colecao-dezembro" element={<December />} />
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

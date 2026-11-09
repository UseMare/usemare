import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles.css'
import './pages.css'
import { ShopProvider } from './shop.jsx'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import Product from './pages/Product.jsx'
import About from './pages/About.jsx'
import Promotions from './pages/Promotions.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/Login.jsx'

// Páginas do site:
//   /                     Início (prévia de tudo)
//   /produtos             Catálogo completo (?categoria=, ?busca=, filtros)
//   /produto/:slug        Página individual de cada peça
//   /promocoes            Promoções
//   /sobre                Sobre nós (+ #como-comprar)
//   /entrar               Login / criar conta
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ShopProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="produtos" element={<Catalog />} />
            <Route path="produto/:slug" element={<Product />} />
            <Route path="promocoes" element={<Promotions />} />
            <Route path="sobre" element={<About />} />
            <Route path="entrar" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ShopProvider>
    </BrowserRouter>
  </React.StrictMode>
)

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products } from './products.js'

// Estado compartilhado da loja: sacola, favoritos e avisos ("foi para a sacola").
// Sacola e favoritos ficam salvos no aparelho da cliente (localStorage).

const ShopContext = createContext(null)
export const useShop = () => useContext(ShopContext)

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* navegação privada: segue sem salvar */ }
}

export function ShopProvider({ children }) {
  const [bag, setBag] = useState(() =>
    read('mare-sacola', []).filter(item => products.some(p => p.id === item.id && p.available)))
  const [liked, setLiked] = useState(() => read('mare-favoritos', []))
  const [bagOpen, setBagOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => write('mare-sacola', bag), [bag])
  useEffect(() => write('mare-favoritos', liked), [liked])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const addToBag = useCallback(product => {
    if (!product.available) return
    setBag(list => list.some(item => item.id === product.id)
      ? list.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...list, { id: product.id, quantity: 1 }])
    setToast({ name: product.name, key: Date.now() })
  }, [])

  const value = useMemo(() => ({
    bag,
    bagItems: bag.map(item => ({ product: products.find(p => p.id === item.id), quantity: item.quantity })).filter(item => item.product),
    bagCount: bag.reduce((sum, item) => sum + item.quantity, 0),
    addToBag,
    changeQuantity: (id, quantity) => setBag(list => quantity < 1
      ? list.filter(item => item.id !== id)
      : list.map(item => item.id === id ? { ...item, quantity } : item)),
    removeFromBag: id => setBag(list => list.filter(item => item.id !== id)),
    bagOpen,
    openBag: () => setBagOpen(true),
    closeBag: () => setBagOpen(false),
    liked,
    toggleLike: id => setLiked(list => list.includes(id) ? list.filter(item => item !== id) : [...list, id]),
    toast,
    dismissToast: () => setToast(null),
  }), [bag, liked, bagOpen, toast, addToBag])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

// Animação de entrada ao rolar, para o site inteiro.
// Qualquer elemento com data-reveal aparece quando entra na tela — inclusive os que surgem depois
// (troca de página, filtros, "ver todos"). Use style={{ '--i': n }} para escalonar.
export function useRevealObserver() {
  useEffect(() => {
    const show = el => el.classList.add('is-visible')
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(show)
      return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        show(entry.target)
        io.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    const scan = root => {
      if (root.matches?.('[data-reveal]:not(.is-visible)')) io.observe(root)
      root.querySelectorAll?.('[data-reveal]:not(.is-visible)').forEach(el => io.observe(el))
    }
    scan(document.body)
    const mo = new MutationObserver(mutations => mutations.forEach(m => m.addedNodes.forEach(node => node.nodeType === 1 && scan(node))))
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Maré` : 'Maré | Moda feminina e fitness'
  }, [title])
}

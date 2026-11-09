import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { products } from './products.js'
import { refreshCatalog } from './data.js'
import { supabase } from './supabase.js'

// Estado compartilhado da loja: catálogo, conta, sacola, favoritos e avisos ("foi para a sacola").
// Sacola e favoritos ficam salvos no aparelho da cliente (localStorage).
// Com a cliente logada, os favoritos também vão para a conta dela no Supabase (tabela favorites).

const ShopContext = createContext(null)
export const useShop = () => useContext(ShopContext)

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* navegação privada: segue sem salvar */ }
}
const uuidOf = code => products.find(p => p.id === code)?.uuid

export function ShopProvider({ children }) {
  // Sobe a cada atualização do catálogo vindo do Supabase: quem usa useShop() redesenha.
  const [catalogVersion, setCatalogVersion] = useState(0)
  const [bag, setBag] = useState(() => read('mare-sacola', []))
  const [liked, setLiked] = useState(() => read('mare-favoritos', []))
  const [bagOpen, setBagOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [profile, setProfile] = useState(null)
  const [recovering, setRecovering] = useState(false)
  const likedRef = useRef(liked)
  likedRef.current = liked
  const user = session?.user ?? null

  useEffect(() => write('mare-sacola', bag), [bag])
  useEffect(() => write('mare-favoritos', liked), [liked])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  // Catálogo e configurações atualizados do banco.
  useEffect(() => {
    let alive = true
    refreshCatalog().then(changed => { if (alive && changed) setCatalogVersion(v => v + 1) })
    return () => { alive = false }
  }, [])

  // Peças que saíram do catálogo ou esgotaram deixam a sacola.
  useEffect(() => {
    setBag(list => {
      const next = list.filter(item => products.some(p => p.id === item.id && p.available))
      return next.length === list.length ? list : next
    })
  }, [catalogVersion])

  // Sessão de login.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      setAuthReady(true)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Perfil + favoritos da conta (junta os favoritos do aparelho com os da conta).
  useEffect(() => {
    if (!user) { setProfile(null); return }
    let alive = true
    ;(async () => {
      const [{ data: prof }, { data: favs }] = await Promise.all([
        supabase.from('profiles').select('full_name, phone, role').eq('id', user.id).maybeSingle(),
        supabase.from('favorites').select('product_id'),
      ])
      if (!alive) return
      setProfile(prof)
      const remote = (favs || []).map(f => products.find(p => p.uuid === f.product_id)?.id).filter(Boolean)
      const missing = likedRef.current.filter(code => !remote.includes(code)).map(uuidOf).filter(Boolean)
      if (missing.length) await supabase.from('favorites').upsert(missing.map(product_id => ({ product_id })), { ignoreDuplicates: true })
      if (alive) setLiked(list => [...new Set([...list, ...remote])])
    })()
    return () => { alive = false }
  }, [user?.id, catalogVersion])

  const addToBag = useCallback(product => {
    if (!product.available) return
    setBag(list => list.some(item => item.id === product.id)
      ? list.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...list, { id: product.id, quantity: 1 }])
    setToast({ name: product.name, key: Date.now() })
  }, [])

  const toggleLike = useCallback(id => {
    const isLiked = likedRef.current.includes(id)
    setLiked(list => isLiked ? list.filter(item => item !== id) : [...list, id])
    const product_id = uuidOf(id)
    if (!user || !product_id) return
    const request = isLiked
      ? supabase.from('favorites').delete().eq('product_id', product_id)
      : supabase.from('favorites').upsert({ product_id }, { ignoreDuplicates: true })
    request.then(({ error }) => { if (error) console.warn('Favorito não sincronizado.', error) })
  }, [user])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
    setRecovering(false)
  }, [])

  const value = useMemo(() => ({
    catalogVersion,
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
    toggleLike,
    toast,
    dismissToast: () => setToast(null),
    user,
    profile,
    setProfile,
    authReady,
    recovering,
    endRecovery: () => setRecovering(false),
    signOut,
  }), [catalogVersion, bag, liked, bagOpen, toast, addToBag, toggleLike, user, profile, authReady, recovering, signOut])

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

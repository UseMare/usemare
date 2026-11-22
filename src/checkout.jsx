import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop } from './shop.jsx'
import { WhatsApp } from './ui.jsx'
import { orderMessage, whatsappLink } from './store.js'
import { productTypeName, products } from './products.js'

// Finalizar pedido: só com conta. Logada → abre o WhatsApp com o pedido pronto.
// Sem conta → guarda o pedido nesta aba e leva para /entrar?finalizar=1 (criar conta ou entrar);
// ao concluir, Login.jsx pega o pedido guardado e abre o WhatsApp.

const KEY = 'mare-finalizar'

const savePending = items => {
  try { sessionStorage.setItem(KEY, JSON.stringify(items.map(({ product, quantity }) => ({ id: product.id, quantity })))) } catch { /* aba anônima sem storage: segue sem guardar */ }
}

// Devolve e apaga o pedido guardado (itens que saíram do catálogo ou esgotaram ficam de fora).
export const takePendingOrder = () => {
  let saved = []
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || '[]'); sessionStorage.removeItem(KEY) } catch { saved = [] }
  return saved
    .map(({ id, quantity }) => ({ product: products.find(p => p.id === id), quantity }))
    .filter(item => item.product?.available && item.quantity > 0)
}

export const orderLink = (items, customer) => whatsappLink(orderMessage(items, customer, productTypeName))

export const customerOf = (user, profile) => ({
  name: profile?.full_name || user?.user_metadata?.full_name || '',
  email: user?.email || '',
  phone: profile?.phone || '',
})

export function CheckoutButton({ items, className = 'button whatsapp', children, onLeave }) {
  const { user, profile } = useShop()
  const navigate = useNavigate()
  const content = children || <><WhatsApp /> Finalizar pedido</>

  if (user) return (
    <a className={className} href={orderLink(items, customerOf(user, profile))} target="_blank" rel="noreferrer">{content}</a>
  )
  return (
    <button type="button" className={className} onClick={() => {
      savePending(items)
      onLeave?.()
      navigate('/entrar?finalizar=1')
    }}>{content}</button>
  )
}

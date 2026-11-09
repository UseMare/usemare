import { createClient } from '@supabase/supabase-js'

// Conexão com o Supabase (banco, login e fotos). Valores em /.env
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null

if (!supabase) console.warn('Supabase não configurado: o site usa o catálogo local (src/products.js).')

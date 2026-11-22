import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

// Sessão do painel: quem está logado e se essa conta é admin.
// status: 'loading' | 'offline' | 'signed-out' | 'denied' | 'admin'
// A tela só esconde o painel; quem realmente protege os dados são as policies (RLS) do Supabase,
// que só deixam contas com role = 'admin' criar, editar ou excluir.
export function useAdminAuth() {
  const [state, setState] = useState({ status: supabase ? 'loading' : 'offline', session: null, profile: null })

  useEffect(() => {
    if (!supabase) return
    let active = true

    const check = async session => {
      if (!session) {
        if (active) setState({ status: 'signed-out', session: null, profile: null })
        return
      }
      const { data } = await supabase.from('profiles').select('full_name, role, avatar_url').eq('id', session.user.id).maybeSingle()
      if (!active) return
      setState({ status: data?.role === 'admin' ? 'admin' : 'denied', session, profile: data })
    }

    supabase.auth.getSession().then(({ data }) => check(data.session))
    // setTimeout: o Supabase recomenda não fazer outras chamadas dentro do próprio callback de auth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => check(session), 0)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  return state
}

export const signOut = () => supabase?.auth.signOut()

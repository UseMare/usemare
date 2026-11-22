// Desempenho: o cliente do Supabase (banco + login) é pesado e não é preciso para desenhar a
// primeira tela. As partes que entram no pacote principal (catálogo, sacola/login, rodapé)
// o buscam por aqui, em paralelo, depois que a página já apareceu. As páginas que já são
// baixadas sob demanda (produto, login, painel) podem importar ./supabase.js direto.
export const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)

let loading
export const loadSupabase = () => (loading ||= import('./supabase.js').then(m => m.supabase))

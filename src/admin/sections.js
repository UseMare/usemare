import { FileText, House, LayoutDashboard, Mail, Package, PanelsTopLeft, Settings, Sparkles, Star, Tags } from 'lucide-react'

export const BASE = '/painel-loja'

// Todas as áreas do painel. `stage` = etapa do plano em que a tela fica pronta.
export const sections = {
  inicio:        { label: 'Início',          icon: LayoutDashboard, path: BASE,                          stage: 12, description: 'Resumo da loja: produtos, esgotados, avaliações pendentes e atalhos.' },
  produtos:      { label: 'Produtos',        icon: Package,         path: `${BASE}/produtos`,            stage: 4,  description: 'Lista de todas as peças, com busca, filtros, ordem, ocultar, esgotar, duplicar e excluir. Cadastro e edição completa com fotos.' },
  categorias:    { label: 'Categorias',      icon: Tags,            path: `${BASE}/categorias`,          stage: 7,  description: 'Criar, renomear, ordenar e ocultar categorias; imagem do card da página inicial e texto do banner.' },
  destaques:     { label: 'Destaques',       icon: Sparkles,        path: `${BASE}/destaques`,           stage: 8,  description: 'Escolher até 5 produtos para o card flutuante de destaques e a ordem deles.' },
  paginaInicial: { label: 'Página inicial',  icon: House,           path: `${BASE}/pagina-inicial`,      stage: 9,  description: 'Hero (fotos e textos), cards de categorias, banners e quadro de serviços.' },
  paginas:       { label: 'Textos das páginas', icon: FileText,     path: `${BASE}/paginas`,             stage: 10, description: 'Sobre nós, Como comprar, Envio, faixa de avisos do topo e textos do catálogo.' },
  avaliacoes:    { label: 'Avaliações',      icon: Star,            path: `${BASE}/avaliacoes`,          stage: 12, description: 'Aprovar ou recusar as avaliações que as clientes enviam.' },
  newsletter:    { label: 'Newsletter',      icon: Mail,            path: `${BASE}/newsletter`,          stage: 12, description: 'E-mails cadastrados no rodapé, com exportação.' },
  aparencia:     { label: 'Logo e rodapé',   icon: PanelsTopLeft,   path: `${BASE}/logo-e-rodape`,       stage: 11, description: 'Logotipo do site, textos do rodapé e redes sociais.' },
  configuracoes: { label: 'Configurações',   icon: Settings,        path: `${BASE}/configuracoes`,       stage: 11, description: 'WhatsApp da loja (atualiza todos os botões), Instagram e parcelamento.' },
}

export const navGroups = [
  { label: null,       items: ['inicio'] },
  { label: 'Loja',     items: ['produtos', 'categorias', 'destaques'] },
  { label: 'Site',     items: ['paginaInicial', 'paginas', 'aparencia'] },
  { label: 'Clientes', items: ['avaliacoes', 'newsletter'] },
  { label: 'Sistema',  items: ['configuracoes'] },
]

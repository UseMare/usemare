import { CircleHelp, FileText, Gift, House, LayoutDashboard, Mail, Package, PanelsTopLeft, Settings, Sparkles, Star, Tags, Users, Menu } from 'lucide-react'

export const BASE = '/painel-loja'

// Todas as áreas do painel. `stage` = etapa do plano em que a tela fica pronta.
export const sections = {
  inicio:        { label: 'Início',          icon: LayoutDashboard, path: BASE,                          stage: 12, description: 'Resumo da loja e atalhos.' },
  produtos:      { label: 'Produtos',        icon: Package,         path: `${BASE}/produtos`,            stage: 4,  description: 'Cadastrar, editar e organizar as peças.' },
  categorias:    { label: 'Categorias',      icon: Tags,            path: `${BASE}/categorias`,          stage: 7,  description: 'Coleções, tipos de peça e cards.' },
  destaques:     { label: 'Flutuantes',      icon: Sparkles,        path: `${BASE}/flutuantes`,          stage: 8,  description: 'Produtos do card flutuante.' },
  paginaInicial: { label: 'Página inicial',  icon: House,           path: `${BASE}/pagina-inicial`,      stage: 9,  description: 'Banner, vitrine e textos do Início.' },
  colecao:       { label: 'Coleção',         icon: Gift,            path: `${BASE}/colecao`,             stage: 11, description: 'Nome, textos e peças da coleção.' },
  menuSite:      { label: 'Menu do site',    icon: Menu,            path: `${BASE}/menu-do-site`,        stage: 11, description: 'Nomes das páginas no menu.' },
  paginas:       { label: 'Textos das páginas', icon: FileText,     path: `${BASE}/paginas`,             stage: 10, description: 'Sobre, catálogo, promoções e avisos.' },
  clientes:      { label: 'Clientes',        icon: Users,           path: `${BASE}/clientes`,            stage: 12, description: 'Contas e WhatsApp das clientes.' },
  avaliacoes:    { label: 'Avaliações',      icon: Star,            path: `${BASE}/avaliacoes`,          stage: 12, description: 'Aprovar ou recusar avaliações.' },
  newsletter:    { label: 'Newsletter',      icon: Mail,            path: `${BASE}/newsletter`,          stage: 12, description: 'E-mails inscritos no rodapé.' },
  aparencia:     { label: 'Logo e rodapé',   icon: PanelsTopLeft,   path: `${BASE}/logo-e-rodape`,       stage: 11, description: 'Logo, rodapé e redes sociais.' },
  configuracoes: { label: 'Configurações',   icon: Settings,        path: `${BASE}/configuracoes`,       stage: 11, description: 'WhatsApp, Instagram e parcelas.' },
  ajuda:         { label: 'Ajuda',           icon: CircleHelp,      path: `${BASE}/ajuda`,               stage: 13, description: 'Guia rápido do painel.' },
}

// Configurações fica fixo no rodapé do menu (ver AdminApp).
export const navGroups = [
  { label: null,       items: ['inicio'] },
  { label: 'Loja',     items: ['produtos', 'categorias', 'destaques'] },
  { label: 'Site',     items: ['paginaInicial', 'colecao', 'menuSite', 'paginas', 'aparencia'] },
  { label: 'Clientes', items: ['clientes', 'avaliacoes', 'newsletter'] },
]

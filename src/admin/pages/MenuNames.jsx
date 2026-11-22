import React from 'react'
import ContentEditor from '../components/ContentEditor.jsx'
import { menuDefaults } from '../../Layout.jsx'

// Menu do site: nomes dos itens do menu do topo (os endereços não mudam). Salvo em site_content 'menu'.
const schema = [
  { type: 'heading', label: 'Itens do menu do topo', text: 'Mude só o nome que aparece no menu (no computador e no celular).' },
  { key: 'inicio', label: 'Início (página inicial)', type: 'text', required: true, max: 24 },
  { key: 'produtos', label: 'Produtos (catálogo completo)', type: 'text', required: true, max: 24 },
  { key: 'colecao', label: 'Coleção (página da coleção do mês)', type: 'text', required: true, max: 24,
    hint: 'Ex.: Coleção Dezembro, Coleção Janeiro. O título grande, o texto e as peças dessa página ficam em Categorias → Coleção Dezembro.' },
  { key: 'promocoes', label: 'Promoções', type: 'text', required: true, max: 24 },
  { key: 'sobre', label: 'Sobre nós', type: 'text', required: true, max: 24 },
]

export default function MenuNames() {
  return <ContentEditor contentKey="menu" defaults={menuDefaults} schema={schema} previewUrl="/" saveLabel="Salvar menu"
    intro="Nomes das páginas no menu do topo do site." />
}

import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ContentEditor from '../components/ContentEditor.jsx'
import { useConfirm } from '../ui.jsx'
import { aboutDefaults, howtoDefaults } from '../../pages/About.jsx'
import { catalogDefaults } from '../../pages/Catalog.jsx'
import { promotionsDefaults } from '../../pages/Promotions.jsx'
import { announcementDefaults } from '../../Layout.jsx'
import { exchangeDefaults, legalPages, privacyDefaults, termsDefaults } from '../../pages/Legal.jsx'

// Textos das páginas: uma aba por página. Cada aba é um esquema de campos (ver ContentEditor).

const ENTER = 'Enter = quebra de linha.'
const TITLE_HINT = 'Enter = quebra de linha. A última linha aparece em itálico.'
const PORTRAIT = { aspect: 3 / 4, outputs: [{ width: 900, height: 1200, quality: 0.84 }], suffixes: [''] }
const LANDSCAPE = { aspect: 1525 / 1005, outputs: [{ width: 1525, height: 1005, quality: 0.84 }, { width: 800, height: 527, quality: 0.8 }], suffixes: ['', '800'] }

const tabs = [
  {
    key: 'sobre', label: 'Sobre nós', contentKey: 'about', defaults: aboutDefaults, previewUrl: '/sobre',
    intro: 'Página "Sobre nós" (/sobre). O quadro "Como comprar" fica na aba ao lado.',
    schema: [
      { type: 'heading', label: 'Topo da página' },
      { key: 'heroEyebrow', label: 'Texto pequeno (acima do título)', type: 'text', max: 60 },
      { key: 'heroTitle', label: 'Título', type: 'textarea', rows: 2, required: true, max: 80, hint: TITLE_HINT },
      { key: 'heroText', label: 'Texto', type: 'textarea', rows: 4, max: 400 },
      { key: 'mosaic', label: 'Fotos ao lado do título', type: 'list', min: 3, max: 3, itemLabel: 'Foto', columns: 3, hint: 'Três fotos em pé (3:4), sobrepostas.', item: [
        { key: 'image', label: 'Foto', type: 'image', required: true, image: PORTRAIT },
      ] },
      { key: 'mosaicScript', label: 'Frase em letra cursiva sobre as fotos', type: 'textarea', rows: 2, max: 40, hint: ENTER },
      { type: 'heading', label: 'Nossa história' },
      { key: 'quote', label: 'Frase em destaque (citação)', type: 'textarea', rows: 2, max: 200 },
      { key: 'story', label: 'Parágrafos', type: 'list', min: 1, max: 5, itemLabel: 'Parágrafo', addLabel: 'Adicionar parágrafo', item: [
        { key: 'text', label: 'Texto', type: 'textarea', rows: 4, required: true, max: 600 },
      ] },
      { key: 'signature', label: 'Assinatura', type: 'text', max: 80 },
      { key: 'signatureName', label: 'Nome na assinatura (em letra cursiva)', type: 'text', max: 30 },
      { type: 'heading', label: 'O que nos move', text: 'Os três quadros com ícone.' },
      { key: 'values', label: 'Quadros', type: 'list', min: 3, max: 3, itemLabel: 'Quadro', columns: 3, item: [
        { key: 'icon', label: 'Ícone', type: 'icon' },
        { key: 'title', label: 'Título', type: 'text', required: true, max: 40 },
        { key: 'text', label: 'Texto', type: 'textarea', rows: 3, required: true, max: 200 },
      ] },
      { type: 'heading', label: 'Nossas linhas', text: 'Os dois cards grandes com foto.' },
      { key: 'lines', label: 'Cards', type: 'list', min: 2, max: 2, itemLabel: 'Card', columns: 2, item: [
        { key: 'image', label: 'Imagem', type: 'image', required: true, image: LANDSCAPE, hint: 'O texto fica embaixo à esquerda, em branco: prefira fotos mais escuras nessa parte.' },
        { key: 'eyebrow', label: 'Texto pequeno', type: 'text', max: 40 },
        { key: 'title', label: 'Título', type: 'textarea', rows: 2, required: true, max: 60, hint: ENTER },
        { key: 'button', label: 'Texto do botão', type: 'text', max: 30 },
        { key: 'link', label: 'Para onde o card leva', type: 'link' },
      ] },
      { type: 'heading', label: 'Versículo' },
      { key: 'verse', label: 'Versículo (vazio = a faixa some)', type: 'textarea', rows: 2, max: 200, hint: ENTER },
      { key: 'verseRef', label: 'Referência', type: 'text', max: 40 },
      { type: 'heading', label: 'Comunidade (Instagram)' },
      { key: 'communityEyebrow', label: 'Texto pequeno', type: 'text', max: 60 },
      { key: 'communityTitle', label: 'Título', type: 'textarea', rows: 2, required: true, max: 80, hint: ENTER },
      { key: 'communityText', label: 'Texto', type: 'textarea', rows: 3, max: 300 },
      { type: 'heading', label: 'Cartão do perfil do Instagram', text: 'Retrato do perfil. Atualize os números de vez em quando.' },
      { key: 'igStats', label: 'Números', type: 'list', min: 3, max: 3, itemLabel: 'Número', columns: 3, item: [
        { key: 'value', label: 'Valor', type: 'text', required: true, max: 10 },
        { key: 'label', label: 'Legenda', type: 'text', required: true, max: 20 },
      ] },
      { key: 'igName', label: 'Nome em negrito na bio', type: 'text', max: 60 },
      { key: 'igBio', label: 'Linhas da bio', type: 'list', min: 0, max: 5, itemLabel: 'Linha', addLabel: 'Adicionar linha', item: [
        { key: 'text', label: 'Texto', type: 'text', required: true, max: 80 },
      ] },
    ],
  },
  {
    key: 'como-comprar', label: 'Como comprar', contentKey: 'howto', defaults: howtoDefaults, previewUrl: '/sobre#como-comprar',
    intro: 'Quadro "Como comprar na Maré" (na página Sobre; o link "Como comprar" do rodapé leva até ele).',
    schema: [
      { key: 'eyebrow', label: 'Texto pequeno', type: 'text', max: 60 },
      { key: 'title', label: 'Título', type: 'text', required: true, max: 60 },
      { key: 'steps', label: 'Passos', type: 'list', min: 3, max: 3, itemLabel: 'Passo', columns: 3, item: [
        { key: 'icon', label: 'Ícone', type: 'icon' },
        { key: 'title', label: 'Título', type: 'text', required: true, max: 40 },
        { key: 'text', label: 'Texto', type: 'textarea', rows: 3, required: true, max: 200 },
      ] },
    ],
  },
  {
    key: 'catalogo', label: 'Catálogo', contentKey: 'catalog', defaults: catalogDefaults, previewUrl: '/produtos',
    intro: 'Topo da página de produtos em "Todos". Cada categoria pode ter o próprio texto (Categorias → editar → Banner).',
    schema: [
      { key: 'eyebrow', label: 'Texto pequeno', type: 'text', max: 60 },
      { key: 'title', label: 'Título', type: 'textarea', rows: 2, required: true, max: 80, hint: TITLE_HINT },
      { key: 'text', label: 'Texto', type: 'textarea', rows: 3, max: 300 },
      { key: 'script', label: 'Frase em letra cursiva (ao lado das fotos)', type: 'text', max: 30 },
      { key: 'shippingBadge', label: 'Selo de envio', type: 'text', max: 40 },
      { key: 'whatsappBadge', label: 'Selo do WhatsApp', type: 'text', max: 40 },
    ],
  },
  {
    key: 'promocoes', label: 'Promoções', contentKey: 'promotions', defaults: promotionsDefaults, previewUrl: '/promocoes',
    intro: 'Página de promoções. As peças aparecem sozinhas quando têm "preço antigo" no cadastro.',
    schema: [
      { key: 'eyebrow', label: 'Texto pequeno', type: 'text', max: 60 },
      { key: 'title', label: 'Título', type: 'textarea', rows: 2, required: true, max: 80, hint: TITLE_HINT },
      { key: 'text', label: 'Texto', type: 'textarea', rows: 3, max: 300 },
      { key: 'images', label: 'Fotos (estilo polaroide)', type: 'list', min: 3, max: 3, itemLabel: 'Foto', columns: 3, item: [
        { key: 'image', label: 'Foto', type: 'image', required: true, image: PORTRAIT },
      ] },
      { type: 'heading', label: 'Quando não há peças em promoção' },
      { key: 'emptyTitle', label: 'Título', type: 'text', required: true, max: 60 },
      { key: 'emptyText', label: 'Texto', type: 'textarea', rows: 3, max: 300 },
      { key: 'suggestionsTitle', label: 'Título das sugestões no fim da página', type: 'text', required: true, max: 60 },
    ],
  },
  {
    key: 'faixa', label: 'Faixa do topo', contentKey: 'announcement', defaults: announcementDefaults, previewUrl: '/',
    intro: 'Faixa fina acima do menu, em todas as páginas. No celular só o primeiro aviso aparece.',
    schema: [
      { key: 'items', label: 'Avisos', type: 'list', min: 1, max: 4, itemLabel: 'Aviso', addLabel: 'Adicionar aviso', columns: 3,
        hint: 'Use {parcelas} para o número de parcelas das Configurações (ex.: "Parcele em até {parcelas}x sem juros").', item: [
          { key: 'icon', label: 'Ícone', type: 'icon' },
          { key: 'text', label: 'Texto', type: 'text', required: true, max: 50 },
          { key: 'link', label: 'Link (opcional)', type: 'link', allowNone: true },
        ] },
    ],
  },
  ...[
    { key: 'privacidade', contentKey: 'legal_privacidade', defaults: privacyDefaults },
    { key: 'trocas', contentKey: 'legal_trocas', defaults: exchangeDefaults },
    { key: 'termos', contentKey: 'legal_termos', defaults: termsDefaults },
  ].map(t => {
    const page = legalPages.find(p => p.contentKey === t.contentKey)
    return {
      ...t, label: page.label, previewUrl: page.path,
      intro: `Página "${page.label}" (${page.path}). O link fica só no rodapé, na linha de baixo. Ao mudar regras, atualize também a data.`,
      schema: [
        { key: 'title', label: 'Título', type: 'text', required: true, max: 60 },
        { key: 'updated', label: 'Atualizada em', type: 'text', max: 40, hint: 'Ex.: 22 de novembro de 2026.' },
        { key: 'intro', label: 'Introdução', type: 'textarea', rows: 4, max: 800 },
        { key: 'sections', label: 'Seções', type: 'list', min: 1, max: 15, itemLabel: 'Seção', addLabel: 'Adicionar seção',
          hint: 'Linha em branco separa parágrafos. Comece a linha com "- " para virar item de lista.', item: [
            { key: 'title', label: 'Título da seção', type: 'text', required: true, max: 80 },
            { key: 'text', label: 'Texto', type: 'textarea', rows: 8, required: true, max: 3000 },
          ] },
      ],
    }
  }),
]

export default function PageTexts() {
  const [params, setParams] = useSearchParams()
  const confirm = useConfirm()
  const [dirty, setDirty] = useState(false)
  const current = tabs.find(t => t.key === params.get('aba')) || tabs[0]

  const open = async tab => {
    if (tab.key === current.key) return
    if (dirty && !(await confirm({ title: 'Trocar de aba sem salvar?', text: 'As alterações desta aba ainda não foram salvas e serão perdidas.', confirmLabel: 'Trocar sem salvar', cancelLabel: 'Continuar editando', danger: true }))) return
    setDirty(false)
    setParams({ aba: tab.key })
  }

  return (
    <>
      <nav className="adm-tabs" aria-label="Páginas">
        {tabs.map(tab => (
          <button key={tab.key} type="button" className={tab.key === current.key ? 'active' : ''} aria-current={tab.key === current.key ? 'page' : undefined} onClick={() => open(tab)}>{tab.label}</button>
        ))}
      </nav>
      <ContentEditor key={current.key} contentKey={current.contentKey} defaults={current.defaults} schema={current.schema}
        intro={current.intro} previewUrl={current.previewUrl} saveLabel="Salvar textos" onDirtyChange={setDirty} />
    </>
  )
}

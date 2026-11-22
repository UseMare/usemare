// Páginas institucionais (links só no rodapé). Fica num arquivo próprio e pequeno para o rodapé
// não carregar a página inteira de políticas (src/pages/Legal.jsx), que só baixa quando aberta.
export const legalPages = [
  { path: '/politica-de-privacidade', label: 'Política de Privacidade', contentKey: 'legal_privacidade' },
  { path: '/trocas-e-devolucoes', label: 'Trocas e Devoluções', contentKey: 'legal_trocas' },
  { path: '/termos-de-uso', label: 'Termos de Uso', contentKey: 'legal_termos' },
]

// Textos e imagens editáveis do site (tabela public.site_content, editada no painel).
// Cada seção do site tem o seu texto padrão no código; o que vier do banco substitui
// só os campos preenchidos. Assim, se o banco estiver fora do ar, o site continua igual.

const content = {}

export function setContent(map) {
  Object.keys(content).forEach(key => delete content[key])
  Object.assign(content, map || {})
}

const isEmpty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)

// Textos das páginas (Sobre, Como comprar, Catálogo, Promoções, faixa do topo):
// tudo o que foi salvo vale como está — inclusive campo vazio, que some do site.
// O painel não deixa salvar vazio um campo obrigatório. Campo nunca salvo = padrão do código.
export function pageContent(key, defaults) {
  const saved = content[key] || {}
  const result = { ...defaults }
  Object.keys(defaults).forEach(field => { if (saved[field] !== undefined && saved[field] !== null) result[field] = saved[field] })
  return result
}

// O que foi salvo no painel para uma seção, sem misturar com o padrão (quem chama decide).
export const savedContent = key => content[key] || {}

// Mistura o padrão com o que foi salvo no painel (campo vazio = usa o padrão).
export function getContent(key, defaults) {
  const saved = content[key] || {}
  const result = { ...defaults }
  Object.entries(saved).forEach(([field, value]) => { if (!isEmpty(value)) result[field] = value })
  return result
}

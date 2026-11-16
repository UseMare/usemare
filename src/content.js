// Textos e imagens editáveis do site (tabela public.site_content, editada no painel).
// Cada seção do site tem o seu texto padrão no código; o que vier do banco substitui
// só os campos preenchidos. Assim, se o banco estiver fora do ar, o site continua igual.

const content = {}

export function setContent(map) {
  Object.keys(content).forEach(key => delete content[key])
  Object.assign(content, map || {})
}

const isEmpty = value => value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)

// Mistura o padrão com o que foi salvo no painel (campo vazio = usa o padrão).
export function getContent(key, defaults) {
  const saved = content[key] || {}
  const result = { ...defaults }
  Object.entries(saved).forEach(([field, value]) => { if (!isEmpty(value)) result[field] = value })
  return result
}

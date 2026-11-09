import { spotlightIds, store } from './store.js'

// Catálogo inicial da Maré — usado quando o Supabase está fora do ar e como base do seed do banco.
// A fonte oficial agora é a tabela public.products no Supabase (edite por lá).
// As fotos ficam em /public/img/produtos/ (geradas a partir de assets/.../PRODUTOS INICIAIS/#{id}):
//   {id}-{nº}.webp      → 1000px, usada na janela do produto
//   {id}-{nº}-480.webp  → 480px, usada nos cards
// Descrições escritas no tom da cliente (Instagram @uusemaree.br): parágrafos curtos, emojis, fecho com chamada.
// ATENÇÃO: os preços abaixo são provisórios — confirmar com a loja antes de publicar.
// Peça esgotada: adicione `available: false` — ela continua no site (coerente com o Instagram),
// aparece com selo "Esgotado", vai para o fim da lista e não pode ser comprada.
// Promoção: adicione `oldPrice: 119.9` (preço antigo) — a peça aparece riscada e entra na página Promoções.
// type: conjunto | vestido | blusa | saia | calca | suplemento
// line: fitness (Maré Move) | casual (Moda feminina) | suplementos
// Suplementos usam `flavors` (sabores), `size`, `usage` (modo de uso) e `notice` (aviso) no lugar de cor/tamanho.

const photos = (id, count) =>
  Array.from({ length: count }, (_, i) => `/img/produtos/${id}-${String(i + 1).padStart(2, '0')}.webp`)

const thumbOf = photo => photo.replace(/\.webp$/, '-480.webp')

const installments = (price, times = 6) =>
  `${times}x de R$ ${(price / times).toFixed(2).replace('.', ',')}`

const formatPrice = price => `R$ ${price.toFixed(2).replace('.', ',')}`

const SUPP_NOTICE = "Suplemento alimentar. Não substitui uma alimentação equilibrada e hábitos de vida saudáveis. Gestantes, lactantes, crianças, pessoas em uso de medicamentos (como antidepressivos) ou com alguma condição de saúde devem consultar um médico ou nutricionista antes do consumo. Confira a composição completa no rótulo."

const catalog = [
  {
    id: '01',
    type: 'conjunto',
    color: 'Vinho',
    swatch: '#7b2233',
    name: 'Conjunto Maré Move Vinho',
    line: 'fitness',
    category: 'Maré Move · Conjuntos fitness',
    price: 89.9,
    description: `Treino com elegância? A gente ama! 🍷✨

Blusa de manga curta com modelagem ajustadinha e short de cintura alta com costuras que valorizam o corpo. O vinho é aquele tom que deixa qualquer treino mais chique — e ainda fica lindo com jaqueta no pós-academia.

Com o bordado Maré no peito, do jeitinho que você merece. 🤎

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('01', 4),
  },
  {
    id: '02',
    type: 'conjunto',
    color: 'Verde-oliva',
    swatch: '#5b5f2e',
    name: 'Conjunto Maré Move Verde',
    line: 'fitness',
    category: 'Maré Move · Conjuntos fitness',
    price: 89.9,
    description: `💚 O seu novo pré-treino favorito chegou.

O conjunto verde da Maré Move une conforto, segurança e aquele caimento que faz você se sentir ainda mais linda para treinar. ✨

Regata com costas livres e short de cintura alta com bolsinho lateral para o celular ou a chave — porque detalhe faz toda a diferença.

Pra começar o treino se sentindo bem, confiante e pronta pra tudo. 🌊

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('02', 4),
  },
  {
    id: '03',
    type: 'conjunto',
    color: 'Amarelo',
    swatch: '#efdc86',
    name: 'Conjunto Maré Move Amarelo',
    line: 'fitness',
    category: 'Maré Move · Conjuntos fitness',
    price: 89.9,
    description: `☀️ Um solzinho pro seu treino!

Regata cavada de gola alta e short de cós largo, os dois com o bordado Maré em tom sobre tom. O amarelo suave deixa tudo mais leve — do alongamento à caminhada no fim de tarde.

Daquelas peças que você veste e já sai sorrindo. 🥹✨

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('03', 4),
  },
  {
    id: '04',
    type: 'vestido',
    color: 'Azul e branco',
    swatch: 'linear-gradient(135deg,#2b56c4 50%,#fff 50%)',
    name: 'Vestido Longo Azulejo',
    line: 'casual',
    category: 'Moda feminina',
    price: 159.9,
    description: `🌊 Leve, fresco e impossível de passar despercebido.

Tomara que caia com busto franzido em lastex, que acompanha o corpo com conforto, e estampa em azul e branco inspirada em azulejos, com flores e passarinhos. A saia ampla em camadas ganha movimento a cada passo. 💙

Perfeito para dias de sol, viagens e aquele almoço especial.

Seja sempre sua melhor escolha. ✨`,
    photos: photos('04', 4),
  },
  {
    id: '05',
    type: 'vestido',
    color: 'Salmão',
    swatch: '#e3a487',
    name: 'Vestido Babado Salmão',
    line: 'casual',
    category: 'Moda feminina',
    price: 119.9,
    description: `Delicado na medida certa. 🌷

Ombros estruturados, cintura marcadinha com faixa transpassada e babado na barra que dá aquele balanço lindo ao andar. O tom salmão ilumina a pele e deixa o look romântico sem esforço.

Do almoço de domingo ao fim de tarde com as amigas. 🤎

Chama a Maré e garanta o seu! 🛍️`,
    photos: photos('05', 4),
  },
  {
    id: '06',
    type: 'saia',
    color: 'Cru',
    swatch: '#e6dccb',
    name: 'Saia Longa Linho Cru',
    line: 'casual',
    category: 'Saias & calças',
    price: 99.9,
    description: `Elegância que nasce do simples. 🤍

Saia longa de cintura alta com botõezinhos na frente e fenda que dá liberdade a cada passo. O tecido com aparência de linho, em tom cru, cai leve e fluido.

Combina com regata, body ou camisa — e te deixa pronta pra qualquer ocasião. ✨

É sobre nunca se esquecer que você merece muito. 🌊`,
    photos: photos('06', 4),
  },
  {
    id: '07',
    type: 'blusa',
    color: 'Off-white',
    swatch: '#f4efe6',
    name: 'Blusa Flora',
    line: 'casual',
    category: 'Blusas',
    price: 49.9,
    description: `✨ Chegou aquele detalhe que faz toda a diferença! 🌷🤎

Blusa off-white de golinha alta e manga curta em tecido texturizado, com aplicação de flor em crochê que traz um toque delicado, romântico e super exclusivo para o look.

Daquelas peças que você olha e pensa: “preciso dessa!” 🥹✨

Chama a Maré e garanta a sua! 🛍️`,
    photos: photos('07', 4),
  },
  {
    id: '08',
    type: 'vestido',
    color: 'Nude',
    swatch: '#d2b394',
    name: 'Vestido Midi Canelado Nude',
    line: 'casual',
    category: 'Moda feminina',
    price: 129.9,
    description: `Para as noites em que você quer ser lembrada. ✨

Vestido midi de um ombro só em malha canelada, com faixa transpassada na cintura presa por uma fivela dourada e fenda lateral. Ajusta sem apertar e valoriza cada curva com elegância.

Jantar, aniversário, ocasião especial… ele resolve. 🤎

Vista-se com confiança. Vista sua melhor versão.`,
    photos: photos('08', 4),
  },
  {
    id: '09',
    type: 'vestido',
    color: 'Azul-céu',
    swatch: '#9cbde6',
    name: 'Vestido Babados Azul Céu',
    line: 'casual',
    category: 'Moda feminina',
    price: 119.9,
    description: `Um pedacinho de céu pra você vestir. 💙☁️

Vestido de alcinhas com decote reto e saia em camadas de babados que dançam a cada passo. O azul clarinho e o tecido leve trazem frescor para os dias quentes.

Passeio, festinha de dia ou aquele domingo especial — ele vai com você. ✨

Chama a Maré e garanta o seu! 🛍️`,
    photos: photos('09', 4),
  },
  {
    id: '10',
    type: 'blusa',
    color: 'Off-white',
    swatch: '#f4efe6',
    name: 'Regata Nina',
    line: 'casual',
    category: 'Blusas',
    price: 45.9,
    description: `O básico que não tem nada de básico. 🤍

Regata off-white em malha canelada com recorte vazado no ombro e um detalhe dourado que eleva qualquer look. Fica linda com short de alfaiataria, calça ou saia.

Peça coringa pra ter no guarda-roupa e usar sem medo de repetir. ✨

Seja sempre sua melhor escolha.`,
    photos: photos('10', 4),
  },
  {
    id: '11',
    type: 'blusa',
    color: 'Preto',
    swatch: '#1f1c1c',
    name: 'Blusa Layla',
    line: 'casual',
    category: 'Blusas',
    price: 39.9,
    description: `Confortável, soltinha e cheia de charme. 🖤

Blusa preta de manga curta com barra em tule sobreposto, que traz um toque romântico ao visual. Vai bem com calça de alfaiataria, jeans ou saia.

Daquelas que você coloca e já se sente pronta. ✨

Chama a Maré e garanta a sua! 🛍️`,
    photos: photos('11', 2),
  },
  {
    id: '12',
    type: 'blusa',
    color: 'Nude',
    swatch: '#d2b394',
    name: 'Blusa Aurora',
    line: 'casual',
    category: 'Blusas',
    price: 59.9,
    description: `Elegância, personalidade e propósito em cada detalhe. 🌊🤎

Blusa nude de um ombro com franzido preso por aplique dourado e alça com lacinho no outro ombro. Delicada e marcante ao mesmo tempo — fica perfeita com short de alfaiataria e cinto.

Ela vestiu Maré e entregou tudo. ✨`,
    photos: photos('12', 4),
  },
  {
    id: '13',
    type: 'suplemento',
    color: null,
    swatch: null,
    name: 'Life Slim Lifemore',
    brand: 'Lifemore',
    line: 'suplementos',
    category: 'Suplementos · Lifemore',
    price: 119.9,
    flavors: ['Maçã Verde', 'Frutas Vermelhas', 'Citrus Fresh'],
    size: 'Pote de 210 g',
    usage: 'Misture 1 dosador (7 g) em 100 a 200 ml de água, de preferência pela manhã, e consuma logo após o preparo.',
    notice: SUPP_NOTICE,
    description: `💙 Seu momento de cuidado é na Maré! ✨

O Life Slim, da Lifemore, é um suplemento alimentar em pó termogênico e diurético, para quem quer conhecer melhor essa opção e incluir novos hábitos na rotina. Adoçado com stevia, vira um drink refrescante em segundos.

Disponível nos sabores Maçã Verde, Frutas Vermelhas e Citrus Fresh — pote de 210 g.

Chama a Maré e escolha o seu sabor! 🛍️`,
    photos: photos('13', 3),
  },
  {
    id: '14',
    type: 'suplemento',
    color: null,
    swatch: null,
    name: 'Life Creatina + Beauty Lifemore',
    brand: 'Lifemore',
    line: 'suplementos',
    category: 'Suplementos · Lifemore',
    price: 139.9,
    flavors: ['Frutas Vermelhas'],
    size: 'Pote de 240 g',
    usage: 'Misture 1 dosador (8 g) em 150 ml de água ou leite.',
    notice: SUPP_NOTICE,
    description: `💗 Força e beleza no mesmo copo!

O Life Creatina + Beauty, da Lifemore, é creatina para complementar a rotina de quem busca suporte para o desempenho muscular, aliada à proposta Beauty: na fórmula, colágeno hidrolisado, ácido hialurônico, biotina e zinco.

Sabor Frutas Vermelhas — pote de 240 g. ✨

Seu momento de cuidado é na Maré! Chama a gente e garanta o seu. 🛍️`,
    photos: photos('14', 2),
  },
]

const slugify = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Completa os campos calculados (slug, preços formatados, miniaturas…).
// Serve tanto para o catálogo local acima quanto para o que vem do Supabase (src/data.js).
const enrich = product => ({
  ...product,
  slug: product.slug || slugify(product.name),
  oldPriceLabel: product.oldPrice ? formatPrice(product.oldPrice) : null,
  available: product.available !== false,
  spotlight: product.spotlight ?? spotlightIds.includes(product.id),
  thumbs: product.thumbs || product.photos.map(thumbOf),
  priceLabel: formatPrice(product.price),
  installments: installments(product.price, store.installments),
})

// disponíveis primeiro, esgotadas no fim (mantendo a ordem do catálogo)
const availableFirst = list => list.sort((a, b) => Number(b.available) - Number(a.available))

// Lista viva: setProducts() troca o conteúdo sem trocar o array, então todo o site enxerga a versão nova.
export const products = availableFirst(catalog.map(enrich))

export function setProducts(list) {
  if (!list?.length) return
  products.splice(0, products.length, ...availableFirst(list.map(enrich)))
}

// ---------- Categorias usadas no menu, nos chips e nos filtros ----------
export const typeLabels = { conjunto: 'Conjuntos', vestido: 'Vestidos', blusa: 'Blusas', saia: 'Saias & calças', calca: 'Saias & calças', suplemento: 'Suplementos' }

export const lineInfo = {
  fitness: { label: 'Maré Move', key: 'mare-move' },
  casual: { label: 'Moda feminina', key: 'moda-feminina' },
  suplementos: { label: 'Suplementos', key: 'suplementos' },
}

export const collections = [
  { key: 'todos', label: 'Todos', test: () => true },
  { key: 'mare-move', label: 'Maré Move', test: p => p.line === 'fitness' },
  { key: 'moda-feminina', label: 'Moda feminina', test: p => p.line === 'casual' },
  { key: 'vestidos', label: 'Vestidos', test: p => p.type === 'vestido' },
  { key: 'blusas', label: 'Blusas', test: p => p.type === 'blusa' },
  { key: 'saias-calcas', label: 'Saias & calças', test: p => p.type === 'saia' || p.type === 'calca' },
  { key: 'conjuntos', label: 'Conjuntos', test: p => p.type === 'conjunto' },
  { key: 'suplementos', label: 'Suplementos', test: p => p.type === 'suplemento' },
]

export const findProduct = slug => products.find(product => product.slug === slug)

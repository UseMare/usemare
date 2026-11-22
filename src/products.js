import { store } from './store.js'

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
// type: conjunto | macaquinho | vestido | blusa | saia | calca | short | suplemento
// line: fitness (Maré Move) | casual (Moda feminina) | suplementos
// Suplementos usam `flavors` (sabores), `size`, `usage` (modo de uso) e `notice` (aviso) no lugar de cor/tamanho.

const photos = (id, count) =>
  Array.from({ length: count }, (_, i) => `/img/produtos/${id}-${String(i + 1).padStart(2, '0')}.webp`)

const thumbOf = photo => photo.replace(/\.webp$/, '-480.webp')

// Parcelas (Configurações do painel). 1 = só à vista: não mostra parcela.
const installments = (price, times = 6) => times > 1
  ? `${times}x de R$ ${(price / times).toFixed(2).replace(".", ",")}`
  : null

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
  {
    id: '15',
    type: 'calca',
    color: "Chocolate, preto e cinza",
    swatch: 'linear-gradient(135deg,#4a2c22 33%,#1d1d1d 33% 66%,#6e6e72 66%)',
    name: "Calça Alfaiataria Helena",
    line: 'casual',
    category: "Saias, calças & shorts",
    price: 129.9,
    description: `Elegância que acompanha o seu dia inteiro. 🤎

Calça de alfaiataria de cintura alta, com pregas frontais, bolsos laterais e cinto com fivela dourada que já vem junto e finaliza o look. A modelagem reta alonga a silhueta e cai bem do trabalho ao jantar.

Disponível em chocolate, preto e cinza: difícil escolher uma só. ✨

Chama a Maré e garanta a sua! 🛍️`,
    photos: photos('15', 5),
  },
  {
    id: '16',
    type: 'macaquinho',
    color: "Azul royal",
    swatch: '#1f5fd6',
    name: "Macaquinho Maré Move Azul Royal",
    line: 'fitness',
    category: "Maré Move · Macaquinhos",
    price: 99.9,
    description: `💙 Um azul que ninguém esquece.

Macaquinho de alcinhas finas com decote reto e costas abertas com tirinha, que valoriza as costas e deixa o treino mais fresquinho. A modelagem ajustada abraça o corpo e as costuras desenham a silhueta.

Uma peça só, look pronto: é vestir e ir. 🌊

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('16', 4),
  },
  {
    id: '17',
    type: 'macaquinho',
    color: "Vermelho",
    swatch: '#e0352b',
    name: "Macaquinho Maré Move Vermelho Retrô",
    line: 'fitness',
    category: "Maré Move · Macaquinhos",
    price: 99.9,
    description: `❤️ Ousado na medida certa.

Macaquinho de manguinha curta, com decote arredondado e recorte nas costas, todo acabado com viés branco que traz um charme retrô. Ajustado no corpo, ele valoriza cada curva.

Para treinar e para ser vista. 🔥✨

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('17', 4),
  },
  {
    id: '18',
    type: 'vestido',
    color: "Azul bebê",
    swatch: '#a9cdee',
    name: "Vestido Maré Move Azul Bebê",
    line: 'fitness',
    category: "Maré Move · Vestidos fitness",
    price: 109.9,
    description: `🎾 Esportivo, leve e cheio de charme.

Vestido fitness de regata cavada, com recortes que marcam a cintura e barra arredondada que balança a cada movimento. O azul bebê deixa o look delicado, do treino ao passeio.

Prático como deve ser e lindo como você merece. 🩵

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('18', 3),
  },
  {
    id: '19',
    type: 'short',
    color: "Verde menta",
    swatch: '#bfe3d6',
    name: "Short Alfaiataria Menta",
    line: 'casual',
    category: "Saias, calças & shorts",
    price: 79.9,
    description: `🍃 Frescor para os dias de sol.

Short de alfaiataria de cintura alta, com bolsos frontais, botão dourado e cinto nude que já vem junto. O verde menta é tendência e combina com tudo, de regata básica a camisa.

Leve, chique e confortável. ✨

Chama a Maré e garanta o seu! 🛍️`,
    photos: photos('19', 2),
  },
  {
    id: '20',
    type: 'macaquinho',
    color: "Rosa",
    swatch: '#f08cc0',
    name: "Macaquinho Maré Move Rosa Candy",
    line: 'fitness',
    category: "Maré Move · Macaquinhos",
    price: 99.9,
    description: `🩷 Doce, mas com atitude.

Macaquinho rosa de alcinhas com costas bem abertas, contornado por viés azul bebê que cria aquele contraste fofo. Ajustadinho no corpo, valoriza a silhueta do jeito certo.

Para quem treina com estilo e não abre mão de cor. 🌸✨

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('20', 2),
  },
  {
    id: '21',
    type: 'conjunto',
    color: "Café",
    swatch: '#5a2e22',
    name: "Conjunto Maré Move Café",
    line: 'fitness',
    category: "Maré Move · Conjuntos fitness",
    price: 89.9,
    description: `☕ Tons terrosos que nunca saem de moda.

Regata cropped de gola alta e short soltinho de cós largo com barra arredondada, que dá liberdade total nos movimentos. O marrom café é elegante, combina com tudo e fica lindo com uma faixa no cabelo.

Do treino ao café pós-academia. 🤎

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('21', 2),
  },
  {
    id: '22',
    type: 'conjunto',
    color: "Verde musgo",
    swatch: '#7c8a4a',
    name: "Conjunto Maré Move Musgo",
    line: 'fitness',
    category: "Maré Move · Conjuntos fitness",
    price: 89.9,
    description: `🌿 Leveza para o seu dia a dia.

Regata cropped com forro em tom rosé e short de cós com elástico, soltinho e confortável. O verde musgo traz um ar natural e sofisticado para o look.

Para treinar, caminhar ou curtir o fim de semana. ✨

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('22', 2),
  },
  {
    id: '23',
    type: 'conjunto',
    color: "Magenta",
    swatch: '#c21fb8',
    name: "Conjunto Maré Move Magenta",
    line: 'fitness',
    category: "Maré Move · Conjuntos fitness",
    price: 89.9,
    description: `💜 Energia para o seu treino!

Regata de gola alta e short soltinho de cós largo, no mesmo modelo queridinho do conjunto Café. Agora no magenta vibrante, que ilumina a pele e levanta o astral.

Combina com faixa no cabelo e muito sorriso. 😍✨

MARÉ MOVE — seu movimento, sua melhor versão.`,
    photos: photos('23', 2),
  },
]

const slugify = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// ---------- Categorias ----------
// A fonte oficial é a tabela public.categories no Supabase (editada no painel /painel-loja).
// Esta cópia local só é usada se o banco estiver fora do ar.
//   kind 'colecao' → linha da loja (selo e caminho da página do produto)
//   kind 'tipo'    → tipo de peça (filtro "Tipo de peça")
const localCategories = [
  { slug: 'mare-move', name: 'Maré Move', kind: 'colecao', home_card: true, home_card_order: 1, home_title: 'Conjuntos\nFitness', home_image: '/img/banners/conjuntos-fitness.webp', home_tone: 'light', banner_eyebrow: 'Maré Move', banner_title: 'Seu movimento,\nsua melhor versão.', banner_text: 'Conjuntos que unem conforto, segurança e aquele caimento que faz você se sentir linda para treinar.' },
  { slug: 'moda-feminina', name: 'Moda feminina', kind: 'colecao', home_card: true, home_card_order: 2, home_title: 'Moda\nFeminina', home_image: '/img/banners/moda-feminina.webp', home_tone: 'light', banner_eyebrow: 'Moda feminina', banner_title: 'Leve, feminina\ne do seu jeito.', banner_text: 'Peças escolhidas para trazer mais estilo para os seus dias — daquelas que você veste e se sente linda.' },
  { slug: 'vestidos', name: 'Vestidos', kind: 'tipo' },
  { slug: 'blusas', name: 'Blusas', kind: 'tipo', home_card: true, home_card_order: 3, home_title: 'Blusas', home_image: '/img/banners/blusas.webp', home_tone: 'dark', banner_eyebrow: 'Blusas', banner_title: 'O básico que não\ntem nada de básico.', banner_text: 'Detalhes que fazem toda a diferença no look do dia a dia.' },
  { slug: 'saias-calcas', name: 'Saias, calças & shorts', kind: 'tipo', home_card: true, home_card_order: 4, home_title: 'Saias &\nCalças', home_image: '/img/banners/saias-calcas.webp', home_tone: 'dark', banner_eyebrow: 'Saias, calças & shorts', banner_title: 'Elegância que\nnasce do simples.', banner_text: 'Modelagens que acompanham você do trabalho ao fim de semana.' },
  { slug: 'conjuntos', name: 'Conjuntos', kind: 'tipo' },
  { slug: 'macaquinhos', name: 'Macaquinhos', kind: 'tipo', banner_eyebrow: 'Macaquinhos', banner_title: 'Uma peça só,\nlook pronto.', banner_text: 'Macaquinhos Maré Move que abraçam o corpo e acompanham cada movimento.' },
  { slug: 'suplementos', name: 'Suplementos', kind: 'colecao', banner_eyebrow: 'Suplementos', banner_title: 'Seu momento de\ncuidado é na Maré.', banner_text: 'Opções para complementar a sua rotina, escolhidas com o mesmo carinho das nossas peças.' },
].map((c, i) => ({ id: c.slug, active: true, sort_order: (i + 1) * 10, home_card: false, home_card_order: 0, home_tone: 'light', ...c }))

// Catálogo local (sem banco): deduz as categorias pela linha e pelo tipo antigos.
const localCategorySlugs = product => {
  const line = { fitness: 'mare-move', casual: 'moda-feminina', suplementos: 'suplementos' }[product.line]
  const type = { vestido: 'vestidos', blusa: 'blusas', saia: 'saias-calcas', calca: 'saias-calcas', short: 'saias-calcas', conjunto: 'conjuntos', macaquinho: 'macaquinhos' }[product.type]
  return [line, type].filter(Boolean)
}

// Lista viva de categorias (setCategories troca o conteúdo sem trocar o array).
export const categories = [...localCategories]
const bySort = (a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name, 'pt-BR')
export const categoryBySlug = slug => categories.find(c => c.slug === slug)

// Chips do catálogo: "Todos" + categorias ativas.
export const collections = []
const rebuildCollections = () => {
  const list = categories.filter(c => c.active).sort(bySort).map(c => ({ key: c.slug, label: c.name, test: p => p.categorySlugs.includes(c.slug) }))
  collections.splice(0, collections.length, { key: 'todos', label: 'Todos', test: () => true }, ...list)
}

// Coleção (linha) e tipo de uma peça, pela ordem das categorias.
const firstOfKind = (product, kind) => categories.filter(c => c.kind === kind && c.active && product.categorySlugs.includes(c.slug)).sort(bySort)[0]
export const productCollection = product => firstOfKind(product, 'colecao')
export const productTypeName = product => firstOfKind(product, 'tipo')?.name || (product.kind === 'suplemento' ? 'Suplementos' : 'Peças')
export const collectionLabel = product => productCollection(product)?.name || 'Produtos'
export const collectionLink = product => `/produtos?categoria=${productCollection(product)?.slug || ''}`

// Completa os campos calculados (slug, preços formatados, miniaturas, cores, tamanhos…).
// Serve tanto para o catálogo local acima quanto para o que vem do Supabase (src/data.js).
const enrich = product => {
  const kind = product.kind || (product.type === 'suplemento' ? 'suplemento' : 'roupa')
  const colors = product.colors?.length ? product.colors : product.color ? [{ name: product.color, hex: product.swatch || '#cccccc' }] : []
  return {
    ...product,
    kind,
    colors,
    color: colors[0]?.name || null, // compatibilidade: primeira cor
    swatch: colors[0]?.hex || null,
    sizes: product.sizes ?? (kind === 'roupa' ? ['P', 'M', 'G'] : []),
    details: product.details || [],
    categorySlugs: product.categorySlugs || localCategorySlugs(product),
    slug: product.slug || slugify(product.name),
    oldPriceLabel: product.oldPrice ? formatPrice(product.oldPrice) : null,
    available: product.available !== false,
    thumbs: product.thumbs || product.photos.map(thumbOf),
    priceLabel: formatPrice(product.price),
    installments: installments(product.price, store.installments),
  }
}

// Lista viva: setProducts() troca o conteúdo sem trocar o array, então todo o site enxerga a versão nova.
// Indisponíveis ficam na mesma posição da lista do painel (não vão para o fim).
export const products = catalog.map(enrich)
rebuildCollections()

export function setProducts(list) {
  if (!list?.length) return
  products.splice(0, products.length, ...list.map(enrich))
}

export function setCategories(list) {
  if (!list?.length) return
  categories.splice(0, categories.length, ...list)
  rebuildCollections()
}

// Destaques do card flutuante, na ordem escolhida no painel (até 5, só disponíveis).
export const spotlightProducts = () => store.spotlight.enabled
  ? store.spotlight.ids.map(id => products.find(p => p.uuid === id || p.id === id)).filter(p => p?.available).slice(0, 5)
  : []

// Procura pelo endereço atual; se não achar, por um endereço antigo (produto renomeado).
export const findProduct = slug => products.find(product => product.slug === slug)
  || products.find(product => product.oldSlugs?.includes(slug))

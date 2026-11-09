// Configurações da loja — dados de contato e como as mensagens do WhatsApp são montadas.
// As vendas são fechadas no WhatsApp: tamanho, pagamento e entrega são combinados na conversa.

export const store = {
  // Número com DDI + DDD, só dígitos. Ex.: '5511999998888'.
  // Enquanto estiver vazio, o WhatsApp abre pedindo para a cliente escolher o contato.
  whatsapp: '',
  instagram: 'https://www.instagram.com/uusemaree.br/',
  instagramHandle: '@uusemaree.br',
}

// Produtos que aparecem no card flutuante de destaques (ids do catálogo, até 5).
export const spotlightIds = ['02', '04', '08', '09', '13']

// Usa api.whatsapp.com direto: o atalho wa.me redireciona e, nesse redirecionamento,
// o WhatsApp corrompe os emojis (viram "�"). Indo direto, a mensagem chega intacta.
export const whatsappLink = text => {
  const params = new URLSearchParams()
  if (store.whatsapp) params.set('phone', store.whatsapp)
  params.set('text', text)
  return `https://api.whatsapp.com/send?${params.toString().replace(/\+/g, '%20')}`
}

const formatPrice = value => `R$ ${value.toFixed(2).replace('.', ',')}`

export const productMessage = product =>
  `Oi, Maré! 🌊 Vi no site e me apaixonei ${product.flavors ? 'por este produto' : 'por esta peça'}:\n\n` +
  `*${product.name}* — ${product.priceLabel}\n\n` +
  (product.flavors
    ? (product.flavors.length > 1 ? `Quais sabores estão disponíveis? 🤎` : `Pode me ajudar com a disponibilidade? 🤎`)
    : `Pode me ajudar com tamanho e disponibilidade? 🤎`)

// Mensagem de finalização da sacola (formato definido pela loja).
export const bagMessage = items => {
  const lines = items.map(({ product, quantity }) =>
    `${quantity > 1 ? `${quantity}x ` : ''}*${product.name}* — ${formatPrice(product.price * quantity)}`)
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  return `Oi, Maré! ✨\nMontei minha sacola no site:\n\n` +
    `--------\n${lines.join('\n')}\nTotal: *${formatPrice(total)}*\n\n` +
    `😃 Pode me ajudar com os tamanhos e a finalização?`
}

export const restockMessage = product =>
  `Oi, Maré! 🌊 Vi que a peça *${product.name}* está esgotada. Pode me avisar se ela voltar? 🤎`

export const helloMessage = 'Oi, Maré! 🌊 Vim pelo site e queria tirar uma dúvida. 🤎'

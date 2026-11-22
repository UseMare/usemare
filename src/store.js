// Configurações da loja — dados de contato e como as mensagens do WhatsApp são montadas.
// As vendas são fechadas no WhatsApp: tamanho, pagamento e entrega são combinados na conversa.
// Os valores abaixo são o padrão; os oficiais vêm da tabela public.store_settings no Supabase
// (src/data.js copia para cá assim que carrega — a dona edita pelo painel /painel-loja).

export const store = {
  // Número com DDI + DDD, só dígitos. Ex.: '5511999998888'.
  // Enquanto estiver vazio, o WhatsApp abre pedindo para a cliente escolher o contato.
  whatsapp: '',
  instagram: 'https://www.instagram.com/uusemaree.br/',
  instagramHandle: '@uusemaree.br',
  installments: 6,
  logo: '/img/logo/mare.webp',          // logo do cabeçalho
  logoFooter: null,                     // logo do rodapé (vazio = mesma do cabeçalho)
  social: [],                           // outras redes: [{ network, url, label }]
  footerText: 'Moda que acompanha seu ritmo,\ncom leveza e personalidade.',
  // Card flutuante de destaques: até 5 produtos, na ordem (códigos locais ou ids do banco).
  spotlight: { enabled: true, ids: ['02', '04', '08', '09', '13'] },
}

// Usa api.whatsapp.com direto: o atalho wa.me redireciona e, nesse redirecionamento,
// o WhatsApp corrompe os emojis (viram "�"). Indo direto, a mensagem chega intacta.
export const whatsappLink = text => {
  const params = new URLSearchParams()
  if (store.whatsapp) params.set('phone', store.whatsapp)
  params.set('text', text)
  return `https://api.whatsapp.com/send?${params.toString().replace(/\+/g, '%20')}`
}

const formatPrice = value => `R$ ${value.toFixed(2).replace('.', ',')}`

// Mensagem do pedido (sacola ou "Comprar" da página da peça), enviada depois que a cliente
// entra na conta. items: [{ product, quantity }] · customer: { name, email, phone }
// *negrito* e _itálico_ são a formatação do próprio WhatsApp.
export const orderMessage = (items, customer = {}, productType = () => null) => {
  const now = new Date()
  const date = now.toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })
  const time = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Fortaleza', hour: '2-digit', minute: '2-digit' })
  const pieces = items.reduce((sum, { quantity }) => sum + quantity, 0)
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const site = window.location.host || 'usemare.com.br'

  const lines = items.map(({ product, quantity }, index) => {
    const type = productType(product)
    const price = product.oldPrice
      ? `de ~${formatPrice(product.oldPrice)}~ por ${formatPrice(product.price)}`
      : formatPrice(product.price)
    return [
      `*${index + 1}) ${product.name}*`,
      type && `• Categoria: ${type}`,
      `• Quantidade: ${quantity}`,
      `• Valor: ${price}${quantity > 1 ? ' cada' : ''}`,
      quantity > 1 && `• Subtotal: *${formatPrice(product.price * quantity)}*`,
      `🔗 ${site}/produto/${product.slug}`,
    ].filter(Boolean).join('\n')
  })

  const data = [
    customer.name && `• Nome: ${customer.name}`,
    customer.email && `• E-mail: ${customer.email}`,
    customer.phone && `• WhatsApp: ${customer.phone}`,
  ].filter(Boolean)

  const rule = '━━━━━━━━━━━━━━'
  return [
    'Olá, Maré! 🌊 Acabei de montar meu pedido pelo site:',
    '',
    '🛍️ *MEU PEDIDO*',
    `🗓️ ${date}, às ${time}`,
    '',
    lines.join('\n\n'),
    '',
    rule,
    `💰 *TOTAL: ${formatPrice(total)}* (${pieces} ${pieces === 1 ? 'item' : 'itens'})`,
    store.installments > 1 && `💳 Em até ${store.installments}x sem juros`,
    rule,
    data.length && '',
    data.length && '👤 *MEUS DADOS*',
    ...data,
    '',
    `Pode me ajudar com ${items.some(i => i.product.flavors) ? 'sabor/tamanho' : 'os tamanhos'}, o pagamento e a entrega? 🤎`,
  ].filter(line => line !== false && line !== 0 && line !== null && line !== undefined).join('\n')
}

export const restockMessage = product =>
  `Oi, Maré! 🌊 Vi que a peça *${product.name}* está esgotada. Pode me avisar se ela voltar? 🤎`

export const helloMessage = 'Oi, Maré! 🌊 Vim pelo site e queria tirar uma dúvida. 🤎'

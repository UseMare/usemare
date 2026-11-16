import { CreditCard, Gem, Gift, Heart, HeartHandshake, Leaf, LockKeyhole, MessageCircle, Package, RefreshCw, Ruler, Shirt, ShoppingBag, Smile, Sparkles, Star, Sun, Truck, Waves, Zap } from 'lucide-react'
import { Instagram } from './ui.jsx'

// Ícones que a dona pode escolher no painel (benefícios do hero e quadro de serviços).
// A chave é o que fica salvo no banco; mudar uma chave aqui quebra o que já foi salvo.
export const siteIcons = {
  truck:     { label: 'Caminhão (entrega)',   Icon: Truck },
  card:      { label: 'Cartão (pagamento)',   Icon: CreditCard },
  lock:      { label: 'Cadeado (segurança)',  Icon: LockKeyhole },
  instagram: { label: 'Instagram',            Icon: Instagram },
  leaf:      { label: 'Folha (conforto)',     Icon: Leaf },
  gem:       { label: 'Joia (qualidade)',     Icon: Gem },
  heart:     { label: 'Coração',              Icon: Heart },
  handshake: { label: 'Mãos e coração (propósito)', Icon: HeartHandshake },
  bag:       { label: 'Sacola (compra)',      Icon: ShoppingBag },
  sparkles:  { label: 'Brilho',               Icon: Sparkles },
  star:      { label: 'Estrela',              Icon: Star },
  gift:      { label: 'Presente',             Icon: Gift },
  package:   { label: 'Caixa (pacote)',       Icon: Package },
  shirt:     { label: 'Roupa',                Icon: Shirt },
  ruler:     { label: 'Fita métrica (medidas)', Icon: Ruler },
  refresh:   { label: 'Setas (troca)',        Icon: RefreshCw },
  chat:      { label: 'Conversa (atendimento)', Icon: MessageCircle },
  smile:     { label: 'Sorriso',              Icon: Smile },
  sun:       { label: 'Sol',                  Icon: Sun },
  waves:     { label: 'Ondas (Maré)',         Icon: Waves },
  zap:       { label: 'Raio (energia)',       Icon: Zap },
}

export function SiteIcon({ name }) {
  const { Icon } = siteIcons[name] || siteIcons.sparkles
  return <Icon />
}

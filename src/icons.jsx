import { CreditCard, Gem, Gift, Globe, Heart, HeartHandshake, Leaf, LockKeyhole, Mail, MessageCircle, Package, RefreshCw, Ruler, Shirt, ShoppingBag, Smile, Sparkles, Star, Sun, Truck, Waves, Zap } from 'lucide-react'
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

// ---------- Redes sociais (rodapé) ----------
// A biblioteca de ícones não tem logos de marcas; estes seguem o mesmo traço fino.
const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
export const socialNetworks = {
  instagram: { label: 'Instagram', placeholder: 'https://www.instagram.com/…', Icon: Instagram },
  facebook:  { label: 'Facebook', placeholder: 'https://www.facebook.com/…', Icon: () => <Svg><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Svg> },
  tiktok:    { label: 'TikTok', placeholder: 'https://www.tiktok.com/@…', Icon: () => <Svg><path d="M15 3c.4 2.6 2.1 4.3 5 4.5v3.3c-1.9 0-3.6-.6-5-1.6V15a6 6 0 1 1-6-6v3.3A2.7 2.7 0 1 0 11.7 15V3z" /></Svg> },
  youtube:   { label: 'YouTube', placeholder: 'https://www.youtube.com/@…', Icon: () => <Svg><path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></Svg> },
  pinterest: { label: 'Pinterest', placeholder: 'https://br.pinterest.com/…', Icon: () => <Svg><circle cx="12" cy="12" r="9.5" /><path d="m9.5 20.5 2.6-10" /><path d="M9 14.6c-.8-.6-1.2-1.6-1.2-2.7 0-2.6 2-4.6 4.6-4.6s4.4 1.8 4.4 4.3c0 2.8-1.5 4.9-3.6 4.9-1 0-1.7-.5-2-1.2" /></Svg> },
  x:         { label: 'X (Twitter)', placeholder: 'https://x.com/…', Icon: () => <Svg><path d="M4 4h4.5L20 20h-4.5z" /><path d="M4 20l6.4-6.4M13.6 10.4 20 4" /></Svg> },
  email:     { label: 'E-mail', placeholder: 'contato@…', Icon: Mail },
  site:      { label: 'Outro site', placeholder: 'https://…', Icon: Globe },
}

// Link de uma rede: e-mail vira mailto:.
export const socialHref = item => item.network === 'email' && !/^mailto:/i.test(item.url) ? `mailto:${item.url}` : item.url

export function SocialIcon({ network }) {
  const { Icon } = socialNetworks[network] || socialNetworks.site
  return <Icon />
}

export function SiteIcon({ name }) {
  const { Icon } = siteIcons[name] || siteIcons.sparkles
  return <Icon />
}

import React from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../shop.jsx'
import { Instagram, WhatsApp } from '../ui.jsx'
import { helloMessage, store, whatsappLink } from '../store.js'
import { pageContent } from '../content.js'

// Páginas institucionais (links só no rodapé): Política de Privacidade, Trocas e Devoluções e
// Termos de Uso. Os textos abaixo são o padrão; a loja edita tudo em
// painel → Textos das páginas (chaves legal_privacidade, legal_trocas, legal_termos).
//
// Formatação dos textos: linha em branco separa parágrafos; linhas começando com "- " viram lista.

export const legalPages = [
  { path: '/politica-de-privacidade', label: 'Política de Privacidade', contentKey: 'legal_privacidade' },
  { path: '/trocas-e-devolucoes', label: 'Trocas e Devoluções', contentKey: 'legal_trocas' },
  { path: '/termos-de-uso', label: 'Termos de Uso', contentKey: 'legal_termos' },
]

export const privacyDefaults = {
  title: 'Política de Privacidade',
  updated: '22 de novembro de 2026',
  intro: 'Na Maré, cuidar de você inclui cuidar dos seus dados. Esta política explica, de forma simples, quais informações coletamos, por que coletamos, com quem compartilhamos e como você pode exercer seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).',
  sections: [
    { title: 'Quais dados coletamos', text: 'Coletamos apenas o necessário para você comprar e acompanhar a loja:\n\n- Cadastro: nome, e-mail e senha. A senha é guardada criptografada: nem a equipe da Maré consegue vê-la.\n- Perfil (opcional): telefone/WhatsApp e foto de perfil, se você decidir informar.\n- Atividade na loja: peças favoritas e avaliações que você publicar.\n- Newsletter: o e-mail que você cadastrar para receber novidades.\n- Pedido: as peças, quantidades e valores que vão na mensagem para o nosso WhatsApp, junto com seu nome e e-mail.\n\nNo seu próprio aparelho, o site guarda a sacola, os favoritos e o seu acesso à conta, para que você não perca nada ao voltar. Não usamos cookies de publicidade nem ferramentas de rastreamento de terceiros.' },
    { title: 'Para que usamos seus dados', text: '- Criar e manter sua conta e o seu acesso com segurança.\n- Montar e enviar o seu pedido para o WhatsApp da Maré e atender você durante a compra, a entrega, trocas e devoluções.\n- Salvar seus favoritos e publicar suas avaliações (somente o seu primeiro nome aparece).\n- Enviar e-mails da sua conta, como redefinição de senha e avisos de segurança.\n- Enviar novidades e promoções, apenas se você se inscrever na newsletter.\n- Proteger o site contra fraudes e acessos indevidos.' },
    { title: 'Base legal', text: 'Tratamos seus dados para executar o que você nos pede (sua conta e seus pedidos), para cumprir obrigações legais (como as do Código de Defesa do Consumidor), com o seu consentimento (newsletter e dados opcionais do perfil) e, quando necessário, por legítimo interesse, sempre para manter a loja segura.' },
    { title: 'Com quem compartilhamos', text: 'A Maré não vende nem aluga seus dados. Eles passam apenas por serviços que fazem o site funcionar, todos com medidas de segurança próprias:\n\n- Supabase: banco de dados e sistema de login.\n- Hostinger: hospedagem do site.\n- Resend: envio dos e-mails da sua conta.\n- WhatsApp (Meta): quando você envia o pedido ou conversa com a gente por lá.\n\nTambém podemos compartilhar dados quando a lei ou uma autoridade exigir.' },
    { title: 'Como protegemos seus dados', text: 'O site usa conexão segura (HTTPS), senhas criptografadas e regras de acesso no banco de dados: cada cliente vê apenas as próprias informações, e somente a equipe autorizada da Maré acessa o painel da loja.' },
    { title: 'Por quanto tempo guardamos', text: 'Mantemos seus dados enquanto sua conta estiver ativa ou enquanto forem necessários para atender você e cumprir obrigações legais. Se você pedir a exclusão da conta, apagamos seus dados pessoais, exceto aqueles que a lei nos obriga a guardar por um período.' },
    { title: 'Seus direitos', text: 'Pela LGPD, você pode a qualquer momento:\n\n- Saber quais dados temos sobre você e pedir uma cópia.\n- Corrigir dados incompletos ou desatualizados (nome, telefone e foto você mesma altera em Minha conta).\n- Pedir a exclusão da sua conta e dos seus dados.\n- Cancelar a newsletter e retirar consentimentos.\n\nPara qualquer pedido, fale com a gente pelo WhatsApp. Respondemos o quanto antes.' },
    { title: 'Menores de idade', text: 'A conta na Maré é destinada a maiores de 18 anos. Menores podem comprar com a participação de um responsável.' },
    { title: 'Mudanças nesta política', text: 'Esta política pode ser atualizada para refletir melhorias na loja ou mudanças na lei. A data da última atualização fica sempre no topo desta página.' },
  ],
}

export const exchangeDefaults = {
  title: 'Trocas e Devoluções',
  updated: '22 de novembro de 2026',
  intro: 'Queremos que você ame cada peça da Maré. Se algo não ficou como você esperava, a gente resolve com carinho. Veja abaixo como funcionam trocas e devoluções, de acordo com o Código de Defesa do Consumidor (CDC).',
  sections: [
    { title: 'Direito de arrependimento (7 dias)', text: 'Como a compra é feita a distância (pelo site e WhatsApp), você pode desistir dela em até 7 dias corridos a partir do recebimento, sem precisar explicar o motivo (art. 49 do CDC).\n\nNesse caso, devolvemos o valor integral pago, incluindo o frete de envio, depois que a peça chegar de volta e for conferida.' },
    { title: 'Troca de tamanho ou modelo', text: 'Não serviu ou quer trocar por outro tamanho ou cor? Você pode pedir a troca em até 7 dias corridos a partir do recebimento.\n\n- A troca depende da disponibilidade da peça no estoque.\n- Se a peça desejada não estiver disponível, você pode escolher outra ou receber o valor de volta.\n- O frete de envio da peça para troca e o de reenvio são combinados com a gente pelo WhatsApp.' },
    { title: 'Produto com defeito', text: 'Se a peça chegar com defeito ou diferente do que você pediu, avise a gente o quanto antes. O prazo para reclamar é de 90 dias para roupas e acessórios e de 30 dias para suplementos e outros produtos não duráveis (art. 26 do CDC).\n\nNesses casos, o frete de devolução e de reenvio fica por conta da Maré. Você pode escolher entre a troca por uma peça igual, outra peça de mesmo valor ou a devolução do dinheiro.' },
    { title: 'Condições para troca ou devolução', text: 'Para que a troca ou devolução seja aceita, a peça precisa:\n\n- Estar sem sinais de uso, sem lavagem e sem odores (perfume, desodorante, suor).\n- Estar com a etiqueta original presa.\n- Ser enviada, de preferência, na embalagem em que chegou.\n\nSuplementos só podem ser devolvidos com o lacre intacto, exceto em caso de defeito. Peças com sinais de uso ou danificadas por mau uso podem ser recusadas; nesse caso, enviamos a peça de volta para você.' },
    { title: 'Como pedir', text: '- Chame a Maré no WhatsApp e informe seu nome, o pedido e o que deseja (troca, devolução ou defeito).\n- Se for defeito, envie fotos da peça e da etiqueta.\n- Vamos combinar com você a forma e o endereço de envio da peça.' },
    { title: 'Reembolso', text: 'Quando houver devolução do dinheiro, o reembolso é feito pela mesma forma de pagamento usada na compra (Pix, transferência ou estorno no cartão) em até 10 dias úteis depois que recebermos e conferirmos a peça. No cartão de crédito, o estorno pode aparecer em uma ou duas faturas, conforme a operadora.' },
  ],
}

export const termsDefaults = {
  title: 'Termos de Uso',
  updated: '22 de novembro de 2026',
  intro: 'Bem-vinda à Maré! Estes termos explicam as regras de uso do site usemare.com.br. Ao navegar, criar uma conta ou enviar um pedido, você concorda com eles.',
  sections: [
    { title: 'Sobre a Maré', text: 'A Maré é uma loja de moda feminina e fitness. O site funciona como vitrine e para montar seu pedido; a venda é concluída na conversa pelo WhatsApp, onde combinamos tamanho, pagamento e entrega.' },
    { title: 'Sua conta', text: '- Para finalizar um pedido, é preciso ter uma conta na Maré.\n- Use informações verdadeiras e mantenha seu e-mail atualizado: é por ele que você recupera o acesso.\n- Sua senha é pessoal. Não a compartilhe; se suspeitar de uso indevido, troque a senha em Minha conta.\n- A conta é destinada a maiores de 18 anos.\n- Podemos suspender contas usadas de forma indevida, fraudulenta ou que desrespeitem estes termos.' },
    { title: 'Pedidos, preços e disponibilidade', text: '- O pedido enviado pelo site é uma solicitação de compra. Ele só é confirmado depois que combinamos os detalhes e o pagamento é feito pelo WhatsApp.\n- Preços, promoções e disponibilidade podem mudar sem aviso, e valem os confirmados na conversa.\n- Fazemos o possível para que as fotos mostrem as peças com fidelidade, mas as cores podem variar um pouco de acordo com a tela de cada aparelho.\n- O valor e o prazo do frete são calculados para o seu CEP e informados antes de você pagar.' },
    { title: 'Avaliações', text: 'Você pode avaliar as peças que conhece. As avaliações passam por aprovação antes de aparecer no site e podem ser recusadas se tiverem conteúdo ofensivo, falso, propaganda ou dados pessoais de outras pessoas. Ao publicar, você autoriza a Maré a exibir o texto, a nota, as fotos enviadas e o seu primeiro nome.' },
    { title: 'Uso do site', text: 'Não é permitido usar o site para fins ilegais, tentar acessar áreas restritas ou contas de outras pessoas, copiar o conteúdo em massa ou prejudicar o funcionamento da loja.' },
    { title: 'Propriedade intelectual', text: 'A marca Maré, o logotipo, as fotos, os textos e o visual do site pertencem à Maré e não podem ser copiados ou usados sem autorização.' },
    { title: 'Links para outros sites', text: 'O site tem links para o WhatsApp, Instagram e outras redes. Esses serviços têm suas próprias regras e políticas de privacidade.' },
    { title: 'Privacidade e trocas', text: 'O uso dos seus dados está explicado na nossa Política de Privacidade, e as regras de troca e devolução estão na página Trocas e Devoluções.' },
    { title: 'Alterações e legislação', text: 'Estes termos podem ser atualizados a qualquer momento; a data da última atualização fica no topo da página. Eles seguem as leis brasileiras, em especial o Código de Defesa do Consumidor, e eventuais conflitos podem ser resolvidos no foro do domicílio da cliente.' },
  ],
}

const defaultsFor = { legal_privacidade: privacyDefaults, legal_trocas: exchangeDefaults, legal_termos: termsDefaults }

// Texto simples → parágrafos e listas ("- " no começo da linha).
function RichText({ text }) {
  return String(text || '').split(/\n\s*\n/).map((block, i) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length && lines.every(l => l.startsWith('- '))) {
      return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>
    }
    return <p key={i}>{lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{l.replace(/^- /, '• ')}</React.Fragment>)}</p>
  })
}

const slug = (text, i) => `${i + 1}-${String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

export default function LegalPage({ contentKey }) {
  const page = pageContent(contentKey, defaultsFor[contentKey])
  usePageTitle(page.title)
  const sections = (page.sections || []).filter(s => s?.title || s?.text)
  const others = legalPages.filter(p => p.contentKey !== contentKey)

  return (
    <article className="legal shell">
      <header className="legal-head">
        <p className="eyebrow">Maré · Institucional</p>
        <h1>{page.title}</h1>
        {page.updated && <p className="legal-updated">Atualizada em {page.updated}</p>}
        {page.intro && <p className="legal-intro">{page.intro}</p>}
      </header>

      {sections.length > 2 && (
        <nav className="legal-toc" aria-label="Nesta página">
          <p>Nesta página</p>
          <ol>{sections.map((s, i) => <li key={i}><a href={`#${slug(s.title, i)}`}>{s.title}</a></li>)}</ol>
        </nav>
      )}

      <div className="legal-body">
        {sections.map((s, i) => (
          <section key={i} id={slug(s.title, i)}>
            <h2>{s.title}</h2>
            <RichText text={s.text} />
          </section>
        ))}
      </div>

      <aside className="legal-contact">
        <div>
          <h2>Ficou com alguma dúvida?</h2>
          <p>Fale com a gente. Respondemos com carinho e o quanto antes.</p>
        </div>
        <div className="legal-contact-actions">
          <a className="button whatsapp" href={whatsappLink(helloMessage)} target="_blank" rel="noreferrer"><WhatsApp /> WhatsApp</a>
          <a className="button outline" href={store.instagram} target="_blank" rel="noreferrer"><Instagram /> Instagram</a>
        </div>
      </aside>

      <p className="legal-others">Veja também: {others.map((p, i) => <React.Fragment key={p.path}>{i > 0 && ' · '}<Link to={p.path}>{p.label}</Link></React.Fragment>)}</p>
    </article>
  )
}

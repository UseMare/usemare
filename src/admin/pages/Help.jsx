import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { BASE } from '../sections.js'

// Guia do painel, escrito para a dona da loja (sem termos técnicos).

const go = (path, label) => <Link to={`${BASE}${path}`} className="adm-help-link">{label} <ArrowRight /></Link>

const topics = [
  {
    title: 'Primeiros passos',
    body: <>
      <p>Tudo o que você salva aqui aparece no site <b>na hora</b>. Se uma cliente já estiver com o site aberto, ela vê a novidade ao atualizar a página.</p>
      <ul>
        <li><b>Menu da esquerda:</b> leva a cada parte da loja. O botão ao lado do logo recolhe o menu, que vira uma faixa só com os ícones.</li>
        <li><b>Seu nome (canto de cima, à direita):</b> abre atalhos, <b>Alterar senha</b> e <b>Sair</b>.</li>
        <li><b>Ver loja:</b> abre o site em outra aba, para conferir como ficou.</li>
        <li>Nas telas com <b>Salvar</b>, nada muda no site antes de você clicar. Se tentar sair sem salvar, o painel avisa. <b>Desfazer</b> volta ao que estava salvo.</li>
        <li>Campos com <b>*</b> não podem ficar vazios. Nos outros, se você apagar o texto, aquele pedaço some do site.</li>
      </ul>
    </>,
  },
  {
    title: 'Cadastrar e editar produtos',
    body: <>
      <ol>
        <li>Abra <b>Produtos</b> e clique em <b>Novo produto</b> (ou no lápis de um produto para editar).</li>
        <li>Preencha nome, preço e descrição. <b>Preço antigo</b> é para promoção: coloque o valor de antes (maior) e a peça vai sozinha para a página <b>Promoções</b>, com o preço riscado.</li>
        <li>Escolha as <b>categorias</b> (ex.: Maré Move + Conjuntos), as <b>cores</b> e os <b>tamanhos</b>.</li>
        <li>Adicione as <b>fotos</b>: depois de escolher, ajuste o enquadramento arrastando e usando o zoom. A primeira foto é a capa; arraste para mudar a ordem.</li>
        <li>Clique em <b>Criar produto</b> / <b>Salvar alterações</b>.</li>
      </ol>
      <ul>
        <li><b>No site</b> desligado = a peça fica escondida (bom para preparar antes de lançar).</li>
        <li><b>Disponível</b> desligado = aparece como <b>Esgotado</b>, e a cliente pode pedir aviso de reposição pelo WhatsApp.</li>
        <li><b>Ordem:</b> na lista, arraste pelos pontinhos ou use as setas e clique em <b>Salvar ordem</b>. A ordem da lista é a ordem do site.</li>
        <li><b>Duplicar</b> cria uma cópia escondida, ótimo para a mesma peça em outra cor. Revise e ligue <b>No site</b>.</li>
      </ul>
      {go('/produtos', 'Ir para Produtos')}
    </>,
  },
  {
    title: 'Categorias e cards da página inicial',
    body: <>
      <p><b>Coleções</b> (ex.: Maré Move) aparecem no selo e no caminho da página da peça. <b>Tipos de peça</b> (ex.: Vestidos) aparecem no filtro do catálogo.</p>
      <ul>
        <li>As setas mudam a ordem dos botões de categoria no catálogo.</li>
        <li>Ao editar uma categoria você muda o texto do topo da página dela e liga o <b>card na página inicial</b>, com imagem própria.</li>
        <li>Para esconder sem apagar, desligue <b>Ativa</b>.</li>
      </ul>
      {go('/categorias', 'Ir para Categorias')}
    </>,
  },
  {
    title: 'Coleção (página da coleção do momento)',
    body: <>
      <p>A página <b>usemare.com.br/colecao</b> muda quando você quiser: Coleção Janeiro, Verão, Dia das Mães…</p>
      <ul>
        <li><b>Nome da coleção</b> é também o nome no menu do topo.</li>
        <li>Escolha as peças e a ordem delas; o resto do catálogo não muda.</li>
        <li>Os enfeites dourados e o quadro do final podem ser ligados ou desligados.</li>
      </ul>
      {go('/colecao', 'Ir para Coleção')}
    </>,
  },
  {
    title: 'Destaques (card que aparece no canto)',
    body: <>
      <p>Escolha até <b>5 produtos</b> e a ordem. O card aparece no canto do site alguns segundos depois que a cliente entra e troca de peça a cada 5 segundos. Peças escondidas ou esgotadas saem do card sozinhas e voltam quando ficarem disponíveis.</p>
      {go('/destaques', 'Ir para Destaques')}
    </>,
  },
  {
    title: 'Página inicial, textos e rodapé',
    body: <>
      <ul>
        <li><b>Página inicial:</b> fotos do banner do topo (pode ter várias, que trocam sozinhas), textos, benefícios, banners do meio e quadro de serviços. Nas fotos do banner, deixe o <b>lado esquerdo mais liso</b>, porque é onde ficam os textos.</li>
        <li><b>Textos das páginas:</b> Sobre nós, Como comprar, topo do catálogo, Promoções e a <b>faixa de avisos</b> acima do menu.</li>
        <li><b>Logo e rodapé:</b> logotipo do topo e do rodapé, texto da marca, outras redes sociais (Facebook, TikTok…) e as colunas de links.</li>
        <li>Escreva <b>{'{parcelas}'}</b> num texto para mostrar o número de parcelas das Configurações (ex.: "Parcele em até {'{parcelas}'}x sem juros" vira "6x").</li>
        <li><b>Voltar ao padrão</b> recoloca os textos originais do site (você revisa antes de salvar).</li>
      </ul>
      {go('/pagina-inicial', 'Ir para Página inicial')}
    </>,
  },
  {
    title: 'WhatsApp, Instagram e parcelas',
    body: <>
      <p>Em <b>Configurações</b>, coloque o <b>WhatsApp da loja com DDD</b> e clique em <b>Abrir conversa de teste</b> para conferir. Todos os botões de WhatsApp do site (peça, sacola, rodapé) passam a usar esse número.</p>
      <p>No Instagram, pode escrever o @ ou colar o link do perfil. Em parcelas, escolha até quantas vezes sem juros (ou só à vista).</p>
      {go('/configuracoes', 'Ir para Configurações')}
    </>,
  },
  {
    title: 'Avaliações e newsletter',
    body: <>
      <ul>
        <li>As clientes avaliam pela página da peça. Nada aparece no site antes de você <b>Aprovar</b>. O número ao lado de <b>Avaliações</b> no menu mostra quantas estão esperando. <b>Recusar</b> esconde; <b>Excluir</b> apaga de vez.</li>
        <li><b>Newsletter:</b> e-mails cadastrados no rodapé. <b>Baixar planilha</b> abre no Excel ou Google Planilhas; <b>Copiar e-mails</b> é para colar no seu e-mail (use o campo <b>Cco</b> para as clientes não verem os e-mails umas das outras).</li>
      </ul>
      {go('/avaliacoes', 'Ir para Avaliações')}
    </>,
  },
  {
    title: 'Dicas de fotos',
    body: <ul>
      <li>Fotos de produto ficam <b>em pé</b> (3 × 4). Use boa luz e fundo limpo; o painel deixa as fotos leves sozinho.</li>
      <li>Pode enviar fotos do celular normalmente (até 25 MB). Para o logo, prefira PNG com fundo transparente.</li>
      <li>Ao trocar uma foto, a antiga é apagada sozinha do armazenamento.</li>
    </ul>,
  },
  {
    title: 'Se algo der errado',
    body: <ul>
      <li><b>"Sua sessão expirou"</b>: saia e entre de novo no painel.</li>
      <li><b>"Sem conexão"</b>: confira a internet e clique em salvar de novo. Nada é perdido enquanto a tela estiver aberta.</li>
      <li>Esqueceu a senha? Na tela de entrada do painel use <b>Esqueci minha senha</b>.</li>
      <li>O site não mudou? Atualize a página do site (F5 no computador; puxe para baixo no celular).</li>
    </ul>,
  },
]

export default function Help() {
  return (
    <>
      <p className="adm-muted adm-intro">Guia rápido de cada parte do painel.</p>
      <div className="adm-help">
        {topics.map((t, i) => (
          <details key={t.title} className="adm-card" open={i === 0}>
            <summary><span>{t.title}</span><ChevronDown /></summary>
            <div className="adm-help-body">{t.body}</div>
          </details>
        ))}
      </div>
    </>
  )
}

// Gera os modelos de e-mail de conta da Maré (Supabase Auth) no mesmo esqueleto
// dos e-mails da Coaph, com as cores e o logo da Maré.
// Uso: node supabase/email-templates/gerar.mjs  → cria os .html nesta pasta.
// Depois, os .html são aplicados no Supabase (Auth → Email Templates) pela API de gestão.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SITE = 'https://usemare.com.br'
const C = {
  page: '#faf5f0', card: '#ffffff', header: '#f7e7db', ink: '#3a1d17', text: '#5f4a44',
  soft: '#8a7770', button: '#43201a', link: '#a36f5a', line: '#e2d3c8', note: '#f7efe8',
}
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"
const SANS = 'Arial, Helvetica, sans-serif'

const button = (url, label) => `
  <!-- Botão (bulletproof) -->
  <tr>
    <td align="center" class="stack-padding" style="padding:0 40px 32px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" bgcolor="${C.button}" style="border-radius:999px; background-color:${C.button};">
            <a href="${url}" target="_blank" style="display:inline-block; padding:15px 38px; font-family:${SANS}; font-size:14px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#ffffff; text-decoration:none; border-radius:999px;">${label}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Link alternativo (fallback em texto puro) -->
  <tr>
    <td class="stack-padding" style="padding:0 40px 32px 40px; font-family:${SANS};">
      <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:${C.soft};">
        Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:
      </p>
      <p style="margin:0; font-size:13px; line-height:1.6; word-break:break-all;">
        <a href="${url}" target="_blank" style="color:${C.link}; text-decoration:underline;">${url}</a>
      </p>
    </td>
  </tr>`

const code = token => `
  <!-- Código -->
  <tr>
    <td align="center" class="stack-padding" style="padding:0 40px 32px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" bgcolor="${C.note}" style="background-color:${C.note}; border:1px solid ${C.line}; border-radius:12px; padding:18px 36px; font-family:${SANS}; font-size:30px; font-weight:700; letter-spacing:8px; color:${C.ink};">${token}</td>
        </tr>
      </table>
    </td>
  </tr>`

const note = html => `
  <tr>
    <td class="stack-padding" style="padding:0 40px 32px 40px; font-family:${SANS};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="${C.note}" style="background-color:${C.note}; border-radius:10px; padding:14px 18px; font-size:13px; line-height:1.6; color:${C.text};">${html}</td>
        </tr>
      </table>
    </td>
  </tr>`

const layout = ({ title, preheader, heading, body, extra = '', footnote }) => `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${title} — Maré</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  @media only screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .stack-padding { padding-left: 24px !important; padding-right: 24px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${C.page}; -webkit-text-size-adjust:100%; text-size-adjust:100%;">
<span style="display:none; font-size:1px; color:${C.page}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  ${preheader}
</span>
<center style="width:100%; background-color:${C.page}; padding:24px 0;">
<!--[if mso]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" align="center"><tr><td>
<![endif]-->
<table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" align="center" style="width:100%; max-width:600px; margin:0 auto; background-color:${C.card}; border-radius:16px; overflow:hidden;">
  <!-- Cabeçalho -->
  <tr>
    <td align="center" bgcolor="${C.header}" style="background-color:${C.header}; padding:28px 24px;">
      <a href="${SITE}" target="_blank" style="text-decoration:none;">
        <img src="${SITE}/img/logo/mare-email.png" width="160" alt="Maré — Moda feminina e fitness" style="display:block; border:0; outline:none; text-decoration:none; height:auto; max-width:160px; margin:0 auto;">
      </a>
    </td>
  </tr>

  <!-- Corpo -->
  <tr>
    <td class="stack-padding" style="padding:40px 40px 24px 40px; font-family:${SANS};">
      <h1 style="margin:0 0 16px 0; font-family:${SERIF}; font-size:26px; line-height:1.3; color:${C.ink}; font-weight:700;">${heading}</h1>
      ${body}
    </td>
  </tr>
${extra}
  <!-- Aviso de segurança -->
  <tr>
    <td class="stack-padding" style="padding:0 40px 32px 40px; font-family:${SANS};">
      <p style="margin:0; font-size:13px; line-height:1.6; color:${C.soft};">${footnote}</p>
    </td>
  </tr>

  <!-- Divisor -->
  <tr>
    <td style="padding:0 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid ${C.line}; font-size:0; line-height:0;">&nbsp;</td></tr>
      </table>
    </td>
  </tr>

  <!-- Rodapé -->
  <tr>
    <td align="center" style="padding:24px 40px 32px 40px; font-family:${SANS}; background-color:${C.card};">
      <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:${C.text};">
        Maré — Moda feminina e fitness · <a href="${SITE}" target="_blank" style="color:${C.link}; text-decoration:none;">usemare.com.br</a>
      </p>
      <p style="margin:0; font-size:12px; line-height:1.6; color:#b3a39c;">
        E-mail automático, não responda.
      </p>
    </td>
  </tr>
</table>
<!--[if mso]>
</td></tr></table>
<![endif]-->
</center>
</body>
</html>
`

const p = html => `<p style="margin:0 0 16px 0; font-size:15px; line-height:1.7; color:${C.text};">${html}</p>`
const NAO_FOI_VOCE = 'Se não foi você, pode ignorar este e-mail com tranquilidade: nada muda na sua conta.'
const ALERTA = `Se não foi você, <strong>redefina sua senha agora</strong> em <a href="${SITE}/entrar" target="_blank" style="color:${C.link};">usemare.com.br/entrar</a> (opção "Esqueci minha senha").`

// chave = nome do modelo no Supabase (mailer_templates_<chave>_content)
const templates = {
  confirmation: layout({
    title: 'Confirme seu e-mail',
    preheader: 'Falta só um clique para ativar sua conta na Maré.',
    heading: 'Que bom ter você na Maré!',
    body: p('Sua conta foi criada. Para ativá-la, confirme seu e-mail clicando no botão abaixo.') +
      p('Com a conta ativa, você salva seus favoritos e acompanha suas compras.'),
    extra: button('{{ .ConfirmationURL }}', 'Confirmar meu e-mail'),
    footnote: 'Se você não criou uma conta na Maré, pode ignorar este e-mail.',
  }),
  invite: layout({
    title: 'Convite',
    preheader: 'Você foi convidada para a equipe da Maré. Crie sua senha para acessar o painel.',
    heading: 'Você foi convidada para a equipe da Maré.',
    body: p('Você recebeu um convite para acessar o <strong>painel da loja</strong>, a área de administração da Maré, onde ficam produtos, fotos, textos e configurações do site.') +
      p('Para ativar seu acesso, clique no botão abaixo e crie sua senha.'),
    // Vai para a página do painel que valida o convite e pede a senha (AcceptInvite).
    extra: button('{{ .SiteURL }}/painel-loja/convite?token_hash={{ .TokenHash }}&amp;type=invite', 'Aceitar convite'),
    footnote: 'Se você não esperava este convite, pode ignorar este e-mail. Sem aceitar, nenhum acesso é liberado.',
  }),
  magic_link: layout({
    title: 'Seu link de acesso',
    preheader: 'Use este link para entrar na sua conta da Maré.',
    heading: 'Seu link de acesso chegou.',
    body: p('Clique no botão abaixo para entrar na sua conta da Maré. O link vale por pouco tempo e só pode ser usado uma vez.'),
    extra: button('{{ .ConfirmationURL }}', 'Entrar na minha conta'),
    footnote: NAO_FOI_VOCE,
  }),
  recovery: layout({
    title: 'Redefinir senha',
    preheader: 'Recebemos um pedido para redefinir a senha da sua conta na Maré.',
    heading: 'Vamos criar uma nova senha?',
    body: p('Recebemos um pedido para redefinir a senha da sua conta na Maré. Clique no botão abaixo e escolha uma nova senha.') +
      p('O link vale por pouco tempo e só pode ser usado uma vez.'),
    extra: button('{{ .ConfirmationURL }}', 'Criar nova senha'),
    footnote: 'Se você não pediu para trocar a senha, pode ignorar este e-mail: sua senha atual continua valendo.',
  }),
  email_change: layout({
    title: 'Confirme a troca de e-mail',
    preheader: 'Confirme a troca do e-mail da sua conta na Maré.',
    heading: 'Confirme seu novo e-mail.',
    body: p('Recebemos um pedido para trocar o e-mail da sua conta na Maré de <strong>{{ .Email }}</strong> para <strong>{{ .NewEmail }}</strong>.') +
      p('Para concluir a troca, clique no botão abaixo.'),
    extra: button('{{ .ConfirmationURL }}', 'Confirmar troca de e-mail'),
    footnote: 'Se você não pediu essa troca, ignore este e-mail: o e-mail da sua conta continua o mesmo.',
  }),
  reauthentication: layout({
    title: 'Código de verificação',
    preheader: 'Seu código de verificação da Maré: {{ .Token }}',
    heading: 'Seu código de verificação',
    body: p('Para confirmar que é você mesma, digite o código abaixo no site da Maré.'),
    extra: code('{{ .Token }}'),
    footnote: 'Não compartilhe este código com ninguém. ' + NAO_FOI_VOCE,
  }),
  password_changed_notification: layout({
    title: 'Senha alterada',
    preheader: 'A senha da sua conta na Maré foi alterada.',
    heading: 'Sua senha foi alterada.',
    body: p('Este é um aviso de segurança: a senha da conta <strong>{{ .Email }}</strong> na Maré acabou de ser alterada.') +
      p('Se foi você, está tudo certo e não precisa fazer nada.'),
    extra: note(ALERTA),
    footnote: 'Avisamos sempre que algo importante muda na sua conta.',
  }),
  email_changed_notification: layout({
    title: 'E-mail alterado',
    preheader: 'O e-mail da sua conta na Maré foi alterado.',
    heading: 'O e-mail da sua conta mudou.',
    body: p('Este é um aviso de segurança: o e-mail da sua conta na Maré foi alterado de <strong>{{ .OldEmail }}</strong> para <strong>{{ .Email }}</strong>.') +
      p('Se foi você, está tudo certo e não precisa fazer nada.'),
    extra: note('Se não foi você, responda pelo nosso WhatsApp no site <a href="' + SITE + '" target="_blank" style="color:' + C.link + ';">usemare.com.br</a> para recuperarmos sua conta.'),
    footnote: 'Avisamos sempre que algo importante muda na sua conta.',
  }),
}

for (const [name, html] of Object.entries(templates)) writeFileSync(join(here, `${name}.html`), html)
console.log('Modelos gerados:', Object.keys(templates).join(', '))

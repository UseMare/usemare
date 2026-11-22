# Maré

Loja da Maré (moda feminina e fitness), construída com React + Vite e conectada ao Supabase.
As vendas são fechadas pelo WhatsApp.

## Desenvolvimento

```bash
npm install
npm run dev
```

As chaves do Supabase ficam em `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`).
A chave *publishable* é pública por natureza; quem protege os dados são as policies RLS do banco.
**Nunca** coloque a chave `secret`/`service_role` no `.env` do site.

## Produção (Hostinger)

```bash
npm run build
```

Publique o conteúdo de `dist/`. O `.htaccess` em `public/` já faz as rotas (/produtos, /produto/...) funcionarem.

**Publicação automática:** a cada push no `main`, o GitHub Actions (`.github/workflows/publicar-site.yml`)
gera o site e coloca a pasta `dist` no ramo `site-publicado`. A Hostinger (usemare.com.br) é ligada
a esse ramo e publica sozinha. Ou seja: deu push no `main`, em 1–2 minutos está no ar. Não edite o
ramo `site-publicado` à mão.

## Supabase

Todo o banco está versionado em `supabase/migrations/`.

## Painel da loja (`/painel-loja`)

Tudo o que a loja precisa editar é feito pelo painel, sem mexer em código nem no Supabase:
produtos e fotos (com recorte), categorias, destaques, página inicial, textos das páginas,
logo e rodapé, WhatsApp/Instagram/parcelas, avaliações e newsletter. O próprio painel tem
uma página **Ajuda** (ícone **?** no topo) com o passo a passo.

Quem pode entrar: contas com `role = 'admin'` em `profiles`. **Só vira admin quem entra por convite**:
no Supabase, Authentication → Users → **Invite user** com o e-mail da pessoa. Ela recebe o e-mail
"Aceitar convite", cria a senha em `/painel-loja/convite` e já entra no painel. Quem se cadastra
pelo site (`/entrar`) é sempre cliente: entra na hora, sem e-mail de confirmação. Todas as gravações
passam pelas policies RLS do banco.

## E-mails de conta

Saem pelo Resend como "Maré" <nao-responda@usemare.com.br>. Os modelos ficam em
`supabase/email-templates/` (gerados por `gerar.mjs`, no estilo dos e-mails da Coaph) e estão
aplicados no Supabase (Authentication → Email Templates).

Onde cada coisa fica no banco (para referência técnica):

| O que | Tabela |
|---|---|
| Produtos, fotos e categorias | `products`, `product_images`, `categories`, `product_categories` (fotos no bucket `produtos`) |
| WhatsApp, Instagram, parcelas, logos, redes, destaques | `store_settings` (linha `id = 1`) |
| Textos e imagens das páginas | `site_content` (chaves `home`, `about`, `howto`, `catalog`, `promotions`, `announcement`, `footer`; imagens no bucket `site`) |
| Avaliações | `reviews` (só aparecem no site com `status = 'aprovada'`) |
| Newsletter | `newsletter_subscribers` |

Os textos padrão ficam no código (ex.: `homeDefaults` em `src/pages/Home.jsx`); o que for salvo
no painel substitui o padrão. Campo opcional salvo vazio some do site.

O site abre na hora com o catálogo salvo da última visita (ou com `src/products.js`) e, em seguida,
atualiza com os dados do Supabase. Se o Supabase cair, o site continua no ar com o catálogo local.

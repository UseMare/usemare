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

## Supabase

Todo o banco está versionado em `supabase/migrations/`.

## Painel da loja (`/painel-loja`)

Tudo o que a loja precisa editar é feito pelo painel, sem mexer em código nem no Supabase:
produtos e fotos (com recorte), categorias, destaques, página inicial, textos das páginas,
logo e rodapé, WhatsApp/Instagram/parcelas, avaliações e newsletter. O próprio painel tem
uma página **Ajuda** (ícone **?** no topo) com o passo a passo.

Quem pode entrar: contas com `role = 'admin'` em `profiles` (os e-mails em `private.admin_emails`
viram admin ao se cadastrar). Todas as gravações passam pelas policies RLS do banco.

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

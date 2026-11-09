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

| O que | Onde editar (painel do Supabase → Table Editor) |
|---|---|
| Produtos, preços, esgotado, destaques | `products` (`available=false` = esgotado; `old_price` = promoção; `spotlight` = card de destaques; `active=false` = some do site) |
| Fotos dos produtos | `product_images` (caminho em `/public/img/...` ou URL do bucket `produtos`) |
| WhatsApp, Instagram, parcelas | `store_settings` (WhatsApp com DDI+DDD, só dígitos: `5511999998888`) |
| Aprovar avaliações | `reviews` → mude `status` para `aprovada` |
| E-mails da newsletter | `newsletter_subscribers` |
| Administradoras | `private.admin_emails` (quem se cadastra com esses e-mails vira admin) |

O site abre na hora com o catálogo salvo da última visita (ou com `src/products.js`) e, em seguida,
atualiza com os dados do Supabase. Se o Supabase cair, o site continua no ar com o catálogo local.

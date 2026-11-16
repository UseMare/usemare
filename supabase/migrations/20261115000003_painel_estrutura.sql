-- =====================================================================
-- Painel da loja — etapa 2: estrutura para tudo que a dona edita.
-- Só ADICIONA coisas (o site atual continua funcionando igual).
-- As colunas antigas (type, line, category_label, color, swatch, spotlight)
-- continuam até o site passar a ler as novas (etapa 3).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CATEGORIAS (substituem a lista fixa que ficava no código)
--    kind = 'colecao' → linhas da loja (Maré Move, Moda feminina, Suplementos):
--                       aparecem no selo e no caminho da página do produto.
--    kind = 'tipo'    → tipo de peça (Vestidos, Blusas…): filtro "Tipo de peça".
-- ---------------------------------------------------------------------
create table public.categories (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name             text not null check (char_length(name) between 2 and 60),
  kind             text not null default 'tipo' check (kind in ('colecao', 'tipo')),
  sort_order       integer not null default 0,
  active           boolean not null default true,
  -- card na página inicial
  home_card        boolean not null default false,
  home_card_order  integer not null default 0,
  home_title       text,                 -- texto do card; quebra de linha com Enter
  home_image       text,                 -- caminho do site ou URL do Storage
  home_tone        text not null default 'light' check (home_tone in ('light', 'dark')),
  -- banner do topo da página da categoria
  banner_eyebrow   text,
  banner_title     text,
  banner_text      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create index categories_sort_idx on public.categories (sort_order);

alter table public.categories enable row level security;
create policy "Categorias: leitura pública das ativas" on public.categories
  for select to anon, authenticated using (active or (select private.is_admin()));
create policy "Categorias: admin cria" on public.categories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Categorias: admin edita" on public.categories
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Categorias: admin exclui" on public.categories
  for delete to authenticated using ((select private.is_admin()));
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- Produto ↔ categorias (uma peça pode estar em várias: "Maré Move" e "Vestidos")
create table public.product_categories (
  product_id   uuid not null references public.products (id) on delete cascade,
  category_id  uuid not null references public.categories (id) on delete cascade,
  primary key (product_id, category_id)
);
create index product_categories_category_idx on public.product_categories (category_id);

alter table public.product_categories enable row level security;
create policy "Produto-categoria: leitura pública" on public.product_categories
  for select to anon, authenticated using (true);
create policy "Produto-categoria: admin cria" on public.product_categories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Produto-categoria: admin exclui" on public.product_categories
  for delete to authenticated using ((select private.is_admin()));
grant select on public.product_categories to anon, authenticated;
grant insert, delete on public.product_categories to authenticated;

-- ---------------------------------------------------------------------
-- 2) PRODUTOS: cores, tamanhos, detalhes e tipo de ficha
-- ---------------------------------------------------------------------
alter table public.products
  add column kind    text  not null default 'roupa' check (kind in ('roupa', 'suplemento')),
  add column colors  jsonb not null default '[]'::jsonb check (jsonb_typeof(colors) = 'array'),   -- [{ "name": "Vinho", "hex": "#7b2233" }]
  add column sizes   text[] not null default array['P', 'M', 'G'],                               -- tamanhos disponíveis
  add column details jsonb not null default '[]'::jsonb check (jsonb_typeof(details) = 'array');  -- linhas extras da aba "Sobre a peça": [{ "label": "Tecido", "value": "Suplex" }]

comment on column public.products.colors  is 'Cores da peça: [{ "name": "Vinho", "hex": "#7b2233" }] (hex aceita gradiente CSS)';
comment on column public.products.sizes   is 'Tamanhos disponíveis. Padrão P, M, G; suplementos ficam vazios';
comment on column public.products.details is 'Linhas extras da ficha: [{ "label": "Tecido", "value": "Suplex" }]';

-- Fotos: posição única, mas conferida só no fim da transação (permite reordenar trocando posições)
alter table public.product_images drop constraint product_images_product_id_position_key;
alter table public.product_images add constraint product_images_product_id_position_key
  unique (product_id, position) deferrable initially deferred;

-- ---------------------------------------------------------------------
-- 3) CONFIGURAÇÕES DA LOJA: logo, redes, rodapé e destaques
-- ---------------------------------------------------------------------
alter table public.store_settings
  add column logo_url           text,                                   -- vazio = logo padrão do site
  add column logo_footer_url    text,
  add column social             jsonb not null default '[]'::jsonb check (jsonb_typeof(social) = 'array'),  -- [{ "network": "instagram", "url": "...", "label": "@..." }]
  add column footer_text        text,
  add column spotlight_enabled  boolean not null default true,
  add column spotlight_ids      uuid[] not null default '{}',           -- até 5 produtos, na ordem
  add constraint store_settings_spotlight_max check (cardinality(spotlight_ids) <= 5);

-- ---------------------------------------------------------------------
-- 4) CONTEÚDO DO SITE (textos e imagens editáveis por seção)
--    key: 'hero', 'home', 'about', 'how_to_buy', 'shipping', 'catalog', 'footer'…
--    Se uma chave não existir, o site usa o texto padrão que já tem.
-- ---------------------------------------------------------------------
create table public.site_content (
  key         text primary key check (key ~ '^[a-z0-9_]+$'),
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
create trigger site_content_updated_at before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
create policy "Conteúdo: leitura pública" on public.site_content
  for select to anon, authenticated using (true);
create policy "Conteúdo: admin cria" on public.site_content
  for insert to authenticated with check ((select private.is_admin()));
create policy "Conteúdo: admin edita" on public.site_content
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Conteúdo: admin exclui" on public.site_content
  for delete to authenticated using ((select private.is_admin()));
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- ---------------------------------------------------------------------
-- 5) STORAGE: fotos do site (logo, hero, banners, cards de categoria)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('site', 'site', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/svg+xml'])
on conflict (id) do nothing;

create policy "Storage site: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'site' and (select private.is_admin()));
create policy "Storage site: admin atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'site' and (select private.is_admin()));
create policy "Storage site: admin exclui" on storage.objects
  for delete to authenticated using (bucket_id = 'site' and (select private.is_admin()));

-- =====================================================================
-- DADOS: copia o que o site mostra hoje para as estruturas novas
-- =====================================================================

-- Categorias atuais (mesmos endereços: /produtos?categoria=slug)
insert into public.categories (slug, name, kind, sort_order, home_card, home_card_order, home_title, home_image, home_tone, banner_eyebrow, banner_title, banner_text) values
  ('mare-move',     'Maré Move',              'colecao', 10, true,  1, E'Conjuntos\nFitness', '/img/banners/conjuntos-fitness.webp', 'light',
     'Maré Move', E'Seu movimento,\nsua melhor versão.', 'Conjuntos que unem conforto, segurança e aquele caimento que faz você se sentir linda para treinar.'),
  ('moda-feminina', 'Moda feminina',          'colecao', 20, true,  2, E'Moda\nFeminina',     '/img/banners/moda-feminina.webp',     'light',
     'Moda feminina', E'Leve, feminina\ne do seu jeito.', 'Peças escolhidas para trazer mais estilo para os seus dias — daquelas que você veste e se sente linda.'),
  ('vestidos',      'Vestidos',               'tipo',    30, false, 0, null, null, 'light', null, null, null),
  ('blusas',        'Blusas',                 'tipo',    40, true,  3, 'Blusas',             '/img/banners/blusas.webp',            'dark',
     'Blusas', E'O básico que não\ntem nada de básico.', 'Detalhes que fazem toda a diferença no look do dia a dia.'),
  ('saias-calcas',  'Saias, calças & shorts', 'tipo',    50, true,  4, E'Saias &\nCalças',    '/img/banners/saias-calcas.webp',      'dark',
     'Saias, calças & shorts', E'Elegância que\nnasce do simples.', 'Modelagens que acompanham você do trabalho ao fim de semana.'),
  ('conjuntos',     'Conjuntos',              'tipo',    60, false, 0, null, null, 'light', null, null, null),
  ('macaquinhos',   'Macaquinhos',            'tipo',    70, false, 0, null, null, 'light',
     'Macaquinhos', E'Uma peça só,\nlook pronto.', 'Macaquinhos Maré Move que abraçam o corpo e acompanham cada movimento.'),
  ('suplementos',   'Suplementos',            'colecao', 80, false, 0, null, null, 'light',
     'Suplementos', E'Seu momento de\ncuidado é na Maré.', 'Opções para complementar a sua rotina, escolhidas com o mesmo carinho das nossas peças.');

-- Cada produto ganha a sua coleção (pela linha) e o seu tipo (pelo tipo antigo)
insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p
join public.categories c on c.slug = case p.line when 'fitness' then 'mare-move' when 'casual' then 'moda-feminina' else 'suplementos' end
on conflict do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p
join public.categories c on c.slug = case p.type::text
  when 'vestido' then 'vestidos' when 'blusa' then 'blusas'
  when 'saia' then 'saias-calcas' when 'calca' then 'saias-calcas' when 'short' then 'saias-calcas'
  when 'conjunto' then 'conjuntos' when 'macaquinho' then 'macaquinhos' end
on conflict do nothing;

-- Ficha: suplementos x roupas; cor atual vira a primeira da lista; suplementos sem tamanhos
update public.products set kind = 'suplemento', sizes = '{}' where type = 'suplemento';
update public.products set colors = jsonb_build_array(jsonb_build_object('name', color, 'hex', coalesce(swatch, '#cccccc')))
  where color is not null and colors = '[]'::jsonb;

-- Destaques: os produtos marcados hoje, na ordem do catálogo
update public.store_settings set spotlight_ids = coalesce(
  (select array_agg(id order by sort_order) from (select id, sort_order from public.products where spotlight order by sort_order limit 5) s), '{}');

-- Redes sociais: o Instagram que já está configurado
update public.store_settings set social = jsonb_build_array(jsonb_build_object('network', 'instagram', 'url', instagram_url, 'label', instagram_handle))
  where social = '[]'::jsonb;

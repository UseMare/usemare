-- =====================================================================
-- Maré — schema inicial
-- Perfis (auth), configurações da loja, catálogo, fotos, favoritos,
-- avaliações e newsletter. Todas as tabelas com RLS.
-- =====================================================================

-- ---------- Tipos ----------
create type public.product_type  as enum ('conjunto', 'vestido', 'blusa', 'saia', 'calca', 'suplemento');
create type public.product_line  as enum ('fitness', 'casual', 'suplementos');
create type public.user_role     as enum ('cliente', 'admin');
create type public.review_status as enum ('pendente', 'aprovada', 'rejeitada');

-- ---------- Utilitário: updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =====================================================================
-- PERFIS (1:1 com auth.users)
-- =====================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) between 1 and 120),
  phone       text check (phone ~ '^[0-9]{10,13}$'),
  role        public.user_role not null default 'cliente',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is 'Dados da cliente. role=admin libera o gerenciamento da loja.';

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Verifica se quem está logado é admin (usado nas policies).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Cria o perfil automaticamente no cadastro (nome vem de options.data.full_name).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'nome')), ''));
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Perfil: ver o próprio (ou admin)" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Perfil: editar o próprio (ou admin)" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- A cliente só altera nome e telefone; a coluna role fica fora do alcance dela.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- =====================================================================
-- CONFIGURAÇÕES DA LOJA (linha única)
-- =====================================================================
create table public.store_settings (
  id                smallint primary key default 1 check (id = 1),
  whatsapp          text check (whatsapp is null or whatsapp ~ '^[0-9]{12,13}$'),
  instagram_url     text not null default 'https://www.instagram.com/uusemaree.br/',
  instagram_handle  text not null default '@uusemaree.br',
  installments_max  smallint not null default 6 check (installments_max between 1 and 12),
  announcement      text[] not null default array['Envio para todo o Brasil', 'Parcele em até 6x sem juros', 'Compra 100% segura'],
  updated_at        timestamptz not null default now()
);
comment on column public.store_settings.whatsapp is 'DDI + DDD + número, só dígitos. Ex.: 5511999998888';

create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

create policy "Configurações: leitura pública" on public.store_settings
  for select to anon, authenticated using (true);

create policy "Configurações: admin edita" on public.store_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;

-- =====================================================================
-- PRODUTOS
-- =====================================================================
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,                     -- '01', '02'… (pasta das fotos)
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name            text not null check (char_length(name) between 2 and 120),
  type            public.product_type not null,
  line            public.product_line not null,
  category_label  text not null,                            -- 'Maré Move · Conjuntos fitness'
  color           text,
  swatch          text,                                     -- cor/gradiente CSS do filtro
  brand           text,
  price           numeric(10,2) not null check (price > 0),
  old_price       numeric(10,2) check (old_price is null or old_price > price), -- preenchido = promoção
  available       boolean not null default true,            -- false = "Esgotado"
  active          boolean not null default true,            -- false = oculto do site
  spotlight       boolean not null default false,           -- card flutuante de destaques
  sort_order      integer not null default 0,
  description     text not null default '',
  flavors         text[],                                   -- suplementos
  package_size    text,                                     -- suplementos: 'Pote de 210 g'
  usage           text,                                     -- suplementos: modo de uso
  notice          text,                                     -- suplementos: aviso legal
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on column public.products.old_price is 'Preço antigo. Quando preenchido, a peça entra em Promoções.';

create index products_listing_idx on public.products (active, available desc, sort_order);
create index products_line_idx    on public.products (line);
create index products_type_idx    on public.products (type);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "Produtos: leitura pública dos ativos" on public.products
  for select to anon, authenticated
  using (active or (select public.is_admin()));

create policy "Produtos: admin cria" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "Produtos: admin edita" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Produtos: admin exclui" on public.products
  for delete to authenticated using ((select public.is_admin()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- =====================================================================
-- FOTOS DOS PRODUTOS
-- =====================================================================
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  path        text not null,      -- foto grande (1000px). Caminho do site ou URL do Storage
  thumb_path  text not null,      -- miniatura (480px)
  alt         text,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  unique (product_id, position)
);

alter table public.product_images enable row level security;

create policy "Fotos: leitura pública dos produtos ativos" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p
                 where p.id = product_id and (p.active or (select public.is_admin()))));

create policy "Fotos: admin cria" on public.product_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "Fotos: admin edita" on public.product_images
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Fotos: admin exclui" on public.product_images
  for delete to authenticated using ((select public.is_admin()));

grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;

-- =====================================================================
-- FAVORITOS (cliente logada)
-- =====================================================================
create table public.favorites (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index favorites_product_idx on public.favorites (product_id);

alter table public.favorites enable row level security;

create policy "Favoritos: ver os próprios" on public.favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Favoritos: adicionar os próprios" on public.favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Favoritos: remover os próprios" on public.favorites
  for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, delete on public.favorites to authenticated;

-- =====================================================================
-- AVALIAÇÕES (moderadas pela loja)
-- =====================================================================
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_name  text,                                         -- preenchido pelo trigger
  rating       smallint not null check (rating between 1 and 5),
  comment      text check (char_length(comment) <= 2000),
  photos       text[] not null default '{}' check (cardinality(photos) <= 4),
  status       public.review_status not null default 'pendente',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_status_idx on public.reviews (product_id, status);
create index reviews_user_idx on public.reviews (user_id);

-- Preenche o nome público e garante que só a loja aprova:
-- qualquer edição feita pela cliente volta para "pendente".
create or replace function public.reviews_before_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    new.status := 'pendente';
    new.user_id := auth.uid();
    select split_part(coalesce(p.full_name, 'Cliente Maré'), ' ', 1)
      into new.author_name
      from public.profiles p where p.id = auth.uid();
    new.author_name := coalesce(new.author_name, 'Cliente Maré');
  end if;
  return new;
end $$;
revoke all on function public.reviews_before_write() from public, anon, authenticated;

create trigger reviews_before_write before insert or update on public.reviews
  for each row execute function public.reviews_before_write();
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy "Avaliações: públicas quando aprovadas; a autora vê as suas" on public.reviews
  for select to anon, authenticated
  using (status = 'aprovada' or user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Avaliações: cliente logada cria a sua" on public.reviews
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "Avaliações: autora ou admin edita" on public.reviews
  for update to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Avaliações: autora ou admin exclui" on public.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

-- Resumo de notas por produto (respeita o RLS: só conta avaliações aprovadas).
create view public.product_ratings with (security_invoker = true) as
  select product_id,
         round(avg(rating)::numeric, 1) as average,
         count(*)::int                  as total
  from public.reviews
  where status = 'aprovada'
  group by product_id;
grant select on public.product_ratings to anon, authenticated;

-- =====================================================================
-- NEWSLETTER ("Receba novidades" no rodapé)
-- =====================================================================
create table public.newsletter_subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(email) <= 254),
  source           text not null default 'rodape',
  created_at       timestamptz not null default now(),
  unsubscribed_at  timestamptz
);
create unique index newsletter_email_unique on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

create policy "Newsletter: só admin lê" on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));
create policy "Newsletter: só admin edita" on public.newsletter_subscribers
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Newsletter: só admin exclui" on public.newsletter_subscribers
  for delete to authenticated using ((select public.is_admin()));

revoke all on public.newsletter_subscribers from anon, authenticated;
grant select, update, delete on public.newsletter_subscribers to authenticated;

-- Cadastro pelo site via RPC: não revela se o e-mail já existia
-- e reativa quem tinha saído da lista.
create or replace function public.subscribe_newsletter(p_email text, p_source text default 'rodape')
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or char_length(v_email) > 254 then
    raise exception 'E-mail inválido' using errcode = '22023';
  end if;
  insert into public.newsletter_subscribers (email, source)
  values (v_email, left(coalesce(p_source, 'rodape'), 40))
  on conflict (lower(email)) do update set unsubscribed_at = null;
end $$;
revoke all on function public.subscribe_newsletter(text, text) from public;
grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;

-- =====================================================================
-- STORAGE
-- produtos   → fotos do catálogo (leitura pública, só admin envia)
-- avaliacoes → fotos das clientes (leitura pública, cada uma na sua pasta {user_id}/)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('produtos',   'produtos',   true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('avaliacoes', 'avaliacoes', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/heic', 'image/avif']);

create policy "Storage produtos: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and (select public.is_admin()));
create policy "Storage produtos: admin atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'produtos' and (select public.is_admin()));
create policy "Storage produtos: admin exclui" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and (select public.is_admin()));

create policy "Storage avaliações: cliente envia na sua pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avaliacoes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Storage avaliações: dona ou admin exclui" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avaliacoes' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));

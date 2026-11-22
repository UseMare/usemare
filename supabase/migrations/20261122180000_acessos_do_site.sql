-- Contador de acessos próprio (sem Google, sem cookies, sem dado pessoal).
-- O site registra cada página vista com um código aleatório do navegador (não liga a ninguém).
-- Só o painel (admin) lê os números, já somados, pela função site_stats.

create table if not exists public.site_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor    uuid not null,
  path       text not null,
  product_id uuid references public.products(id) on delete set null,
  is_entry   boolean not null default false,
  source     text,
  device     text
);
create index if not exists site_events_created_idx on public.site_events (created_at);
create index if not exists site_events_visitor_idx on public.site_events (visitor, created_at);
create index if not exists site_events_product_idx on public.site_events (product_id, created_at) where product_id is not null;

alter table public.site_events enable row level security;
-- Nenhuma política: ninguém lê nem grava direto. Gravação só por track_event; leitura só por site_stats.
revoke all on public.site_events from anon, authenticated;

create or replace function public.track_event(p_visitor uuid, p_path text, p_entry boolean default false, p_ref text default null, p_device text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_path text := left(coalesce(p_path, '/'), 300);
  v_slug text;
  v_product uuid;
  v_source text;
begin
  if p_visitor is null or v_path not like '/%' or v_path like '/painel-loja%' then return; end if;
  -- quem administra a loja não conta como visita
  if private.is_admin() then return; end if;
  -- evita contar duas vezes a mesma página em poucos segundos
  if exists (select 1 from site_events where visitor = p_visitor and path = v_path and created_at > now() - interval '10 seconds') then return; end if;

  if v_path like '/produto/%' then
    v_slug := split_part(substr(v_path, 10), '/', 1);
    select id into v_product from products where slug = v_slug or v_slug = any(old_slugs) limit 1;
  end if;

  if p_entry then
    v_source := case
      when p_ref is null or btrim(p_ref) = '' then 'Direto'
      when p_ref ~* 'instagram' then 'Instagram'
      when p_ref ~* 'whatsapp|wa\.me' then 'WhatsApp'
      when p_ref ~* 'facebook|fb\.|fban|fbav' then 'Facebook'
      when p_ref ~* 'tiktok' then 'TikTok'
      when p_ref ~* 'google' then 'Google'
      when p_ref ~* 'bing|yahoo|duckduckgo|ecosia' then 'Outras buscas'
      else 'Outros sites'
    end;
  end if;

  insert into site_events (visitor, path, product_id, is_entry, source, device)
  values (p_visitor, v_path, v_product, coalesce(p_entry, false), v_source,
          case when p_device in ('celular', 'computador') then p_device end);
end;
$$;
revoke all on function public.track_event(uuid, text, boolean, text, text) from public;
grant execute on function public.track_event(uuid, text, boolean, text, text) to anon, authenticated;

-- Números do painel. p_days = 1 (hoje, por hora), 7 ou 30 (por dia). Horário de Brasília.
create or replace function public.site_stats(p_days int default 7)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tz constant text := 'America/Sao_Paulo';
  days int := greatest(1, least(coalesce(p_days, 7), 90));
  since timestamptz := (date_trunc('day', now() at time zone tz) - make_interval(days => days - 1)) at time zone tz;
  prev_since timestamptz := since - make_interval(days => days);
  result jsonb;
begin
  if not private.is_admin() then raise exception 'sem permissão' using errcode = '42501'; end if;

  with cur as (select * from site_events where created_at >= since),
       prev as (select * from site_events where created_at >= prev_since and created_at < since),
       buckets as (
         select b from generate_series(
           case when days = 1 then date_trunc('day', now() at time zone tz) else (since at time zone tz) end,
           case when days = 1 then date_trunc('hour', now() at time zone tz) else date_trunc('day', now() at time zone tz) end,
           case when days = 1 then interval '1 hour' else interval '1 day' end) b
       )
  select jsonb_build_object(
    'visitors',      (select count(distinct visitor) from cur),
    'visits',        (select count(*) from cur where is_entry),
    'pageviews',     (select count(*) from cur),
    'productViews',  (select count(*) from cur where product_id is not null),
    'prevVisitors',  (select count(distinct visitor) from prev),
    'prevPageviews', (select count(*) from prev),
    'series', (select coalesce(jsonb_agg(jsonb_build_object('t', b, 'visitors', coalesce(s.v, 0), 'pageviews', coalesce(s.p, 0)) order by b), '[]')
               from buckets left join (
                 select date_trunc(case when days = 1 then 'hour' else 'day' end, created_at at time zone tz) t,
                        count(distinct visitor) v, count(*) p
                 from cur group by 1) s on s.t = b),
    'products', (select coalesce(jsonb_agg(x order by x.views desc), '[]') from (
                   select product_id id, count(*) views, count(distinct visitor) visitors
                   from cur where product_id is not null group by product_id order by count(*) desc limit 10) x),
    'sources',  (select coalesce(jsonb_agg(x order by x.visits desc), '[]') from (
                   select source name, count(*) visits from cur where is_entry and source is not null group by source) x),
    'devices',  (select coalesce(jsonb_agg(x order by x.visitors desc), '[]') from (
                   select device name, count(distinct visitor) visitors from cur where device is not null group by device) x),
    'pages',    (select coalesce(jsonb_agg(x order by x.views desc), '[]') from (
                   select path, count(*) views from cur where product_id is null group by path order by count(*) desc limit 6) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.site_stats(int) from public;
grant execute on function public.site_stats(int) to authenticated;

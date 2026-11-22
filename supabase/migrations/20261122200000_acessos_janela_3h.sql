-- Contador de acessos: o mesmo aparelho não reconta por 3 horas.
-- - Visita nova: só se o aparelho ficou 3 h sem nenhum acesso (abrir aba nova/recarregar não soma).
-- - A mesma página (ou peça) no mesmo aparelho conta 1 vez a cada 3 h; páginas diferentes somam.
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
  v_last timestamptz;
  v_new_visit boolean;
begin
  if p_visitor is null or v_path not like '/%' or v_path like '/painel-loja%' then return; end if;
  if private.is_admin() then return; end if;
  -- mesma página no mesmo aparelho nas últimas 3 h: não conta de novo
  if exists (select 1 from site_events where visitor = p_visitor and path = v_path and created_at > now() - interval '3 hours') then return; end if;

  select max(created_at) into v_last from site_events where visitor = p_visitor;
  v_new_visit := v_last is null or v_last < now() - interval '3 hours';

  if v_path like '/produto/%' then
    v_slug := split_part(substr(v_path, 10), '/', 1);
    select id into v_product from products where slug = v_slug or v_slug = any(old_slugs) limit 1;
  end if;

  if v_new_visit then
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
  values (p_visitor, v_path, v_product, v_new_visit, v_source,
          case when p_device in ('celular', 'computador') then p_device end);
end;
$$;

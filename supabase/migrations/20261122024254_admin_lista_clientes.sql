-- Painel → Clientes: lista as contas de cliente com nome, e-mail, WhatsApp, cadastro, último acesso
-- e nº de favoritos. O e-mail fica em auth.users (fora do alcance da API), por isso a função roda
-- como dona (security definer) e SÓ responde para admin; para qualquer outra conta dá erro.
create or replace function public.admin_list_clientes()
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  favorites integer
)
language plpgsql
stable
security definer
set search_path to ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Acesso restrito à administração da loja.' using errcode = '42501';
  end if;
  return query
    select p.id, p.full_name, u.email::text, p.phone, p.avatar_url, u.created_at, u.last_sign_in_at,
           (select count(*)::integer from public.favorites f where f.user_id = p.id)
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.role = 'cliente'
     order by u.created_at desc;
end $$;

revoke execute on function public.admin_list_clientes() from public, anon;
grant execute on function public.admin_list_clientes() to authenticated;

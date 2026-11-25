-- Painel → Configurações → Administração: lista todas as contas com o nível (Usuário comum ou Admin)
-- e deixa uma admin promover ou rebaixar outra. As duas funções rodam como dona (o e-mail fica em
-- auth.users e a coluna role é bloqueada para a API) e SÓ respondem para admin.

create or replace function public.admin_list_users()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.user_role,
  last_sign_in_at timestamptz
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
    select p.id, p.full_name, u.email::text, p.role, u.last_sign_in_at
      from public.profiles p
      join auth.users u on u.id = p.id
     order by (p.role = 'admin') desc, lower(coalesce(nullif(p.full_name, ''), u.email::text));
end $$;

revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- Troca o nível de uma conta. Regras: só admin chama; ninguém rebaixa a si mesma
-- (evita ficar trancada fora do painel); a loja nunca fica sem nenhuma admin.
create or replace function public.admin_set_role(p_user uuid, p_role public.user_role)
returns void
language plpgsql
volatile
security definer
set search_path to ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Acesso restrito à administração da loja.' using errcode = '42501';
  end if;
  if p_user = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'Você não pode tirar o seu próprio acesso de admin.' using errcode = '42501';
  end if;
  if p_role <> 'admin' and (select count(*) from public.profiles where role = 'admin' and id <> p_user) = 0 then
    raise exception 'A loja precisa ter pelo menos uma admin.' using errcode = '42501';
  end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then
    raise exception 'Conta não encontrada.' using errcode = 'P0002';
  end if;
end $$;

revoke execute on function public.admin_set_role(uuid, public.user_role) from public, anon;
grant execute on function public.admin_set_role(uuid, public.user_role) to authenticated;

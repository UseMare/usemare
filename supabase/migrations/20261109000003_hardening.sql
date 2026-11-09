-- Ajustes apontados pelo Security Advisor.

-- 1) is_admin() sai do schema exposto pela API (public) para um schema privado.
--    As policies continuam funcionando (referenciam a função pelo OID).
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;

-- O trigger de avaliações chama a função pelo nome: atualiza para o novo schema.
create or replace function public.reviews_before_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then
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

-- 2) Função de event trigger do "RLS automático": não precisa ser chamável pela API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Obs.: subscribe_newsletter() continua pública de propósito (é o formulário do rodapé).

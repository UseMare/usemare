-- Admin só por convite: o cadastro do site (sem confirmação de e-mail) sempre cria 'cliente'.
-- Contas criadas pelo convite do Supabase (Authentication → Users → Invite user) já nascem com
-- invited_at preenchido; só a chave secreta do projeto consegue convidar, então ninguém forja isso.
-- A lista private.admin_emails deixa de dar admin (com o cadastro sem confirmação, qualquer pessoa
-- poderia se cadastrar com um e-mail da lista antes da dona dele).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    left(nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'nome')), ''), 120),
    case when new.invited_at is not null then 'admin'::public.user_role else 'cliente'::public.user_role end
  );
  return new;
end $$;

comment on table private.admin_emails is 'Sem uso desde 2026-11-22: admin agora é só quem entra por convite (handle_new_user).';

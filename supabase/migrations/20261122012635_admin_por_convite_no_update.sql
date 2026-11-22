-- O Supabase cria a conta do convite e só depois preenche invited_at (UPDATE), por isso
-- handle_new_user (INSERT) não enxerga o convite. Este gatilho promove a admin quando
-- invited_at passa de vazio para preenchido, o que só o endpoint de convite (chave secreta) faz.
create or replace function public.handle_user_invited()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  update public.profiles set role = 'admin'::public.user_role where id = new.id;
  return new;
end $$;

create trigger on_auth_user_invited
  after update of invited_at on auth.users
  for each row
  when (old.invited_at is null and new.invited_at is not null)
  execute function public.handle_user_invited();

revoke execute on function public.handle_user_invited() from public, anon, authenticated;

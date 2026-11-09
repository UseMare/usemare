-- E-mails que viram admin automaticamente ao se cadastrar no site.
-- Para adicionar outra pessoa: insert into private.admin_emails (email) values ('...');
create table private.admin_emails (
  email text primary key check (email = lower(email))
);
revoke all on private.admin_emails from public, anon, authenticated;

insert into private.admin_emails (email) values ('jonaslimasousa9@gmail.com');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'nome')), ''),
    case when exists (select 1 from private.admin_emails a where a.email = lower(new.email))
         then 'admin'::public.user_role else 'cliente'::public.user_role end
  );
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Se a conta já existir, promove agora.
update public.profiles p set role = 'admin'
from auth.users u
where u.id = p.id and lower(u.email) in (select email from private.admin_emails);

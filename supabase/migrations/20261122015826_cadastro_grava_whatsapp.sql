-- Cadastro pelo site manda o WhatsApp em raw_user_meta_data.phone (só dígitos: DDD + 9 dígitos).
-- Só grava se estiver no formato de celular brasileiro; qualquer outra coisa vira vazio.
-- Papel continua: sempre 'cliente' aqui; admin só por convite (handle_user_invited).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_phone text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g');
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    left(nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'nome')), ''), 120),
    case when v_phone ~ '^[1-9]{2}9[0-9]{8}$' then v_phone end,
    case when new.invited_at is not null then 'admin'::public.user_role else 'cliente'::public.user_role end
  );
  return new;
end $$;

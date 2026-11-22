-- Defesa extra: visitante (anon) e cliente (authenticated) nunca precisam de TRUNCATE, TRIGGER
-- ou REFERENCES. TRUNCATE em especial ignora o RLS. A API do Supabase não oferece esses comandos,
-- mas não há motivo para a permissão existir. Vale também para tabelas criadas no futuro.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
alter default privileges for role postgres in schema public revoke truncate, trigger, references on tables from anon, authenticated;

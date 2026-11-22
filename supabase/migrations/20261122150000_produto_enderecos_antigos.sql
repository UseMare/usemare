-- Endereço do produto acompanha o nome; os endereços antigos ficam guardados aqui
-- para os links já compartilhados continuarem abrindo (o site redireciona para o atual).
alter table public.products add column if not exists old_slugs text[] not null default '{}';
create index if not exists products_old_slugs_idx on public.products using gin (old_slugs);

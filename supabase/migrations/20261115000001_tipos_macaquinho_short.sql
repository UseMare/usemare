-- Novos tipos de peça: macaquinho e short.
-- Rode este arquivo SOZINHO primeiro (o Postgres só deixa usar um valor novo de enum depois que ele é salvo).
alter type public.product_type add value if not exists 'macaquinho';
alter type public.product_type add value if not exists 'short';

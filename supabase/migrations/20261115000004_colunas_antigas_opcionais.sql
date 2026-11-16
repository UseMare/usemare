-- Painel — etapa 3: o site passou a ler categorias (product_categories), cores (colors),
-- ficha (kind) e destaques (store_settings.spotlight_ids).
-- As colunas antigas ficam guardadas, mas deixam de ser obrigatórias para o painel
-- conseguir criar produtos novos sem elas.
alter table public.products
  alter column type drop not null,
  alter column line drop not null,
  alter column category_label drop not null;

comment on column public.products.type           is 'ANTIGA (não usada pelo site desde a etapa 3 do painel): use product_categories';
comment on column public.products.line           is 'ANTIGA (não usada pelo site desde a etapa 3 do painel): use product_categories';
comment on column public.products.category_label is 'ANTIGA (não usada pelo site desde a etapa 3 do painel): use product_categories';
comment on column public.products.color          is 'ANTIGA (não usada pelo site desde a etapa 3 do painel): use colors';
comment on column public.products.swatch         is 'ANTIGA (não usada pelo site desde a etapa 3 do painel): use colors';
comment on column public.products.spotlight      is 'ANTIGA (não usada pelo site desde a etapa 3 do painel): use store_settings.spotlight_ids';

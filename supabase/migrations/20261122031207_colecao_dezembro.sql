-- Coleção Dezembro: categoria nova (coleção) + 4 produtos com fotos em /img/produtos/24..27.
-- Os produtos ficam no topo de "Todos" (sort_order 1–4) e também em Moda feminina e no tipo
-- (Vestidos/Conjuntos). A página /colecao-dezembro lista o que estiver nesta categoria
-- (a loja troca as peças pelo painel → Produtos → categorias).
insert into public.categories (slug, name, kind, sort_order, active, home_card, banner_eyebrow, banner_title, banner_text)
values ('colecao-dezembro', 'Coleção Dezembro', 'colecao', 5, true, false,
        'Edição de fim de ano',
        E'Coleção\nDezembro.',
        'Peças escolhidas para brilhar nas festas: ceia de Natal, confraternizações e a virada do ano.')
on conflict (slug) do nothing;

with novos (code, slug, name, type, color, swatch, colors, price, sort_order, description, n_fotos, tipo_slug) as (values
  ('24', 'vestido-longo-laco-rubi', 'Vestido Longo Laço Rubi', 'vestido', 'Vermelho', '#b3121f',
   '[{"name": "Vermelho", "hex": "#b3121f"}]'::jsonb, 229.90, 1,
   E'Para brilhar nas festas de fim de ano. ✨\n\nVestido longo em tecido encorpado, com laço charmoso no ombro, cinto com fivela dourada que marca a cintura e saia com pregas que dão movimento a cada passo. Um vermelho intenso que é a cara do Natal.\n\nPerfeito para a ceia, para o amigo secreto e para qualquer ocasião especial. 🤎\n\nChama a Maré e garanta o seu! 🛍️',
   4, 'vestidos'),
  ('25', 'conjunto-cereja-e-brilho', 'Conjunto Cereja e Brilho', 'conjunto', 'Vermelho e branco', '#b8141e',
   '[{"name": "Vermelho", "hex": "#b8141e"}, {"name": "Branco", "hex": "#f7f5f2"}]'::jsonb, 189.90, 2,
   E'Look pronto para as festas. 🍒✨\n\nBlusa vermelha drapeada com botão dourado no ombro + short branco de alfaiataria com brilhos aplicados nos bolsos. Um contraste elegante e cheio de charme.\n\nDo almoço de Natal ao réveillon na praia. 🤎\n\nChama a Maré e garanta o seu! 🛍️',
   3, 'conjuntos'),
  ('26', 'vestido-assimetrico-perola', 'Vestido Assimétrico Pérola', 'vestido', 'Off-white', '#efe6d2',
   '[{"name": "Off-white", "hex": "#efe6d2"}]'::jsonb, 169.90, 3,
   E'Elegância em tom pérola. 🤍\n\nVestido curto assimétrico de um ombro só, com gola choker e camada esvoaçante que cai em diagonal. Leve, moderno e perfeito para virar o ano com estilo.\n\nUm clássico para o réveillon e para as festas de dezembro. ✨\n\nChama a Maré e garanta o seu! 🛍️',
   4, 'vestidos'),
  ('27', 'vestido-capa-escarlate', 'Vestido Capa Escarlate', 'vestido', 'Vermelho', '#c8161d',
   '[{"name": "Vermelho", "hex": "#c8161d"}]'::jsonb, 179.90, 4,
   E'Pura presença. ❤️\n\nVestido curto de um ombro só com capa em chiffon que flutua a cada movimento, argola dourada no ombro e saia em camadas. O vermelho que ilumina qualquer festa.\n\nPara a ceia, para as confraternizações e para todas as fotos de dezembro. ✨\n\nChama a Maré e garanta o seu! 🛍️',
   4, 'vestidos')
),
ins as (
  insert into public.products (code, slug, name, type, line, category_label, color, swatch, colors, sizes, details, price, available, active, spotlight, sort_order, description, kind)
  select code, slug, name, type::public.product_type, 'casual'::public.product_line, 'Coleção Dezembro', color, swatch, colors, array['P', 'M', 'G'], '[]'::jsonb, price, true, true, false, sort_order, description, 'roupa'
    from novos
  on conflict (code) do nothing
  returning id, code
),
fotos as (
  insert into public.product_images (product_id, path, thumb_path, alt, position)
  select ins.id,
         format('/img/produtos/%s-%s.webp', ins.code, lpad(g::text, 2, '0')),
         format('/img/produtos/%s-%s-480.webp', ins.code, lpad(g::text, 2, '0')),
         format('%s — foto %s', n.name, g), g - 1
    from ins join novos n on n.code = ins.code
    cross join lateral generate_series(1, n.n_fotos) g
  returning product_id
)
insert into public.product_categories (product_id, category_id)
select ins.id, c.id
  from ins join novos n on n.code = ins.code
  join public.categories c on c.slug in ('colecao-dezembro', 'moda-feminina', n.tipo_slug)
on conflict do nothing;

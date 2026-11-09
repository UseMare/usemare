-- Seed: configurações da loja + catálogo inicial (gerado de src/products.js)
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

insert into public.products (code, slug, name, type, line, category_label, color, swatch, brand, price, old_price, available, spotlight, sort_order, description, flavors, package_size, usage, notice) values
  ('01', 'conjunto-mare-move-vinho', 'Conjunto Maré Move Vinho', 'conjunto', 'fitness', 'Maré Move · Conjuntos fitness', 'Vinho', '#7b2233', null, 89.9, null, true, false, 10, 'Treino com elegância? A gente ama! 🍷✨

Blusa de manga curta com modelagem ajustadinha e short de cintura alta com costuras que valorizam o corpo. O vinho é aquele tom que deixa qualquer treino mais chique — e ainda fica lindo com jaqueta no pós-academia.

Com o bordado Maré no peito, do jeitinho que você merece. 🤎

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('02', 'conjunto-mare-move-verde', 'Conjunto Maré Move Verde', 'conjunto', 'fitness', 'Maré Move · Conjuntos fitness', 'Verde-oliva', '#5b5f2e', null, 89.9, null, true, true, 20, '💚 O seu novo pré-treino favorito chegou.

O conjunto verde da Maré Move une conforto, segurança e aquele caimento que faz você se sentir ainda mais linda para treinar. ✨

Regata com costas livres e short de cintura alta com bolsinho lateral para o celular ou a chave — porque detalhe faz toda a diferença.

Pra começar o treino se sentindo bem, confiante e pronta pra tudo. 🌊

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('03', 'conjunto-mare-move-amarelo', 'Conjunto Maré Move Amarelo', 'conjunto', 'fitness', 'Maré Move · Conjuntos fitness', 'Amarelo', '#efdc86', null, 89.9, null, true, false, 30, '☀️ Um solzinho pro seu treino!

Regata cavada de gola alta e short de cós largo, os dois com o bordado Maré em tom sobre tom. O amarelo suave deixa tudo mais leve — do alongamento à caminhada no fim de tarde.

Daquelas peças que você veste e já sai sorrindo. 🥹✨

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('04', 'vestido-longo-azulejo', 'Vestido Longo Azulejo', 'vestido', 'casual', 'Moda feminina', 'Azul e branco', 'linear-gradient(135deg,#2b56c4 50%,#fff 50%)', null, 159.9, null, true, true, 40, '🌊 Leve, fresco e impossível de passar despercebido.

Tomara que caia com busto franzido em lastex, que acompanha o corpo com conforto, e estampa em azul e branco inspirada em azulejos, com flores e passarinhos. A saia ampla em camadas ganha movimento a cada passo. 💙

Perfeito para dias de sol, viagens e aquele almoço especial.

Seja sempre sua melhor escolha. ✨', null, null, null, null),
  ('05', 'vestido-babado-salmao', 'Vestido Babado Salmão', 'vestido', 'casual', 'Moda feminina', 'Salmão', '#e3a487', null, 119.9, null, true, false, 50, 'Delicado na medida certa. 🌷

Ombros estruturados, cintura marcadinha com faixa transpassada e babado na barra que dá aquele balanço lindo ao andar. O tom salmão ilumina a pele e deixa o look romântico sem esforço.

Do almoço de domingo ao fim de tarde com as amigas. 🤎

Chama a Maré e garanta o seu! 🛍️', null, null, null, null),
  ('06', 'saia-longa-linho-cru', 'Saia Longa Linho Cru', 'saia', 'casual', 'Saias & calças', 'Cru', '#e6dccb', null, 99.9, null, true, false, 60, 'Elegância que nasce do simples. 🤍

Saia longa de cintura alta com botõezinhos na frente e fenda que dá liberdade a cada passo. O tecido com aparência de linho, em tom cru, cai leve e fluido.

Combina com regata, body ou camisa — e te deixa pronta pra qualquer ocasião. ✨

É sobre nunca se esquecer que você merece muito. 🌊', null, null, null, null),
  ('07', 'blusa-flora', 'Blusa Flora', 'blusa', 'casual', 'Blusas', 'Off-white', '#f4efe6', null, 49.9, null, true, false, 70, '✨ Chegou aquele detalhe que faz toda a diferença! 🌷🤎

Blusa off-white de golinha alta e manga curta em tecido texturizado, com aplicação de flor em crochê que traz um toque delicado, romântico e super exclusivo para o look.

Daquelas peças que você olha e pensa: “preciso dessa!” 🥹✨

Chama a Maré e garanta a sua! 🛍️', null, null, null, null),
  ('08', 'vestido-midi-canelado-nude', 'Vestido Midi Canelado Nude', 'vestido', 'casual', 'Moda feminina', 'Nude', '#d2b394', null, 129.9, null, true, true, 80, 'Para as noites em que você quer ser lembrada. ✨

Vestido midi de um ombro só em malha canelada, com faixa transpassada na cintura presa por uma fivela dourada e fenda lateral. Ajusta sem apertar e valoriza cada curva com elegância.

Jantar, aniversário, ocasião especial… ele resolve. 🤎

Vista-se com confiança. Vista sua melhor versão.', null, null, null, null),
  ('09', 'vestido-babados-azul-ceu', 'Vestido Babados Azul Céu', 'vestido', 'casual', 'Moda feminina', 'Azul-céu', '#9cbde6', null, 119.9, null, true, true, 90, 'Um pedacinho de céu pra você vestir. 💙☁️

Vestido de alcinhas com decote reto e saia em camadas de babados que dançam a cada passo. O azul clarinho e o tecido leve trazem frescor para os dias quentes.

Passeio, festinha de dia ou aquele domingo especial — ele vai com você. ✨

Chama a Maré e garanta o seu! 🛍️', null, null, null, null),
  ('10', 'regata-nina', 'Regata Nina', 'blusa', 'casual', 'Blusas', 'Off-white', '#f4efe6', null, 45.9, null, true, false, 100, 'O básico que não tem nada de básico. 🤍

Regata off-white em malha canelada com recorte vazado no ombro e um detalhe dourado que eleva qualquer look. Fica linda com short de alfaiataria, calça ou saia.

Peça coringa pra ter no guarda-roupa e usar sem medo de repetir. ✨

Seja sempre sua melhor escolha.', null, null, null, null),
  ('11', 'blusa-layla', 'Blusa Layla', 'blusa', 'casual', 'Blusas', 'Preto', '#1f1c1c', null, 39.9, null, true, false, 110, 'Confortável, soltinha e cheia de charme. 🖤

Blusa preta de manga curta com barra em tule sobreposto, que traz um toque romântico ao visual. Vai bem com calça de alfaiataria, jeans ou saia.

Daquelas que você coloca e já se sente pronta. ✨

Chama a Maré e garanta a sua! 🛍️', null, null, null, null),
  ('12', 'blusa-aurora', 'Blusa Aurora', 'blusa', 'casual', 'Blusas', 'Nude', '#d2b394', null, 59.9, null, true, false, 120, 'Elegância, personalidade e propósito em cada detalhe. 🌊🤎

Blusa nude de um ombro com franzido preso por aplique dourado e alça com lacinho no outro ombro. Delicada e marcante ao mesmo tempo — fica perfeita com short de alfaiataria e cinto.

Ela vestiu Maré e entregou tudo. ✨', null, null, null, null),
  ('13', 'life-slim-lifemore', 'Life Slim Lifemore', 'suplemento', 'suplementos', 'Suplementos · Lifemore', null, null, 'Lifemore', 119.9, null, true, true, 130, '💙 Seu momento de cuidado é na Maré! ✨

O Life Slim, da Lifemore, é um suplemento alimentar em pó termogênico e diurético, para quem quer conhecer melhor essa opção e incluir novos hábitos na rotina. Adoçado com stevia, vira um drink refrescante em segundos.

Disponível nos sabores Maçã Verde, Frutas Vermelhas e Citrus Fresh — pote de 210 g.

Chama a Maré e escolha o seu sabor! 🛍️', array['Maçã Verde', 'Frutas Vermelhas', 'Citrus Fresh'], 'Pote de 210 g', 'Misture 1 dosador (7 g) em 100 a 200 ml de água, de preferência pela manhã, e consuma logo após o preparo.', 'Suplemento alimentar. Não substitui uma alimentação equilibrada e hábitos de vida saudáveis. Gestantes, lactantes, crianças, pessoas em uso de medicamentos (como antidepressivos) ou com alguma condição de saúde devem consultar um médico ou nutricionista antes do consumo. Confira a composição completa no rótulo.'),
  ('14', 'life-creatina-beauty-lifemore', 'Life Creatina + Beauty Lifemore', 'suplemento', 'suplementos', 'Suplementos · Lifemore', null, null, 'Lifemore', 139.9, null, true, false, 140, '💗 Força e beleza no mesmo copo!

O Life Creatina + Beauty, da Lifemore, é creatina para complementar a rotina de quem busca suporte para o desempenho muscular, aliada à proposta Beauty: na fórmula, colágeno hidrolisado, ácido hialurônico, biotina e zinco.

Sabor Frutas Vermelhas — pote de 240 g. ✨

Seu momento de cuidado é na Maré! Chama a gente e garanta o seu. 🛍️', array['Frutas Vermelhas'], 'Pote de 240 g', 'Misture 1 dosador (8 g) em 150 ml de água ou leite.', 'Suplemento alimentar. Não substitui uma alimentação equilibrada e hábitos de vida saudáveis. Gestantes, lactantes, crianças, pessoas em uso de medicamentos (como antidepressivos) ou com alguma condição de saúde devem consultar um médico ou nutricionista antes do consumo. Confira a composição completa no rótulo.')
on conflict (code) do nothing;

insert into public.product_images (product_id, path, thumb_path, alt, position)
select p.id, v.path, v.thumb, p.name || ' — foto ' || (v.pos + 1), v.pos
from (values
  ('01', '/img/produtos/01-01.webp', '/img/produtos/01-01-480.webp', 0),
  ('01', '/img/produtos/01-02.webp', '/img/produtos/01-02-480.webp', 1),
  ('01', '/img/produtos/01-03.webp', '/img/produtos/01-03-480.webp', 2),
  ('01', '/img/produtos/01-04.webp', '/img/produtos/01-04-480.webp', 3),
  ('02', '/img/produtos/02-01.webp', '/img/produtos/02-01-480.webp', 0),
  ('02', '/img/produtos/02-02.webp', '/img/produtos/02-02-480.webp', 1),
  ('02', '/img/produtos/02-03.webp', '/img/produtos/02-03-480.webp', 2),
  ('02', '/img/produtos/02-04.webp', '/img/produtos/02-04-480.webp', 3),
  ('03', '/img/produtos/03-01.webp', '/img/produtos/03-01-480.webp', 0),
  ('03', '/img/produtos/03-02.webp', '/img/produtos/03-02-480.webp', 1),
  ('03', '/img/produtos/03-03.webp', '/img/produtos/03-03-480.webp', 2),
  ('03', '/img/produtos/03-04.webp', '/img/produtos/03-04-480.webp', 3),
  ('04', '/img/produtos/04-01.webp', '/img/produtos/04-01-480.webp', 0),
  ('04', '/img/produtos/04-02.webp', '/img/produtos/04-02-480.webp', 1),
  ('04', '/img/produtos/04-03.webp', '/img/produtos/04-03-480.webp', 2),
  ('04', '/img/produtos/04-04.webp', '/img/produtos/04-04-480.webp', 3),
  ('05', '/img/produtos/05-01.webp', '/img/produtos/05-01-480.webp', 0),
  ('05', '/img/produtos/05-02.webp', '/img/produtos/05-02-480.webp', 1),
  ('05', '/img/produtos/05-03.webp', '/img/produtos/05-03-480.webp', 2),
  ('05', '/img/produtos/05-04.webp', '/img/produtos/05-04-480.webp', 3),
  ('06', '/img/produtos/06-01.webp', '/img/produtos/06-01-480.webp', 0),
  ('06', '/img/produtos/06-02.webp', '/img/produtos/06-02-480.webp', 1),
  ('06', '/img/produtos/06-03.webp', '/img/produtos/06-03-480.webp', 2),
  ('06', '/img/produtos/06-04.webp', '/img/produtos/06-04-480.webp', 3),
  ('07', '/img/produtos/07-01.webp', '/img/produtos/07-01-480.webp', 0),
  ('07', '/img/produtos/07-02.webp', '/img/produtos/07-02-480.webp', 1),
  ('07', '/img/produtos/07-03.webp', '/img/produtos/07-03-480.webp', 2),
  ('07', '/img/produtos/07-04.webp', '/img/produtos/07-04-480.webp', 3),
  ('08', '/img/produtos/08-01.webp', '/img/produtos/08-01-480.webp', 0),
  ('08', '/img/produtos/08-02.webp', '/img/produtos/08-02-480.webp', 1),
  ('08', '/img/produtos/08-03.webp', '/img/produtos/08-03-480.webp', 2),
  ('08', '/img/produtos/08-04.webp', '/img/produtos/08-04-480.webp', 3),
  ('09', '/img/produtos/09-01.webp', '/img/produtos/09-01-480.webp', 0),
  ('09', '/img/produtos/09-02.webp', '/img/produtos/09-02-480.webp', 1),
  ('09', '/img/produtos/09-03.webp', '/img/produtos/09-03-480.webp', 2),
  ('09', '/img/produtos/09-04.webp', '/img/produtos/09-04-480.webp', 3),
  ('10', '/img/produtos/10-01.webp', '/img/produtos/10-01-480.webp', 0),
  ('10', '/img/produtos/10-02.webp', '/img/produtos/10-02-480.webp', 1),
  ('10', '/img/produtos/10-03.webp', '/img/produtos/10-03-480.webp', 2),
  ('10', '/img/produtos/10-04.webp', '/img/produtos/10-04-480.webp', 3),
  ('11', '/img/produtos/11-01.webp', '/img/produtos/11-01-480.webp', 0),
  ('11', '/img/produtos/11-02.webp', '/img/produtos/11-02-480.webp', 1),
  ('12', '/img/produtos/12-01.webp', '/img/produtos/12-01-480.webp', 0),
  ('12', '/img/produtos/12-02.webp', '/img/produtos/12-02-480.webp', 1),
  ('12', '/img/produtos/12-03.webp', '/img/produtos/12-03-480.webp', 2),
  ('12', '/img/produtos/12-04.webp', '/img/produtos/12-04-480.webp', 3),
  ('13', '/img/produtos/13-01.webp', '/img/produtos/13-01-480.webp', 0),
  ('13', '/img/produtos/13-02.webp', '/img/produtos/13-02-480.webp', 1),
  ('13', '/img/produtos/13-03.webp', '/img/produtos/13-03-480.webp', 2),
  ('14', '/img/produtos/14-01.webp', '/img/produtos/14-01-480.webp', 0),
  ('14', '/img/produtos/14-02.webp', '/img/produtos/14-02-480.webp', 1)
) as v(code, path, thumb, pos)
join public.products p on p.code = v.code
on conflict (product_id, position) do nothing;

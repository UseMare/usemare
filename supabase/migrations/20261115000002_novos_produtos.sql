-- Novos produtos #15 a #23 (rode DEPOIS de 20261115000001_tipos_macaquinho_short.sql)
-- Preços provisórios — confirmar com a loja.
insert into public.products (code, slug, name, type, line, category_label, color, swatch, brand, price, old_price, available, spotlight, sort_order, description, flavors, package_size, usage, notice) values
  ('15', 'calca-alfaiataria-helena', 'Calça Alfaiataria Helena', 'calca', 'casual', 'Saias, calças & shorts', 'Chocolate, preto e cinza', 'linear-gradient(135deg,#4a2c22 33%,#1d1d1d 33% 66%,#6e6e72 66%)', null, 129.9, null, true, false, 150, 'Elegância que acompanha o seu dia inteiro. 🤎

Calça de alfaiataria de cintura alta, com pregas frontais, bolsos laterais e cinto com fivela dourada que já vem junto e finaliza o look. A modelagem reta alonga a silhueta e cai bem do trabalho ao jantar.

Disponível em chocolate, preto e cinza: difícil escolher uma só. ✨

Chama a Maré e garanta a sua! 🛍️', null, null, null, null),
  ('16', 'macaquinho-mare-move-azul-royal', 'Macaquinho Maré Move Azul Royal', 'macaquinho', 'fitness', 'Maré Move · Macaquinhos', 'Azul royal', '#1f5fd6', null, 99.9, null, true, false, 160, '💙 Um azul que ninguém esquece.

Macaquinho de alcinhas finas com decote reto e costas abertas com tirinha, que valoriza as costas e deixa o treino mais fresquinho. A modelagem ajustada abraça o corpo e as costuras desenham a silhueta.

Uma peça só, look pronto: é vestir e ir. 🌊

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('17', 'macaquinho-mare-move-vermelho-retro', 'Macaquinho Maré Move Vermelho Retrô', 'macaquinho', 'fitness', 'Maré Move · Macaquinhos', 'Vermelho', '#e0352b', null, 99.9, null, true, false, 170, '❤️ Ousado na medida certa.

Macaquinho de manguinha curta, com decote arredondado e recorte nas costas, todo acabado com viés branco que traz um charme retrô. Ajustado no corpo, ele valoriza cada curva.

Para treinar e para ser vista. 🔥✨

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('18', 'vestido-mare-move-azul-bebe', 'Vestido Maré Move Azul Bebê', 'vestido', 'fitness', 'Maré Move · Vestidos fitness', 'Azul bebê', '#a9cdee', null, 109.9, null, true, false, 180, '🎾 Esportivo, leve e cheio de charme.

Vestido fitness de regata cavada, com recortes que marcam a cintura e barra arredondada que balança a cada movimento. O azul bebê deixa o look delicado, do treino ao passeio.

Prático como deve ser e lindo como você merece. 🩵

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('19', 'short-alfaiataria-menta', 'Short Alfaiataria Menta', 'short', 'casual', 'Saias, calças & shorts', 'Verde menta', '#bfe3d6', null, 79.9, null, true, false, 190, '🍃 Frescor para os dias de sol.

Short de alfaiataria de cintura alta, com bolsos frontais, botão dourado e cinto nude que já vem junto. O verde menta é tendência e combina com tudo, de regata básica a camisa.

Leve, chique e confortável. ✨

Chama a Maré e garanta o seu! 🛍️', null, null, null, null),
  ('20', 'macaquinho-mare-move-rosa-candy', 'Macaquinho Maré Move Rosa Candy', 'macaquinho', 'fitness', 'Maré Move · Macaquinhos', 'Rosa', '#f08cc0', null, 99.9, null, true, false, 200, '🩷 Doce, mas com atitude.

Macaquinho rosa de alcinhas com costas bem abertas, contornado por viés azul bebê que cria aquele contraste fofo. Ajustadinho no corpo, valoriza a silhueta do jeito certo.

Para quem treina com estilo e não abre mão de cor. 🌸✨

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('21', 'conjunto-mare-move-cafe', 'Conjunto Maré Move Café', 'conjunto', 'fitness', 'Maré Move · Conjuntos fitness', 'Café', '#5a2e22', null, 89.9, null, true, false, 210, '☕ Tons terrosos que nunca saem de moda.

Regata cropped de gola alta e short soltinho de cós largo com barra arredondada, que dá liberdade total nos movimentos. O marrom café é elegante, combina com tudo e fica lindo com uma faixa no cabelo.

Do treino ao café pós-academia. 🤎

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('22', 'conjunto-mare-move-musgo', 'Conjunto Maré Move Musgo', 'conjunto', 'fitness', 'Maré Move · Conjuntos fitness', 'Verde musgo', '#7c8a4a', null, 89.9, null, true, false, 220, '🌿 Leveza para o seu dia a dia.

Regata cropped com forro em tom rosé e short de cós com elástico, soltinho e confortável. O verde musgo traz um ar natural e sofisticado para o look.

Para treinar, caminhar ou curtir o fim de semana. ✨

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null),
  ('23', 'conjunto-mare-move-magenta', 'Conjunto Maré Move Magenta', 'conjunto', 'fitness', 'Maré Move · Conjuntos fitness', 'Magenta', '#c21fb8', null, 89.9, null, true, false, 230, '💜 Energia para o seu treino!

Regata de gola alta e short soltinho de cós largo, no mesmo modelo queridinho do conjunto Café. Agora no magenta vibrante, que ilumina a pele e levanta o astral.

Combina com faixa no cabelo e muito sorriso. 😍✨

MARÉ MOVE — seu movimento, sua melhor versão.', null, null, null, null)
on conflict (code) do nothing;

insert into public.product_images (product_id, path, thumb_path, alt, position)
select p.id, v.path, v.thumb, p.name || ' — foto ' || (v.pos + 1), v.pos
from (values
  ('15', '/img/produtos/15-01.webp', '/img/produtos/15-01-480.webp', 0),
  ('15', '/img/produtos/15-02.webp', '/img/produtos/15-02-480.webp', 1),
  ('15', '/img/produtos/15-03.webp', '/img/produtos/15-03-480.webp', 2),
  ('15', '/img/produtos/15-04.webp', '/img/produtos/15-04-480.webp', 3),
  ('15', '/img/produtos/15-05.webp', '/img/produtos/15-05-480.webp', 4),
  ('16', '/img/produtos/16-01.webp', '/img/produtos/16-01-480.webp', 0),
  ('16', '/img/produtos/16-02.webp', '/img/produtos/16-02-480.webp', 1),
  ('16', '/img/produtos/16-03.webp', '/img/produtos/16-03-480.webp', 2),
  ('16', '/img/produtos/16-04.webp', '/img/produtos/16-04-480.webp', 3),
  ('17', '/img/produtos/17-01.webp', '/img/produtos/17-01-480.webp', 0),
  ('17', '/img/produtos/17-02.webp', '/img/produtos/17-02-480.webp', 1),
  ('17', '/img/produtos/17-03.webp', '/img/produtos/17-03-480.webp', 2),
  ('17', '/img/produtos/17-04.webp', '/img/produtos/17-04-480.webp', 3),
  ('18', '/img/produtos/18-01.webp', '/img/produtos/18-01-480.webp', 0),
  ('18', '/img/produtos/18-02.webp', '/img/produtos/18-02-480.webp', 1),
  ('18', '/img/produtos/18-03.webp', '/img/produtos/18-03-480.webp', 2),
  ('19', '/img/produtos/19-01.webp', '/img/produtos/19-01-480.webp', 0),
  ('19', '/img/produtos/19-02.webp', '/img/produtos/19-02-480.webp', 1),
  ('20', '/img/produtos/20-01.webp', '/img/produtos/20-01-480.webp', 0),
  ('20', '/img/produtos/20-02.webp', '/img/produtos/20-02-480.webp', 1),
  ('21', '/img/produtos/21-01.webp', '/img/produtos/21-01-480.webp', 0),
  ('21', '/img/produtos/21-02.webp', '/img/produtos/21-02-480.webp', 1),
  ('22', '/img/produtos/22-01.webp', '/img/produtos/22-01-480.webp', 0),
  ('22', '/img/produtos/22-02.webp', '/img/produtos/22-02-480.webp', 1),
  ('23', '/img/produtos/23-01.webp', '/img/produtos/23-01-480.webp', 0),
  ('23', '/img/produtos/23-02.webp', '/img/produtos/23-02-480.webp', 1)
) as v(code, path, thumb, pos)
join public.products p on p.code = v.code
where not exists (select 1 from public.product_images i where i.product_id = p.id and i.path = v.path);

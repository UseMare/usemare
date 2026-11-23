-- Parcelamento por produto (editor do produto no painel). Tudo vazio = segue o padrão das Configurações.
--   installments_times: nº de vezes (1 = só à vista; vazio = padrão da loja)
--   installment_value:  valor de cada parcela (vazio = preço ÷ vezes)
--   installment_note:   texto depois do valor (vazio = "sem juros"; ex.: "com juros", "no cartão")
alter table public.products
  add column if not exists installments_times smallint check (installments_times between 1 and 24),
  add column if not exists installment_value numeric(10,2) check (installment_value > 0),
  add column if not exists installment_note text check (length(installment_note) <= 40);

-- Painel — etapa 6: para APAGAR arquivos pela API, o Storage precisa que a conta também
-- consiga LER o registro do arquivo (storage.objects). Sem isso, o remove() não apaga nada.
-- Leitura liberada só para admin (as fotos continuam públicas pela URL, como sempre).
create policy "Storage produtos: admin lê" on storage.objects
  for select to authenticated using (bucket_id = 'produtos' and (select private.is_admin()));
create policy "Storage site: admin lê" on storage.objects
  for select to authenticated using (bucket_id = 'site' and (select private.is_admin()));

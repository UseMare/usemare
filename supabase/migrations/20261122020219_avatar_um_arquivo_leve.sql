-- Foto de perfil: o site envia um WebP de ~10–20 KB (320×320, qualidade 50%).
-- O servidor garante isso mesmo para quem tentar enviar direto pela API:
--   - só WebP e no máximo 256 KB por arquivo;
--   - cada cliente só grava o arquivo <id>/avatar.webp (um por cliente, a nova substitui a antiga).
update storage.buckets
   set file_size_limit = 262144,
       allowed_mime_types = array['image/webp']
 where id = 'avatares';

alter policy "Storage avatares: cliente envia na sua pasta" on storage.objects
  with check (bucket_id = 'avatares' and name = (select auth.uid())::text || '/avatar.webp');

alter policy "Storage avatares: cliente atualiza a sua pasta" on storage.objects
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatares' and name = (select auth.uid())::text || '/avatar.webp');

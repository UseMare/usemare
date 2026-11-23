-- Foto de perfil: o Safari (iPhone/iPad) não gera WebP no navegador, então lá o site envia JPG.
-- Cada cliente continua com um único arquivo: <id>/avatar.webp OU <id>/avatar.jpg (máx. 256 KB).
update storage.buckets
   set allowed_mime_types = array['image/webp', 'image/jpeg']
 where id = 'avatares';

alter policy "Storage avatares: cliente envia na sua pasta" on storage.objects
  with check (bucket_id = 'avatares' and name in ((select auth.uid())::text || '/avatar.webp', (select auth.uid())::text || '/avatar.jpg'));

alter policy "Storage avatares: cliente atualiza a sua pasta" on storage.objects
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatares' and name in ((select auth.uid())::text || '/avatar.webp', (select auth.uid())::text || '/avatar.jpg'));

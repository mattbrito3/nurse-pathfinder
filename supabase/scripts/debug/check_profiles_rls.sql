-- Verificar políticas RLS da tabela profiles
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

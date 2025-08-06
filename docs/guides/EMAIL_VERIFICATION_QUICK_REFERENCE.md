# Guia de Referência Rápida - Verificação de Email

## 🎯 Problema Resolvido
**Token de verificação não estava sendo processado** → Usuários não conseguiam fazer login após verificação.

## ✅ Solução Implementada
2 Edge Functions + 1 página de verificação = Fluxo completo funcionando.

## 🔄 Fluxo Atual (Funcionando)
```
Cadastro → send-verification-email → Email → Clique no link → verify-email-token → Usuário confirmado → Login funciona
```

## 📁 Arquivos Principais

### Edge Functions
- `supabase/functions/send-verification-email/index.ts` - Cria usuário e envia email
- `supabase/functions/verify-email-token/index.ts` - Processa token e confirma usuário

### Frontend
- `src/pages/VerifyEmail.tsx` - Página que processa o link de verificação
- `src/hooks/useAuth.tsx` - Hook que chama a Edge Function de cadastro

### Banco de Dados
- `public.email_verification` - Tabela que armazena tokens
- `public.create_email_verification_token` - Função RPC que gera tokens

## 🚀 Comandos Essenciais

### Deploy
```bash
npx supabase functions deploy send-verification-email
npx supabase functions deploy verify-email-token
```

### Logs
```bash
npx supabase functions logs send-verification-email
npx supabase functions logs verify-email-token
```

### Debug SQL
```sql
-- Verificar tokens
SELECT * FROM public.email_verification WHERE email = 'email@example.com';

-- Verificar usuários
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'email@example.com';

-- Limpar tokens expirados
DELETE FROM public.email_verification WHERE expires_at < now();
```

## ⚙️ Configurações Críticas

### Supabase Dashboard
- **Authentication > Settings:**
  - ✅ "Confirm email" = **DESATIVADO**
  - ✅ Site URL = `https://dosecerta.online`
  - ✅ Redirect URLs = `https://dosecerta.online/verify-email`

### Variáveis de Ambiente
```bash
NEW_API_KEY_RESEND=re_xxxxxxxxxxxx
SMTP_USER=team@dosecerta.online
SMTP_PASS=xxxxxxxxxxxx
```

## 🧪 Teste Rápido
1. Cadastre um novo usuário
2. Verifique se email chegou
3. Clique no link de verificação
4. Confirme se aparece "Email verificado com sucesso!"
5. Tente fazer login → Deve funcionar ✅

## 🔍 Troubleshooting Rápido

| Problema | Verificar |
|----------|-----------|
| Email não chega | API Key do Resend + logs `send-verification-email` |
| Token inválido | Tabela `email_verification` + logs `verify-email-token` |
| Login falha | `auth.users` + `email_confirmed_at` |
| Usuário não confirmado | `email_confirm: true` em `auth.users` |

## 📞 Contatos de Emergência
- **Logs das Edge Functions:** Supabase Dashboard > Functions
- **Configurações:** Supabase Dashboard > Authentication > Settings
- **Resend:** Dashboard do Resend para métricas de email

---

**Status:** ✅ Funcionando  
**Última verificação:** Janeiro 2025  
**Próxima revisão:** Março 2025 

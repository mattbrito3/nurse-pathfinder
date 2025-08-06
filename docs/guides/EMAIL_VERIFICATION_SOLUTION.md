# Solução para Verificação de Email - Dose Certa

## 📋 Resumo do Problema

### Problema Original
- Usuários conseguiam se cadastrar e receber email de verificação
- Ao clicar no link de verificação, recebiam confirmação visual
- **MAS** não conseguiam fazer login posteriormente
- Sistema retornava "Email ou senha incorretos"
- Email permanecia disponível para novo cadastro

### Diagnóstico
O problema era que o **token de verificação não estava sendo processado**. O link gerava um token, mas não havia nenhum sistema processando esse token para confirmar o usuário no banco de dados.

## 🔧 Solução Implementada

### Arquitetura Final
```
1. Cadastro → Edge Function send-verification-email
2. Email enviado → Com token de verificação
3. Usuário clica no link → Página VerifyEmail.tsx
4. Token processado → Edge Function verify-email-token
5. Usuário confirmado → email_confirm: true
6. Login funciona → ✅ SUCESSO
```

### Componentes Criados/Modificados

#### 1. Edge Function: `send-verification-email`
**Localização:** `supabase/functions/send-verification-email/index.ts`

**Função:**
- Cria usuário no banco (sem confirmação automática)
- Gera token de verificação
- Envia email via Resend
- Salva dados na tabela `email_verification`

**Fluxo:**
```typescript
// 1. Criar usuário sem confirmação
const { data: user, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: false, // Não confirmar automaticamente
  user_metadata: { full_name: fullName }
});

// 2. Gerar token de verificação
const { data: tokenData, error: tokenError } = await supabase.rpc('create_email_verification_token', {
  p_email: email
});

// 3. Enviar email via Resend
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'dosecertasmtp <team@dosecerta.online>',
    to: email,
    subject: '🔐 Confirme seu email - Dose Certa',
    html: emailHtml
  })
});
```

#### 2. Edge Function: `verify-email-token`
**Localização:** `supabase/functions/verify-email-token/index.ts`

**Função:**
- Processa o token de verificação
- Confirma o usuário no banco de dados
- Marca como verificado na tabela `email_verification`

**Fluxo:**
```typescript
// 1. Verificar token na tabela email_verification
const { data: verificationData, error: verificationError } = await supabase
  .from('email_verification')
  .select('*')
  .eq('token', token)
  .single();

// 2. Verificar se usuário já existe
const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();
const user = existingUser.users.find(u => u.email?.toLowerCase() === verificationData.email.toLowerCase());

// 3. Confirmar usuário
if (user) {
  // Usuário existe, apenas confirmar email
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true
  });
} else {
  // Usuário não existe, criar novo
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: verificationData.email,
    password: verificationData.user_password,
    email_confirm: true,
    user_metadata: { full_name: verificationData.user_full_name }
  });
}

// 4. Marcar como verificado
await supabase
  .from('email_verification')
  .update({
    verified: true,
    verified_at: new Date().toISOString()
  })
  .eq('id', verificationData.id);
```

#### 3. Página: `VerifyEmail.tsx`
**Localização:** `src/pages/VerifyEmail.tsx`

**Função:**
- Recebe o token via URL
- Chama a Edge Function `verify-email-token`
- Exibe resultado da verificação
- Redireciona para login

**Fluxo:**
```typescript
// 1. Extrair token da URL
const token = searchParams.get('token');

// 2. Chamar Edge Function
const { data, error } = await supabase.functions.invoke('verify-email-token', {
  body: { token: verificationToken }
});

// 3. Exibir resultado
if (data.success) {
  setStatus('success');
  setMessage('Email verificado com sucesso!');
} else {
  setStatus('error');
  setMessage(data.message);
}
```

#### 4. Hook: `useAuth.tsx`
**Localização:** `src/hooks/useAuth.tsx`

**Modificação:**
- Função `signUp` agora chama a Edge Function `send-verification-email`
- Remove dependência do SMTP nativo do Supabase

```typescript
const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.functions.invoke('send-verification-email', {
    body: {
      email,
      password,
      fullName,
      action: 'register'
    }
  });
  
  return { error };
};
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `email_verification`
```sql
CREATE TABLE public.email_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  user_password TEXT NOT NULL,
  user_full_name TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Função RPC: `create_email_verification_token`
```sql
CREATE OR REPLACE FUNCTION public.create_email_verification_token(
  p_email TEXT
)
RETURNS TABLE(
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Gerar token único
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + interval '24 hours';
  
  -- Inserir na tabela
  INSERT INTO public.email_verification (
    email, token, user_password, user_full_name, expires_at
  ) VALUES (
    p_email, v_token, p_user_password, p_user_full_name, v_expires_at
  );
  
  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$;
```

## 🔧 Configurações Necessárias

### 1. Variáveis de Ambiente (Supabase)
```bash
# Resend API Key
NEW_API_KEY_RESEND=re_xxxxxxxxxxxx

# SMTP (opcional, usado como fallback)
SMTP_USER=team@dosecerta.online
SMTP_PASS=xxxxxxxxxxxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_NAME=Dose Certa
```

### 2. Configurações do Supabase Dashboard
- **Authentication > Settings:**
  - "Confirm email" deve estar **DESATIVADO** (Edge Functions cuidam do envio)
  - Site URL: `https://dosecerta.online`
  - Redirect URLs: `https://dosecerta.online/verify-email`

### 3. Configurações do Resend
- API Key configurada
- Domínio `dosecerta.online` verificado
- From email: `team@dosecerta.online`

## 🚀 Deploy e Manutenção

### Deploy das Edge Functions
```bash
# Deploy send-verification-email
npx supabase functions deploy send-verification-email

# Deploy verify-email-token
npx supabase functions deploy verify-email-token
```

### Verificar Logs
```bash
# Logs da função de envio
npx supabase functions logs send-verification-email

# Logs da função de verificação
npx supabase functions logs verify-email-token
```

### Monitoramento
- Verificar logs das Edge Functions regularmente
- Monitorar taxa de entrega de emails no Resend Dashboard
- Verificar tabela `email_verification` para tokens expirados

## 🧪 Testes

### Cenários de Teste
1. **Cadastro normal** - Deve enviar email e permitir verificação
2. **Email já cadastrado** - Deve retornar erro apropriado
3. **Token expirado** - Deve solicitar nova verificação
4. **Token inválido** - Deve retornar erro
5. **Verificação dupla** - Deve informar que já foi verificado
6. **Login após verificação** - Deve funcionar corretamente

### Comandos de Teste
```bash
# Testar Edge Function de envio
curl -X POST https://epjfoteyvejoqnigijrz.supabase.co/functions/v1/send-verification-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","fullName":"Test User","action":"register"}'

# Testar Edge Function de verificação
curl -X POST https://epjfoteyvejoqnigijrz.supabase.co/functions/v1/verify-email-token \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_AQUI"}'
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Email não chega
- Verificar API Key do Resend
- Verificar logs da Edge Function `send-verification-email`
- Verificar configurações de domínio no Resend

#### 2. Token inválido
- Verificar se token existe na tabela `email_verification`
- Verificar se token não expirou
- Verificar logs da Edge Function `verify-email-token`

#### 3. Usuário não confirmado
- Verificar se `email_confirm` foi definido como `true`
- Verificar logs da Edge Function `verify-email-token`
- Verificar se usuário existe em `auth.users`

#### 4. Login ainda falha
- Verificar se `email_confirmed_at` está preenchido
- Verificar se usuário tem `email_confirm: true`
- Verificar logs de autenticação

### Comandos de Debug
```sql
-- Verificar tokens de verificação
SELECT * FROM public.email_verification WHERE email = 'email@example.com';

-- Verificar usuários no auth
SELECT id, email, email_confirmed_at, email_confirm FROM auth.users WHERE email = 'email@example.com';

-- Limpar tokens expirados
DELETE FROM public.email_verification WHERE expires_at < now();
```

## 📈 Métricas e Monitoramento

### Métricas Importantes
- Taxa de entrega de emails
- Taxa de cliques nos links de verificação
- Taxa de sucesso na verificação
- Tempo médio para verificação
- Número de tentativas de verificação

### Alertas Recomendados
- Falha no envio de emails
- Alta taxa de tokens expirados
- Erros nas Edge Functions
- Falhas de autenticação pós-verificação

## 🔄 Manutenção Futura

### Limpeza Automática
Considerar implementar uma função para limpar tokens expirados periodicamente:

```sql
-- Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.email_verification 
  WHERE expires_at < now() AND verified = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
```

### Melhorias Futuras
1. **Rate limiting** - Limitar tentativas de verificação
2. **Notificações** - Alertar sobre tokens expirados
3. **Analytics** - Rastrear métricas de verificação
4. **Backup** - Sistema de fallback para envio de emails

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Status:** ✅ Implementado e Funcionando 

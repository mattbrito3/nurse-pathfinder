# Configuração de Autenticação do Supabase

## Problema Atual
Usuários estão sendo criados e podem fazer login sem confirmar o email, mesmo quando o sistema deveria aguardar a verificação.

## Solução

### 1. Configurar Confirmação Obrigatória

**Acesse:** https://supabase.com/dashboard/project/epjfoteyvejoqnigijrz

**Vá para:** Settings → Authentication → Providers

**Configure:**
- ✅ **Enable email confirmations** - DEVE estar ATIVADO
- ✅ **Enable email change confirmations** - DEVE estar ATIVADO
- ❌ **Enable phone confirmations** - Pode estar desativado

### 2. Configurar URL de Redirecionamento

**Vá para:** Settings → Authentication → URL Configuration

**Configure:**
```
Site URL: https://nurse-pathfinder.vercel.app
Redirect URLs: 
- https://nurse-pathfinder.vercel.app/auth/callback
- https://nurse-pathfinder.vercel.app/verify-email
```

### 3. Configurar Templates de Email

**Vá para:** Settings → Authentication → Email Templates

**Configure os templates:**
- **Confirm signup** - Template para confirmação de cadastro
- **Magic Link** - Template para login mágico
- **Change email** - Template para mudança de email

### 4. Verificar Configuração de SMTP

**Vá para:** Settings → Authentication → SMTP Settings

**Verificar se está configurado:**
```
Host: smtp.resend.com
Port: 465
Username: resend
Password: [API Key do Resend]
Encryption: SSL/TLS
```

## Teste da Configuração

### Cenário 1: Usuário Novo
1. Criar conta → Email enviado
2. Tentar login sem confirmar → Deve falhar
3. Confirmar email → Login deve funcionar

### Cenário 2: Usuário Existente
1. Fazer login → Deve funcionar normalmente

## Comandos para Verificar

```bash
# Verificar configuração atual
npx supabase status

# Verificar logs de autenticação
npx supabase functions logs
```

## Troubleshooting

### Se emails não chegarem:
1. Verificar configuração SMTP
2. Verificar logs do Resend
3. Verificar pasta de spam

### Se confirmação não funcionar:
1. Verificar URL de redirecionamento
2. Verificar template de email
3. Verificar logs do Supabase 

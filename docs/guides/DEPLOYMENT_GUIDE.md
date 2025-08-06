# Guia de Deployment - Sistema de Reset de Senha

Este guia documenta o processo de deployment do sistema completo de reset de senha implementado no Dose Certa.

## 📋 Pré-requisitos

- Supabase CLI instalado (`npx supabase --version`)
- Acesso ao projeto Supabase
- Variáveis de ambiente configuradas
- Docker (opcional, para desenvolvimento local)

## 🚀 Processo de Deployment

### 1. Preparação do Ambiente

```bash
# Verificar se o Supabase CLI está disponível
npx supabase --version

# Verificar status do projeto
npx supabase status

# Listar variáveis de ambiente configuradas
npx supabase secrets list
```

### 2. Deploy do Banco de Dados

```bash
# Aplicar migrações do banco de dados
npx supabase db push

# Verificar status das migrações
npx supabase migration list
```

**Migração aplicada:**
- `20250130000008_create_password_reset_tokens.sql`

### 3. Deploy das Edge Functions

```bash
# Deploy da Edge Function password-reset
npx supabase functions deploy password-reset

# Deploy da Edge Function verify-reset-token
npx supabase functions deploy verify-reset-token

# Verificar status das Edge Functions
npx supabase functions list
```

### 4. Verificação do Deployment

```bash
# Testar Edge Function password-reset
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/password-reset" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Testar Edge Function verify-reset-token
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/verify-reset-token" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token","newPassword":"temp_validation_only"}'
```

## 🔧 Configuração de Variáveis de Ambiente

### Variáveis Necessárias

```bash
# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
SUPABASE_ANON_KEY=[ANON_KEY]

# Email (Resend)
NEW_API_KEY_RESEND=[RESEND_API_KEY]
FRONTEND_URL=https://dosecerta.online

# Frontend
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
VITE_RESEND_API_KEY=[RESEND_API_KEY]
VITE_FROM_EMAIL=team@dosecerta.online
VITE_FROM_NAME=Dose Certa
```

### Configuração via Supabase CLI

```bash
# Definir variáveis de ambiente
npx supabase secrets set NEW_API_KEY_RESEND=[API_KEY]
npx supabase secrets set FRONTEND_URL=https://dosecerta.online

# Verificar variáveis configuradas
npx supabase secrets list
```

## 🧪 Testes de Validação

### 1. Teste de Funcionalidade Básica

```bash
# Testar com email inexistente (deve retornar sucesso por segurança)
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/password-reset" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Se o email existir em nossa base, você receberá um link de recuperação."
}
```

### 2. Teste de Validação de Token

```bash
# Testar validação de token (deve retornar erro para token inválido)
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/verify-reset-token" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token","newPassword":"temp_validation_only"}'
```

**Resposta esperada:**
```json
{
  "success": false,
  "message": "Token de reset inválido"
}
```

## 📊 Monitoramento

### Logs das Edge Functions

```bash
# Verificar logs da Edge Function password-reset
npx supabase functions logs password-reset

# Verificar logs da Edge Function verify-reset-token
npx supabase functions logs verify-reset-token
```

### Métricas de Uso

- **Tokens gerados**: Monitorar tabela `password_reset_tokens`
- **Tentativas de reset**: Contador de `attempts` na tabela
- **Tokens expirados**: Limpeza automática via função `cleanup_expired_reset_tokens`

## 🔒 Segurança

### Medidas Implementadas

1. **Rate Limiting**: Máximo 5 tentativas por token
2. **Expiração**: Tokens expiram em 1 hora
3. **Invalidação**: Tokens são marcados como usados após reset
4. **RLS**: Políticas de segurança no banco de dados
5. **Logs**: Auditoria completa de operações

### Manutenção

```bash
# Limpeza manual de tokens expirados
npx supabase db execute -f cleanup_expired_tokens.sql

# Verificar tokens ativos
npx supabase db execute -f check_active_tokens.sql
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro 500 na Edge Function**
   - Verificar variáveis de ambiente
   - Verificar logs da função
   - Confirmar que migração foi aplicada

2. **Email não enviado**
   - Verificar configuração do Resend
   - Verificar logs da Edge Function
   - Confirmar template de email

3. **Token inválido**
   - Verificar expiração do token
   - Confirmar que token não foi usado
   - Verificar tentativas máximas

4. **Link redirecionando para localhost**
   - Verificar variável `FRONTEND_URL` no Supabase
   - Confirmar que está configurada como `https://dosecerta.online`
   - Fazer redeploy da Edge Function após correção

### Comandos de Debug

```bash
# Verificar status do projeto
npx supabase status

# Verificar logs em tempo real
npx supabase functions logs password-reset --follow

# Testar conexão com banco
npx supabase db execute -f test_connection.sql
```

## 📝 Documentação Relacionada

- [Guia de Implementação](PASSWORD_RESET_IMPLEMENTATION.md)
- [Script de Deploy](../../scripts/deploy-reset-password.sh)
- [Changelog](../../CHANGELOG.md)
- [Documentação do Supabase](https://supabase.com/docs)

---

**Última atualização:** 2025-08-06
**Versão:** 1.0.0
**Responsável:** Equipe de Desenvolvimento 

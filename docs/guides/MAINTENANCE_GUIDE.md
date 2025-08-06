# Guia de Manutenção - Sistema de Reset de Senha

Este guia fornece instruções para manutenção e monitoramento do sistema de reset de senha implementado no Dose Certa.

## 📊 Monitoramento Diário

### 1. Verificação de Logs

#### Logs das Edge Functions
```bash
# Verificar logs da Edge Function password-reset
npx supabase functions logs password-reset --limit 50

# Verificar logs da Edge Function verify-reset-token
npx supabase functions logs verify-reset-token --limit 50

# Monitorar logs em tempo real
npx supabase functions logs password-reset --follow
```

#### Logs do Banco de Dados
```sql
-- Verificar tokens ativos
SELECT 
  email,
  created_at,
  expires_at,
  attempts,
  used
FROM password_reset_tokens 
WHERE expires_at > now()
ORDER BY created_at DESC
LIMIT 10;

-- Verificar tokens expirados não utilizados
SELECT 
  email,
  created_at,
  expires_at,
  attempts
FROM password_reset_tokens 
WHERE expires_at < now() AND used = false
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Métricas de Performance

#### Taxa de Sucesso
```sql
-- Calcular taxa de sucesso de resets
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN used = true THEN 1 END) as successful_resets,
  ROUND(
    (COUNT(CASE WHEN used = true THEN 1 END)::float / COUNT(*)::float) * 100, 2
  ) as success_rate
FROM password_reset_tokens 
WHERE created_at >= now() - interval '7 days';
```

#### Tentativas por Token
```sql
-- Verificar tokens com muitas tentativas
SELECT 
  email,
  attempts,
  created_at,
  expires_at
FROM password_reset_tokens 
WHERE attempts >= 3
ORDER BY attempts DESC;
```

## 🧹 Manutenção Semanal

### 1. Limpeza de Tokens Expirados

#### Limpeza Automática
```sql
-- Executar limpeza de tokens expirados
SELECT cleanup_expired_reset_tokens();

-- Verificar resultado da limpeza
SELECT 
  COUNT(*) as remaining_tokens
FROM password_reset_tokens 
WHERE expires_at < now() AND used = false;
```

#### Limpeza Manual (se necessário)
```sql
-- Remover tokens expirados manualmente
DELETE FROM password_reset_tokens 
WHERE expires_at < now() AND used = false;

-- Verificar espaço liberado
SELECT 
  pg_size_pretty(pg_total_relation_size('password_reset_tokens')) as table_size;
```

### 2. Análise de Segurança

#### Verificar Tentativas Suspeitas
```sql
-- Identificar IPs ou emails com muitas tentativas
SELECT 
  email,
  COUNT(*) as request_count,
  MAX(created_at) as last_request
FROM password_reset_tokens 
WHERE created_at >= now() - interval '24 hours'
GROUP BY email
HAVING COUNT(*) > 5
ORDER BY request_count DESC;
```

#### Verificar Tokens Não Utilizados
```sql
-- Tokens criados mas não utilizados
SELECT 
  email,
  created_at,
  expires_at,
  attempts
FROM password_reset_tokens 
WHERE used = false AND expires_at < now() - interval '1 hour'
ORDER BY created_at DESC;
```

## 🔧 Manutenção Mensal

### 1. Análise de Performance

#### Estatísticas de Uso
```sql
-- Estatísticas mensais
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN used = true THEN 1 END) as successful_resets,
  COUNT(CASE WHEN attempts >= 5 THEN 1 END) as blocked_attempts,
  AVG(attempts) as avg_attempts_per_token
FROM password_reset_tokens 
WHERE created_at >= now() - interval '3 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

#### Análise de Padrões
```sql
-- Horários de pico de solicitações
SELECT 
  EXTRACT(hour FROM created_at) as hour_of_day,
  COUNT(*) as request_count
FROM password_reset_tokens 
WHERE created_at >= now() - interval '30 days'
GROUP BY EXTRACT(hour FROM created_at)
ORDER BY request_count DESC;
```

### 2. Otimização do Banco

#### Análise de Índices
```sql
-- Verificar uso de índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'password_reset_tokens';
```

#### Estatísticas da Tabela
```sql
-- Estatísticas da tabela
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE tablename = 'password_reset_tokens';
```

## 🚨 Troubleshooting

### 1. Problemas Comuns

#### Edge Function Retornando Erro 500
```bash
# Verificar logs detalhados
npx supabase functions logs password-reset --follow

# Verificar variáveis de ambiente
npx supabase secrets list

# Testar Edge Function diretamente
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/password-reset" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### Email Não Enviado
```sql
-- Verificar se token foi gerado
SELECT * FROM password_reset_tokens 
WHERE email = 'email@example.com' 
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar logs do Resend
npx supabase functions logs password-reset | grep -i resend
```

#### Token Inválido
```sql
-- Verificar status do token
SELECT 
  email,
  token,
  used,
  expires_at,
  attempts,
  created_at
FROM password_reset_tokens 
WHERE token = 'token_aqui';
```

### 2. Comandos de Debug

#### Verificar Status do Sistema
```bash
# Status geral do projeto
npx supabase status

# Status das Edge Functions
npx supabase functions list

# Verificar migrações
npx supabase migration list
```

#### Testar Conexões
```bash
# Testar conexão com banco
npx supabase db execute -f test_connection.sql

# Testar Edge Functions
npx supabase functions serve --debug
```

## 📈 Relatórios e Alertas

### 1. Relatório Semanal

```sql
-- Relatório semanal de uso
SELECT 
  'Weekly Report' as report_type,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN used = true THEN 1 END) as successful_resets,
  COUNT(CASE WHEN attempts >= 5 THEN 1 END) as blocked_attempts,
  COUNT(DISTINCT email) as unique_users,
  MIN(created_at) as period_start,
  MAX(created_at) as period_end
FROM password_reset_tokens 
WHERE created_at >= now() - interval '7 days';
```

### 2. Alertas de Segurança

```sql
-- Alertas para muitas tentativas
SELECT 
  email,
  COUNT(*) as attempt_count,
  MAX(created_at) as last_attempt
FROM password_reset_tokens 
WHERE created_at >= now() - interval '1 hour'
GROUP BY email
HAVING COUNT(*) > 10;
```

## 🔄 Atualizações e Melhorias

### 1. Atualização de Edge Functions

```bash
# Deploy de atualizações
npx supabase functions deploy password-reset
npx supabase functions deploy verify-reset-token

# Verificar versões
npx supabase functions list
```

### 2. Atualização de Configurações

```bash
# Atualizar variáveis de ambiente
npx supabase secrets set NEW_API_KEY_RESEND=[NEW_API_KEY]
npx supabase secrets set FRONTEND_URL=[NEW_URL]

# Verificar configurações
npx supabase secrets list
```

### 3. Backup e Recuperação

```sql
-- Backup da tabela de tokens
CREATE TABLE password_reset_tokens_backup AS 
SELECT * FROM password_reset_tokens;

-- Restaurar backup (se necessário)
-- INSERT INTO password_reset_tokens SELECT * FROM password_reset_tokens_backup;
```

## 📋 Checklist de Manutenção

### Diário
- [ ] Verificar logs das Edge Functions
- [ ] Monitorar taxa de sucesso
- [ ] Verificar tentativas suspeitas

### Semanal
- [ ] Executar limpeza de tokens expirados
- [ ] Analisar métricas de performance
- [ ] Verificar segurança

### Mensal
- [ ] Gerar relatório de uso
- [ ] Analisar padrões de comportamento
- [ ] Otimizar banco de dados
- [ ] Atualizar documentação

### Trimestral
- [ ] Revisar políticas de segurança
- [ ] Atualizar Edge Functions
- [ ] Revisar configurações
- [ ] Backup completo

---

**Última atualização**: 2025-08-06
**Versão**: 1.0.0
**Responsável**: Equipe de Desenvolvimento 

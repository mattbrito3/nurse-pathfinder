# Arquitetura Técnica - Sistema de Reset de Senha

Este documento descreve a arquitetura técnica do sistema completo de reset de senha implementado no Nurse Pathfinder.

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Edge Functions │    │   Database      │
│   (React)       │    │   (Deno)         │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Request Reset      │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Generate Token     │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 3. Send Email         │
         │                       ├──────────────────────►│
         │                       │    (Resend API)      │
         │                       │                       │
         │ 4. Click Link         │                       │
         ├──────────────────────►│                       │
         │                       │ 5. Validate Token     │
         │                       ├──────────────────────►│
         │                       │                       │
         │ 6. Update Password    │                       │
         ├──────────────────────►│                       │
         │                       │ 7. Mark Token Used    │
         │                       ├──────────────────────►│
         │                       │                       │
```

## 📁 Estrutura de Arquivos

```
nurse-pathfinder/
├── src/
│   ├── pages/
│   │   └── ResetPassword.tsx           # Interface de reset de senha
│   ├── services/
│   │   ├── passwordResetService.ts     # Serviço de solicitação de reset
│   │   └── resetPasswordService.ts     # Serviço de processamento de reset
│   └── ...
├── supabase/
│   ├── functions/
│   │   ├── password-reset/
│   │   │   └── index.ts                # Edge Function para solicitar reset
│   │   └── verify-reset-token/
│   │       └── index.ts                # Edge Function para validar e processar
│   ├── migrations/
│   │   └── 20250130000008_create_password_reset_tokens.sql
│   └── ...
└── docs/
    └── guides/
        ├── PASSWORD_RESET_IMPLEMENTATION.md
        ├── DEPLOYMENT_GUIDE.md
        └── TECHNICAL_ARCHITECTURE.md
```

## 🗄️ Camada de Banco de Dados

### Tabela Principal: `password_reset_tokens`

```sql
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);
```

### Funções SQL

#### 1. `create_password_reset_token(p_email TEXT)`
- **Propósito**: Gerar token único para reset de senha
- **Funcionalidades**:
  - Limpa tokens antigos não utilizados
  - Gera token criptograficamente seguro
  - Define expiração de 1 hora
  - Retorna token e timestamp de expiração

#### 2. `validate_reset_token(p_token TEXT)`
- **Propósito**: Validar token de reset
- **Funcionalidades**:
  - Verifica existência do token
  - Valida se não foi usado
  - Verifica se não expirou
  - Incrementa contador de tentativas
  - Retorna status de validação

#### 3. `mark_reset_token_used(p_token TEXT)`
- **Propósito**: Marcar token como utilizado
- **Funcionalidades**:
  - Marca token como `used = true`
  - Registra timestamp de uso
  - Retorna status da operação

#### 4. `cleanup_expired_reset_tokens()`
- **Propósito**: Limpeza automática de tokens expirados
- **Funcionalidades**:
  - Remove tokens expirados não utilizados
  - Mantém limpeza do banco de dados

### Políticas RLS (Row Level Security)

```sql
-- Permitir consulta pública para validação
CREATE POLICY "Allow public reset token lookup" 
ON public.password_reset_tokens FOR SELECT USING (true);

-- Permitir criação de tokens
CREATE POLICY "Allow public reset creation" 
ON public.password_reset_tokens FOR INSERT WITH CHECK (true);

-- Permitir atualização de tokens
CREATE POLICY "Allow public reset updates" 
ON public.password_reset_tokens FOR UPDATE USING (true);
```

## ⚡ Camada de Edge Functions

### 1. Edge Function: `password-reset`

**Localização**: `supabase/functions/password-reset/index.ts`

**Responsabilidades**:
- Receber solicitação de reset de senha
- Validar formato do email
- Verificar existência do usuário
- Gerar token via função SQL
- Enviar email via Resend
- Retornar resposta apropriada

**Fluxo de Execução**:
1. Validação de entrada (email)
2. Verificação de existência do usuário
3. Geração de token via `create_password_reset_token()`
4. Construção do link de recuperação
5. Envio de email via Resend
6. Retorno de resposta de sucesso

### 2. Edge Function: `verify-reset-token`

**Localização**: `supabase/functions/verify-reset-token/index.ts`

**Responsabilidades**:
- Validar token de reset
- Processar nova senha
- Atualizar senha no Supabase Auth
- Marcar token como utilizado
- Retornar status da operação

**Fluxo de Execução**:
1. Validação de entrada (token, nova senha)
2. Validação de token via `validate_reset_token()`
3. Busca do usuário por email
4. Atualização da senha via `supabase.auth.admin.updateUserById()`
5. Marcação do token como usado via `mark_reset_token_used()`
6. Retorno de resposta de sucesso

## 🎨 Camada de Frontend

### 1. Página: `ResetPassword.tsx`

**Localização**: `src/pages/ResetPassword.tsx`

**Responsabilidades**:
- Interface para entrada de nova senha
- Validação de token na carga da página
- Validação de força da senha
- Submissão da nova senha
- Feedback visual para o usuário

**Fluxo de Interação**:
1. Extração do token da URL
2. Validação do token via `validateResetToken()`
3. Exibição do formulário de nova senha
4. Validação de força da senha
5. Submissão via `processPasswordReset()`
6. Redirecionamento para login

### 2. Serviço: `resetPasswordService.ts`

**Localização**: `src/services/resetPasswordService.ts`

**Responsabilidades**:
- Abstração das chamadas para Edge Functions
- Tratamento de erros
- Tipagem de respostas
- Interface consistente para o frontend

**Métodos**:
- `validateResetToken(token: string)`: Valida token sem alterar senha
- `processPasswordReset(token: string, newPassword: string)`: Processa reset completo

### 3. Serviço: `passwordResetService.ts`

**Localização**: `src/services/passwordResetService.ts`

**Responsabilidades**:
- Solicitação inicial de reset de senha
- Fallback para métodos alternativos
- Tratamento de erros
- Logging de operações

## 🔐 Camada de Segurança

### Medidas Implementadas

1. **Tokens Criptograficamente Seguros**
   - UUID + timestamp para unicidade
   - Geração via `gen_random_uuid()`

2. **Rate Limiting**
   - Máximo 5 tentativas por token
   - Contador de `attempts` na tabela

3. **Expiração Automática**
   - Tokens expiram em 1 hora
   - Limpeza automática de tokens expirados

4. **Invalidação Imediata**
   - Tokens marcados como usados após reset
   - Prevenção de reutilização

5. **Políticas RLS**
   - Controle de acesso no nível do banco
   - Operações permitidas definidas explicitamente

6. **Validação de Usuário**
   - Verificação de existência antes de gerar token
   - Resposta de sucesso mesmo para emails inexistentes (segurança)

## 📧 Integração com Email

### Serviço: Resend

**Configuração**:
- API Key configurada via variável de ambiente
- Template HTML customizado
- Remetente: `Dose Certa <team@dosecerta.online>`

**Template de Email**:
- Design responsivo
- Link de recuperação destacado
- Informações de segurança
- Fallback para cópia manual do link

## 🔄 Fluxo de Dados

### 1. Solicitação de Reset
```
Frontend → password-reset → Database → Resend → User Email
```

### 2. Validação de Token
```
Frontend → verify-reset-token → Database → Frontend
```

### 3. Processamento de Reset
```
Frontend → verify-reset-token → Database → Supabase Auth → Database
```

## 📊 Monitoramento e Logs

### Logs das Edge Functions
- Logs detalhados de cada operação
- Informações de debug para troubleshooting
- Métricas de performance

### Métricas de Uso
- Contagem de tokens gerados
- Taxa de sucesso de resets
- Tentativas de reset por usuário
- Tokens expirados não utilizados

## 🚀 Performance e Escalabilidade

### Otimizações Implementadas
- Índices na tabela para consultas rápidas
- Limpeza automática de dados expirados
- Rate limiting para prevenir abuso
- Caching de validações de usuário

### Considerações de Escala
- Tokens únicos por usuário
- Limpeza periódica de dados antigos
- Monitoramento de uso de recursos
- Logs estruturados para análise

---

**Versão**: 1.0.0
**Última atualização**: 2025-08-06
**Responsável**: Equipe de Desenvolvimento 
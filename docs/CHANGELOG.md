# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Fixed
- **URL de produção no sistema de reset de senha**
  - Corrigido fallback da variável `FRONTEND_URL` de `localhost:8080` para `https://dosecerta.online`
  - Atualizada variável de ambiente no Supabase para usar URL de produção
  - Links de reset agora redirecionam corretamente para o site em produção

### Added
- **Sistema completo de reset de senha**
  - Tabela `password_reset_tokens` para gerenciar tokens de recuperação
  - Funções SQL para criação, validação e invalidação de tokens
  - Edge Function `password-reset` atualizada com verificação de usuário
  - Nova Edge Function `verify-reset-token` para processar reset de senha
  - Serviço frontend `resetPasswordService.ts` para abstração de chamadas
  - Página `/reset-password` integrada com novo sistema
  - Políticas RLS configuradas para segurança
  - Rate limiting via contador de tentativas
  - Expiração automática de tokens (1 hora)
  - Logs de auditoria para monitoramento

### Changed
- **Edge Function `password-reset`**
  - Substituída lógica de `supabase.auth.admin.generateLink` por tokens customizados
  - Adicionada verificação de existência de usuário antes de gerar token
  - Melhorado tratamento de erros e logging
  - Removido fallback para `supabase.auth.resetPasswordForEmail`

- **Página `ResetPassword.tsx`**
  - Integrada com novo serviço `resetPasswordService.ts`
  - Implementada validação de token via Edge Function
  - Adicionado feedback visual durante processamento

### Security
- **Tokens criptograficamente seguros** gerados com UUID + timestamp
- **Rate limiting** implementado via contador de tentativas (máx. 5)
- **Expiração automática** de tokens não utilizados
- **Invalidação imediata** após uso do token
- **Políticas RLS** configuradas para acesso controlado

### Technical Details
- **Banco de dados**: Migração `20250130000008_create_password_reset_tokens.sql`
- **Edge Functions**: Deploy das versões atualizadas
- **Frontend**: Integração completa com novo sistema
- **Email**: Template customizado via Resend

### Documentation
- **Guia de implementação**: `docs/guides/PASSWORD_RESET_IMPLEMENTATION.md`
- **Script de deploy**: `scripts/deploy-reset-password.sh`
- **Documentação técnica**: Funções SQL documentadas com comentários

## [1.0.0] - 2025-01-30

### Added
- Sistema de autenticação base com Supabase
- Verificação de email implementada
- Interface de login e cadastro
- Sistema de recuperação de senha (parcial)

### Changed
- Estrutura inicial do projeto
- Configuração do Supabase
- Integração com Resend para emails

---

## Como usar este changelog

### Tipos de mudanças:
- **Added** para novas funcionalidades
- **Changed** para mudanças em funcionalidades existentes
- **Deprecated** para funcionalidades que serão removidas
- **Removed** para funcionalidades removidas
- **Fixed** para correções de bugs
- **Security** para melhorias de segurança

### Formato das entradas:
- Descrição clara e concisa
- Contexto técnico quando relevante
- Impacto para o usuário final
- Detalhes de implementação quando necessário 
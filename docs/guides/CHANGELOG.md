# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🚧 BREAKING CHANGES - January 2025
- **Stripe Integration Removal**: Complete removal of Stripe payment system
- **Payment System Migration**: Preparing for new payment gateway (Mercado Pago)
- **Placeholder Implementation**: Payment buttons now show maintenance messages
- **Database Migration**: Stripe constraints removed, new gateway columns added

### Removed
- **All Stripe Dependencies**: @stripe/stripe-js, stripe packages removed
- **Stripe Edge Functions**: create-checkout-session, stripe-webhook deleted
- **Stripe Components**: Legacy payment components removed
- **Stripe Configuration**: Environment variables and configurations cleaned

### Added
- **Sistema de Backlog Simples**: Implementado sistema interno para gerenciar funcionalidades e melhorias do projeto
- **Dashboard de Desenvolvimento**: Interface dedicada para acompanhar progresso de desenvolvimento
- **Componente SimpleBacklog**: Interface clean e prática para gerenciar backlog
- **Categorização por Funcionalidade**: Sistema organiza itens por Calculadora, Flashcards, Glossário, UX/UI, Performance, etc.
- **Gerenciamento de Status**: Fluxo Backlog → Em Desenvolvimento → Concluído
- **Filtros e Estatísticas**: Visualização organizada com filtros por status e estatísticas de progresso
- **Guias Práticos**: Documentação completa para desenvolvedores (BACKLOG_GUIDE.md, NURSE_PATHFINDER_PLANNING_GUIDE.md)
- **Regras de Desenvolvimento Incremental**: Atualizadas regras do Cursor para desenvolvimento estruturado
- **Sistema de Armazenamento Local**: Persistência de dados do backlog no localStorage
- **Comandos de Console**: Funções utilitárias para adicionar itens via console do navegador
- **Login com Google OAuth**: Implementada autenticação social completa com Google
- **Vinculação de Contas**: Sistema para vincular contas Google com emails existentes
- **Setup de Perfil para Usuários Google**: Modal para configuração inicial de nome após login Google
- **Rotas Organizadas**: Páginas dedicadas `/login`, `/register` e `/profile-setup`
- **Hook Global de Google Auth**: `useGoogleAuthGlobal` para processamento centralizado
- **Componente GoogleLoginButton**: Botão reutilizável para login com Google
- **Sincronização de Perfil**: Atualização automática do user_metadata após alterações no perfil
- **Validação de Email Simplificada**: Remoção de mensagens desnecessárias na validação de email

### Changed
- **Foco em Simplicidade**: Removidas funcionalidades complexas (métricas avançadas, análises de impacto) para priorizar usabilidade
- **Interface do Dashboard**: Simplificada para focar no backlog e ferramentas essenciais
- **Estrutura de Desenvolvimento**: Implementado sistema de desenvolvimento incremental conforme regras do Cursor
- **Fluxo de Autenticação**: Reestruturado para rotas organizadas (/login, /register, /profile)
- **Redirecionamento Pós-Login**: Agora redireciona para `/profile` em vez de `/dashboard`
- **Interface de Validação de Email**: Removida mensagem "Email disponível para cadastro"
- **Sincronização de Nome**: Nome do perfil agora é refletido imediatamente no sistema geral
- **Estrutura de Rotas**: Organização mais clara e intuitiva das páginas de autenticação

### Fixed
- **Nome não Atualizado no Sistema**: ✅ **RESOLVIDO** - Nome do perfil agora sincroniza com user_metadata
- **Modal de Setup não Aparecia**: ✅ **RESOLVIDO** - Corrigido fluxo de verificação de perfil para usuários Google
- **Página Profile Inacessível**: ✅ **RESOLVIDO** - Corrigido redirecionamento automático que impedia acesso
- **Interface Poluída**: ✅ **RESOLVIDO** - Removidas mensagens desnecessárias na validação de email

### Breaking Changes
- **Rota `/auth`**: Agora redireciona para `/login` (mantida para compatibilidade)
- **Redirecionamento Pós-Login**: Mudou de `/dashboard` para `/profile`

### Added
- **Sistema de Recuperação de Senha Completo**: Implementada funcionalidade completa de reset de senha
- **Edge Function de Password Reset**: Nova API `password-reset` para gerenciar recuperação de senha
- **Email Personalizado de Recuperação**: Template HTML customizado com design profissional
- **Link de Recuperação Seguro**: Geração de links seguros com expiração automática
- **Validação de Força de Senha**: Sistema robusto para verificar qualidade da nova senha
- **Feedback Visual de Senha**: Medidor de força com critérios detalhados
- **Campo de Email Editável**: Correção para permitir edição de email na verificação
- **Tratamento de Sessão**: Verificação robusta de tokens de recuperação
- **Redirecionamento Correto**: Configuração para porta de desenvolvimento (8080)
- **Sistema de Validação de Email Duplicado**: Implementada validação robusta para prevenir cadastros duplicados
- **Edge Function de Verificação**: API segura para verificação de disponibilidade de email
- **Validação em Tempo Real**: Verificação automática enquanto usuário digita o email
- **Rate Limiting**: Sistema de proteção contra abuso da API de verificação
- **Hook Customizado**: `useEmailValidation` para gerenciar validação de email
- **Feedback Visual**: Indicadores visuais (ícones, cores) para status da validação
- **Fluxo Alternativo**: Botões para login e recuperação de senha quando email já existe
- **Componente de Teste**: `EmailValidationTest` para validar a funcionalidade
- **Sistema de Validação de Força de Senha**: Implementada validação robusta de senhas com feedback visual
- **Hook Customizado**: `usePasswordStrength` para análise de força de senha em tempo real
- **Componente de Medidor**: `PasswordStrengthMeter` com barra de progresso e critérios detalhados
- **Gerador de Senhas**: Funcionalidade para gerar senhas seguras automaticamente
- **Critérios de Segurança**: Verificação de comprimento, tipos de caracteres e senhas comuns
- **Sugestões de Melhoria**: Feedback específico sobre como melhorar a senha
- **Sistema de Pontuação**: Score de 0-100 com níveis visuais (Muito Fraca, Fraca, Média, Forte, Muito Forte)
- **Sistema de Email Real**: Implementado envio real de emails via Resend API
- **Ferramenta de Debug**: Componente `EmailDebugPanel` para diagnóstico de problemas de email
- **Logs Detalhados**: Melhor logging na Edge Function para debugging
- **Guia de Configuração**: Documentação completa para configuração do Resend
- **Tratamento de Erros**: Melhor tratamento de erros na Edge Function
- **Monitoramento**: Sistema de debug em tempo real para problemas de email
- **Personalização de Email**: Nome do usuário extraído automaticamente do email para emails mais humanizados
- **Orientação sobre Spam**: Adicionada dica para verificar pasta de spam/lixo eletrônico

### Changed
- **Fluxo de Recuperação de Senha**: Reestruturado para usar Edge Function customizada
- **Template de Email**: Atualizado com design profissional e botão de ação
- **Configuração de Redirecionamento**: Ajustado para ambiente de desenvolvimento
- **Verificação de Tokens**: Implementada verificação robusta com delays para processamento
- **Interface de Reset de Senha**: Melhorada com validação em tempo real e feedback visual
- **Fluxo de Cadastro**: Reestruturado para validar email antes da verificação
- **Interface de Validação**: Adicionados indicadores visuais e feedback em tempo real
- **Tratamento de Erros**: Melhorado para lidar especificamente com emails duplicados
- **Experiência do Usuário**: Fluxo mais intuitivo com opções alternativas
- **Validação de Senha**: Substituída validação básica por sistema completo de força de senha
- **Formulário de Cadastro**: Integrado medidor de força de senha com feedback visual
- **Critérios de Segurança**: Atualizados para incluir caracteres especiais e verificação de senhas comuns
- **Interface do Medidor de Senha**: Redesenhada versão clean e minimalista com melhor integração ao dark theme
- **Componente PasswordStrengthMeter**: Simplificado para mostrar apenas barra de progresso e informações essenciais
- **UX/UI**: Removida poluição visual e duplicação de labels, foco na simplicidade e elegância
- **Atualização de Chave**: Migração para nova API key do Resend (`re_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z`)
- **Nomenclatura**: Alterado `RESEND_API_KEY` para `NEW_API_KEY_RESEND` no Supabase
- **Domínio de Email**: Corrigido domínio de `noreply@resend.dev` para `team@dosecerta.online`
- **Consistência**: Padronizado domínio de email em toda a aplicação
- **Interface Limpa**: Removido botão de debug após resolução do problema de email

### Fixed
- **Loop Infinito React**: ✅ **RESOLVIDO** - Corrigido problema de "Maximum update depth exceeded" no usePasswordStrength
- **Campo de Email Não Editável**: ✅ **RESOLVIDO** - Corrigido onEmailChange no SimpleEmailVerification
- **Link de Recuperação Inválido**: ✅ **RESOLVIDO** - Implementada verificação robusta de sessão com delays
- **Redirecionamento para Porta Errada**: ✅ **RESOLVIDO** - Corrigido redirectTo para localhost:8080
- **Email de Recuperação Não Enviado**: ✅ **RESOLVIDO** - Implementada Edge Function completa com Resend
- **Emails Duplicados**: ✅ **RESOLVIDO** - Sistema agora previne cadastros com emails já existentes
- **Validação de Email**: Implementada verificação robusta antes do cadastro
- **Feedback ao Usuário**: Mensagens claras sobre status do email
- **Segurança**: Prevenção contra enumeração de emails com rate limiting
- **Senhas Fracas**: ✅ **RESOLVIDO** - Sistema agora previne cadastros com senhas inseguras
- **Validação de Senha**: Implementada verificação robusta de força de senha
- **Feedback de Segurança**: Mensagens claras sobre requisitos de senha
- **Educação do Usuário**: Orientações específicas para criar senhas seguras
- **Problema de Entrega**: ✅ **RESOLVIDO** - Emails agora chegam corretamente na caixa de entrada
- **Configuração Resend**: Corrigida implementação para usar API real do Resend
- **Debug de Problemas**: Implementada ferramenta para identificar problemas de email
- **Logs de Erro**: Melhor visibilidade de erros na Edge Function
- **Domínio Inválido**: Corrigido problema de domínio não verificado no Resend

### Breaking Changes
- **Nenhuma breaking change** - Todas as mudanças são compatíveis com versões anteriores

## [1.2.0] - 2024-01-15

### Added
- Sistema de flashcards com 270 cards pré-criados
- Glossário médico interativo
- Sistema de assinaturas com Stripe
- Dashboard com estatísticas de uso
- Sistema de autenticação com Supabase

### Changed
- Interface melhorada com shadcn/ui
- Performance otimizada com React Query
- Segurança aprimorada com RLS

### Fixed
- Bugs de validação de formulários
- Problemas de responsividade
- Erros de tipagem TypeScript

## [1.1.0] - 2024-01-10

### Added
- Calculadora de medicamentos
- Sistema de histórico de cálculos
- Autenticação básica
- Interface responsiva

### Changed
- Migração para TypeScript
- Atualização para React 18

## [1.0.0] - 2024-01-01

### Added
- Versão inicial do projeto
- Estrutura básica React
- Configuração inicial Supabase 
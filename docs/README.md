# 📚 Documentação do Dose Certa

Esta pasta contém toda a documentação técnica e guias do projeto Dose Certa, organizados por categoria para facilitar a navegação e manutenção.

## 📁 Estrutura da Documentação

### 📖 `guides/` - Guias Gerais
Guias e documentação geral do projeto:
- `README.md` - Documentação principal do projeto
- `BACKLOG_GUIDE.md` - Guia do sistema de backlog interno
- `CHANGELOG.md` - Histórico de mudanças
- `CHECKLIST_PRODUCAO.md` - Checklist para deploy em produção
- `DEPLOY_INSTRUCTIONS.md` - Instruções de deploy
- `DEPLOY_READY_GUIDE.md` - Guia para preparação de produção
- `EMAIL_TROUBLESHOOTING.md` - Solução de problemas de email
- `EMAIL_VALIDATION_GUIDE.md` - Guia de validação de email
- `GMAIL_SMTP_SETUP_GUIDE.md` - Configuração do Gmail SMTP
- `GOOGLE_OAUTH_PRODUCTION.md` - OAuth Google em produção
- `GOOGLE_OAUTH_SETUP.md` - Configuração do OAuth Google
- `INSTRUCOES_API_KEY.md` - Instruções para chaves de API
- `NURSE_PATHFINDER_PLANNING_GUIDE.md` - Guia de planejamento
- `PASSWORD_STRENGTH_GUIDE.md` - Guia de força de senha
- `PRODUCAO_DEPLOY_GUIDE.md` - Guia de deploy em produção
- `SCALING_IMPROVEMENTS.md` - Melhorias de escalabilidade
- `STRIPE_SETUP_GUIDE.md` - Configuração do Stripe

### 🚀 `deployment/` - Guias de Deploy
Documentação específica para deploy e configuração de produção:
- `RESEND_SETUP_GUIDE.md` - Configuração do Resend para emails

### ⚡ `features/` - Documentação de Funcionalidades
Documentação técnica detalhada de funcionalidades implementadas:
- `FAQ_IMPLEMENTATION_GUIDE.md` - Guia completo da implementação da seção FAQ

### 🔌 `api/` - Documentação de APIs
Documentação de endpoints e integrações:
- APIs do Supabase
- Edge Functions
- Integrações externas (Stripe, Resend, Google)

### 🏗️ `architecture/` - Documentação de Arquitetura
Documentação técnica da arquitetura do sistema:
- Diagramas de arquitetura
- Decisões técnicas
- Padrões de design

## 🎯 Como Usar Esta Documentação

### **Para Desenvolvedores**
1. **Configuração Inicial**: Comece com `guides/README.md`
2. **Setup de Ambiente**: Consulte `deployment/` para configurações
3. **Implementação de Features**: Use `features/` para detalhes técnicos

### **Para Deploy**
1. **Checklist**: `guides/CHECKLIST_PRODUCAO.md`
2. **Configurações**: `deployment/` para todas as configurações
3. **Instruções**: `guides/DEPLOY_INSTRUCTIONS.md`

### **Para Manutenção**
1. **Backlog**: `guides/BACKLOG_GUIDE.md`
2. **Mudanças**: `guides/CHANGELOG.md`
3. **Melhorias**: `guides/SCALING_IMPROVEMENTS.md`

## 📋 Convenções de Documentação

### **Estrutura dos Arquivos**
- **Título descritivo** com emoji relacionado
- **Seções bem organizadas** com headers claros
- **Exemplos práticos** quando aplicável
- **Código comentado** para facilitar entendimento

### **Padrões de Nomenclatura**
- `GUIDE.md` - Guias completos de implementação
- `SETUP.md` - Configurações e setup
- `TROUBLESHOOTING.md` - Solução de problemas
- `README.md` - Documentação principal

### **Formatação**
- **Markdown** como padrão
- **Emojis** para categorização visual
- **Tabelas** para informações estruturadas
- **Code blocks** para exemplos técnicos

## 🔄 Manutenção da Documentação

### **Atualizações Obrigatórias**
- ✅ **Após cada feature**: Documentar em `features/`
- ✅ **Após mudanças de deploy**: Atualizar `deployment/`
- ✅ **Após mudanças de configuração**: Atualizar `guides/`

### **Revisão Periódica**
- **Mensal**: Verificar links e referências
- **Trimestral**: Revisar documentação desatualizada
- **Semestral**: Reorganizar estrutura se necessário

## 🚀 Próximos Passos

### **Documentação Pendente**
- [ ] Guia de testes automatizados
- [ ] Documentação de API
- [ ] Guia de contribuição para desenvolvedores
- [ ] Documentação de arquitetura

### **Melhorias Futuras**
- [ ] Índice de busca na documentação
- [ ] Versões da documentação por release
- [ ] Integração com ferramentas de documentação automática

---

**📅 Última Atualização**: Janeiro 2025  
**👨‍💻 Mantido por**: Mateus Brito  
**🎯 Objetivo**: Organizar e facilitar acesso à documentação do projeto 
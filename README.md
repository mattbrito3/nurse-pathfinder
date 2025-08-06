# Nurse Pathfinder - Calculadora de Medicamentos

Sistema completo de calculadora de medicamentos para profissionais de enfermagem, com funcionalidades avançadas de autenticação e segurança.

## 🚀 Funcionalidades Principais

### 🔐 Sistema de Autenticação Completo
- **Login/Cadastro** com Supabase Auth
- **Verificação de Email** com Edge Functions
- **Reset de Senha Seguro** com tokens criptográficos
- **Google OAuth** integrado
- **Perfis de Usuário** personalizáveis

### 💊 Calculadora de Medicamentos
- Cálculos precisos de dosagem
- Histórico de cálculos
- Validação de parâmetros
- Interface intuitiva

### 📚 Sistema de Flashcards
- Flashcards médicos interativos
- Categorização por especialidade
- Modo de estudo personalizado
- Progresso do usuário

### 📖 Glossário Médico
- Termos médicos explicados
- Busca avançada
- Categorização por área

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth
- **Email**: Resend
- **Estilização**: Tailwind CSS + shadcn/ui
- **Deploy**: Vercel

## 🔧 Sistema de Reset de Senha

### ✅ Implementação Completa

O sistema de reset de senha foi implementado com as melhores práticas de segurança:

- **Tokens Criptográficos**: UUID + timestamp para unicidade
- **Expiração Automática**: Tokens expiram em 1 hora
- **Rate Limiting**: Máximo 5 tentativas por token
- **Invalidação Imediata**: Tokens marcados como usados após reset
- **Políticas RLS**: Controle de acesso no nível do banco
- **Logs de Auditoria**: Monitoramento completo de operações

### 🔄 Fluxo de Funcionamento

1. **Solicitação**: Usuário solicita reset via formulário
2. **Validação**: Sistema verifica existência do usuário
3. **Token**: Gera token único e seguro
4. **Email**: Envia link de recuperação via Resend
5. **Validação**: Usuário clica no link e token é validado
6. **Reset**: Nova senha é processada e salva
7. **Login**: Usuário pode fazer login com nova senha

### 📁 Arquivos Principais

```
├── supabase/
│   ├── functions/
│   │   ├── password-reset/           # Solicitação de reset
│   │   └── verify-reset-token/       # Validação e processamento
│   └── migrations/
│       └── 20250130000008_create_password_reset_tokens.sql
├── src/
│   ├── pages/ResetPassword.tsx       # Interface de reset
│   └── services/
│       ├── passwordResetService.ts   # Solicitação inicial
│       └── resetPasswordService.ts   # Processamento de reset
└── docs/
    └── guides/
        ├── PASSWORD_RESET_IMPLEMENTATION.md
        ├── DEPLOYMENT_GUIDE.md
        └── TECHNICAL_ARCHITECTURE.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Supabase CLI
- Conta no Supabase
- Conta no Resend (para emails)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nurse-pathfinder.git
cd nurse-pathfinder

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas configurações

# Execute o projeto
npm run dev
```

### Deploy

```bash
# Deploy das Edge Functions
npx supabase functions deploy password-reset
npx supabase functions deploy verify-reset-token

# Deploy do banco de dados
npx supabase db push

# Deploy do frontend (Vercel)
npm run build
```

## 📚 Documentação

- [Guia de Implementação](docs/guides/PASSWORD_RESET_IMPLEMENTATION.md)
- [Guia de Deployment](docs/guides/DEPLOYMENT_GUIDE.md)
- [Arquitetura Técnica](docs/guides/TECHNICAL_ARCHITECTURE.md)
- [Changelog](docs/CHANGELOG.md)

## 🔒 Segurança

### Medidas Implementadas
- **Autenticação Segura**: Supabase Auth com JWT
- **Reset de Senha**: Tokens criptográficos únicos
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Validação de Entrada**: Sanitização de dados
- **HTTPS**: Comunicação criptografada
- **Políticas RLS**: Controle de acesso no banco

### Monitoramento
- Logs detalhados de todas as operações
- Métricas de uso e performance
- Alertas de segurança
- Auditoria de acessos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@dosecerta.com.br
- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/nurse-pathfinder/issues)

---

**Desenvolvido com ❤️ para a comunidade de enfermagem**

**Versão**: 1.0.0
**Última atualização**: 2025-08-06 
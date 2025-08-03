# 💊 Dose Certa - Plataforma de Estudo para Enfermagem

Uma plataforma web moderna e intuitiva desenvolvida para estudantes e profissionais de enfermagem, oferecendo ferramentas essenciais para cálculos de medicação, estudo de termos médicos e gestão de conhecimento.

![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.52.0-green.svg)
![Stripe](https://img.shields.io/badge/Stripe-18.3.0-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-cyan.svg)

## 📁 Estrutura do Projeto

```
nurse-pathfinder/
├── 📚 docs/                    # Documentação completa
│   ├── 📖 guides/             # Guias gerais e setup
│   ├── 🚀 deployment/         # Guias de deploy
│   ├── ⚡ features/           # Documentação de funcionalidades
│   ├── 🔌 api/               # Documentação de APIs
│   └── 🏗️ architecture/      # Documentação de arquitetura
├── ⚙️ config/                 # Arquivos de configuração
├── 📜 scripts/                # Scripts de automação
├── 💡 examples/               # Exemplos e testes
├── 🧪 tests/                  # Testes automatizados
├── 🗄️ supabase/              # Backend e banco de dados
├── 🎨 src/                    # Código fonte da aplicação
├── 📦 public/                 # Assets públicos
└── 📋 README.md              # Este arquivo
```

## ✨ Funcionalidades

### 🧮 **Calculadora de Medicação**
- **Dosagem por peso**: Cálculos precisos baseados no peso do paciente
- **Taxa de infusão**: Cálculo de gotejamento e velocidade de infusão
- **Conversão de unidades**: Conversões entre diferentes unidades médicas
- **Concentração de soluções**: Cálculos de diluição e concentração
- **Histórico de cálculos**: Salve e consulte cálculos anteriores

### 📚 **Glossário Médico Interativo**
- **Mais de 270+ termos médicos** organizados por categorias
- **Sistema de busca avançada** com filtros por dificuldade
- **Categorias especializadas**: Cardiovascular, Respiratório, Neurológico, etc.
- **Favoritos**: Marque termos importantes para estudo rápido
- **Definições completas** com sinônimos e termos relacionados

### 🎯 **Sistema de Flashcards**
- **Criação de flashcards personalizados** para estudo
- **Flashcards pré-criados** com conteúdo profissional
- **Sistema de revisão espaçada** para otimizar o aprendizado
- **Filtros por categoria e dificuldade**
- **Estatísticas de progresso** de estudos

### 💳 **Sistema de Assinatura**
- **Plano Gratuito**: Acesso limitado à calculadora (7 usos/dia, apenas dosagem)
- **Plano Estudante (R$ 29/mês)**: Acesso completo às funcionalidades
- **Plano Profissional (R$ 59/mês)**: Recursos avançados + suporte prioritário
- **Pagamentos seguros** via Stripe

### 👤 **Gestão de Usuário**
- **Autenticação segura** com Supabase Auth
- **Login com Google OAuth** (✅ Implementado)
- **Vinculação de contas** Google + Email/Senha
- **Verificação de email** via Resend (✅ Funcionando)
- **Recuperação de senha** completa com emails personalizados (✅ Funcionando)
- **Validação de força de senha** em tempo real
- **Campo de email editável** na verificação
- **Setup de perfil** para usuários Google
- **Perfis personalizados** com estatísticas de uso
- **Dashboard analítico** com métricas de progresso
- **Histórico completo** de atividades
- **Ferramentas de debug** para diagnóstico de problemas
- **Rotas organizadas** (/login, /register, /profile)
- **Sincronização de perfil** - nome atualizado automaticamente no sistema
- **Validação de email simplificada** - interface mais limpa

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18.3.1** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização utilitária
- **shadcn/ui** - Componentes de UI modernos
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários performáticos
- **React Router** - Roteamento SPA

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados principal
- **Row Level Security (RLS)** - Segurança granular
- **Edge Functions** - Serverless functions
- **Real-time subscriptions** - Atualizações em tempo real

### **Pagamentos & Autenticação**
- **Stripe** - Processamento de pagamentos
- **Supabase Auth** - Sistema de autenticação
- **JWT** - Tokens de autenticação

### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **TypeScript ESLint** - Regras específicas para TS
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta Supabase
- Conta Stripe (para pagamentos)

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/nurse-pathfinder.git
cd nurse-pathfinder
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configuração das variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=sua_supabase_url
VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=sua_stripe_publishable_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

### **4. Configuração do Supabase**

#### **4.1. Execute as migrações do banco**
No Supabase Dashboard > SQL Editor, execute os arquivos de migração em ordem:

```sql
-- Execute os arquivos em supabase/migrations/ na ordem:
-- 20250122000001_create_medical_glossary.sql
-- 20250122000002_insert_initial_glossary_data.sql
-- 20250123000001_create_flashcards_system.sql
-- 20250126200000_create_user_profiles.sql
-- 20250126210000_create_subscription_system.sql
-- 20250128000001_create_calculator_usage.sql
```

#### **4.2. Configure os secrets do Supabase**
No Supabase Dashboard > Edge Functions > Settings:

```
STRIPE_SECRET_KEY=sua_stripe_secret_key
SUPABASE_URL=sua_supabase_url
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key
```

#### **4.3. Configure o Google OAuth**
1. **Execute a migração do Google OAuth:**
   ```sql
   -- Execute o arquivo: 20250130000004_add_google_auth_fields.sql
   ```

2. **Configure o provider Google no Supabase:**
   - Acesse: Authentication → Providers
   - Ative o Google provider
   - Configure o Client ID e Client Secret

3. **Configure as URLs de redirecionamento:**
   - Site URL: `http://localhost:8080` (dev) ou seu domínio (prod)
   - Redirect URLs: `http://localhost:8080/**` (dev) ou seu domínio (prod)

**📖 Guia completo:** Veja `docs/guides/GOOGLE_OAUTH_SETUP.md` para instruções detalhadas.

#### **4.4. Deploy das Edge Functions**
```bash
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy send-verification-email
npx supabase functions deploy password-reset
```

### **5. Configuração do Stripe**

1. **Configure os produtos no Stripe Dashboard**
2. **Configure os webhooks** para o endpoint das Edge Functions
3. **Anote os Price IDs** dos produtos criados

### **6. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 📋 **Para Desenvolvedores**

### **Sistema de Backlog**
O projeto inclui um sistema interno de backlog para gerenciar funcionalidades e melhorias:

1. **Acesse**: Faça login e vá para "Dev Dashboard" no menu
2. **Adicione Ideias**: Use o botão "Adicionar Item" para registrar novas funcionalidades
3. **Categorize**: Organize por Calculadora, Flashcards, Glossário, UX/UI, etc.
4. **Priorize**: Defina prioridades (Alta, Média, Baixa)
5. **Acompanhe**: Use filtros para ver backlog, em desenvolvimento ou concluído

### **Guias Disponíveis**
- `docs/guides/BACKLOG_GUIDE.md` - Guia prático do sistema de backlog
- `docs/guides/NURSE_PATHFINDER_PLANNING_GUIDE.md` - Documentação completa de planejamento

### **Comandos Úteis**
```javascript
// Adicionar item ao backlog via console
addBacklogItem("Título", "Descrição", "Calculadora", "Alta")
```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run dev:clean        # Inicia removendo processos anteriores
npm run dev:port         # Inicia na porta 8080

# Build
npm run build            # Build para produção
npm run build:dev        # Build para desenvolvimento
npm run preview          # Preview do build

# Qualidade de código
npm run lint             # Executa ESLint

# Utilitários
npm run stop             # Para processos Vite
```

## 🧪 Funcionalidades Principais

### **Calculadora de Medicação**
- Suporte a múltiplos tipos de cálculo
- Validação de entrada em tempo real
- Histórico de cálculos persistente
- Limitações baseadas no plano de assinatura

### **Glossário Médico**
- Base de conhecimento com 270+ termos
- Sistema de busca inteligente
- Categorização por especialidade
- Níveis de dificuldade (básico, intermediário, avançado)

### **Sistema de Flashcards**
- Algoritmo de repetição espaçada
- Criação de conteúdo personalizado
- Tracking de progresso de estudos
- Análise de performance

### **Sistema de Assinatura**
- Integração completa com Stripe
- Webhooks para sincronização de status
- Portal de gerenciamento de cobrança
- Diferentes níveis de acesso

### **Sistema de Recuperação de Senha**
- **Edge Function customizada** para gerenciar reset de senha
- **Emails personalizados** com template HTML profissional
- **Links seguros** com expiração automática
- **Validação de força de senha** em tempo real
- **Campo de email editável** na verificação
- **Verificação robusta de tokens** com delays para processamento
- **Redirecionamento correto** para ambiente de desenvolvimento

### **Sistema de Autenticação Google**
- **OAuth 2.0 completo** com Google
- **Vinculação de contas** para emails existentes
- **Setup de perfil** para novos usuários Google
- **Sincronização automática** de dados do perfil
- **Redirecionamento inteligente** baseado no status do usuário

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Autenticação JWT** via Supabase Auth
- **Recuperação de senha segura** com tokens expiráveis
- **Validação de força de senha** com critérios rigorosos
- **Prevenção de enumeração de emails** com rate limiting
- **Validação de entrada** em todas as operações
- **HTTPS** obrigatório em produção
- **Sanitização** de dados de entrada

## 📚 Documentação

### **Estrutura da Documentação**
- **`docs/guides/`** - Guias gerais e setup
- **`docs/deployment/`** - Guias de deploy e produção
- **`docs/features/`** - Documentação técnica de funcionalidades
- **`docs/api/`** - Documentação de APIs
- **`docs/architecture/`** - Documentação de arquitetura

### **Guias Principais**
- **Setup Inicial**: `docs/guides/README.md`
- **Deploy**: `docs/guides/DEPLOY_INSTRUCTIONS.md`
- **FAQ**: `docs/features/FAQ_IMPLEMENTATION_GUIDE.md`
- **Backlog**: `docs/guides/BACKLOG_GUIDE.md`

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra** um Pull Request

### **Padrões de Commit**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Mateus Brito** - *Desenvolvedor Principal* - [@matheusbrito](https://github.com/matheusbrito)

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: matheusbrito.oo@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/nurse-pathfinder/issues)
- 📚 Documentação: `docs/` - Guias completos e troubleshooting

## 🙏 Agradecimentos

- Comunidade de enfermagem pela validação das funcionalidades
- Equipe shadcn/ui pelos componentes excepcionais
- Supabase e Stripe pelas ferramentas robustas

---

**💡 Dose Certa** - Transformando o estudo de enfermagem através da tecnologia. 
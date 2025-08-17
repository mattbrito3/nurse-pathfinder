# 💊 Dose Certa - Plataforma de Estudo para Enfermagem

Uma plataforma web moderna e intuitiva desenvolvida para estudantes e profissionais de enfermagem, oferecendo ferramentas essenciais para cálculos de medicação, estudo de termos médicos e gestão de conhecimento.

![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.52.0-green.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-cyan.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.19-yellow.svg)

## 📁 Estrutura do Projeto

```
nurse-pathfinder/
├── 📚 docs/                    # Documentação completa
│   ├── 📖 guides/             # Guias gerais e setup
│   ├── 🚀 deployment/         # Guias de deploy
│   ├── ⚡ features/           # Documentação de funcionalidades
│   ├── 🔌 api/               # Documentação de APIs
│   ├── 🏗️ architecture/      # Documentação de arquitetura
│   └── 📄 legal/             # Documentos legais
├── ⚙️ config/                 # Arquivos de configuração
├── 📜 scripts/                # Scripts de automação
├── 💡 examples/               # Exemplos e testes
├── 🧪 tests/                  # Testes automatizados
├── 🗄️ supabase/              # Backend e banco de dados
├── 🎨 src/                    # Código fonte da aplicação
├── 📦 public/                 # Assets públicos
└── 📋 README.md              # Este arquivo
```

## ✨ Funcionalidades Implementadas

### 🎨 **Animações e Responsividade Avançadas** ✅
- **Scroll-triggered animations** com efeitos de reveal suaves
- **Parallax scrolling** para profundidade visual e imersão
- **Progress indicators** com barra de progresso em tempo real
- **Micro-interactions** sofisticadas em botões e cards
- **Animações contínuas** (floating, gradient text) para dinamismo
- **Stagger animations** para elementos sequenciais
- **100% responsivo** para todos os iPhones (SE até iPhone 16)
- **Otimizações iOS Safari** com safe area support
- **Touch targets** otimizados (44px mínimo)
- **Reduced motion** support para acessibilidade
- **Performance otimizada** com GPU acceleration

### 🧮 **Calculadora de Medicação** ✅
- **Dosagem por peso**: Cálculos precisos baseados no peso do paciente
- **Taxa de infusão**: Cálculo de gotejamento e velocidade de infusão
- **Conversão de unidades**: Conversões entre diferentes unidades médicas
- **Concentração de soluções**: Cálculos de diluição e concentração
- **Histórico de cálculos**: Salve e consulte cálculos anteriores
- **Validação em tempo real**: Verificação de entrada para evitar erros
- **Interface intuitiva**: Design responsivo e fácil de usar

### 📚 **Glossário Médico Interativo** ✅
- **270+ termos médicos** organizados por categorias
- **Sistema de busca avançada** com filtros por dificuldade
- **Categorias especializadas**: Cardiovascular, Respiratório, Neurológico, etc.
- **Favoritos**: Marque termos importantes para estudo rápido
- **Definições completas** com sinônimos e termos relacionados
- **Interface responsiva**: Funciona perfeitamente em mobile e desktop

### 🎯 **Sistema de Flashcards** ✅
- **270+ flashcards pré-criados** com conteúdo profissional
- **Sistema de revisão espaçada** (algoritmo SM-2) para otimizar o aprendizado
- **Criação de flashcards personalizados** para estudo
- **Filtros por categoria e dificuldade**
- **Estatísticas de progresso** de estudos
- **Sessões de estudo** com tracking de performance
- **Níveis de domínio**: Novo, Iniciante, Básico, Intermediário, Avançado, Dominado
- **Sistema de favoritos** para marcar cards importantes

### 📊 **Analytics e Progresso** ✅
- **Dashboard analítico** com métricas de progresso
- **Gráficos interativos** de performance
- **Estatísticas por categoria** de estudo
- **Tracking de streaks** de estudo
- **Distribuição de domínio** dos flashcards
- **Progresso semanal** e mensal
- **Atualizações em tempo real** via Supabase Realtime

### 👤 **Sistema de Autenticação Completo** ✅
- **Autenticação segura** com Supabase Auth
- **Login com Google OAuth** (✅ Implementado e funcionando)
- **Vinculação de contas** Google + Email/Senha
- **Verificação de email** via Resend (✅ Funcionando)
- **Recuperação de senha** completa com emails personalizados (✅ Funcionando)
- **Validação de força de senha** em tempo real
- **Setup de perfil** para usuários Google
- **Perfis personalizados** com estatísticas de uso
- **Ferramentas de debug** para diagnóstico de problemas

### 📄 **Documentos Legais** ✅
- **Termos de Uso** completos e atualizados
- **Política de Privacidade** em conformidade com LGPD
- **Política de Cookies** para conformidade
- **Termos de Assinatura** com planos atualizados
- **Banner de consentimento** de cookies
- **Links no footer** para todos os documentos

### 💳 **Sistema de Assinatura** 🚧
- **Plano Gratuito**: Acesso limitado à calculadora (7 usos/dia, apenas dosagem)
- **Plano Estudante (R$ 18,99/mês)**: Acesso completo às funcionalidades
- **🚧 Sistema de pagamentos**: Em atualização para nova solução mais segura

> **📢 Atualização Importante (Janeiro 2025)**  
> O sistema de pagamentos foi completamente renovado. A integração anterior foi removida e estamos implementando uma nova solução mais segura e eficiente. Durante este período, todas as funcionalidades principais da plataforma permanecem disponíveis.

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

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18.3.1** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização utilitária
- **shadcn/ui** - Componentes de UI modernos
- **AOS (Animate On Scroll)** - Animações baseadas em scroll
- **Intersection Observer API** - Detecção de visibilidade para animações
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários performáticos
- **React Router** - Roteamento SPA
- **Recharts** - Gráficos e visualizações

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados principal
- **Row Level Security (RLS)** - Segurança granular
- **Edge Functions** - Serverless functions
- **Real-time subscriptions** - Atualizações em tempo real

### **Autenticação & Email**
- **Supabase Auth** - Sistema de autenticação
- **Google OAuth** - Login social integrado
- **Resend** - Serviço de emails
- **JWT** - Tokens de autenticação

### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **TypeScript ESLint** - Regras específicas para TS
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos
- **Playwright** - Testes automatizados

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta Supabase
- Conta Resend (para emails)
- Conta Google (para OAuth)

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

# Email (Resend)
VITE_RESEND_API_KEY=sua_resend_api_key
VITE_FROM_EMAIL=noreply@seudominio.com
VITE_FROM_NAME=Dose Certa

# Google OAuth
VITE_GOOGLE_CLIENT_ID=seu_google_client_id

# App Configuration
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Dose Certa
```

### **4. Configuração do Supabase**

#### **4.1. Execute as migrações do banco**
No Supabase Dashboard > SQL Editor, execute os arquivos de migração em ordem:

```sql
-- Execute os arquivos em supabase/migrations/ na ordem:
-- 20250122000001_create_medical_glossary.sql
-- 20250122000002_insert_initial_glossary_data.sql
-- 20250123000001_create_flashcards_system.sql
-- 20250123000002_populate_flashcard_data.sql
-- 20250126000001_expand_flashcards_to_270.sql
-- 20250126000002_complete_flashcards_expansion.sql
-- 20250126000003_final_flashcards_completion.sql
-- 20250126200000_create_user_profiles.sql
-- 20250126210000_create_subscription_system.sql
-- 20250128000001_create_calculator_usage.sql
-- 20250130000008_create_password_reset_tokens.sql
```

#### **4.2. Configure os secrets do Supabase**
No Supabase Dashboard > Edge Functions > Settings:

```
STRIPE_SECRET_KEY=sua_stripe_secret_key
SUPABASE_URL=sua_supabase_url
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key
NEW_API_KEY_RESEND=sua_resend_api_key
FRONTEND_URL=https://dosecerta.online
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
npx supabase functions deploy send-verification-email
npx supabase functions deploy password-reset
npx supabase functions deploy verify-reset-token
npx supabase functions deploy check-email-exists
npx supabase functions deploy debug-subscription
```

### **5. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 📋 **Para Desenvolvedores**

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

# Testes
npm run test             # Executa testes Playwright
npm run test:ui          # Interface de testes
npm run test:headed      # Testes com navegador visível
npm run test:debug       # Modo debug dos testes

# Utilitários
npm run stop             # Para processos Vite
```

## 🧪 Funcionalidades Principais

### **Calculadora de Medicação** ✅
- Suporte a múltiplos tipos de cálculo
- Validação de entrada em tempo real
- Histórico de cálculos persistente
- Limitações baseadas no plano de assinatura
- Interface responsiva e intuitiva

### **Glossário Médico** ✅
- Base de conhecimento com 270+ termos
- Sistema de busca inteligente
- Categorização por especialidade
- Níveis de dificuldade (básico, intermediário, avançado)
- Sistema de favoritos

### **Sistema de Flashcards** ✅
- Algoritmo de repetição espaçada (SM-2)
- 270+ flashcards pré-criados
- Criação de conteúdo personalizado
- Tracking de progresso de estudos
- Análise de performance
- Sessões de estudo com estatísticas

### **Sistema de Analytics** ✅
- Dashboard completo com métricas
- Gráficos interativos de progresso
- Estatísticas por categoria
- Tracking de streaks de estudo
- Atualizações em tempo real

### **Sistema de Assinatura** 🚧
- 🚧 Sistema em atualização para nova solução de pagamento
- Controle de acesso baseado em planos
- Diferentes níveis de funcionalidades
- Preparado para integração com nova solução

### **Sistema de Recuperação de Senha** ✅
- **Edge Function customizada** para gerenciar reset de senha
- **Emails personalizados** com template HTML profissional
- **Links seguros** com expiração automática
- **Validação de força de senha** em tempo real
- **Campo de email editável** na verificação
- **Verificação robusta de tokens** com delays para processamento
- **Redirecionamento correto** para ambiente de desenvolvimento

### **Sistema de Autenticação Google** ✅
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

## 📱 Compatibilidade de Dispositivos

### **✅ iPhone Series (100% Compatível)**
- **iPhone 16 Pro Max** (430px) - ✅ Perfeito
- **iPhone 16 Pro** (393px) - ✅ Perfeito
- **iPhone 16** (393px) - ✅ Perfeito
- **iPhone 15 Pro Max** (430px) - ✅ Perfeito
- **iPhone 15 Pro** (393px) - ✅ Perfeito
- **iPhone 15** (393px) - ✅ Perfeito
- **iPhone 14 Pro Max** (430px) - ✅ Perfeito
- **iPhone 14 Pro** (393px) - ✅ Perfeito
- **iPhone 14** (390px) - ✅ Perfeito
- **iPhone 13 Pro Max** (428px) - ✅ Perfeito
- **iPhone 13 Pro** (390px) - ✅ Perfeito
- **iPhone 13** (390px) - ✅ Perfeito
- **iPhone 12 Pro Max** (428px) - ✅ Perfeito
- **iPhone 12 Pro** (390px) - ✅ Perfeito
- **iPhone 12** (390px) - ✅ Perfeito
- **iPhone 11 Pro Max** (414px) - ✅ Perfeito
- **iPhone 11 Pro** (375px) - ✅ Perfeito
- **iPhone 11** (414px) - ✅ Perfeito
- **iPhone XS Max** (414px) - ✅ Perfeito
- **iPhone XS** (375px) - ✅ Perfeito
- **iPhone X** (375px) - ✅ Perfeito
- **iPhone SE (3rd gen)** (375px) - ✅ Perfeito
- **iPhone SE (2nd gen)** (375px) - ✅ Perfeito
- **iPhone SE (1st gen)** (320px) - ✅ Perfeito

### **✅ Outros Dispositivos**
- **Samsung Galaxy S21** (360px) - ✅ Perfeito
- **Google Pixel** (411px) - ✅ Perfeito
- **Tablets** (768px+) - ✅ Perfeito
- **Desktop** (1024px+) - ✅ Perfeito

### **🎨 Otimizações Específicas**
- **Safe area support** para notch e home indicator
- **Touch targets** otimizados (44px mínimo)
- **Prevenção de zoom** em inputs iOS
- **Performance de scroll** otimizada para Safari
- **Reduced motion** support para acessibilidade

## 📚 Documentação

### **Estrutura da Documentação**
- **`docs/guides/`** - Guias gerais e setup
- **`docs/deployment/`** - Guias de deploy e produção
- **`docs/features/`** - Documentação técnica de funcionalidades
- **`docs/api/`** - Documentação de APIs
- **`docs/architecture/`** - Documentação de arquitetura
- **`docs/legal/`** - Documentos legais

### **Guias Principais**
- **Setup Inicial**: `docs/guides/README.md`
- **Deploy**: `docs/guides/DEPLOY_INSTRUCTIONS.md`
- **Animações e Responsividade**: `docs/guides/ANIMATIONS_IMPLEMENTATION_GUIDE.md`
- **Reset de Senha**: `docs/guides/PASSWORD_RESET_IMPLEMENTATION.md`
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
- Supabase e Resend pelas ferramentas robustas
- Comunidade open source pelo suporte contínuo

---

**💡 Dose Certa** - Transformando o estudo de enfermagem através da tecnologia.

**Versão**: 1.1.0
**Última atualização**: 2025-01-08 #   C h e c k o u t   T r a n s p a r e n t e   c o n f i g u r a d o   n o   V e r c e l  
 
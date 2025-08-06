# 🚀 CHECKLIST COMPLETO - DEV → PRODUÇÃO

## ⚠️ **CONFIGURAÇÕES QUE VOCÊ PRECISA AJUSTAR:**

---

## 📧 **1. RESEND (EMAIL) - IMPORTANTE!**

### **🔧 O que está HARDCODED (problemático):**
```typescript
// Em vários arquivos de serviço:
const RESEND_API_KEY = 're_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z'; // ❌ EXPOSTO
const FROM_EMAIL = 'delivered@resend.dev'; // ❌ Domínio de teste
```

### **✅ O que você DEVE fazer:**

#### **🔑 1.1. Criar variáveis de ambiente:**
**Arquivo: `.env.production` (criar):**
```env
# Resend Production
VITE_RESEND_API_KEY=re_SuaChaveRealAqui_Production
VITE_FROM_EMAIL=noreply@seudominio.com.br
VITE_FROM_NAME=Dose Certa

# Supabase (já está ok)
VITE_SUPABASE_URL=https://epjfoteyvejoqnigijrz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (já está ok)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_SuaChaveStripeProducao
```

#### **🔧 1.2. Atualizar código para usar variáveis:**
**Precisa alterar em:**
- `src/services/resendOfficialService.ts`
- `src/services/resendEmailService.ts`  
- `src/services/productionEmailService.ts`

**De:**
```typescript
const RESEND_API_KEY = 're_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z'; // ❌
```

**Para:**
```typescript
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY; // ✅
```

#### **🌐 1.3. Configurar domínio no Resend:**
- **Dashboard Resend:** Adicionar `seudominio.com.br`
- **DNS:** Configurar registros SPF/DKIM
- **Verificar:** Domínio aprovado para envio

---

## 🔐 **2. GOOGLE OAUTH (já sabemos):**

### **✅ Google Cloud Console:**
```
Authorized JavaScript origins:
- http://localhost:8080 (manter para dev)
- https://seudominio.com.br (adicionar para prod)

Redirect URIs:
- https://epjfoteyvejoqnigijrz.supabase.co/auth/v1/callback (não muda)
```

### **✅ Supabase Auth Settings:**
```
Site URL: https://seudominio.com.br
Redirect URLs: https://seudominio.com.br/**
```

---

## 💳 **3. STRIPE (se usando):**

### **🔧 Mudar para chaves de produção:**
```env
# .env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_SuaChaveRealProducao (não pk_test_)
```

### **🔧 Supabase Functions (variáveis):**
**Dashboard Supabase → Functions → Environment Variables:**
```
STRIPE_SECRET_KEY=sk_live_SuaChaveSecretaProducao
STRIPE_WEBHOOK_SECRET=whsec_SeuWebhookSecretProducao
```

---

## 🌐 **4. HOSPEDAGEM (Hostinger ou Vercel):**

### **📋 Build & Deploy:**
```bash
# 1. Criar arquivo .env.production com variáveis corretas
# 2. Build do projeto
npm run build

# 3A. Hostinger: Upload pasta dist/ para public_html/
# 3B. Vercel: Deploy automático via GitHub
```

### **🔧 Variáveis de ambiente na hospedagem:**

#### **📊 Hostinger (se usar):**
- Painel → Variables de ambiente
- Adicionar todas as `VITE_*` 

#### **⚡ Vercel (recomendado):**
- Dashboard → Project → Settings → Environment Variables
- Adicionar todas as variáveis

---

## ⚙️ **5. SUPABASE FUNCTIONS (se necessário):**

### **🔧 Environment Variables no Supabase:**
**Dashboard → Functions → Environment Variables:**
```
RESEND_API_KEY=re_SuaChaveRealProducao
SMTP_HOST=smtp.resend.com
SMTP_USER=resend
SMTP_PASS=re_SuaChaveRealProducao
FROM_NAME=Dose Certa
STRIPE_SECRET_KEY=sk_live_... (se usando Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (se usando webhooks)
```

---

## 📋 **RESUMO - ORDEM DE EXECUÇÃO:**

### **🔄 Pré-deploy:**
1. ✅ **Criar .env.production** com variáveis corretas
2. ✅ **Resend:** Configurar domínio + DNS
3. ✅ **Google:** Adicionar domínio de produção
4. ✅ **Stripe:** Mudar para chaves live (se usando)
5. ✅ **Atualizar código:** Usar variáveis de ambiente

### **🚀 Deploy:**
1. ✅ **Build:** `npm run build`
2. ✅ **Upload/Deploy:** Hostinger ou Vercel
3. ✅ **Variáveis:** Configurar na hospedagem
4. ✅ **Supabase:** Atualizar URLs de auth

### **🧪 Pós-deploy:**
1. ✅ **Teste:** Login Google
2. ✅ **Teste:** Envio de email
3. ✅ **Teste:** Pagamentos (se aplicável)

---

## ⚠️ **PROBLEMAS ATUAIS NO SEU CÓDIGO:**

### **❌ APIs keys hardcoded:**
- Resend API key está exposta no código
- FROM_EMAIL usando domínio de teste

### **❌ Sem variáveis de ambiente:**
- Não tem arquivo `.env`
- Valores fixos em vez de configuráveis

### **❌ Email domínio de teste:**
- `delivered@resend.dev` vs `noreply@seudominio.com.br`

---

## 💡 **PRIORIDADES PARA PRODUÇÃO:**

### **🔥 CRÍTICO (obrigatório):**
1. **Criar sistema de variáveis** (.env.production)
2. **Configurar domínio no Resend**
3. **Atualizar código** para usar env vars
4. **Google OAuth** adicionar domínio produção

### **⚡ IMPORTANTE (recomendado):**
1. **Usar Vercel** em vez de Hostinger (grátis + melhor)
2. **Configurar DNS** corretamente
3. **SSL/HTTPS** automático

### **🎯 OPCIONAL (melhorias):**
1. **Monitoring** de emails
2. **Analytics** de conversão
3. **Backup** automático

---

**🚨 RESUMO: Sua principal pendência são as APIs keys hardcoded e falta de variáveis de ambiente!**

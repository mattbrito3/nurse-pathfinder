# 🚀 Deploy em Produção - Guia Completo

## 📋 **CHECKLIST PRÉ-DEPLOY:**

### **1️⃣ Hospedagem Vercel (GRÁTIS):**
- Criar conta no Vercel.com
- Conectar repositório GitHub
- Deploy automático configurado

### **2️⃣ Domínio Personalizado:**
- Adicionar domínio no painel Vercel
- Configurar DNS (A/CNAME records)
- HTTPS automático (Let's Encrypt)

---

## 🔧 **CONFIGURAÇÕES GOOGLE OAUTH:**

### **⚙️ Google Cloud Console:**
1. Acesse projeto existente
2. APIs & Services → Credentials 
3. Edite as credenciais OAuth existentes

**🌐 ADICIONAR às Authorized JavaScript origins:**
```
https://seudominio.com.br
```

**🔄 Redirect URIs permanecem:**
```
https://epjfoteyvejoqnigijrz.supabase.co/auth/v1/callback
```

---

## 📱 **CONFIGURAÇÕES SUPABASE:**

### **🔧 Authentication Settings:**
1. Dashboard → Authentication → URL Configuration
2. **Site URL:** `https://seudominio.com.br`
3. **Redirect URLs:** `https://seudominio.com.br/**`

---

## 🌐 **OPÇÕES DE HOSPEDAGEM:**

### **🎯 HOSTINGER (Sua escolha):**
**💰 Custo:** R$ 6-15/mês (já comprou)
**⚡ Deploy:** Manual via FTP ou Git
**🔒 HTTPS:** Incluído (Let's Encrypt)
**🌍 Localização:** Brasil (boa velocidade)
**📊 cPanel:** Interface familiar

**Passos Hostinger:**
1. Build do projeto: `npm run build`
2. Upload pasta `dist/` via File Manager
3. Configurar domínio no painel
4. Ativar HTTPS

### **🥇 VERCEL (Alternativa GRÁTIS):**
**💰 Custo:** GRÁTIS
**⚡ Deploy:** Automático via GitHub
**🔒 HTTPS:** Incluído
**🌍 CDN:** Global
**📊 Analytics:** Incluído

### **🥈 NETLIFY (Alternativa):**
**💰 Custo:** GRÁTIS
**⚡ Deploy:** Automático via GitHub
**🔒 HTTPS:** Incluído

**💡 Você pode usar Hostinger para domínio + Vercel para hospedagem (grátis)!**

---

## 🔄 **PROCESSO DE DEPLOY:**

### **📝 Pré-requisitos:**
- [ ] Código no GitHub
- [ ] Testes locais funcionando
- [ ] Domínio comprado/configurado

### **🚀 Deploy Hostinger:**
1. **Build:** `npm run build` (gera pasta `dist/`)
2. **Upload:** File Manager → Upload `dist/` para `public_html/`
3. **Domínio:** Configurar no painel Hostinger
4. **HTTPS:** Ativar SSL/TLS gratuito
5. **Teste:** Acessar domínio

### **🆚 Deploy Vercel (alternativa grátis):**
1. **Conectar:** GitHub → Vercel
2. **Import:** Selecionar repositório
3. **Configure:** Detecta Vite automaticamente
4. **Deploy:** ~2 minutos
5. **DNS:** Apontar domínio Hostinger para Vercel

### **⚙️ Configs pós-deploy:**
1. **Google Console:** Adicionar domínio produção
2. **Supabase:** Atualizar Site URL
3. **Teste:** Login Google em produção

---

## 💡 **COMPARAÇÃO HOSTINGER vs VERCEL:**

| **🏗️ Hostinger** | **⚡ Vercel** |
|-------------------|---------------|
| ✅ Domínio + hospedagem junto | ⚠️ Domínio separado |
| ✅ Servidores no Brasil | ✅ CDN mundial |
| ⚠️ Upload manual | ✅ Deploy automático |
| ⚠️ Atualização manual | ✅ Git push = deploy |
| ✅ HTTPS incluído | ✅ HTTPS automático |
| ⚠️ R$ 6-15/mês | ✅ GRÁTIS |
| ✅ cPanel familiar | ✅ Interface moderna |

## 🎯 **ESTRATÉGIA HÍBRIDA (Recomendada):**
- **🌐 Domínio:** Hostinger (já comprou)
- **🏗️ Hospedagem:** Vercel (grátis)
- **📊 Resultado:** Melhor dos dois mundos!

---

## 🎯 **RESUMO - O QUE FAZER:**

### **🔄 Opção 1 - Hostinger Completo:**
1. **Build:** `npm run build`
2. **Upload:** Pasta `dist/` para Hostinger
3. **Google:** Adicionar domínio às origens
4. **Supabase:** Atualizar Site URL

### **🔄 Opção 2 - Híbrida (Recomendada):**
1. **Deploy:** Vercel (grátis)
2. **DNS:** Apontar domínio Hostinger → Vercel
3. **Google:** Adicionar domínio às origens
4. **Supabase:** Atualizar Site URL

**⏱️ Tempo total:** ~30 minutos
**💰 Custo:** Hostinger (já pago) ou Grátis (híbrida)

---

## 🔧 **CONFIGURAÇÃO DNS:**

### **📍 Opção 1 - Hostinger completo:**
- Domínio aponta para Hostinger (padrão)
- Upload manual dos arquivos

### **📍 Opção 2 - DNS Hostinger → Vercel:**
**No painel Hostinger:**
```
Tipo: CNAME
Nome: @ (ou www)  
Valor: cname.vercel-dns.com
```

**💡 Vantagem:** Deploy automático + domínio Hostinger!**

---

## 🤔 **MINHA RECOMENDAÇÃO:**

**🎯 Use a estratégia híbrida:**
- ✅ Mantenha o domínio na Hostinger
- ✅ Hospede no Vercel (grátis)
- ✅ Tenha deploy automático
- ✅ Economize dinheiro
- ✅ Performance melhor

**💡 É literalmente o melhor dos dois mundos!**

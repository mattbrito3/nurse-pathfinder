# 🔐 Google OAuth - Configuração para dosecerta.online

## 🎯 **DOMÍNIO: dosecerta.online**

---

## 📋 **PASSO 1: Google Cloud Console**

### **🔧 Adicionar domínio de produção:**

1. **Acesse:** https://console.cloud.google.com/
2. **Projeto:** Dose Certa App
3. **Menu:** APIs & Services → Credentials
4. **Edite:** Suas credenciais OAuth existentes

### **🌐 Authorized JavaScript origins:**
```
http://localhost:8080          ← manter para desenvolvimento
https://dosecerta.online       ← ADICIONAR para produção
```

### **🔄 Authorized redirect URIs:**
```
https://epjfoteyvejoqnigijrz.supabase.co/auth/v1/callback  ← não muda
```

---

## 📱 **PASSO 2: Supabase Auth Settings**

### **🔧 Atualizar URLs de autenticação:**

1. **Acesse:** https://supabase.com/dashboard/project/epjfoteyvejoqnigijrz
2. **Menu:** Authentication → URL Configuration
3. **Site URL:** `https://dosecerta.online`
4. **Redirect URLs:** `https://dosecerta.online/**`

---

## 📧 **PASSO 3: Resend Domain Setup**

### **🔧 Configurar domínio para emails:**

1. **Dashboard Resend:** Adicionar `dosecerta.online`
2. **DNS Records:** Configurar SPF/DKIM
3. **Verificar:** Domínio aprovado para envio

### **📧 Email de produção:**
```
noreply@dosecerta.online
```

---

## 🧪 **PASSO 4: Testar**

### **✅ Desenvolvimento (localhost):**
- Google login funciona ✅
- Emails via Resend ✅

### **🌐 Produção (dosecerta.online):**
- Google login funcionará após configurar
- Emails via domínio próprio

---

## 🎯 **RESULTADO:**

- ✅ **Google OAuth:** Funciona em dev + prod
- ✅ **Emails:** Via domínio profissional
- ✅ **Sistema:** 100% production-ready
- ✅ **Deploy:** Pronto quando quiser

---

**🚀 Quando fizer deploy, só precisa:**
1. Configurar Google OAuth (este guia)
2. Configurar domínio no Resend
3. Build + Upload
4. **PRONTO!** 

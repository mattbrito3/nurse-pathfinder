# 🚀 DEPLOY INSTRUCTIONS - Dose Certa

## 📧 PORQUE EMAILS NÃO FUNCIONAM EM LOCALHOST:

### ❌ PROBLEMA:
- **localhost:8080** não é um domínio real
- **Resend/Supabase** precisam de HTTPS
- **DNS configurado** para `dosecerta.online` (não localhost)

### ✅ SOLUÇÃO:
- **Deploy para produção** = Emails funcionam IMEDIATAMENTE

---

## 🌐 DEPLOY OPTIONS:

### 🥇 VERCEL (RECOMENDADO)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set custom domain
vercel --prod --domains dosecerta.online
```

### 🥈 NETLIFY
```bash
# 1. Build
npm run build

# 2. Deploy dist/ folder to Netlify
# 3. Set custom domain: dosecerta.online
```

### 🥉 HOSTINGER (ONDE VOCÊ TEM O DOMÍNIO)
```bash
# 1. Build
npm run build

# 2. Upload dist/ to public_html via FTP
# 3. Domain já está configurado
```

---

## ⚡ DEPLOY RÁPIDO (5 MINUTOS):

### 1. 📦 BUILD THE PROJECT
```bash
npm run build
```

### 2. 🌐 DEPLOY TO VERCEL
```bash
npx vercel
# Follow prompts
# Set domain: dosecerta.online
```

### 3. 🔧 UPDATE SUPABASE CONFIG
```
Site URL: https://dosecerta.online
Redirect URLs: https://dosecerta.online/**
```

### 4. ✅ TEST EMAILS
```
Go to: https://dosecerta.online/forgot-password
Enter your email
CHECK YOUR INBOX! 📬
```

---

## 🎯 AFTER DEPLOY:

### ✅ EMAILS WILL WORK:
- From: dosecertasmtp <team@dosecerta.online>
- To: your-email@gmail.com
- Via: Resend → SMTP → Your inbox

### ✅ ALL FEATURES WORK:
- Signup verification codes
- Password reset links
- Real email delivery
- Professional branding

---

## 🚨 CRITICAL: UPDATE SUPABASE URLS

After deploy, update in Supabase Dashboard:

### Authentication → Settings → Site URL:
```
https://dosecerta.online
```

### Authentication → Settings → Redirect URLs:
```
https://dosecerta.online/**
https://dosecerta.online/auth
https://dosecerta.online/reset-password
```

---

## 🎉 RESULT:

**📧 REAL EMAILS IN YOUR INBOX!**
**🌐 PROFESSIONAL DOMAIN!**
**✅ EVERYTHING WORKS!**

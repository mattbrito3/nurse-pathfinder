# 🚀 Setup Rápido - Checkout Transparente

## ⚡ Configuração Express (5 minutos)

### **1. Credenciais Necessárias**
Você precisa fornecer suas credenciais do Mercado Pago:

```env
# Adicionar no .env (SOLICITAR AO USUÁRIO)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxx
```

> **Nota**: O `VITE_MERCADOPAGO_ACCESS_TOKEN` já existe e será reaproveitado.

### **2. Habilitar Checkout Transparente**
```env
# Adicionar no .env
VITE_ENABLE_TRANSPARENT_CHECKOUT=true
VITE_DEFAULT_PAYMENT_MODE=transparent
```

### **3. Deploy dos Endpoints**
```bash
# Deploy das novas Edge Functions
supabase functions deploy create-transparent-payment
supabase functions deploy get-payment-status
```

### **4. Teste Básico**
1. Acessar página de preços
2. Ver modo transparente ativo
3. Testar pagamento PIX ou cartão
4. Verificar webhook funcionando

---

## 🔧 Variáveis de Ambiente Completas

```env
# === OBRIGATÓRIAS ===
# Backend (existente)
VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxx

# Frontend (NOVA - solicitar)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxx

# === OPCIONAIS ===
# Feature Flags
VITE_ENABLE_TRANSPARENT_CHECKOUT=true
VITE_DEFAULT_PAYMENT_MODE=transparent

# Debug (dev)
VITE_DEBUG_PAYMENT=true

# Testes
VITE_MP_FORCE_AMOUNT=1.00
VITE_MP_MIN_AMOUNT=1.00
```

---

## 🎛️ Modos de Operação

### **Modo Conservador (Padrão)**
```env
VITE_ENABLE_TRANSPARENT_CHECKOUT=true
VITE_DEFAULT_PAYMENT_MODE=classic
```
- Checkout Pro por padrão
- Usuários podem testar o transparente

### **Modo Transparente**
```env
VITE_DEFAULT_PAYMENT_MODE=transparent
```
- Checkout Transparente por padrão
- Checkout Pro como fallback

### **Modo Debug**
```env
VITE_DEBUG_PAYMENT=true
```
- Painel de controle visível
- Alternância entre modos
- Informações técnicas

---

## 🧪 Teste Rápido

### **PIX (Recomendado)**
1. Selecionar "PIX" no checkout
2. Preencher nome e email
3. Gerar QR Code
4. ✅ Pagamento criado

### **Cartão (Teste)**
```
Número: 4037371641007021
CVV: 123
Vencimento: 12/25
Nome: TESTE APROVADO
CPF: 123.456.789-01
```

---

## 🚨 Troubleshooting Express

### **SDK não carrega?**
```javascript
// Console do navegador
console.log('Public Key:', import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
```

### **Pagamento não cria?**
```bash
# Logs da Edge Function
supabase functions logs create-transparent-payment
```

### **Webhook não funciona?**
- Webhook **não muda** (usa o mesmo atual)
- Testar: `mercadopago-webhook-public`

---

## 📞 Precisa das Credenciais?

**Entre em contato para fornecer:**
- `MP_PUBLIC_KEY` (frontend)
- `MP_ACCESS_TOKEN` (backend - pode ser o mesmo atual)

**Onde encontrar no Mercado Pago:**
1. [dev.mercadopago.com](https://dev.mercadopago.com)
2. Suas integrações
3. Credenciais de produção
4. Copiar Public Key

---

## ✅ Checklist Mínimo

- [ ] Public Key configurada
- [ ] Transparent checkout habilitado
- [ ] Edge Functions deployadas
- [ ] Teste de pagamento funcionando
- [ ] Webhook recebendo notificações

**🎉 Pronto! Checkout Transparente funcionando.**

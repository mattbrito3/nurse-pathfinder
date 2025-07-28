# 🚀 GUIA DE CONFIGURAÇÃO STRIPE REAL

## ⚡ PASSO A PASSO PARA ATIVAR PAGAMENTOS

### **1. 🔍 ENCONTRAR SEUS PRICE IDs NO STRIPE**

#### **📋 ACESSE SEU DASHBOARD:**
```
🌐 https://dashboard.stripe.com/test/products
```

#### **🎯 SEUS PRODUTOS:**
- **Produto 1:** `prod_SlTelkFBR9PDEc` (R$ 19,90/mês) ✅
- **Produto 2:** `prod_SlTek9OQfCZwSA` (R$ 199,00/ano) ✅

#### **📝 COPIE OS PRICE IDs:**
```
🌐 https://dashboard.stripe.com/test/products/prod_SlTelkFBR9PDEc
✅ Clique no produto R$ 19,90
✅ Na seção "Pricing" copie o Price ID 
✅ Ele começa com "price_"

🌐 https://dashboard.stripe.com/test/products/prod_SlTek9OQfCZwSA  
✅ Clique no produto R$ 199,00
✅ Na seção "Pricing" copie o Price ID
✅ Ele começa com "price_"
```

### **2. ⚙️ CONFIGURAR PRICE IDs NO CÓDIGO**

#### **📁 Arquivo:** `supabase/functions/create-checkout-session/index.ts`

**🔧 SUBSTITUA nas linhas 47-48:**
```typescript
// ENCONTRE OS PRICE IDs DOS SEUS PRODUTOS:
'professional': 'price_ENCONTRAR_NO_PRODUTO_prod_SlTelkFBR9PDEc', // R$ 19,90/mês
'annual': 'price_ENCONTRAR_NO_PRODUTO_prod_SlTek9OQfCZwSA',       // R$ 199,00/ano

// SUBSTITUA PELOS PRICE IDs REAIS (começam com "price_"):
'professional': 'price_XXXXXXXXXXXXXXXXXXXXX', // ← Cole o Price ID do prod_SlTelkFBR9PDEc
'annual': 'price_YYYYYYYYYYYYYYYYYYYYY',       // ← Cole o Price ID do prod_SlTek9OQfCZwSA
```

### **3. 🚀 DEPLOY DAS EDGE FUNCTIONS**

#### **📋 COMANDOS PARA EXECUTAR:**
```bash
# 1. Deploy da função de checkout
supabase functions deploy create-checkout-session --project-ref SEU_PROJECT_REF

# 2. Deploy da função de webhook  
supabase functions deploy stripe-webhook --project-ref SEU_PROJECT_REF
```

#### **🔑 CONFIGURAR SECRETS NO SUPABASE:**
```bash
# Adicionar sua chave secreta do Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_51RoObhB2FIOsvy1CAIpiY0sOZsIbLC9IiVji5k3FnRx9WhQCPyrgXO7DCesjuOoeiAzaR5W6yEUxAVqe65OkVh2t00OxZ16mmr --project-ref SEU_PROJECT_REF
```

### **4. 🔗 CONFIGURAR WEBHOOK NO STRIPE**

#### **📋 NO DASHBOARD STRIPE:**
```
🌐 Vá para: https://dashboard.stripe.com/test/webhooks
✅ Clique "Add endpoint"
✅ URL: https://SEU_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
✅ Eventos: 
   - checkout.session.completed
   - customer.subscription.updated  
   - customer.subscription.deleted
✅ Copie o "Signing secret" (whsec_...)
```

#### **🔐 ADICIONAR WEBHOOK SECRET:**
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET --project-ref SEU_PROJECT_REF
```

### **5. 🧪 TESTAR O SISTEMA**

#### **✅ FLUXO COMPLETO:**
```javascript
1. 🛒 http://localhost:8080/pricing
2. 💳 Clique "Assinar Agora"  
3. 🔄 Edge Function cria sessão
4. 🚀 Redireciona para Stripe.com
5. 💰 Usuário paga no Stripe real
6. ✅ Webhook atualiza banco de dados
7. 🎉 Usuário volta com acesso premium
```

### **6. 📊 MONITORAMENTO**

#### **🔍 LOGS DAS EDGE FUNCTIONS:**
```bash
# Ver logs em tempo real
supabase functions logs create-checkout-session --project-ref SEU_PROJECT_REF
supabase functions logs stripe-webhook --project-ref SEU_PROJECT_REF
```

#### **💳 DASHBOARD STRIPE:**
```
🌐 https://dashboard.stripe.com/test/payments
✅ Veja todos os pagamentos
✅ Status das assinaturas
✅ Eventos do webhook
```

---

## 🎯 **RESUMO DOS ARQUIVOS CRIADOS:**

### **✅ IMPLEMENTAÇÃO COMPLETA:**
```javascript
✅ Supabase Edge Functions (checkout + webhook)
✅ SubscribeButton component real
✅ Stripe utilities (getStripe)
✅ Integração com banco de dados
✅ Redirecionamento para Stripe real
✅ Atualização automática via webhook
```

### **🔧 PRÓXIMOS PASSOS:**
1. **📝 Configure os Price IDs corretos**
2. **🚀 Deploy das Edge Functions**  
3. **🔗 Configure webhook no Stripe**
4. **🧪 Teste o fluxo completo**

---

## 🎉 **RESULTADO FINAL:**

**💳 SISTEMA DE PAGAMENTOS REAL E ROBUSTO!**
**🔄 FLUXO IDÊNTICO AO NEXT.JS!**
**✅ REDIRECIONAMENTO PARA STRIPE.COM!**
**🎯 CONFIRMAÇÃO VIA WEBHOOK!**
**💰 PAGAMENTOS REAIS NA SUA CONTA!**
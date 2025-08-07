# 🚀 GUIA DE CONFIGURAÇÃO MERCADO PAGO

## 📋 **Resumo da Implementação**

Este guia te ajudará a configurar completamente a integração com Mercado Pago para o DoseCerta.

## 🔧 **1. Configuração no Mercado Pago**

### **1.1 Obter Credenciais de Teste**

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Copie o **Access Token** de teste
3. Guarde para usar nas variáveis de ambiente

### **1.2 Configurar Webhook**

1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Clique em "Configurar notificações Webhooks"

#### **Configurações do Webhook:**

**URL para teste:**
```
https://epjfoteyvejoqnigijrz.supabase.co/functions/v1/mercadopago-webhook
```

**Eventos a marcar:**

✅ **Eventos recomendados para integrações com CheckoutPro:**
- ✅ **Pagamentos** (obrigatório)
- ✅ **Alertas de fraude** (recomendado)
- ✅ **Contestações** (recomendado)

✅ **Outros eventos:**
- ✅ **Planos e assinaturas** (obrigatório para assinaturas)

**Assinatura secreta:**
- Clique no ícone de refresh para gerar
- Copie o valor gerado

## 🔧 **2. Configuração Local**

### **2.1 Variáveis de Ambiente**

Adicione ao seu arquivo `.env`:

```env
# MercadoPago Configuration
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

### **2.2 Deploy da Edge Function**

```bash
# Deploy da função webhook
npx supabase functions deploy mercadopago-webhook --project-ref epjfoteyvejoqnigijrz

# Configurar secret do webhook
npx supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here --project-ref epjfoteyvejoqnigijrz
```

## 🧪 **3. Testando a Integração**

### **3.1 Teste de Pagamento**

1. Acesse: http://localhost:8080/pricing
2. Clique em "Assinar Plano" no plano Estudante
3. Você será redirecionado para o Mercado Pago
4. Use os dados de teste:

**Cartão de Teste:**
- Número: `4509 9535 6623 3704`
- CVV: `123`
- Data: `12/25`
- Nome: `APRO` (para aprovação) ou `CONT` (para pendente) ou `CALL` (para rejeitado)

### **3.2 Verificar Webhook**

```bash
# Ver logs da função
npx supabase functions logs mercadopago-webhook --project-ref epjfoteyvejoqnigijrz
```

## 📊 **4. Estrutura Implementada**

### **4.1 Arquivos Criados**

- `supabase/functions/mercadopago-webhook/index.ts` - Webhook handler
- `src/services/mercadopagoService.ts` - Serviço de integração
- `src/components/payment/MercadoPagoButton.tsx` - Botão de pagamento

### **4.2 Fluxo de Pagamento**

1. Usuário clica em "Assinar Plano"
2. Sistema cria preferência no Mercado Pago
3. Usuário é redirecionado para checkout
4. Após pagamento, webhook atualiza banco
5. Usuário retorna para site com status

## 🔍 **5. Monitoramento**

### **5.1 Logs do Webhook**

```bash
# Ver logs em tempo real
npx supabase functions logs mercadopago-webhook --project-ref epjfoteyvejoqnigijrz --follow
```

### **5.2 Dashboard Mercado Pago**

- Testes: https://www.mercadopago.com.br/developers/panel/transactions
- Produção: https://www.mercadopago.com.br/developers/panel/transactions

## 🚀 **6. Deploy para Produção**

### **6.1 Configurar Produção**

1. Obter credenciais de produção no Mercado Pago
2. Atualizar variáveis de ambiente
3. Configurar webhook de produção
4. Testar com valores reais

### **6.2 Variáveis de Produção**

```env
VITE_MERCADOPAGO_ACCESS_TOKEN=APP-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=prod_webhook_secret_here
```

## ✅ **7. Checklist de Configuração**

- [ ] Credenciais de teste obtidas
- [ ] Webhook configurado no Mercado Pago
- [ ] Edge Function deployada
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de pagamento realizado
- [ ] Webhook funcionando
- [ ] Logs sendo gerados
- [ ] Banco de dados sendo atualizado

## 🆘 **8. Troubleshooting**

### **Erro 401 - Unauthorized**
- Verificar se o Access Token está correto
- Confirmar se está usando token de teste em desenvolvimento

### **Webhook não recebido**
- Verificar se a URL está correta
- Confirmar se a Edge Function está deployada
- Verificar logs da função

### **Pagamento não atualizado no banco**
- Verificar logs do webhook
- Confirmar se o external_reference está sendo enviado
- Verificar se as tabelas existem no banco

## 📞 **Suporte**

Se encontrar problemas:
1. Verificar logs da Edge Function
2. Consultar documentação do Mercado Pago
3. Verificar se todas as variáveis estão configuradas 
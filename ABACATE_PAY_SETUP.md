# 🥑 Configuração da AbacatePay

## 📋 Pré-requisitos

1. **Conta na AbacatePay** - Crie uma conta em [abacatepay.com](https://abacatepay.com)
2. **Chave de API** - Obtenha sua chave de API no dashboard
3. **Webhook Secret** - Configure um secret para webhooks (opcional)

## 🔧 Configuração

### 1. Configurar Variáveis de Ambiente

Execute os seguintes comandos no Supabase:

```bash
# Chave de API da AbacatePay
npx supabase secrets set ABACATE_PAY_API_KEY=sua_chave_api_aqui

# Secret do webhook (opcional)
npx supabase secrets set ABACATE_PAY_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

### 2. Deploy das Edge Functions

```bash
# Deploy das funções da AbacatePay
npx supabase functions deploy abacatepay-pix
npx supabase functions deploy abacatepay-status
npx supabase functions deploy abacatepay-webhook
npx supabase functions deploy abacatepay-simulate
```

### 3. Configurar Webhook no Dashboard da AbacatePay

1. Acesse o dashboard da AbacatePay
2. Vá em **Configurações > Webhooks**
3. Adicione a URL do webhook:
   ```
   https://epjfoteyvejoqnigijrz.functions.supabase.co/functions/v1/abacatepay-webhook
   ```
4. Configure o secret (opcional)
5. Selecione os eventos: `pix.paid`

## 🧪 Testes

### Ambiente de Desenvolvimento

A AbacatePay oferece ambiente de sandbox para testes:

- Use a chave de API de desenvolvimento
- Os pagamentos são simulados
- Use a função `pixQrCode/simulate-payment` para testar

### Teste Manual

1. Acesse `/pricing`
2. Escolha um plano pago
3. Selecione "PIX"
4. Gere o QR Code
5. Use o app PIX para pagar (ou simule no sandbox)

### Teste com Simulação (Desenvolvimento)

1. Gere um QR Code PIX
2. Clique no botão "🎮 Simular Pagamento (Dev)"
3. O pagamento será simulado automaticamente
4. A assinatura será ativada imediatamente

## 📊 Monitoramento

### Logs das Edge Functions

```bash
# Ver logs em tempo real
npx supabase functions logs abacatepay-pix --follow
npx supabase functions logs abacatepay-status --follow
npx supabase functions logs abacatepay-webhook --follow
```

### Verificar Pagamentos

```sql
-- Ver pagamentos PIX
SELECT * FROM payment_history 
WHERE payment_provider = 'abacatepay' 
ORDER BY created_at DESC;

-- Ver assinaturas ativas
SELECT * FROM user_subscriptions 
WHERE status = 'active' 
ORDER BY created_at DESC;
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha a chave de API no frontend**
2. **Use HTTPS sempre**
3. **Valide webhooks** (implementar verificação de assinatura)
4. **Monitore logs** regularmente
5. **Teste em sandbox** antes de produção

### Validação de Webhook

Para implementar validação de assinatura:

```typescript
// Em abacatepay-webhook/index.ts
const signature = req.headers.get('x-abacate-signature')
const payload = await req.text()

// Verificar assinatura
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex')

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature')
}
```

## 🚀 Produção

### Checklist

- [ ] Chave de API de produção configurada
- [ ] Webhook configurado no dashboard
- [ ] Edge Functions deployadas
- [ ] Testes realizados
- [ ] Monitoramento configurado
- [ ] Backup dos dados configurado

### URLs de Produção

- **Webhook**: `https://epjfoteyvejoqnigijrz.functions.supabase.co/functions/v1/abacatepay-webhook`
- **API**: `https://api.abacatepay.com/v1`

## 📞 Suporte

- **Documentação**: [docs.abacatepay.com](https://docs.abacatepay.com)
- **Dashboard**: [dashboard.abacatepay.com](https://dashboard.abacatepay.com)
- **Email**: suporte@abacatepay.com

## 💰 Custos

- **Taxa fixa**: R$ 0,80 por transação
- **Sem percentual** sobre o valor
- **Sem taxa mensal**
- **Sem taxa de setup**

## 🔄 Fluxo Completo

1. **Cliente escolhe PIX** no frontend
2. **Frontend chama** `abacatepay-pix`
3. **Edge Function cria** QR Code via API AbacatePay
4. **Cliente paga** via PIX
5. **AbacatePay envia webhook** para `abacatepay-webhook`
6. **Webhook ativa** assinatura do usuário
7. **Frontend verifica status** via `abacatepay-status`
8. **Cliente tem acesso** premium 
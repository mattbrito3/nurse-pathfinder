# 🧪 Guia de Configuração do Ambiente de Teste

## 📋 Visão Geral

Este guia descreve como configurar e usar o ambiente de teste para o DoseCerta, permitindo testar a integração com Mercado Pago em um ambiente de pré-produção.

## 🌿 Branch de Teste

### Criar e Usar a Branch
```bash
# Criar branch de teste
git checkout -b test

# Fazer alterações e commitar
git add .
git commit -m "feat: configuração ambiente de teste"

# Fazer push da branch
git push origin test
```

## 🔧 Configuração de Ambiente

### 1. Variáveis de Ambiente (.env.test)
O arquivo `.env.test` contém todas as configurações necessárias para o ambiente de teste:

```env
# Ambiente de Teste - DoseCerta
VITE_ENVIRONMENT=test
VITE_APP_URL=https://teste.dosecerta.online
VITE_APP_NAME=Dose Certa (Teste)

# MercadoPago Configuration (Produção)
VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-8244676714734530-080414-5c3f084aff9b293fac876acd202da87b-2606458554
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-af57363f-f482-4787-baa4-0a3059c3607b
```

### 2. Build para Teste
```bash
# Build específico para teste
npm run build:test

# Ou usar o arquivo .env.test
cp .env.test .env
npm run build
```

## 🌐 Configuração do Subdomínio

### 1. DNS
Configure o subdomínio `teste.dosecerta.online` para apontar para o servidor de teste.

### 2. Webhook do Mercado Pago
Configure o webhook no Mercado Pago para apontar para:
```
https://teste.dosecerta.online/api/mercadopago-webhook
```

### 3. URLs de Retorno
As URLs de retorno do Mercado Pago serão:
- **Sucesso:** `https://teste.dosecerta.online/pricing?payment=success`
- **Falha:** `https://teste.dosecerta.online/pricing?payment=failure`
- **Pendente:** `https://teste.dosecerta.online/pricing?payment=pending`

## 🚀 Deploy

### 1. Build
```bash
npm run build:test
```

### 2. Deploy para Servidor de Teste
Faça upload dos arquivos da pasta `dist/` para o servidor de teste.

### 3. Configuração do Servidor
- Configure o servidor web (nginx/apache) para servir os arquivos estáticos
- Configure HTTPS com certificado SSL
- Configure redirecionamento para `index.html` para SPA

## 🧪 Testando

### 1. Funcionalidades a Testar
- [ ] Login/Registro de usuários
- [ ] Navegação entre páginas
- [ ] Cálculo de medicamentos
- [ ] Flashcards
- [ ] Glossário médico
- [ ] **Pagamentos com Mercado Pago**
- [ ] Webhooks de pagamento
- [ ] Atualização de assinaturas

### 2. Teste de Pagamento
1. Acesse `https://teste.dosecerta.online/pricing`
2. Faça login com uma conta de teste
3. Clique em "Assinar Plano"
4. Complete o pagamento no Mercado Pago
5. Verifique se foi redirecionado corretamente
6. Verifique se a assinatura foi criada no banco

### 3. Teste de Webhook
1. Faça um pagamento de teste
2. Verifique os logs do webhook:
   ```bash
   npx supabase functions logs mercadopago-webhook --project-ref epjfoteyvejoqnigijrz
   ```
3. Verifique se os dados foram salvos no banco

## 🔍 Monitoramento

### 1. Logs do Frontend
- Console do navegador para erros JavaScript
- Network tab para requisições HTTP

### 2. Logs do Backend
- Logs do Supabase Edge Functions
- Logs do servidor web

### 3. Banco de Dados
- Verificar tabelas `payment_history` e `user_subscriptions`
- Monitorar criação de registros

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro 400 no Mercado Pago
- Verificar formato dos dados enviados
- Verificar URLs de retorno
- Verificar token de acesso

#### 2. Webhook não recebido
- Verificar URL do webhook no Mercado Pago
- Verificar logs do Edge Function
- Verificar conectividade de rede

#### 3. Redirecionamento não funciona
- Verificar URLs de retorno
- Verificar configuração do servidor
- Verificar certificado SSL

## 📊 Métricas de Teste

### 1. Performance
- Tempo de carregamento das páginas
- Tempo de resposta das APIs
- Tempo de processamento de pagamentos

### 2. Funcionalidade
- Taxa de sucesso de pagamentos
- Taxa de sucesso de webhooks
- Taxa de erro de usuário

### 3. Segurança
- Validação de dados
- Autenticação de usuários
- Proteção contra CSRF

## 🔄 Atualizações

### 1. Deploy de Novas Versões
```bash
# Fazer alterações na branch test
git add .
git commit -m "feat: nova funcionalidade"
git push origin test

# Build e deploy
npm run build:test
# Upload para servidor
```

### 2. Rollback
Em caso de problemas:
1. Reverter para commit anterior
2. Fazer novo build
3. Fazer deploy

## 📞 Suporte

Para problemas específicos do ambiente de teste:
1. Verificar logs
2. Reproduzir o problema
3. Documentar passos para reprodução
4. Abrir issue no repositório

---

**Nota:** Este ambiente de teste usa as mesmas credenciais de produção do Mercado Pago, mas em um subdomínio separado para isolamento. 
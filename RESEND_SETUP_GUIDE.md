# 🚀 Guia Completo de Configuração do Resend

## 📋 Problema Identificado
Os emails de verificação não estão sendo entregues, mesmo com o sistema reportando envio bem-sucedido.

## 🔧 Solução Implementada

### 1. **Edge Function Corrigida**
- ✅ Removida simulação de envio
- ✅ Implementado envio real via Resend API
- ✅ Melhor tratamento de erros
- ✅ Logs detalhados para debugging

### 2. **Ferramenta de Debug**
- ✅ Componente `EmailDebugPanel` para diagnóstico
- ✅ Teste de conectividade com Edge Function
- ✅ Análise de tempo de resposta
- ✅ Informações detalhadas de erro

## 🛠️ Configuração do Resend

### Passo 1: Criar Conta no Resend
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu email

### Passo 2: Obter API Key
1. No dashboard do Resend, vá em "API Keys"
2. Clique em "Create API Key"
3. Copie a chave (formato: `re_xxxxxxxxxx`)

### Passo 3: Configurar no Supabase
1. Acesse o dashboard do Supabase
2. Vá em "Settings" > "Edge Functions"
3. Adicione a variável de ambiente:
   ```
   NEW_API_KEY_RESEND=re_sua_chave_aqui
   ```

### Passo 4: Verificar Domínio (Opcional)
Para melhor deliverability:
1. No Resend, vá em "Domains"
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções

## 🧪 Testando a Configuração

### Usando a Ferramenta de Debug
1. Acesse a página de verificação de email
2. Clique em "Debug Email"
3. Execute o teste de debug
4. Verifique os resultados

### Verificando Logs
1. No Supabase Dashboard > Edge Functions
2. Clique na função `send-verification-email`
3. Vá em "Logs" para ver detalhes

## 🔍 Diagnóstico de Problemas

### Problema: "NEW_API_KEY_RESEND não configurada"
**Solução:**
- Verifique se a variável está configurada no Supabase
- Confirme se o nome está correto: `NEW_API_KEY_RESEND`

### Problema: "Erro Resend: 401 - Unauthorized"
**Solução:**
- Verifique se a API key está correta
- Confirme se a conta do Resend está ativa

### Problema: "Erro Resend: 400 - Bad Request"
**Solução:**
- Verifique se o email de destino é válido
- Confirme se o formato do email está correto

### Problema: Emails não chegam na caixa de entrada
**Soluções:**
1. **Verificar Spam/Lixo Eletrônico**
2. **Configurar domínio verificado no Resend**
3. **Usar email de teste confiável (Gmail, Outlook)**
4. **Verificar logs de entrega no Resend Dashboard**

## 📊 Monitoramento

### Métricas Importantes
- **Taxa de entrega**: Deve ser > 95%
- **Taxa de abertura**: Indica se emails chegam
- **Tempo de resposta**: Deve ser < 5 segundos

### Ferramentas de Monitoramento
1. **Resend Dashboard**: Métricas de entrega
2. **Supabase Logs**: Logs da Edge Function
3. **EmailDebugPanel**: Debug em tempo real

## 🚨 Troubleshooting Avançado

### Se emails ainda não chegam:

1. **Teste com email diferente**
   ```bash
   # Use um email Gmail ou Outlook para teste
   teste@gmail.com
   ```

2. **Verifique configurações de DNS**
   - SPF records
   - DKIM records
   - DMARC records

3. **Teste manual da API**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_sua_chave" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "dosecertasmtp <team@dosecerta.online>",
       "to": "usuario@exemplo.com",
       "subject": "Teste de Email",
       "html": "<h1>Teste</h1>"
     }'
   ```

4. **Verificar limites da conta**
   - Conta gratuita: 100 emails/dia
   - Verificar se não excedeu o limite

## 📝 Checklist de Configuração

- [ ] Conta Resend criada
- [ ] API Key obtida
- [ ] Variável `NEW_API_KEY_RESEND` configurada no Supabase
- [ ] Edge Function atualizada
- [ ] Teste de debug executado
- [ ] Email de teste recebido
- [ ] Logs verificados
- [ ] Domínio verificado (opcional)

## 🔄 Próximos Passos

1. **Implementar monitoramento automático**
2. **Configurar webhooks para tracking**
3. **Implementar retry automático**
4. **Adicionar métricas de deliverability**

## 📞 Suporte

Se ainda houver problemas:
1. Execute o debug panel
2. Copie as informações de debug
3. Verifique os logs do Supabase
4. Consulte a documentação do Resend

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0 
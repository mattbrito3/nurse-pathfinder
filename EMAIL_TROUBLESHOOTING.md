# 🔧 Troubleshooting de Email - Dose Certa

Este guia documenta a resolução de problemas comuns de email na aplicação Dose Certa.

## ✅ Problema Resolvido: Emails não chegavam na caixa de entrada

### **Sintomas:**
- Sistema reportava "email enviado com sucesso"
- Email não aparecia na caixa de entrada
- Email não aparecia na pasta de spam
- Logs mostravam "modo simulado"

### **Causa Raiz:**
1. **Domínio inválido**: Edge Function usava `noreply@resend.dev` (não verificado)
2. **Configuração inconsistente**: Diferentes serviços usavam domínios diferentes
3. **Fallback para simulação**: Sistema caía em modo simulado quando Resend falhava

### **Solução Aplicada:**
1. **Padronização de domínio**: Todos os serviços agora usam `team@dosecerta.online`
2. **Verificação no Resend**: Domínio `dosecerta.online` verificado e configurado
3. **API Key atualizada**: Nova chave `re_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z`
4. **Nomenclatura corrigida**: `RESEND_API_KEY` → `NEW_API_KEY_RESEND`

### **Arquivos Modificados:**
- `supabase/functions/send-verification-email/index.ts`
- `RESEND_SETUP_GUIDE.md`
- `CHANGELOG.md`
- `README.md`

## 🚨 Problemas Comuns e Soluções

### **1. Email não chega na caixa de entrada**

**Verificar:**
- ✅ Domínio verificado no Resend
- ✅ API Key configurada no Supabase
- ✅ Logs da Edge Function
- ✅ **Pasta de spam/lixo eletrônico** (muito comum!)
- ✅ Filtros de email configurados

**Solução:**
```bash
# Verificar logs
supabase functions logs send-verification-email

# Deploy da função
supabase functions deploy send-verification-email
```

**💡 Dica:** Emails de verificação frequentemente vão para spam na primeira vez. Sempre oriente o usuário a verificar a pasta de spam/lixo eletrônico.

### **2. Erro "Unauthorized" no Resend**

**Causa:** API Key inválida ou expirada

**Solução:**
1. Gerar nova API Key no Resend
2. Atualizar no Supabase: `NEW_API_KEY_RESEND`
3. Deploy da Edge Function

### **3. Erro "Domain not verified"**

**Causa:** Domínio não verificado no Resend

**Solução:**
1. Adicionar domínio no Resend Dashboard
2. Configurar registros DNS
3. Aguardar verificação (pode levar 24h)

### **4. Logs mostram "modo simulado"**

**Causa:** Sistema caindo no fallback SMTP

**Solução:**
1. Verificar se `NEW_API_KEY_RESEND` está configurada
2. Confirmar que Resend está funcionando
3. Verificar logs de erro do Resend

## 🔍 Ferramentas de Debug

### **EmailDebugPanel**
Componente React para testar envio de emails em tempo real.

### **Logs da Edge Function**
```bash
supabase functions logs send-verification-email --follow
```

### **Teste Manual da API**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_sua_chave_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "dosecertasmtp <team@dosecerta.online>",
    "to": "teste@email.com",
    "subject": "Teste",
    "html": "<p>Teste de email</p>"
  }'
```

## 📋 Checklist de Verificação

- [ ] API Key configurada no Supabase
- [ ] Domínio verificado no Resend
- [ ] Edge Function deployada
- [ ] Logs mostram sucesso
- [ ] Email chega na caixa de entrada
- [ ] Não vai para spam

## 🎯 Resultado Final

Após as correções:
- ✅ Emails chegam corretamente na caixa de entrada
- ✅ Remetente: `dosecertasmtp <team@dosecerta.online>`
- ✅ Sistema de debug implementado
- ✅ Documentação atualizada
- ✅ Logs limpos e informativos

---

**Última atualização:** Agosto 2025  
**Status:** ✅ Resolvido 
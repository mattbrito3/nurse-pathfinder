# 📧 Guia Completo: Configurar Gmail SMTP para Envio de Email

## 🎯 **Objetivo**
Configurar o Gmail para enviar emails de verificação automaticamente através do sistema Dose Certa.

---

## 📋 **Passo 1: Preparar Conta Gmail**

### **Opção A: Criar conta dedicada (Recomendado)**
1. Acesse [gmail.com](https://gmail.com)
2. Clique em **"Criar conta"**
3. Escolha um nome profissional:
   - `dosecerta.sistema@gmail.com`
   - `noreply.dosecerta@gmail.com`
   - `sistema.nursepathfinder@gmail.com`

### **Opção B: Usar conta existente**
- Use seu Gmail pessoal

---

## 🔐 **Passo 2: Ativar Verificação em 2 Etapas**

### **1. Acessar Configurações de Segurança:**
1. Entre no Gmail
2. Clique na sua **foto de perfil** (canto superior direito)
3. Clique em **"Gerenciar sua Conta do Google"**
4. No menu lateral: **"Segurança"**

### **2. Ativar 2FA:**
1. Na seção **"Como você faz login no Google"**
2. Clique em **"Verificação em duas etapas"**
3. Clique em **"Começar"**
4. Digite sua senha
5. Adicione seu **número de telefone**
6. Confirme o **código SMS** recebido
7. Clique em **"Ativar"**

⚠️ **IMPORTANTE:** Sem 2FA, não é possível gerar App Passwords!

---

## 📱 **Passo 3: Gerar App Password**

### **1. Acessar App Passwords:**
1. Ainda na página **"Segurança"**
2. Na seção **"Como você faz login no Google"**
3. Clique em **"Senhas de app"**
4. Digite sua senha se solicitado

### **2. Criar Nova Senha:**
1. Clique em **"Selecionar app"** → **"Outro (nome personalizado)"**
2. Digite: **"Dose Certa - Email Verification"**
3. Clique em **"Gerar"**
4. **COPIE A SENHA DE 16 CARACTERES**
   - Exemplo: `abcd efgh ijkl mnop`
5. **GUARDE ESSA SENHA** - ela aparece só uma vez!

---

## ⚙️ **Passo 4: Configurar no Supabase**

### **1. Acessar Supabase Dashboard:**
1. Vá para [supabase.com](https://supabase.com)
2. Entre no seu projeto: `epjfoteyvejoqnigijrz`
3. Menu lateral: **"Settings"** → **"Environment Variables"**

### **2. Adicionar Variáveis de Ambiente:**

Clique em **"Add new variable"** para cada uma:

```
SMTP_HOST = smtp.gmail.com
```

```
SMTP_PORT = 587
```

```
SMTP_USER = seu-email@gmail.com
```
*(Substitua pelo email que você criou/escolheu)*

```
SMTP_PASS = abcd efgh ijkl mnop
```
*(Substitua pela senha de app de 16 caracteres)*

```
FROM_NAME = Dose Certa
```

### **3. Salvar Configurações:**
- Clique em **"Save"** após adicionar cada variável
- Aguarde alguns minutos para as variáveis ficarem ativas

---

## 🚀 **Passo 5: Deploy da Edge Function Atualizada**

### **Via Supabase Dashboard:**
1. Acesse **"Edge Functions"** no menu lateral
2. Clique na função **"send-verification-email"**
3. Clique em **"Deploy"**
4. Aguarde o deploy finalizar

### **Via CLI (Alternativo):**
```bash
supabase functions deploy send-verification-email
```

---

## 🧪 **Passo 6: Testar o Sistema**

### **1. Teste Frontend:**
1. Acesse sua aplicação local: `http://localhost:8080`
2. Vá para a página de cadastro
3. Digite um email válido
4. Clique em **"Criar Conta"**

### **2. Verificar Logs:**
1. Abra o **Console do Browser** (F12)
2. Procure por mensagens como:
   - `📧 Enviando email para...`
   - `✅ Email enviado com sucesso`

### **3. Verificar Email:**
1. Acesse a caixa de entrada do email de teste
2. Procure por email de **"Dose Certa"**
3. Clique no link de verificação

---

## 🐛 **Solução de Problemas**

### **Erro: "SMTP credentials not configured"**
- **Causa:** Variáveis de ambiente não configuradas
- **Solução:** Verificar se todas as 5 variáveis estão no Supabase

### **Erro: "Authentication failed"**
- **Causa:** Senha de app incorreta ou 2FA não ativado
- **Solução:** Gerar nova senha de app com 2FA ativo

### **Email não chegou**
- **Verificar:** Pasta de spam/lixo eletrônico
- **Aguardar:** Pode demorar alguns minutos
- **Logs:** Verificar console para confirmação de envio

### **Função retorna erro 500**
- **Verificar:** Se a Edge Function foi deployed
- **Logs:** Verificar logs da Edge Function no Supabase Dashboard

---

## 📧 **Exemplo de Email que Será Enviado**

O usuário receberá um email bonito com:
- ✅ Botão de confirmação destacado
- 🔐 Informações da verificação
- ⚠️ Avisos importantes sobre validade
- 🏥 Design profissional do Dose Certa

---

## 🔒 **Segurança**

### **Boas Práticas:**
- ✅ Use conta Gmail dedicada
- ✅ Mantenha App Password segura
- ✅ Não compartilhe credenciais SMTP
- ✅ Monitor logs de envio

### **Limitações do Gmail:**
- **500 emails/dia** para contas gratuitas
- **Limite de 100 destinatários** por email
- **Ideal para:** Aplicações pequenas/médias

---

## 🚀 **Próximos Passos**

Após configurar o Gmail SMTP:

1. **Teste completo** do fluxo de verificação
2. **Monitor logs** por alguns dias
3. **Considere migrar** para Resend/SendGrid quando crescer
4. **Backup** das credenciais em local seguro

---

## ❓ **Dúvidas Frequentes**

**P: Posso usar Outlook/Hotmail?**
R: Sim! Apenas mude o SMTP_HOST para `smtp.live.com`

**P: Quantos emails posso enviar?**
R: Gmail gratuito: 500/dia. Gmail Workspace: 2000/dia

**P: E se der erro?**
R: O sistema tem fallback - mostra o link no console para desenvolvimento

**P: É seguro?**
R: Sim! App Passwords são mais seguras que senha normal

---

🎉 **Pronto! Seu sistema de email está configurado e funcionando!**

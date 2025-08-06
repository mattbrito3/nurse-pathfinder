# Configuração de Email no Supabase - Produção

## Problema
Emails de verificação não estão sendo enviados em produção.

## Solução

### 1. Configurar SMTP no Supabase Dashboard

1. **Acesse:** https://supabase.com/dashboard/project/epjfoteyvejoqnigijrz
2. **Vá para:** Settings → Authentication → SMTP Settings
3. **Configure:**

#### Opção A: Usar Gmail SMTP
```
Host: smtp.gmail.com
Port: 587
Username: seu-email@gmail.com
Password: [App Password do Gmail]
Encryption: STARTTLS
```

#### Opção B: Usar Resend (Recomendado)
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: [API Key do Resend]
Encryption: STARTTLS
```

### 2. Configurar Email Templates

1. **Vá para:** Settings → Authentication → Email Templates
2. **Configure os templates:**
   - Confirm signup
   - Magic Link
   - Change email address
   - Reset password

### 3. Verificar URL Configuration

1. **Vá para:** Settings → Authentication → URL Configuration
2. **Configure:**
   - Site URL: `https://seu-dominio.com`
   - Redirect URLs: `https://seu-dominio.com/auth/callback`

### 4. Testar Configuração

1. **Vá para:** Authentication → Users
2. **Crie um usuário de teste**
3. **Verifique se o email é enviado**

## Troubleshooting

### Se emails não chegam:
1. **Verifique spam/junk**
2. **Teste com email diferente**
3. **Verifique logs do Supabase**
4. **Confirme configuração SMTP**

### Logs úteis:
```bash
# Ver logs de autenticação
npx supabase logs auth

# Ver logs de Edge Functions
npx supabase functions logs
```

## Configuração Rápida com Gmail

1. **Ative 2FA no Gmail**
2. **Gere App Password**
3. **Configure no Supabase:**
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `seu-email@gmail.com`
   - Password: `[App Password]`
   - Encryption: `STARTTLS`

## Configuração com Resend (Alternativa)

1. **Crie conta em:** https://resend.com
2. **Obtenha API Key**
3. **Configure no Supabase:**
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: `[API Key]`
   - Encryption: `STARTTLS` 

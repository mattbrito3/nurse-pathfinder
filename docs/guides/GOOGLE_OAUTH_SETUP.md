# 🔐 Google OAuth - Configuração para Desenvolvimento

## 🎯 **AMBIENTE: Desenvolvimento (localhost:8080)**

---

## 📋 **PASSO 1: Google Cloud Console**

### **🔧 Configurar credenciais OAuth:**

1. **Acesse:** https://console.cloud.google.com/
2. **Projeto:** Dose Certa App
3. **Menu:** APIs & Services → Credentials
4. **Edite:** Suas credenciais OAuth existentes

### **🌐 Authorized JavaScript origins:**
```
http://localhost:8080          ← para desenvolvimento
```

### **🔄 Authorized redirect URIs:**
```
https://epjfoteyvejoqnigijrz.supabase.co/auth/v1/callback
```

---

## 📱 **PASSO 2: Supabase Auth Settings**

### **🔧 Configurar Google Provider:**

1. **Acesse:** https://supabase.com/dashboard/project/epjfoteyvejoqnigiz
2. **Menu:** Authentication → Providers
3. **Google:** Ativar e configurar
4. **Client ID:** `208387014770-tnq4sfoojstom3ejle4bvvr50h3l75du.apps.googleusercontent.com`
5. **Client Secret:** (obtido do Google Cloud Console)

### **🔧 Atualizar URLs de autenticação:**

1. **Menu:** Authentication → URL Configuration
2. **Site URL:** `http://localhost:8080`
3. **Redirect URLs:** `http://localhost:8080/**`

---

## 🗄️ **PASSO 3: Executar Migração**

### **🔧 Aplicar migração do banco:**

Execute a migração no Supabase Dashboard > SQL Editor:

```sql
-- Arquivo: 20250130000004_add_google_auth_fields.sql
-- Adicionar campos para Google OAuth na tabela user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS auth_providers TEXT[] DEFAULT ARRAY['email'];

-- Criar índice para google_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON user_profiles(google_id);

-- Adicionar constraint para garantir que auth_providers não seja null
ALTER TABLE user_profiles 
ALTER COLUMN auth_providers SET NOT NULL;

-- Adicionar constraint para garantir que auth_providers tenha pelo menos um valor
ALTER TABLE user_profiles 
ADD CONSTRAINT check_auth_providers_not_empty 
CHECK (array_length(auth_providers, 1) > 0);
```

---

## 🧪 **PASSO 4: Testar**

### **✅ Funcionalidades implementadas:**

1. **Botão "Entrar com Google"** nas abas de login e cadastro
2. **Vinculação de contas** quando email já existe
3. **Setup de perfil** para novos usuários Google
4. **Login automático** para contas já vinculadas
5. **Validação de senha** para vincular contas existentes

### **🔄 Fluxos de teste:**

1. **Novo usuário Google:**
   - Clicar "Entrar com Google"
   - Autorizar no Google
   - Configurar nome no modal
   - Login automático

2. **Usuário existente (email/senha):**
   - Clicar "Entrar com Google"
   - Modal de vinculação aparece
   - Digitar senha atual
   - Contas vinculadas

3. **Usuário Google já vinculado:**
   - Clicar "Entrar com Google"
   - Login direto

---

## 🎯 **RESULTADO:**

- ✅ **Google OAuth:** Funcionando em desenvolvimento
- ✅ **Vinculação de contas:** Implementada
- ✅ **Setup de perfil:** Implementado
- ✅ **UX/UI:** Consistente com design atual
- ✅ **Segurança:** Validação de senha para vinculação

---

**🚀 Próximos passos para produção:**
1. Adicionar domínio de produção no Google Cloud Console
2. Atualizar URLs no Supabase
3. Configurar domínio no Resend
4. Deploy da aplicação

---

**📝 Notas importantes:**
- O Google Client ID já está configurado no código
- A migração adiciona os campos necessários no banco
- O sistema detecta automaticamente o tipo de login
- Modais aparecem conforme necessário
- Usuários podem editar nome após primeiro login 

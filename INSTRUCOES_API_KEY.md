# 🔑 COMO ATUALIZAR SUA API KEY

## 📝 PASSOS APÓS CRIAR A API KEY NO RESEND:

### 1. 📋 COPIE SUA API KEY
Depois de criar no Resend, você receberá algo como:
```
re_ABC123xyz789...
```

### 2. ✏️ SUBSTITUA NO CÓDIGO
Abra o arquivo: `src/services/resendEmailService.ts`

Encontre esta linha:
```javascript
const RESEND_API_KEY = 're_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z'; // MUDE AQUI
```

Substitua pela SUA API key:
```javascript
const RESEND_API_KEY = 're_SUA_API_KEY_AQUI'; // Sua nova key
```

### 3. 💾 SALVE O ARQUIVO
- Ctrl+S para salvar
- O sistema automaticamente detectará a mudança

### 4. 🧪 TESTE
- Recarregue a página (F5)
- Teste o cadastro com seu email
- Email deve chegar em segundos!

## 🎯 EXEMPLO COMPLETO:
```javascript
// ANTES:
const RESEND_API_KEY = 're_3hMvo4A6_2EY5MKCR1U713FYZQj8oeg3Z';

// DEPOIS (com sua key):
const RESEND_API_KEY = 're_Ft7B2nM9XpQ8yZ1aK5wL3vR6jH4tN2cE';
```

## ✅ PRONTO!
Depois disso, os emails chegam na caixa de entrada REAL!
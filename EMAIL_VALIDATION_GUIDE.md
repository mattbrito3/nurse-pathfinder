# 📧 Guia de Validação de Email Duplicado

Este documento descreve a implementação do sistema de validação de email duplicado no **Dose Certa**.

## 🎯 Objetivo

Prevenir cadastros duplicados de usuários com o mesmo email, melhorando a experiência do usuário e a segurança do sistema.

## 🏗️ Arquitetura da Solução

### **Camadas de Validação**

1. **Frontend (React)**
   - Validação em tempo real
   - Feedback visual imediato
   - Debounce para otimização

2. **Backend (Edge Function)**
   - Verificação segura no banco
   - Rate limiting
   - Resposta genérica para segurança

3. **Database (PostgreSQL)**
   - Tabela de rate limiting
   - Verificação em `auth.users`

## 📁 Arquivos Implementados

### **Edge Function**
```
supabase/functions/check-email-exists/index.ts
```
- API para verificação de email
- Rate limiting (10 tentativas/hora)
- Resposta segura (não revela existência)

### **Migração do Banco**
```
supabase/migrations/20250130000003_create_rate_limits.sql
```
- Tabela `rate_limits` para controle de abuso
- Políticas RLS para segurança
- Função de limpeza automática

### **Hook Customizado**
```
src/hooks/useEmailValidation.tsx
```
- Validação em tempo real
- Debounce configurável
- Integração com Edge Function

### **Componente de Teste**
```
src/components/auth/EmailValidationTest.tsx
```
- Testes automatizados
- Validação de cenários
- Debug da funcionalidade

## 🚀 Como Usar

### **1. Deploy da Edge Function**

```bash
# Deploy da função
npx supabase functions deploy check-email-exists

# Executar migração
npx supabase db push

# Ou usar o script automatizado
chmod +x deploy-email-validation.sh
./deploy-email-validation.sh
```

### **2. Configuração no Frontend**

```typescript
import { useEmailValidation } from '@/hooks/useEmailValidation';

const MyComponent = () => {
  const [email, setEmail] = useState('');
  
  const emailValidation = useEmailValidation(email, {
    debounceMs: 800,
    enableRealTime: true
  });

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={emailValidation.isAvailable === false ? 'border-red-500' : ''}
      />
      {emailValidation.message && (
        <p className={emailValidation.isAvailable === false ? 'text-red-600' : 'text-green-600'}>
          {emailValidation.message}
        </p>
      )}
    </div>
  );
};
```

### **3. Validação Manual**

```typescript
const { validateEmail } = useEmailValidation('');

const handleSubmit = async () => {
  const result = await validateEmail(email);
  
  if (result.isAvailable === false) {
    // Email já existe
    setError('Este email já está cadastrado');
    return;
  }
  
  // Continuar com o cadastro
};
```

## 🔒 Segurança

### **Rate Limiting**
- **Limite**: 10 tentativas por hora por IP
- **Janela**: 1 hora
- **Limpeza**: Automática após 24 horas

### **Resposta Segura**
- **Não revela existência**: Resposta genérica para emails não encontrados
- **Rate limit**: Mensagem específica quando excedido
- **Logs**: Monitoramento de tentativas suspeitas

### **Validação em Camadas**
1. **Frontend**: Validação básica de formato
2. **Backend**: Verificação no banco de dados
3. **Database**: Constraints e políticas RLS

## 🎨 Experiência do Usuário

### **Feedback Visual**
- ✅ **Verde**: Email disponível
- ❌ **Vermelho**: Email já existe
- 🔄 **Carregando**: Verificação em andamento
- ⚠️ **Neutro**: Aguardando entrada

### **Mensagens**
- **Email disponível**: "Email disponível para cadastro."
- **Email existente**: "Este email já está em uso. Tente fazer login ou recuperar sua senha."
- **Rate limit**: "Muitas tentativas. Tente novamente em alguns minutos."

### **Ações Alternativas**
- **Botão "Fazer Login"**: Redireciona para aba de login
- **Botão "Recuperar Senha"**: Redireciona para recuperação
- **Validação automática**: Não requer ação do usuário

## 🧪 Testes

### **Componente de Teste**
```typescript
import { EmailValidationTest } from '@/components/auth/EmailValidationTest';

// Usar em página de desenvolvimento
<EmailValidationTest />
```

### **Cenários Testados**
1. ✅ Email válido e disponível
2. ❌ Email já cadastrado
3. ⚠️ Email inválido
4. 🔄 Rate limit excedido
5. 🌐 Erro de conexão

### **Testes Automatizados**
```bash
# Executar testes
npm run test:email-validation

# Verificar logs
npx supabase functions logs check-email-exists
```

## 📊 Monitoramento

### **Logs da Edge Function**
```bash
# Ver logs em tempo real
npx supabase functions logs check-email-exists --follow

# Ver logs específicos
npx supabase functions logs check-email-exists --since 1h
```

### **Métricas do Banco**
```sql
-- Verificar rate limits
SELECT * FROM rate_limits ORDER BY last_attempt DESC LIMIT 10;

-- Limpar rate limits antigos
SELECT cleanup_old_rate_limits();
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
# Supabase (já configuradas)
SUPABASE_URL=sua_url
SUPABASE_SERVICE_ROLE_KEY=sua_chave

# Rate Limiting (configurado automaticamente)
MAX_ATTEMPTS_PER_HOUR=10
RATE_LIMIT_WINDOW_MS=3600000
```

### **Personalização**
```typescript
// Ajustar debounce
const emailValidation = useEmailValidation(email, {
  debounceMs: 1000, // 1 segundo
  enableRealTime: true
});

// Desabilitar validação em tempo real
const emailValidation = useEmailValidation(email, {
  enableRealTime: false
});
```

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **1. Edge Function não responde**
```bash
# Verificar status
npx supabase functions list

# Redeploy
npx supabase functions deploy check-email-exists
```

#### **2. Rate limit muito restritivo**
```sql
-- Ajustar limite (executar no SQL Editor)
UPDATE rate_limits SET attempts = 0 WHERE key LIKE 'email_check:%';
```

#### **3. Validação não funciona**
```typescript
// Verificar logs no console
console.log('Email validation:', emailValidation);

// Testar manualmente
const result = await validateEmail('test@example.com');
console.log('Manual validation:', result);
```

### **Debug**
```typescript
// Habilitar logs detalhados
const emailValidation = useEmailValidation(email, {
  debug: true // Adicionar opção de debug
});
```

## 📈 Próximas Melhorias

### **Funcionalidades Planejadas**
1. **Sugestões de email**: Corrigir erros de digitação
2. **Validação de domínio**: Verificar se domínio existe
3. **Cache local**: Reduzir chamadas à API
4. **Métricas avançadas**: Dashboard de uso

### **Otimizações**
1. **Connection pooling**: Melhorar performance
2. **Cache Redis**: Reduzir latência
3. **CDN**: Distribuir globalmente
4. **Webhooks**: Notificações em tempo real

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: matheusbrito.oo@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/nurse-pathfinder/issues)
- 📚 Docs: [Documentação Supabase](https://supabase.com/docs)

---

**✅ Sistema implementado e funcionando!** 
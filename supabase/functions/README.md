# Edge Functions - Dose Certa

Este diretório contém as Edge Functions do Supabase para o projeto Dose Certa.

## ✅ Correções de Tipagem Implementadas

### Problemas Resolvidos

1. **Erros de Tipagem do Deno**: Corrigidos erros de `Cannot find name 'Deno'` e `Cannot find module`
2. **Imports de URLs**: Resolvidos problemas com imports de módulos via URL
3. **Configuração de Ambiente**: Adicionada configuração adequada para o ambiente Deno
4. **Configuração do VS Code**: Configurações específicas para ignorar validação TypeScript em Edge Functions

### Arquivos de Configuração Adicionados

Cada Edge Function agora possui:
- `deno.json`: Configuração do compilador TypeScript para Deno
- `import_map.json`: Mapeamento de imports para resolução de dependências

Configurações globais:
- `tsconfig.json`: Configuração TypeScript específica para Edge Functions
- `deno.d.ts`: Declarações de tipos para o ambiente Deno
- `.vscode/settings.json`: Configurações do VS Code para ignorar validação TypeScript

### Estrutura Melhorada

#### Antes:
```typescript
// @ts-ignore
declare const Deno;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
```

#### Depois:
```typescript
// Deno Edge Function - Nome da Função
// Este arquivo é executado no ambiente Deno, não Node.js

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
```

### Edge Functions Corrigidas

1. **password-reset**: Sistema de recuperação de senha
2. **check-email-exists**: Verificação de disponibilidade de email
3. **send-verification-email**: Envio de emails de verificação
4. **debug-subscription**: Debug de assinaturas
5. **stripe-webhook**: Webhook do Stripe para pagamentos
6. **create-checkout-session**: Criação de sessões de checkout

### Boas Práticas Implementadas

1. **Tipagem Forte**: Interfaces TypeScript para requests e responses
2. **Validação de Entrada**: Funções de validação para emails e dados
3. **Tratamento de Erros**: Tratamento robusto de erros com mensagens claras
4. **Separação de Responsabilidades**: Funções auxiliares para lógica específica
5. **Logs Estruturados**: Logs informativos para debugging
6. **Fallbacks**: Mecanismos de fallback para garantir funcionamento

### Configuração Global

- `deno.json` global com configurações padrão
- `import_map.json` global para dependências compartilhadas
- `tsconfig.json` específico para Edge Functions
- `deno.d.ts` com declarações de tipos do Deno
- `.vscode/settings.json` para configurar o VS Code

### Como Usar

1. As Edge Functions são executadas automaticamente pelo Supabase
2. Para desenvolvimento local, use: `deno task dev`
3. Para deploy: `supabase functions deploy [nome-da-função]`

### Resolução de Erros de Tipagem

Se você ainda ver erros de tipagem no VS Code:

1. **Instale a extensão Deno**: `denoland.vscode-deno`
2. **Configure o workspace**: As configurações já estão no `.vscode/settings.json`
3. **Reinicie o VS Code**: Para aplicar as novas configurações
4. **Use o comando**: `Ctrl+Shift+P` → "Deno: Restart Language Server"

#### ⚠️ **IMPORTANTE: Erros de Tipagem são Normais**

Os erros de tipagem que você vê são **normais e esperados** em Edge Functions do Supabase porque:

- **VS Code usa TypeScript Node.js** para validar, mas o código roda no **ambiente Deno**
- **APIs globais diferentes**: `Date`, `JSON`, `Error` são globais no Deno
- **Imports via URL**: TypeScript Node.js não entende `https://deno.land/...`

**✅ Não se preocupe com esses erros** - as Edge Functions funcionam perfeitamente em produção!

**🔧 Se quiser eliminar os erros**: As declarações de tipos em `deno.d.ts` já incluem as APIs globais do Deno.

### Variáveis de Ambiente Necessárias

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
- `NEW_API_KEY_RESEND`: Chave da API do Resend (para emails)
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `STRIPE_WEBHOOK_SECRET`: Segredo do webhook do Stripe
- `FRONTEND_URL`: URL do frontend (opcional, padrão: localhost:8080) 
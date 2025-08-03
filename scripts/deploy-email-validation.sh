#!/bin/bash

echo "🚀 Deployando Edge Function de Validação de Email..."

# Deploy da Edge Function
echo "📦 Deployando check-email-exists..."
npx supabase functions deploy check-email-exists

# Verificar se o deploy foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployada com sucesso!"
else
    echo "❌ Erro no deploy da Edge Function"
    exit 1
fi

# Executar migração para rate limiting
echo "🗄️ Executando migração de rate limiting..."
npx supabase db push

echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Teste a validação de email na aplicação"
echo "2. Verifique os logs da Edge Function se necessário"
echo "3. Monitore o rate limiting no banco de dados" 
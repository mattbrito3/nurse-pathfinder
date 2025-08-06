#!/bin/bash

# 🔒 DEPLOY RESET PASSWORD FUNCTIONS
# Script para fazer deploy das edge functions de reset de senha

echo "🚀 Iniciando deploy das edge functions de reset de senha..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Não está logado no Supabase. Execute: supabase login"
    exit 1
fi

echo "📦 Fazendo deploy da edge function password-reset..."
supabase functions deploy password-reset

if [ $? -eq 0 ]; then
    echo "✅ password-reset deployada com sucesso!"
else
    echo "❌ Erro ao fazer deploy de password-reset"
    exit 1
fi

echo "📦 Fazendo deploy da edge function verify-reset-token..."
supabase functions deploy verify-reset-token

if [ $? -eq 0 ]; then
    echo "✅ verify-reset-token deployada com sucesso!"
else
    echo "❌ Erro ao fazer deploy de verify-reset-token"
    exit 1
fi

echo "🗄️ Aplicando migração do banco de dados..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migração aplicada com sucesso!"
else
    echo "❌ Erro ao aplicar migração"
    exit 1
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Resumo do que foi deployado:"
echo "   ✅ Edge function: password-reset"
echo "   ✅ Edge function: verify-reset-token"
echo "   ✅ Tabela: password_reset_tokens"
echo "   ✅ Funções: create_password_reset_token, validate_reset_token, mark_reset_token_used"
echo ""
echo "🔗 URLs das edge functions:"
echo "   📧 password-reset: https://epjfoteyvejoqnigijrz.supabase.co/functions/v1/password-reset"
echo "   🔍 verify-reset-token: https://epjfoteyvejoqnigijrz.supabase.co/functions/v1/verify-reset-token"
echo ""
echo "🧪 Para testar:"
echo "   1. Acesse a página de login"
echo "   2. Clique em 'Esqueci minha senha'"
echo "   3. Digite um email válido"
echo "   4. Verifique o email recebido"
echo "   5. Clique no link de reset"
echo "   6. Digite a nova senha"
echo "" 
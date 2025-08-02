# 📁 Scripts SQL Organizados

Esta pasta contém scripts SQL organizados por categoria para facilitar a manutenção e debug do banco de dados.

## 📂 Estrutura

```
supabase/scripts/
├── debug/           # Scripts de debug e inspeção
├── fixes/           # Scripts de correção de problemas
├── maintenance/     # Scripts de manutenção rotineira
└── README.md        # Esta documentação
```

## 🔍 Debug (`/debug`)

Scripts para inspeção e diagnóstico do banco de dados:

- `check_profiles_rls.sql` - Verificar políticas RLS da tabela profiles

## 🔧 Fixes (`/fixes`)

Scripts de correção para problemas específicos:

- `fix_timestamp_overflow.sql` - Correção de overflow de timestamp no sistema de flashcards

## 🛠️ Maintenance (`/maintenance`)

Scripts para manutenção rotineira do banco de dados:

- (Scripts futuros de limpeza, otimização, etc.)

## 📋 Migrações Oficiais

As migrações oficiais estão em `supabase/migrations/` e devem ser executadas em ordem cronológica:

1. `20250122000001_create_medical_glossary.sql`
2. `20250122000002_insert_initial_glossary_data.sql`
3. `20250123000001_create_flashcards_system.sql`
4. `20250126200000_create_user_profiles.sql`
5. `20250130000004_add_google_auth_fields.sql`

## 🚀 Como Usar

### Executar Script de Debug:
```sql
-- No Supabase SQL Editor
\i supabase/scripts/debug/check_profiles_rls.sql
```

### Executar Correção:
```sql
-- No Supabase SQL Editor
\i supabase/scripts/fixes/fix_timestamp_overflow.sql
```

## ⚠️ Importante

- **Sempre faça backup** antes de executar scripts de correção
- **Teste em ambiente de desenvolvimento** antes de aplicar em produção
- **Documente** qualquer script novo que for adicionado
- **Mantenha** as migrações oficiais em `supabase/migrations/`

## 📝 Convenções

- **Nomes de arquivos**: `snake_case.sql`
- **Comentários**: Usar `--` para comentários de linha única
- **Documentação**: Incluir cabeçalho com descrição e instruções
- **Versionamento**: Incluir data e versão no cabeçalho do script 
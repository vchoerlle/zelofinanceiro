# Alterações no Banco de Dados - Status de Despesas

## Resumo das Alterações

Este documento descreve as alterações necessárias no banco de dados Supabase para implementar o sistema de status nas despesas.

## 1. Migração SQL Necessária

Execute o arquivo `supabase/migrations/add_status_to_despesas.sql` no seu banco de dados Supabase.

### Comandos para Executar:

```sql
-- Conectar ao Supabase via SQL Editor ou CLI
-- Executar o conteúdo do arquivo add_status_to_despesas.sql
```

## 2. Alterações na Tabela `despesas`

### Nova Coluna Adicionada:
- **`status`**: VARCHAR(20) DEFAULT 'pendente'
- **Constraints**: CHECK (status IN ('pago', 'pendente', 'atraso'))

### Índices Criados:
- **`idx_despesas_status`**: Para otimizar consultas por status

### Valores Possíveis:
- `'pendente'`: Despesa ainda não foi paga
- `'pago'`: Despesa foi paga
- `'atraso'`: Despesa venceu e não foi paga

## 3. Funções e Triggers Criados

### Função `update_despesa_status()`
- Atualiza automaticamente o status baseado na data
- Se data < hoje → status = 'atraso'
- Se data >= hoje → status = 'pendente'

### Trigger `update_despesa_status_trigger`
- Executa automaticamente quando a data de uma despesa é alterada
- Mantém o status sempre atualizado

### Função `update_vencidas_despesas()`
- Marca despesas vencidas como 'atraso'
- Pode ser executada diariamente via cron job

## 4. Atualização de Dados Existentes

A migração automaticamente:
- Adiciona o campo `status` com valor padrão 'pendente'
- Atualiza despesas existentes baseado na data:
  - Despesas com data anterior a hoje → status = 'atraso'
  - Despesas com data hoje ou futura → status = 'pendente'

## 5. Como Executar

### Via Supabase Dashboard:
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `add_status_to_despesas.sql`
4. Execute a query

### Via Supabase CLI:
```bash
supabase db push
```

## 6. Verificação

Após executar a migração, verifique se:

1. A coluna `status` foi adicionada à tabela `despesas`
2. Os dados existentes foram atualizados corretamente
3. As funções e triggers foram criados
4. O índice foi criado

### Query de Verificação:
```sql
-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'despesas' AND column_name = 'status';

-- Verificar dados existentes
SELECT status, COUNT(*) 
FROM despesas 
GROUP BY status;

-- Verificar funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%despesa%';
```

## 7. Impacto nas Aplicações

### Frontend:
- Todas as despesas agora incluem o campo `status`
- Interface foi atualizada para exibir e permitir alteração do status
- Filtros por status foram adicionados

### Backend:
- APIs de criação de despesas devem incluir o campo `status`
- APIs de atualização podem modificar o status
- Consultas podem filtrar por status

## 8. Próximos Passos

1. Execute a migração no banco de dados
2. Teste a funcionalidade no frontend
3. Configure um cron job para executar `update_vencidas_despesas()` diariamente
4. Monitore o desempenho das consultas com o novo índice

## 9. Rollback (Se Necessário)

Para reverter as alterações:

```sql
-- Remover trigger
DROP TRIGGER IF EXISTS update_despesa_status_trigger ON public.despesas;

-- Remover funções
DROP FUNCTION IF EXISTS update_despesa_status();
DROP FUNCTION IF EXISTS update_vencidas_despesas();

-- Remover índice
DROP INDEX IF EXISTS idx_despesas_status;

-- Remover coluna
ALTER TABLE public.despesas DROP COLUMN IF EXISTS status;
```

**⚠️ Atenção**: O rollback removerá todos os dados de status das despesas. 
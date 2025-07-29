# Implementação do Sistema de Parcelas de Dívidas

## Resumo da Implementação

Este documento descreve a implementação do sistema de parcelas de dívidas que permite cadastrar automaticamente despesas baseadas em dívidas parceladas.

## Funcionalidades Implementadas

### 1. **Criação Automática de Parcelas**
- Quando uma dívida é cadastrada, o sistema automaticamente cria o número de despesas correspondente ao número de parcelas
- Cada parcela é calculada como: `Valor Total / Número de Parcelas`
- As datas de vencimento são calculadas automaticamente (primeira parcela na data informada, demais parcelas nos meses subsequentes)

### 2. **Vínculo entre Parcelas e Dívidas**
- Nova tabela `parcelas_dividas` que vincula cada parcela à dívida correspondente
- Relacionamento 1:N entre dívidas e parcelas
- Cada parcela está vinculada a uma despesa específica

### 3. **Gestão de Status das Parcelas**
- Status: `pendente`, `paga`, `vencida`
- Interface para alterar o status de cada parcela
- Resumo visual do progresso das parcelas

### 4. **Interface de Visualização**
- Modal dedicado para visualizar todas as parcelas de uma dívida
- Resumo com estatísticas (total, pagas, pendentes, vencidas)
- Botões para alterar status das parcelas
- Visualização responsiva (desktop e mobile)

## Alterações no Banco de Dados

### Nova Tabela: `parcelas_dividas`

```sql
CREATE TABLE IF NOT EXISTS public.parcelas_dividas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
    despesa_id UUID NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'vencida')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(divida_id, numero_parcela),
    UNIQUE(despesa_id)
);
```

### Índices Criados
- `idx_parcelas_dividas_divida_id`
- `idx_parcelas_dividas_despesa_id`
- `idx_parcelas_dividas_status`
- `idx_parcelas_dividas_data_vencimento`

### Políticas RLS (Row Level Security)
- Usuários podem visualizar apenas suas próprias parcelas
- Usuários podem inserir parcelas apenas para suas dívidas
- Usuários podem atualizar e deletar apenas suas parcelas

## Arquivos Criados/Modificados

### Novos Arquivos
1. **`supabase/migrations/create_parcelas_dividas_table.sql`**
   - Migração SQL para criar a tabela de parcelas

2. **`src/hooks/useParcelasDividas.ts`**
   - Hook para gerenciar operações com parcelas
   - Funções: criar, atualizar, deletar parcelas

3. **`src/components/VisualizarParcelasModal.tsx`**
   - Modal para visualizar e gerenciar parcelas
   - Interface responsiva com resumo e lista de parcelas

### Arquivos Modificados
1. **`src/integrations/supabase/types.ts`**
   - Adicionada tipagem para a tabela `parcelas_dividas`

2. **`src/hooks/useDividas.ts`**
   - Integração com sistema de parcelas
   - Criação automática de parcelas ao criar dívida
   - Remoção de parcelas ao deletar dívida

3. **`src/pages/Dividas.tsx`**
   - Adicionado botão para visualizar parcelas
   - Integração com modal de parcelas

## Como Usar

### 1. Cadastrar uma Dívida com Parcelas
1. Acesse a página de Dívidas
2. Clique em "Adicionar Dívida"
3. Preencha os campos:
   - **Descrição**: Ex: "Financiamento Veículo"
   - **Credor**: Ex: "Concessionária do João"
   - **Valor Total**: Ex: 120000
   - **Número de Parcelas**: Ex: 48
   - **Data de Vencimento**: Ex: 30/07/2025
   - **Categoria**: Ex: Transporte
4. Clique em "Adicionar Dívida"

### 2. Visualizar Parcelas
1. Na lista de dívidas, clique no ícone de cartão de crédito (verde)
2. O modal abrirá mostrando:
   - Resumo das parcelas (total, pagas, pendentes, vencidas)
   - Lista detalhada de cada parcela
   - Botões para alterar status

### 3. Gerenciar Status das Parcelas
1. No modal de parcelas, use os botões para alterar o status:
   - **Pendente**: Parcela ainda não foi paga
   - **Paga**: Parcela foi quitada
   - **Vencida**: Parcela passou da data de vencimento

## Exemplo de Funcionamento

### Dados de Entrada
- **Descrição**: Financiamento Veículo
- **Credor**: Concessionária do João
- **Parcelas**: 48
- **Valor Total**: 120000
- **Data de Vencimento**: 30/07/2025
- **Categoria**: Transporte

### Resultado
O sistema criará 48 despesas:

**Parcela 1:**
- Descrição: "Financiamento Veículo - Concessionária do João"
- Valor: R$ 2.500,00
- Data: 30/07/2025
- Categoria: Transporte

**Parcela 2:**
- Descrição: "Financiamento Veículo - Concessionária do João"
- Valor: R$ 2.500,00
- Data: 30/08/2025
- Categoria: Transporte

**... e assim por diante até a parcela 48 (30/06/2029)**

## Benefícios da Implementação

1. **Automatização**: Não é necessário cadastrar cada parcela manualmente
2. **Rastreabilidade**: Cada parcela está vinculada à dívida original
3. **Gestão Simplificada**: Interface intuitiva para gerenciar parcelas
4. **Relatórios**: Facilita a geração de relatórios de dívidas
5. **Controle**: Acompanhamento do progresso de pagamento

## Próximos Passos Sugeridos

1. **Notificações**: Implementar alertas para parcelas vencidas
2. **Relatórios**: Criar relatórios específicos de dívidas
3. **Integração**: Conectar com sistema de pagamentos
4. **Automação**: Atualização automática de status baseada em pagamentos
5. **Dashboard**: Widgets para acompanhamento de dívidas no dashboard principal

## Análise de Escalabilidade e Manutenibilidade

### Pontos Fortes
- **Separação de responsabilidades**: Cada hook gerencia uma entidade específica
- **Tipagem forte**: TypeScript com tipos gerados automaticamente
- **Relacionamentos bem definidos**: Foreign keys e constraints apropriados
- **Interface modular**: Componentes reutilizáveis e bem estruturados
- **Tratamento de erros**: Feedback consistente para o usuário

### Sugestões de Melhorias
- **Cache**: Implementar cache com React Query para melhor performance
- **Validação**: Adicionar validação de dados no frontend
- **Paginação**: Implementar paginação para dívidas com muitas parcelas
- **Otimização**: Considerar lazy loading para parcelas
- **Backup**: Implementar backup automático das parcelas 
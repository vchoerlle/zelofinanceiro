# Correção do Erro nos Filtros de Manutenção

## Problema Identificado

O erro ocorria ao clicar no botão "Mostrar Filtros" na página de Veículos:

```
A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

### Causa Raiz

O componente `FiltrosManutencao` estava usando `SelectItem` com `value=""` (string vazia) para representar a opção "Todos", o que não é permitido pelo Radix UI Select.

## Correções Aplicadas

### 1. Componente FiltrosManutencao.tsx

**Antes:**
```typescript
<SelectItem value="">Todos os veículos</SelectItem>
<SelectItem value="">Todos os tipos</SelectItem>
```

**Depois:**
```typescript
<SelectItem value="todos">Todos os veículos</SelectItem>
<SelectItem value="todos">Todos os tipos</SelectItem>
```

### 2. Página Veiculos.tsx

**Estados iniciais atualizados:**
```typescript
// Antes
const [filtroVeiculo, setFiltroVeiculo] = useState("");
const [filtroTipo, setFiltroTipo] = useState("");

// Depois
const [filtroVeiculo, setFiltroVeiculo] = useState("todos");
const [filtroTipo, setFiltroTipo] = useState("todos");
```

**Lógica de filtros atualizada:**
```typescript
// Antes
const manutencoesFiltradas = manutencoesPendentes.filter(manutencao => {
  if (filtroVeiculo && manutencao.veiculo_id !== filtroVeiculo) return false;
  if (filtroTipo && manutencao.tipo_manutencao_id !== filtroTipo) return false;
  return true;
});

// Depois
const manutencoesFiltradas = manutencoesPendentes.filter(manutencao => {
  if (filtroVeiculo !== "todos" && manutencao.veiculo_id !== filtroVeiculo) return false;
  if (filtroTipo !== "todos" && manutencao.tipo_manutencao_id !== filtroTipo) return false;
  return true;
});
```

**Função de limpar filtros atualizada:**
```typescript
// Antes
const handleLimparFiltros = () => {
  setFiltroVeiculo("");
  setFiltroTipo("");
};

// Depois
const handleLimparFiltros = () => {
  setFiltroVeiculo("todos");
  setFiltroTipo("todos");
};
```

### 3. Lógica de Verificação de Filtros Ativos

**Antes:**
```typescript
const temFiltrosAtivos = filtroVeiculo || filtroTipo;
```

**Depois:**
```typescript
const temFiltrosAtivos = filtroVeiculo !== "todos" || filtroTipo !== "todos";
```

## Resultado

- ✅ **Erro Corrigido**: Não há mais erros de SelectItem com valor vazio
- ✅ **Funcionalidade Mantida**: Os filtros continuam funcionando corretamente
- ✅ **Interface Consistente**: A opção "Todos" aparece corretamente nos selects
- ✅ **Estados Iniciais**: Os filtros começam com "todos" selecionado por padrão

## Teste

Para verificar se a correção funcionou:

1. Abra a página de Veículos
2. Clique no botão "Mostrar Filtros"
3. Verifique se os filtros aparecem sem erro
4. Teste selecionar diferentes opções nos filtros
5. Verifique se a opção "Todos" funciona corretamente
6. Teste o botão "Limpar" para resetar os filtros 
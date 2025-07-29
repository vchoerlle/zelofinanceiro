# Correção das Abas do Modal de Histórico de Manutenções

## Problema Identificado

**Relato do usuário:** "Botão histórico, abre o popup, traz informações, mas, abas 'Por veículo' e 'Por Tipo' não consigo clicar."

**Causa:** As abas "Por Veículo" e "Por Tipo" estavam desabilitadas porque dependiam de parâmetros `veiculoId` e `tipoManutencaoId` que não eram passados para o modal.

## Solução Implementada

### 1. Remoção da Dependência de Parâmetros Externos

**Antes:**
```typescript
interface HistoricoManutencoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencoes: ManutencaoRealizada[];
  veiculoId?: string;        // ❌ Parâmetro obrigatório para aba
  tipoManutencaoId?: string; // ❌ Parâmetro obrigatório para aba
}
```

**Depois:**
```typescript
interface HistoricoManutencoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencoes: ManutencaoRealizada[];
  // ✅ Sem dependência de parâmetros externos
}
```

### 2. Implementação de Seletores Internos

**Novos Estados:**
```typescript
const [selectedVeiculoId, setSelectedVeiculoId] = useState<string>("");
const [selectedTipoId, setSelectedTipoId] = useState<string>("");
```

**Extração de Dados Únicos:**
```typescript
// Extrair veículos únicos das manutenções
const veiculosUnicos = Array.from(new Set(manutencoes.map(m => m.veiculo_id)))
  .map(veiculoId => {
    const manutencao = manutencoes.find(m => m.veiculo_id === veiculoId);
    return {
      id: veiculoId,
      nome: `${manutencao?.veiculo?.marca} ${manutencao?.veiculo?.modelo} (${manutencao?.veiculo?.ano})`
    };
  })
  .filter(veiculo => veiculo.nome && veiculo.nome !== "undefined undefined (undefined)");

// Extrair tipos únicos das manutenções
const tiposUnicos = Array.from(new Set(manutencoes.map(m => m.tipo_manutencao_id)))
  .map(tipoId => {
    const manutencao = manutencoes.find(m => m.tipo_manutencao_id === tipoId);
    return {
      id: tipoId,
      nome: manutencao?.tipoManutencao?.nome || "Tipo desconhecido"
    };
  })
  .filter(tipo => tipo.nome && tipo.nome !== "Tipo desconhecido");
```

### 3. Seletores de Interface

**Aba "Por Veículo":**
```tsx
<div className="flex items-center space-x-2">
  <label className="text-sm font-medium">Selecionar Veículo:</label>
  <Select value={selectedVeiculoId} onValueChange={setSelectedVeiculoId}>
    <SelectTrigger className="w-64">
      <SelectValue placeholder="Escolha um veículo" />
    </SelectTrigger>
    <SelectContent>
      {veiculosUnicos.map((veiculo) => (
        <SelectItem key={veiculo.id} value={veiculo.id}>
          {veiculo.nome}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Aba "Por Tipo":**
```tsx
<div className="flex items-center space-x-2">
  <label className="text-sm font-medium">Selecionar Tipo:</label>
  <Select value={selectedTipoId} onValueChange={setSelectedTipoId}>
    <SelectTrigger className="w-64">
      <SelectValue placeholder="Escolha um tipo de manutenção" />
    </SelectTrigger>
    <SelectContent>
      {tiposUnicos.map((tipo) => (
        <SelectItem key={tipo.id} value={tipo.id}>
          {tipo.nome}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### 4. Filtros Dinâmicos

**Lógica de Filtro Atualizada:**
```typescript
const manutencoesFiltradas = manutencoes.filter(manutencao => {
  if (activeTab === "por-veiculo" && selectedVeiculoId) {
    return manutencao.veiculo_id === selectedVeiculoId;
  }
  if (activeTab === "por-tipo" && selectedTipoId) {
    return manutencao.tipo_manutencao_id === selectedTipoId;
  }
  return true; // "todas"
});
```

### 5. Gerenciamento de Estado das Abas

**Função de Mudança de Aba:**
```typescript
const handleTabChange = (value: string) => {
  setActiveTab(value);
  // Resetar seleções quando mudar de aba
  if (value === "todas") {
    setSelectedVeiculoId("");
    setSelectedTipoId("");
  }
};
```

## Arquivos Modificados

### 1. `src/components/HistoricoManutencoesModal.tsx`
**Mudanças:**
- ✅ Removidos parâmetros `veiculoId` e `tipoManutencaoId`
- ✅ Adicionados estados internos para seleção
- ✅ Implementados seletores de veículo e tipo
- ✅ Atualizada lógica de filtros
- ✅ Adicionada função de gerenciamento de abas
- ✅ Melhoradas mensagens de estado vazio

### 2. `src/pages/Veiculos.tsx`
**Mudanças:**
- ✅ Removidos parâmetros desnecessários do modal
- ✅ Interface simplificada

## Funcionalidades Implementadas

### 1. Aba "Todas"
- Mostra todas as manutenções realizadas
- Sem filtros aplicados
- Estatísticas gerais

### 2. Aba "Por Veículo"
- Seletor dropdown com todos os veículos
- Filtra manutenções por veículo selecionado
- Mostra manutenções específicas do veículo

### 3. Aba "Por Tipo"
- Seletor dropdown com todos os tipos de manutenção
- Filtra manutenções por tipo selecionado
- Mostra manutenções específicas do tipo

## Benefícios da Correção

### Para o Usuário:
- ✅ **Abas funcionais:** Todas as abas agora são clicáveis
- ✅ **Seleção intuitiva:** Dropdowns para escolher veículo/tipo
- ✅ **Filtros dinâmicos:** Filtros baseados nos dados disponíveis
- ✅ **Feedback claro:** Mensagens apropriadas para cada estado

### Para o Sistema:
- ✅ **Independência:** Modal não depende de parâmetros externos
- ✅ **Flexibilidade:** Funciona com qualquer conjunto de dados
- ✅ **Manutenibilidade:** Código mais limpo e organizado
- ✅ **Escalabilidade:** Fácil adição de novos filtros

## Como Testar

### 1. Abrir Histórico
1. Clique no botão "Histórico" na página de Veículos
2. Confirme que o modal abre com todas as abas habilitadas

### 2. Testar Aba "Todas"
1. Clique na aba "Todas"
2. Confirme que mostra todas as manutenções
3. Verifique as estatísticas no topo

### 3. Testar Aba "Por Veículo"
1. Clique na aba "Por Veículo"
2. Use o seletor para escolher um veículo
3. Confirme que filtra as manutenções corretamente
4. Teste com diferentes veículos

### 4. Testar Aba "Por Tipo"
1. Clique na aba "Por Tipo"
2. Use o seletor para escolher um tipo de manutenção
3. Confirme que filtra as manutenções corretamente
4. Teste com diferentes tipos

### 5. Testar Navegação
1. Mude entre as abas
2. Confirme que as seleções são resetadas ao voltar para "Todas"
3. Verifique que os filtros funcionam corretamente

## Status da Correção

- ✅ **Problema identificado:** Abas desabilitadas por dependência de parâmetros
- ✅ **Solução implementada:** Seletores internos e filtros dinâmicos
- ✅ **Interface melhorada:** Dropdowns intuitivos e feedback claro
- ✅ **Funcionalidade completa:** Todas as abas funcionando corretamente
- 🔄 **Aguardando teste:** Confirmação do funcionamento 
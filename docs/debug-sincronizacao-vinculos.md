# Debug da Sincronização de Vínculos de Manutenção

## Problema Persistente

**Relato do usuário:** "Continua atualizando somente quando aperto F5."

**Análise:** Mesmo após implementar o callback de notificação, a sincronização ainda não está funcionando corretamente. Isso indica que pode haver um problema mais profundo na arquitetura de atualização de dados.

## Mudanças de Debug Implementadas

### 1. Logs Detalhados no Hook useManutencoesPendentes

**Adicionados logs no useEffect:**
```typescript
useEffect(() => {
  console.log('🔄 useEffect - Recalculando manutenções pendentes');
  console.log('📊 Dados atuais:', {
    veiculos: veiculos.length,
    tiposManutencao: tiposManutencao.length,
    manutencaoRealizada: manutencaoRealizada.length,
    vinculos: vinculos.length
  });
  
  if (veiculos.length > 0 && tiposManutencao.length > 0) {
    console.log('✅ Condições atendidas, calculando manutenções pendentes...');
    calcularManutencoesPendentes();
  } else {
    console.log('❌ Condições não atendidas para cálculo');
  }
}, [manutencaoRealizada, vinculos, veiculos, tiposManutencao]);
```

**Melhorada função refetch:**
```typescript
refetch: async () => {
  console.log('🔄 Executando refetch do useManutencoesPendentes...');
  await fetchManutencaoRealizada();
  setTimeout(() => {
    console.log('🔄 Recalculando manutenções pendentes após refetch...');
    calcularManutencoesPendentes();
  }, 200);
}
```

### 2. Logs no Hook useVeiculosTiposManutencao

**Adicionados logs na função adicionarVinculo:**
```typescript
console.log('✅ Vínculo adicionado com sucesso');
console.log('🔄 Buscando vínculos atualizados...');
await fetchVinculos();
console.log('✅ Vínculos atualizados:', vinculos.length);
```

### 3. Logs no Modal VincularTiposManutencaoModal

**Adicionados logs nas funções de vincular/desvincular:**
```typescript
const handleVincular = async () => {
  console.log('🔗 Iniciando vinculação...');
  await adicionarVinculo(selectedVeiculo.id, selectedTipo.id);
  
  if (onVinculoChange) {
    console.log('📢 Notificando mudança de vínculo...');
    setTimeout(() => {
      console.log('🔄 Executando callback onVinculoChange...');
      onVinculoChange();
    }, 1000);
  } else {
    console.log('⚠️ onVinculoChange não fornecido');
  }
};
```

### 4. Logs na Página Veículos

**Adicionados logs no callback:**
```typescript
onVinculoChange={() => {
  console.log('🔄 Callback onVinculoChange executado na página Veículos');
  setTimeout(() => {
    console.log('🔄 Executando refetchManutencoes...');
    refetchManutencoes();
  }, 500);
}}
```

## Como Usar os Logs para Debug

### 1. Abrir Console do Navegador
1. Pressione F12 para abrir as ferramentas de desenvolvedor
2. Vá para a aba "Console"
3. Filtre por "🔄" para ver apenas os logs de sincronização

### 2. Testar Vinculação
1. Abra a página de Veículos
2. Clique em "Vincular Tipos"
3. Selecione um veículo e um tipo
4. Clique em "Vincular"
5. Observe os logs no console

### 3. Sequência de Logs Esperada
```
🔗 Iniciando vinculação...
➕ Adicionando vínculo: { veiculoId: "...", tipoManutencaoId: "..." }
✅ Vínculo adicionado com sucesso
🔄 Buscando vínculos atualizados...
✅ Vínculos atualizados: X
📢 Notificando mudança de vínculo...
🔄 Executando callback onVinculoChange...
🔄 Callback onVinculoChange executado na página Veículos
🔄 Executando refetchManutencoes...
🔄 Executando refetch do useManutencoesPendentes...
🔄 useEffect - Recalculando manutenções pendentes
📊 Dados atuais: { veiculos: X, tiposManutencao: Y, manutencaoRealizada: Z, vinculos: W }
✅ Condições atendidas, calculando manutenções pendentes...
🔄 Recalculando manutenções pendentes após refetch...
```

## Possíveis Problemas Identificados

### 1. Problema de Timing
- **Sintoma:** Logs aparecem mas interface não atualiza
- **Causa:** Race condition entre atualização de vínculos e recálculo
- **Solução:** Aumentar timeouts e adicionar dependências

### 2. Problema de Dependência
- **Sintoma:** useEffect não é disparado
- **Causa:** Array de dependências não detecta mudanças
- **Solução:** Verificar se objetos são recriados a cada render

### 3. Problema de Estado
- **Sintoma:** Dados não são atualizados no estado
- **Causa:** Hook não está observando mudanças corretamente
- **Solução:** Forçar re-render ou usar useCallback

### 4. Problema de Cache
- **Sintoma:** Dados antigos persistem
- **Causa:** Cache do React ou Supabase
- **Solução:** Limpar cache ou forçar refetch

## Próximos Passos

### 1. Analisar Logs
- Verificar se todos os logs aparecem na sequência correta
- Identificar onde o fluxo para ou falha
- Confirmar se os dados estão sendo atualizados

### 2. Testar Cenários
- Vincular um novo vínculo
- Desvincular um vínculo existente
- Múltiplas operações seguidas
- Navegação entre páginas

### 3. Implementar Soluções
- Baseado na análise dos logs, implementar correções específicas
- Ajustar timeouts se necessário
- Modificar dependências se necessário
- Forçar re-renders se necessário

## Status do Debug

- ✅ **Logs implementados:** Todos os pontos críticos cobertos
- ✅ **Timeouts ajustados:** Aumentados para garantir sincronização
- ✅ **Dependências expandidas:** useEffect com todas as dependências
- 🔄 **Aguardando análise:** Verificação dos logs para identificar problema 
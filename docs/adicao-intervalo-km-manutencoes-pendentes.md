# Adição do Intervalo KM nos Cards de Manutenções Pendentes

## Implementação

Foi adicionada a informação do "Intervalo KM" nos cards das manutenções pendentes para melhorar a visualização e compreensão dos dados.

### Funcionalidade

- **Exibição do Intervalo**: Mostra o intervalo de quilômetros definido para cada tipo de manutenção
- **Formatação**: Utiliza `toLocaleString()` para formatar números grandes com separadores de milhares
- **Posicionamento**: Aparece na linha de descrição, junto com o sistema e informações do veículo

### Localização

A informação aparece na segunda linha do card, na seguinte ordem:
1. Sistema da manutenção
2. Marca e modelo do veículo
3. **Intervalo KM** (novo)

### Código Implementado

```typescript
<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
  Sistema: {manutencao.sistema} •{" "}
  {manutencao.veiculo?.marca}{" "}
  {manutencao.veiculo?.modelo} •{" "}
  Intervalo: {manutencao.tipoManutencao?.intervalo_km.toLocaleString()} km
</p>
```

### Exemplo de Exibição

**Antes:**
```
Troca de Óleo
Sistema: Motor • Honda Civic • 5.000 km
```

**Depois:**
```
Troca de Óleo
Sistema: Motor • Honda Civic • Intervalo: 5,000 km
```

## Benefícios

- ✅ **Informação Completa**: Usuário vê imediatamente o intervalo definido para a manutenção
- ✅ **Facilita Planejamento**: Ajuda a entender quando a próxima manutenção deve ser realizada
- ✅ **Consistência Visual**: Mantém o padrão de formatação com separadores de milhares
- ✅ **Acesso Direto**: Informação disponível sem precisar abrir detalhes ou modais

## Dados Utilizados

A informação é obtida através da propriedade `tipoManutencao?.intervalo_km` que já estava disponível na interface `ManutencaoPendente`, conectada ao tipo de manutenção correspondente.

### Estrutura de Dados

```typescript
interface ManutencaoPendente {
  // ... outros campos
  tipoManutencao?: TipoManutencao;
}

interface TipoManutencao {
  // ... outros campos
  intervalo_km: number;
}
```

## Teste

Para verificar se a implementação está funcionando:

1. Abra a página de Veículos
2. Verifique se há manutenções pendentes na seção "Manutenções Pendentes"
3. Observe se cada card mostra o intervalo KM na linha de descrição
4. Verifique se os números estão formatados corretamente (ex: "5,000 km" em vez de "5000 km") 
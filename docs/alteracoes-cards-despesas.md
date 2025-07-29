# Alterações nos Cards da Página "Despesas"

## Resumo das Alterações

Este documento descreve as alterações implementadas nos cards de estatísticas da página "Despesas" para melhor organização e visualização dos dados baseados no status das despesas.

## 1. Cards Implementados

### ✅ Card "Despesas Pagas"
- **Título**: "Despesas Pagas"
- **Filtro**: Apenas despesas com status `'pago'`
- **Informações exibidas**:
  - Valor total das despesas pagas
  - Quantidade de despesas pagas
- **Cor**: Verde (indicando sucesso/conclusão)
- **Ícone**: DollarSign

### ✅ Card "Despesas a Pagar"
- **Título**: "Despesas a Pagar"
- **Filtro**: Apenas despesas com status `'pendente'`
- **Informações exibidas**:
  - Valor total das despesas pendentes
  - Quantidade de despesas pendentes
- **Cor**: Amarelo (indicando atenção/pendente)
- **Ícone**: TrendingDown

### ✅ Card "Despesas em Atraso"
- **Título**: "Despesas em Atraso"
- **Filtro**: Apenas despesas com status `'atraso'`
- **Informações exibidas**:
  - Valor total das despesas em atraso
  - Quantidade de despesas em atraso
- **Cor**: Vermelho (indicando urgência/atraso)
- **Ícone**: AlertTriangle

### ✅ Card "Categorias" (Mantido)
- **Título**: "Categorias"
- **Informação**: Quantidade total de categorias de despesa
- **Cor**: Laranja
- **Ícone**: Calendar

## 2. Card Removido

### ❌ Card "Despesas" (Removido)
- **Motivo**: Redundante com os novos cards específicos por status
- **Substituído por**: Cards específicos para cada status

## 3. Cálculos Implementados

### Filtros por Status:
```typescript
const despesasPagas = despesas.filter(despesa => despesa.status === 'pago');
const despesasPendentes = despesas.filter(despesa => despesa.status === 'pendente');
const despesasAtraso = despesas.filter(despesa => despesa.status === 'atraso');
```

### Totais por Status:
```typescript
const totalDespesasPagas = despesasPagas.reduce(
  (total, despesa) => total + despesa.valor, 0
);
const totalDespesasPendentes = despesasPendentes.reduce(
  (total, despesa) => total + despesa.valor, 0
);
const totalDespesasAtraso = despesasAtraso.reduce(
  (total, despesa) => total + despesa.valor, 0
);
```

## 4. Layout Atualizado

### Grid Responsivo:
- **Mobile**: 1 coluna
- **Tablet**: 2 colunas
- **Desktop**: 4 colunas

### Estrutura dos Cards:
```jsx
<Card>
  <div className="flex items-center space-x-4">
    <div className="bg-{cor}-100 rounded-full p-2 md:p-3">
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-{cor}-600" />
    </div>
    <div>
      <p className="text-xs md:text-sm text-gray-600">
        Título do Card
      </p>
      <p className="text-lg md:text-2xl font-bold text-gray-900">
        R$ Valor Total
      </p>
      <p className="text-xs text-gray-500">
        X despesa(s)
      </p>
    </div>
  </div>
</Card>
```

## 5. Benefícios das Alterações

### Para o Usuário:
1. **Visão Clara**: Separação clara entre despesas pagas, pendentes e em atraso
2. **Controle Financeiro**: Identificação rápida de valores por status
3. **Priorização**: Foco nas despesas que precisam de atenção
4. **Quantificação**: Contagem de despesas por status

### Para o Sistema:
1. **Organização**: Dados estruturados por status
2. **Performance**: Cálculos otimizados
3. **Escalabilidade**: Fácil adição de novos status no futuro
4. **Consistência**: Padrão visual uniforme

## 6. Exemplo de Uso

### Cenário: Usuário com 10 despesas
- **5 despesas pagas**: R$ 1.500,00
- **3 despesas pendentes**: R$ 800,00
- **2 despesas em atraso**: R$ 400,00

### Cards exibirão:
1. **Despesas Pagas**: R$ 1.500,00 (5 despesas)
2. **Despesas a Pagar**: R$ 800,00 (3 despesas)
3. **Despesas em Atraso**: R$ 400,00 (2 despesas)
4. **Categorias**: 8 categorias

## 7. Responsividade

### Mobile (< 640px):
```
[Despesas Pagas]
[Despesas a Pagar]
[Despesas em Atraso]
[Categorias]
```

### Tablet (640px - 1024px):
```
[Despesas Pagas] [Despesas a Pagar]
[Despesas em Atraso] [Categorias]
```

### Desktop (> 1024px):
```
[Despesas Pagas] [Despesas a Pagar] [Despesas em Atraso] [Categorias]
```

## 8. Próximos Passos

### Funcionalidades Futuras:
1. **Cards Clicáveis**: Navegar para lista filtrada ao clicar no card
2. **Gráficos**: Visualização gráfica dos dados
3. **Comparação**: Comparação com períodos anteriores
4. **Alertas**: Notificações para despesas em atraso

### Melhorias de UX:
1. **Animações**: Transições suaves entre estados
2. **Tooltips**: Informações detalhadas ao passar o mouse
3. **Exportação**: Exportar dados dos cards
4. **Personalização**: Usuário escolher quais cards exibir

## 9. Arquivos Modificados

### Principais Alterações:
- `src/pages/Despesas.tsx`: Implementação dos novos cards e cálculos

### Imports Adicionados:
- `AlertTriangle` do lucide-react para o card de atraso

## 10. Conclusão

As alterações nos cards proporcionam:
- ✅ Visão clara e organizada das despesas por status
- ✅ Informações quantitativas e qualitativas
- ✅ Interface responsiva e intuitiva
- ✅ Base sólida para futuras funcionalidades

O sistema agora oferece controle total sobre o status das despesas com visualização clara e organizada dos dados financeiros. 
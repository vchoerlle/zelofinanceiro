# Alteração do Label "Data" para "Data Vcto" - Página Despesas

## **📝 Alteração Realizada**

Alterada a descrição da coluna "Data" para "Data Vcto" em todos os locais da página "Despesas" para deixar mais claro que se refere à data de vencimento da despesa.

## **🔧 Locais Alterados**

### **1. Cabeçalho da Tabela (Desktop)**
```typescript
// Antes
<TableHead>Data</TableHead>

// Depois
<TableHead>Data Vcto</TableHead>
```

### **2. Card Mobile**
```typescript
// Antes
<p className="text-gray-500">Data</p>

// Depois
<p className="text-gray-500">Data Vcto</p>
```

### **3. Formulário de Adição**
```typescript
// Antes
<Label htmlFor="data">Data *</Label>

// Depois
<Label htmlFor="data">Data Vcto *</Label>
```

### **4. Modal de Edição**
```typescript
// Antes
<Label htmlFor="data">Data *</Label>

// Depois
<Label htmlFor="data">Data Vcto *</Label>
```

## **📋 Arquivos Modificados**

| Arquivo | Alteração | Status |
|---------|-----------|--------|
| `src/pages/Despesas.tsx` | Cabeçalho da tabela | ✅ |
| `src/pages/Despesas.tsx` | Card mobile | ✅ |
| `src/pages/Despesas.tsx` | Formulário de adição | ✅ |
| `src/components/EditarDespesaModal.tsx` | Modal de edição | ✅ |

## **✅ Benefícios da Alteração**

1. **Clareza**: Deixa explícito que o campo se refere à data de vencimento
2. **Consistência**: Alinha com a funcionalidade real do campo
3. **UX Melhorada**: Usuário entende melhor o que o campo representa
4. **Padronização**: Segue convenções financeiras (Vcto = Vencimento)

## **🎯 Contexto**

O campo `data` na tabela `despesas` representa a **data de vencimento** da despesa, não a data de criação. Esta alteração torna isso mais claro para o usuário.

## **📊 Comparação**

| Campo | Significado | Uso |
|-------|-------------|-----|
| `data` | Data de vencimento | Quando a despesa deve ser paga |
| `created_at` | Data de criação | Quando foi registrada no sistema |

## **🚀 Resultado**

Agora todos os labels relacionados à data na página "Despesas" deixam claro que se referem à data de vencimento, melhorando a experiência do usuário e evitando confusões.

---

**Data da Alteração**: $(date)
**Responsável**: Sistema de Correção Automática
**Status**: ✅ Implementado 
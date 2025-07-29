import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export const useTableSort = <T>(data: T[], defaultSort?: SortConfig) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      // Se ambos os valores são números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Se ambos os valores são strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Verificar se são datas (formato YYYY-MM-DD)
        const isDateA = /^\d{4}-\d{2}-\d{2}$/.test(aValue);
        const isDateB = /^\d{4}-\d{2}-\d{2}$/.test(bValue);
        
        if (isDateA && isDateB) {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        const comparison = aValue.localeCompare(bValue, 'pt-BR', { 
          numeric: true,
          sensitivity: 'base' 
        });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Se um dos valores é null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      // Para outros tipos, converter para string
      const aString = String(aValue);
      const bString = String(bValue);
      const comparison = aString.localeCompare(bString, 'pt-BR', { 
        numeric: true,
        sensitivity: 'base' 
      });
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null; // Remove ordenação
      }
    }
    
    setSortConfig(direction ? { key, direction } : null);
  };

  const getSortDirection = (key: string): SortDirection => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction;
  };

  const clearSort = () => {
    setSortConfig(null);
  };

  return {
    sortedData,
    requestSort,
    getSortDirection,
    clearSort,
    sortConfig
  };
};

// Função auxiliar para acessar valores aninhados (ex: 'categorias.nome')
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
} 
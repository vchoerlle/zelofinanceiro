import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortDirection } from '@/hooks/useTableSort';

interface SortableTableHeadProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export const SortableTableHead: React.FC<SortableTableHeadProps> = ({
  children,
  sortKey,
  currentSortDirection,
  onSort,
  className
}) => {
  const handleClick = () => {
    onSort(sortKey);
  };

  // Determinar o alinhamento baseado na className
  const isRightAligned = className?.includes('text-right');
  const isCenterAligned = className?.includes('text-center');
  
  // Remover classes de alinhamento da className para evitar conflito
  const cleanClassName = className?.replace(/\btext-(right|left|center)\b/g, '');

  return (
    <th
      className={cn(
        "h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none",
        cleanClassName
      )}
      style={{
        // Garantir alinhamento via inline style como fallback
        textAlign: isRightAligned ? 'right' : isCenterAligned ? 'center' : 'left'
      }}
      onClick={handleClick}
    >
      <div className={cn(
        "flex items-center space-x-1",
        // Aplicar justify correto baseado no alinhamento
        isRightAligned ? 'justify-end' : isCenterAligned ? 'justify-center' : 'justify-start'
      )}>
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={cn(
              "w-3 h-3 transition-colors",
              currentSortDirection === 'asc' 
                ? "text-primary" 
                : "text-muted-foreground/30"
            )} 
          />
          <ChevronDown 
            className={cn(
              "w-3 h-3 transition-colors -mt-1",
              currentSortDirection === 'desc' 
                ? "text-primary" 
                : "text-muted-foreground/30"
            )} 
          />
        </div>
      </div>
    </th>
  );
}; 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusDespesa = 'pago' | 'pendente' | 'atraso';

interface StatusDespesaButtonProps {
  status: StatusDespesa;
  onStatusChange: (newStatus: StatusDespesa) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const statusConfig = {
  pago: {
    label: 'Pago',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
    iconClassName: 'text-green-600'
  },
  pendente: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    iconClassName: 'text-yellow-600'
  },
  atraso: {
    label: 'Atraso',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
    iconClassName: 'text-red-600'
  }
};

export const StatusDespesaButton = ({ 
  status, 
  onStatusChange, 
  className,
  size = 'default'
}: StatusDespesaButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Verificar se o status existe no config, caso contrário usar 'pendente' como fallback
  const validStatus = statusConfig[status] ? status : 'pendente';
  const config = statusConfig[validStatus];
  const IconComponent = config.icon;

  const handleStatusChange = (newStatus: StatusDespesa) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn(
            "flex items-center gap-2 border rounded-md px-3 py-1.5",
            config.className,
            className
          )}
        >
          <IconComponent className={cn("w-4 h-4", config.iconClassName)} />
          <span className="font-medium">{config.label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleStatusChange('pago')}
          className={cn(
            "flex items-center gap-2",
            status === 'pago' && "bg-green-50 text-green-700"
          )}
        >
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Marcar como Pago</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('pendente')}
          className={cn(
            "flex items-center gap-2",
            status === 'pendente' && "bg-yellow-50 text-yellow-700"
          )}
        >
          <Clock className="w-4 h-4 text-yellow-600" />
          <span>Marcar como Pendente</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('atraso')}
          className={cn(
            "flex items-center gap-2",
            status === 'atraso' && "bg-red-50 text-red-700"
          )}
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Marcar como Atraso</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Componente simples para exibir apenas o status (sem dropdown)
export const StatusDespesaBadge = ({ 
  status, 
  className 
}: { 
  status: StatusDespesa; 
  className?: string;
}) => {
  // Verificar se o status existe no config, caso contrário usar 'pendente' como fallback
  const validStatus = statusConfig[status] ? status : 'pendente';
  const config = statusConfig[validStatus];
  const IconComponent = config.icon;

  return (
    <Badge className={cn(config.className, className)}>
      <IconComponent className={cn("w-3 h-3 mr-1", config.iconClassName)} />
      {config.label}
    </Badge>
  );
}; 
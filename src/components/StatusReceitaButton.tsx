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

type StatusReceita = 'recebida' | 'pendente' | 'vencida';

interface Props {
  status?: StatusReceita;
  onStatusChange: (status: StatusReceita) => void;
  size?: 'sm' | 'default' | 'lg';
}

const statusConfig = {
  recebida: {
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
  vencida: {
    label: 'Atraso',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
    iconClassName: 'text-red-600'
  }
} as const;

export const StatusReceitaButton = ({ status = 'pendente', onStatusChange, size = 'default' }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const validStatus = statusConfig[status] ? status : 'pendente';
  const config = statusConfig[validStatus as StatusReceita];
  const IconComponent = config.icon;

  const handleStatusChange = (newStatus: StatusReceita) => {
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
            "inline-flex items-center gap-2 border rounded-md px-3 py-1.5 align-middle",
            config.className,
          )}
        >
          <IconComponent className={cn("w-4 h-4", config.iconClassName)} />
          <span className="font-medium">{config.label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleStatusChange('recebida')} className={cn("flex items-center gap-2", status === 'recebida' && "bg-green-50 text-green-700")}>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Marcar como Pago</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('pendente')} className={cn("flex items-center gap-2", status === 'pendente' && "bg-yellow-50 text-yellow-700")}>
          <Clock className="w-4 h-4 text-yellow-600" />
          <span>Marcar como Pendente</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('vencida')} className={cn("flex items-center gap-2", status === 'vencida' && "bg-red-50 text-red-700")}>
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Marcar como Atraso</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



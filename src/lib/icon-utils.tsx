import * as LucideIcons from "lucide-react";

export function renderIcon(iconName: string) {
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent className="w-4 h-4" />;
  }
  // Fallback para ícone padrão se o nome não for encontrado
  return <LucideIcons.DollarSign className="w-4 h-4" />;
} 
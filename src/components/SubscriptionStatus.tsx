import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export const SubscriptionStatus = () => {
  const { diasRestantes, loading, isValid } = useSubscription();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Status da Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (diasRestantes === null) {
    return null; // Não mostrar se não conseguir buscar os dados
  }

  const getStatusInfo = () => {
    if (diasRestantes <= 0) {
      return {
        icon: AlertTriangle,
        color: "destructive",
        text: "Expirada",
        description: "Sua assinatura expirou"
      };
    } else if (diasRestantes <= 7) {
      return {
        icon: Clock,
        color: "warning",
        text: "Expira em breve",
        description: `${diasRestantes} dias restantes`
      };
    } else {
      return {
        icon: CheckCircle,
        color: "default",
        text: "Ativa",
        description: `${diasRestantes} dias restantes`
      };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Status da Assinatura</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{statusInfo.description}</span>
          </div>
          <Badge variant={statusInfo.color as any}>
            {statusInfo.text}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}; 
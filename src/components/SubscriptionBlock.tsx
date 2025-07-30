import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const SubscriptionBlock = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-red-600">
            Acesso Bloqueado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Sua assinatura expirou. Entre em contato para renovar.
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Você será redirecionado automaticamente...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBlock } from "@/components/SubscriptionBlock";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isValid, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Se ainda está carregando autenticação, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Se não tem usuário e não está carregando, redirecionar
  if (!user) {
    navigate("/");
    return null;
  }

  // Se está verificando assinatura, mostrar loading
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Se a assinatura não é válida, mostrar tela de bloqueio
  if (!isValid) {
    return <SubscriptionBlock />;
  }

  // Se tem usuário e assinatura válida, renderizar o conteúdo
  return <>{children}</>;
};
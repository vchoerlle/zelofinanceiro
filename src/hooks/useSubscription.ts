import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar assinatura:', error);
          setLoading(false);
          return;
        }

        const profileData = data as any;
        if (profileData && typeof profileData.dias_restantes === 'number') {
          setDiasRestantes(profileData.dias_restantes);
          
          // Se dias_restantes <= 0, bloquear acesso
          if (profileData.dias_restantes <= 0) {
            setIsValid(false);
            toast({
              title: "Acesso Bloqueado",
              description: "Sua assinatura expirou. Entre em contato para renovar.",
              variant: "destructive",
            });
            
            // Fazer logout após um delay
            setTimeout(async () => {
              await supabase.auth.signOut();
            }, 2000);
          } else {
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, toast]);

  return {
    diasRestantes,
    loading,
    isValid,
  };
}; 
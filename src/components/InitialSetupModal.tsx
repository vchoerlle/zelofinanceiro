import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const InitialSetupModal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [hasStartedSetup, setHasStartedSetup] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('setup_concluido')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar setup:', error);
          return;
        }

        // Se setup não foi concluído, mostrar modal e iniciar configuração automaticamente
        if (!data.setup_concluido && !hasStartedSetup) {
          setIsOpen(true);
          setHasStartedSetup(true);
          // Iniciar configuração automaticamente
          handleSetup();
        }
      } catch (error) {
        console.error('Erro ao verificar setup:', error);
      }
    };

    checkSetupStatus();
  }, [user]);

  const handleSetup = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('setup_initial_data', {
        user_uuid: user.id
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setSetupComplete(true);
        toast({
          title: "Setup concluído!",
          description: "Seu sistema foi configurado com sucesso.",
        });

        // Fechar modal após 2 segundos
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      } else {
        // Se não foi sucesso mas não é erro (ex: já existe), apenas marcar como concluído
        if (data.message && data.message.includes('já existem')) {
          setSetupComplete(true);
          toast({
            title: "Setup concluído!",
            description: "Sistema configurado.",
          });

          // Fechar modal após 2 segundos
          setTimeout(() => {
            setIsOpen(false);
          }, 2000);
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      console.error('Erro no setup:', error);
      toast({
        title: "Erro no setup",
        description: "Ocorreu um erro ao configurar o sistema. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {setupComplete ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Setup Concluído!</span>
              </div>
            ) : (
              "Configuração Inicial"
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          {!setupComplete ? (
            <>
              <p className="text-muted-foreground">
                Aguarde um momento! Estamos configurando o sistema para o seu primeiro acesso.
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Criando categorias padrão...
                </span>
              </div>
            </>
          ) : (
            <p className="text-green-600 font-medium">
              Seu sistema foi configurado com sucesso!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
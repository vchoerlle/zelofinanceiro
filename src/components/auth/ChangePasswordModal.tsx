
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { translateAuthError } from "@/lib/auth-utils";

// Função para validar senha
const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos uma letra minúscula." };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos um número." };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: "A senha deve conter pelo menos um símbolo." };
  }
  
  return { isValid: true, message: "" };
};

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // Validar senha
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Alterar senha usando Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        console.error("Erro ao alterar senha:", error);
        toast({
          title: "Erro",
          description: translateAuthError(error.message) || "Erro ao alterar senha. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      });
      
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      onClose();
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao alterar senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Mín. 6 chars: a-z, A-Z, 0-9, símbolo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

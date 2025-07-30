import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { checkEmailExists } from "@/lib/auth-utils";

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

// Função para validar email
const validateEmail = (email: string): { isValid: boolean; message: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Email inválido. Digite um email válido." };
  }
  return { isValid: true, message: "" };
};



interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para validar email em tempo real
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    
    if (emailValue === "") {
      setEmailError("");
      return;
    }
    
    const emailValidation = validateEmail(emailValue);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Email inválido",
        description: emailValidation.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validar senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Verificar se email já está cadastrado
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      toast({
        title: "Email já cadastrado",
        description: "Este email já está cadastrado. Tente fazer login ou use outro email.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name, organizationName, telefone);
    
    // Note: With email confirmation enabled, user won't be automatically signed in
    // They need to verify their email first
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Nome da organização</Label>
        <Input
          id="organizationName"
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Nome da sua empresa ou organização"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">WhatsApp</Label>
        <Input
          id="telefone"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="seu@email.com"
          className={emailError ? "border-red-500" : ""}
          required
        />
        {emailError && (
          <p className="text-sm text-red-500">{emailError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mín. 6 chars: a-z, A-Z, 0-9, símbolo"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-orange-600 hover:text-orange-500 font-medium"
          >
            Faça login
          </button>
        </span>
      </div>
    </form>
  );
};

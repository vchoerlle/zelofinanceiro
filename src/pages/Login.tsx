import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useSearchParams } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => {
    // Se tiver o token de redefinição de senha na URL, mostra o formulário de reset
    return searchParams.get("type") === "recovery" ? "reset-password" : "login";
  });

  const renderAuthForm = () => {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            onSwitchToRegister={() => setMode("register")}
            onSwitchToForgot={() => setMode("forgot-password")}
          />
        );
      case "register":
        return <RegisterForm onSwitchToLogin={() => setMode("login")} />;
      case "forgot-password":
        return <ForgotPasswordForm onSwitchToLogin={() => setMode("login")} />;
      case "reset-password":
        return <ResetPasswordForm onSwitchToLogin={() => setMode("login")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle 
          variant="outline" 
          size="icon"
          className="bg-background/80 backdrop-blur-sm border-border"
        />
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-1">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-56 w-auto"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {mode === "login" && "Faça login em sua conta"}
              {mode === "register" && "Crie sua conta"}
              {mode === "forgot-password" && "Recupere sua senha"}
              {mode === "reset-password" && "Defina sua nova senha"}
            </p>
          </div>

          {/* Auth Form */}
          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
};

export default Login;

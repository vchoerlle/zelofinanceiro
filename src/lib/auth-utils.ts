import { supabase } from "@/integrations/supabase/client";

// Função para verificar se email já existe na tabela profiles
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_email_exists', { email_to_check: email });

    if (error) {
      console.error("Erro ao verificar email:", error);
      return false; // Em caso de erro, não bloqueia o cadastro
    }

    // A função retorna true se o email existe, false se não existe
    return data === true;
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return false; // Em caso de erro, não bloqueia o cadastro
  }
};

// Função para traduzir mensagens de erro do Supabase
export const translateAuthError = (errorMessage: string): string => {
  // Verificar se é erro de senha fraca
  if (errorMessage.includes("Password should contain at least one character of each")) {
    return "A senha deve conter pelo menos: uma letra minúscula, uma letra maiúscula, um número, um símbolo e no mínimo 6 caracteres.";
  }
  
  // Outros erros comuns
  if (errorMessage.includes("Invalid login credentials")) {
    return "Email ou senha incorretos. Verifique suas credenciais.";
  }
  
  if (errorMessage.includes("Email not confirmed")) {
    return "Email não confirmado. Verifique sua caixa de entrada e confirme sua conta.";
  }
  
  if (errorMessage.includes("User already registered")) {
    return "Este email já está cadastrado. Tente fazer login ou use outro email.";
  }
  
  if (errorMessage.includes("Unable to validate email address")) {
    return "Email inválido. Verifique se o email está correto.";
  }
  
  if (errorMessage.includes("A user with this email address has already been registered")) {
    return "Este email já está cadastrado. Tente fazer login ou use outro email.";
  }
  
  if (errorMessage.includes("Signup disabled")) {
    return "Cadastro temporariamente desabilitado. Tente novamente mais tarde.";
  }
  
  if (errorMessage.includes("Too many requests")) {
    return "Muitas tentativas. Aguarde um momento antes de tentar novamente.";
  }
  
  // Se não encontrar uma tradução específica, retorna a mensagem original
  return errorMessage;
}; 
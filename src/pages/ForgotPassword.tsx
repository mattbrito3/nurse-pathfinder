import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmailVerification from "@/components/auth/EmailVerification";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailVerified = async (verifiedEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(verifiedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email de recuperação enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar email de recuperação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <EmailVerification
        email={email}
        onEmailChange={setEmail}
        onVerified={handleEmailVerified}
        onBack={() => navigate('/auth')}
        title="Recuperar Senha"
        description="Primeiro, vamos verificar que você tem acesso a este email"
      />
    </div>
  );
};

export default ForgotPassword;
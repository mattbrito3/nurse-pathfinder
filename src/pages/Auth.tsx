import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se já está logado, redirecionar para dashboard
        navigate('/dashboard');
      } else {
        // Se não está logado, redirecionar para login
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Redirecionando...
        </p>
      </div>
    </div>
  );
};

export default Auth;
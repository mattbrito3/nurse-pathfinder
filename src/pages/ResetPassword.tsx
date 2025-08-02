import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    return { strength: (strength / 5) * 100, checks };
  };

  const { strength: passwordStrength, checks } = calculatePasswordStrength(password);

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return "Fraca";
    if (strength < 70) return "Média";
    return "Forte";
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Aguardar um pouco para o Supabase processar o hash da URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o usuário está autenticado
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          setError('Link de recuperação inválido ou expirado.');
          return;
        }
        
        if (!session) {
          // Se não há sessão, verificar se há hash na URL
          const hash = window.location.hash;
          if (hash) {
            console.log('🔗 Hash detectado, aguardando processamento...');
            // Aguardar mais um pouco e verificar novamente
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (!retrySession) {
                setError('Link de recuperação inválido ou expirado.');
              }
            }, 2000);
          } else {
            setError('Link de recuperação inválido ou expirado.');
          }
        } else {
          console.log('✅ Sessão válida detectada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        setError('Erro ao processar link de recuperação.');
      }
    };

    checkAuthStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 60) {
      setError('Por favor, escolha uma senha mais forte.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi redefinida. Você já pode fazer login.",
      });

      // Redirect to login page
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(
        error.message === 'New password should be different from the old password.'
          ? 'A nova senha deve ser diferente da senha anterior.'
          : 'Erro ao alterar senha. Tente novamente.'
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Força da senha:</span>
                    <span className={passwordStrength >= 70 ? "text-green-600" : passwordStrength >= 40 ? "text-yellow-600" : "text-red-600"}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength} 
                    className="h-2"
                  />
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center gap-2 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                      {checks.length ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Pelo menos 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {checks.lowercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Letra minúscula
                    </div>
                    <div className={`flex items-center gap-2 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {checks.uppercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Letra maiúscula
                    </div>
                    <div className={`flex items-center gap-2 ${checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                      {checks.numbers ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Número
                    </div>
                    <div className={`flex items-center gap-2 ${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                      {checks.special ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Símbolo especial
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite novamente sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  As senhas não coincidem
                </div>
              )}
              
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Senhas coincidem
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || passwordStrength < 60}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Redefinir Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
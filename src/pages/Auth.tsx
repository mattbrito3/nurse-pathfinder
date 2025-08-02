import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Loader2, Eye, EyeOff, Check, AlertCircle, Mail, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SimpleEmailVerification from "@/components/auth/SimpleEmailVerification";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<any>(null);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Validação de email em tempo real
  const emailValidation = useEmailValidation(signupEmail, {
    debounceMs: 800,
    enableRealTime: true
  });

  // Validação de força de senha
  const passwordStrength = usePasswordStrength(signupPassword, {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true,
    checkCommonPasswords: true
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email ou senha incorretos' 
        : 'Erro ao fazer login. Tente novamente.');
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Dose Certa.",
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Enhanced validation
    if (!fullName.trim()) {
      setError('Nome completo é obrigatório.');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido.');
      setIsLoading(false);
      return;
    }

    // Validação de email duplicado
    if (emailValidation.isAvailable === false) {
      setError('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
      setIsLoading(false);
      return;
    }

    // Se ainda está carregando a validação, aguardar
    if (emailValidation.isLoading) {
      setError('Aguarde a verificação do email...');
      setIsLoading(false);
      return;
    }

    // Se não foi possível verificar, tentar novamente
    if (emailValidation.isAvailable === null && emailValidation.isValid) {
      const validationResult = await emailValidation.validateEmail(email);
      if (validationResult.isAvailable === false) {
        setError('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
        setIsLoading(false);
        return;
      }
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    // Validação de força de senha
    if (!passwordStrength.isPasswordValid()) {
      setError('Sua senha não atende aos requisitos mínimos de segurança. Verifique as sugestões abaixo.');
      setIsLoading(false);
      return;
    }

    // Store signup data and show verification
    setPendingSignupData({ email, password, fullName });
    setShowCodeVerification(true);
    setIsLoading(false);
  };

  const handleCodeVerified = async (verifiedEmail: string) => {
    if (!pendingSignupData) return;

    setIsLoading(true);
    try {
      const { email, password, fullName } = pendingSignupData;
      
      const { error } = await signUp(email, password, fullName);

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setError('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
          // Reset da validação de email
          emailValidation.resetValidation();
        } else if (error.message.includes('Password should be at least')) {
          setError('A senha deve ter pelo menos 8 caracteres.');
        } else if (error.message.includes('Invalid email')) {
          setError('Email inválido.');
        } else {
          setError(error.message || 'Erro ao criar conta. Tente novamente.');
        }
        setShowCodeVerification(false);
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao Nurse Pathfinder!",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Erro ao criar conta. Tente novamente.');
      setShowCodeVerification(false);
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showCodeVerification && pendingSignupData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <SimpleEmailVerification
          email={pendingSignupData.email}
          onEmailChange={() => {}} // Not editable at this stage
          onVerified={handleCodeVerified}
          onBack={() => {
            setShowCodeVerification(false);
            setPendingSignupData(null);
          }}
          title="Verificar Email"
          description="Clique no link que enviaremos para seu email"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dose Certa</h1>
          </div>
        </div>

        <Card className="border-border/80 shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Bem-vindo</CardTitle>
            <CardDescription>
              Entre em sua conta ou crie uma nova para acessar todas as funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        required
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
                  </div>
                  <Button 
                    type="submit" 
                    variant="medical" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Entrar
                  </Button>
                </form>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal text-sm text-muted-foreground hover:text-primary"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        disabled={isLoading}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className={`pr-10 ${
                          emailValidation.isAvailable === false 
                            ? 'border-red-500 focus:border-red-500' 
                            : emailValidation.isAvailable === true 
                            ? 'border-green-500 focus:border-green-500'
                            : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailValidation.isLoading && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {emailValidation.isAvailable === true && !emailValidation.isLoading && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {emailValidation.isAvailable === false && !emailValidation.isLoading && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    {emailValidation.message && (
                      <div className={`text-sm ${
                        emailValidation.isAvailable === false 
                          ? 'text-red-600' 
                          : emailValidation.isAvailable === true 
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      }`}>
                        {emailValidation.message}
                      </div>
                    )}
                    {emailValidation.isAvailable === false && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Mudar para aba de login
                            const tabsList = document.querySelector('[role="tablist"]');
                            const signinTab = tabsList?.querySelector('[value="signin"]') as HTMLElement;
                            if (signinTab) signinTab.click();
                          }}
                        >
                          Fazer Login
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/forgot-password')}
                        >
                          Recuperar Senha
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <PasswordStrengthMeter
                      password={signupPassword}
                      onPasswordChange={setSignupPassword}
                      showGenerator={true}
                    />
                    <input
                      type="hidden"
                      name="password"
                      value={signupPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        required
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
                   </div>
                  <Button 
                    type="submit" 
                    variant="medical" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
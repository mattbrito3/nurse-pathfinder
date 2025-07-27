import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Loader2, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmailValidation } from "@/hooks/useEmailValidation";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Email validation for signup
  const { 
    isValidating: isValidatingEmail, 
    isValid: isEmailValid, 
    confidence: emailConfidence,
    error: emailError, 
    suggestion: emailSuggestion,
    warning: emailWarning,
    applySuggestion 
  } = useEmailValidation(signupEmail);

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
    const email = signupEmail; // Use controlled email state
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Enhanced validation
    if (!fullName.trim()) {
      setError('Nome completo é obrigatório.');
      setIsLoading(false);
      return;
    }

    // Validate email before signup
    if (isEmailValid === false) {
      setError(emailError || 'Email inválido.');
      setIsLoading(false);
      return;
    }

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

    // Check password strength
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasLowercase || !hasUppercase || !hasNumbers) {
      setError('A senha deve conter pelo menos: uma letra maiúscula, uma minúscula e um número.');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (error.message.includes('Password should be at least')) {
        setError('A senha deve ter pelo menos 8 caracteres.');
      } else if (error.message.includes('Invalid email')) {
        setError('Email inválido.');
      } else {
        setError(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });
      navigate('/');
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

        <Card className="border-border/50 shadow-card">
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
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className={`pr-10 ${
                          isEmailValid === true ? 'border-green-500 focus:border-green-500' :
                          isEmailValid === false ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {/* Validation icons */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isValidatingEmail && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        )}
                        {!isValidatingEmail && isEmailValid === true && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {!isValidatingEmail && isEmailValid === false && signupEmail.includes('@') && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* Email validation feedback */}
                    {emailError && !isValidatingEmail && (
                      <div className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {emailError}
                      </div>
                    )}
                    
                    {/* Email suggestion */}
                    {emailSuggestion && !isValidatingEmail && (
                      <div className="text-sm">
                        <span className="text-amber-600">{emailSuggestion}</span>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 ml-2 text-blue-600"
                          onClick={() => setSignupEmail(applySuggestion())}
                        >
                          Usar sugestão
                        </Button>
                      </div>
                    )}
                    
                    {isEmailValid === true && !isValidatingEmail && (
                      <div className="space-y-1">
                        <div className={`text-sm flex items-center gap-1 ${
                          emailConfidence === 'high' ? 'text-green-600' : 
                          emailConfidence === 'medium' ? 'text-yellow-600' : 'text-orange-600'
                        }`}>
                          <Check className="h-3 w-3" />
                          Email válido {emailConfidence === 'high' ? '(Alta confiança)' : 
                                        emailConfidence === 'medium' ? '(Média confiança)' : '(Baixa confiança)'}
                        </div>
                        {emailWarning && (
                          <div className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {emailWarning}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9)"
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
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  User,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationStep {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const EmailVerificationDebug = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<VerificationStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addStep = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setSteps(prev => [...prev, { step, status, message, data }]);
  };

  const updateLastStep = (status: 'success' | 'error', message: string, data?: any) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (newSteps.length > 0) {
        newSteps[newSteps.length - 1] = {
          ...newSteps[newSteps.length - 1],
          status,
          message,
          data
        };
      }
      return newSteps;
    });
  };

  const runVerificationTest = async () => {
    if (!email || !fullName || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSteps([]);

    try {
      // Passo 1: Verificar se email já existe
      addStep('Verificação de Email', 'pending', 'Verificando se o email já está cadastrado...');
      
      const { data: existingUser, error: checkError } = await supabase.rpc('debug_user_status', {
        p_email: email
      });

      if (checkError) {
        updateLastStep('error', `Erro ao verificar email: ${checkError.message}`);
        return;
      }

      if (existingUser?.[0]?.exists_in_auth) {
        updateLastStep('error', 'Email já está cadastrado no sistema');
        return;
      }

      updateLastStep('success', 'Email disponível para cadastro');

      // Passo 2: Criar token de verificação
      addStep('Criação de Token', 'pending', 'Criando token de verificação...');
      
      const { data: tokenData, error: tokenError } = await supabase.rpc('create_email_verification_token_with_user_data', {
        p_email: email,
        p_password: password,
        p_full_name: fullName
      });

      if (tokenError) {
        updateLastStep('error', `Erro ao criar token: ${tokenError.message}`);
        return;
      }

      updateLastStep('success', 'Token de verificação criado com sucesso', tokenData?.[0]);

      // Passo 3: Simular verificação do token
      addStep('Verificação do Token', 'pending', 'Verificando token...');
      
      const token = tokenData?.[0]?.token;
      if (!token) {
        updateLastStep('error', 'Token não foi gerado corretamente');
        return;
      }

                   const { data: verificationResult, error: verificationError } = await supabase.rpc('verify_email_token_and_create_user', {
               p_token: token
             });
       
             if (verificationError) {
               updateLastStep('error', `Erro na verificação: ${verificationError.message}`);
               return;
             }
       
             const result = verificationResult?.[0];
             if (result?.success) {
               updateLastStep('success', 'Token verificado com sucesso', result);
               
               // Agora criar o usuário usando Edge Function
               addStep('Criação do Usuário', 'pending', 'Criando usuário via Edge Function...');
               
               const { data: userData, error: userError } = await supabase.functions.invoke('create-user-after-verification', {
                 body: {
                   email: email,
                   password: password,
                   fullName: fullName
                 }
               });
               
               if (userError) {
                 updateLastStep('error', `Erro ao criar usuário: ${userError.message}`);
                 return;
               }
               
               if (userData?.success) {
                 updateLastStep('success', 'Usuário criado com sucesso via Edge Function', userData);
               } else {
                 updateLastStep('error', userData?.error || 'Falha ao criar usuário');
                 return;
               }
             } else {
               updateLastStep('error', result?.message || 'Falha na verificação do token');
               return;
             }

      // Passo 4: Verificar se usuário foi criado
      addStep('Verificação Final', 'pending', 'Verificando se usuário foi criado corretamente...');
      
      const { data: finalCheck, error: finalError } = await supabase.rpc('debug_user_status', {
        p_email: email
      });

      if (finalError) {
        updateLastStep('error', `Erro na verificação final: ${finalError.message}`);
        return;
      }

      const userData = finalCheck?.[0];
      if (userData?.exists_in_auth && userData?.email_confirmed) {
        updateLastStep('success', 'Usuário criado e confirmado com sucesso!', userData);
        
        toast({
          title: "Teste concluído!",
          description: "Fluxo de verificação funcionando corretamente.",
        });
      } else {
        updateLastStep('error', 'Usuário não foi criado ou confirmado corretamente', userData);
      }

    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setError(error.message || 'Erro durante o teste');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSteps([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Teste de Verificação de Email
          </CardTitle>
          <CardDescription>
            Teste completo do fluxo de verificação de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="debug-email">Email</Label>
              <Input
                id="debug-email"
                type="email"
                placeholder="teste@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="debug-name">Nome Completo</Label>
              <Input
                id="debug-name"
                type="text"
                placeholder="Nome do Usuário"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="debug-password">Senha</Label>
              <Input
                id="debug-password"
                type="password"
                placeholder="Senha123!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={runVerificationTest}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Executar Teste
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="outline"
              disabled={isLoading}
            >
              Limpar Resultados
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Resultados do Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  {step.status === 'pending' && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
                  {step.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {step.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  
                  <span className="font-medium">{step.step}</span>
                  
                  <Badge variant={
                    step.status === 'success' ? 'default' : 
                    step.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {step.status === 'pending' ? 'Processando' :
                     step.status === 'success' ? 'Sucesso' : 'Erro'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground ml-6">
                  {step.message}
                </p>
                
                {step.data && (
                  <div className="ml-6 bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {index < steps.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailVerificationDebug; 
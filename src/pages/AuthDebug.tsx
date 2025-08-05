import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  User, 
  Mail, 
  Shield, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EmailVerificationDebug from '@/components/auth/EmailVerificationDebug';

interface UserDebugInfo {
  email: string;
  existsInAuth: boolean;
  existsInVerification: boolean;
  isVerified: boolean;
  authUser?: any;
  verificationRecord?: any;
}

const AuthDebug = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<UserDebugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkEmailStatus = async () => {
    if (!email) {
      setError('Por favor, insira um email');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('🔍 Verificando status do email:', email);

      // 1. Usar função RPC para verificar status do usuário
      const { data: userStatus, error: userStatusError } = await supabase.rpc('debug_user_status', {
        p_email: email
      });

      if (userStatusError) {
        console.error('❌ Erro ao verificar status do usuário:', userStatusError);
      }

      // 2. Usar função RPC para verificar registros de verificação
      const { data: verificationRecords, error: verificationError } = await supabase.rpc('debug_verification_records', {
        p_email: email
      });

      if (verificationError) {
        console.error('❌ Erro ao verificar registros de verificação:', verificationError);
      }

      // 3. Usar função RPC para verificação completa
      const { data: rpcResult, error: rpcError } = await supabase.rpc('check_email_exists', {
        p_email: email
      });

      if (rpcError) {
        console.error('❌ Erro na função RPC:', rpcError);
      }

      console.log('📊 Resultados da verificação:', {
        userStatus: userStatus?.[0],
        verificationRecords,
        rpcResult
      });

      const userStatusData = userStatus?.[0];
      const debugData: UserDebugInfo = {
        email,
        existsInAuth: userStatusData?.exists_in_auth || false,
        existsInVerification: verificationRecords && verificationRecords.length > 0,
        isVerified: userStatusData?.email_confirmed || false,
        authUser: userStatusData,
        verificationRecord: verificationRecords?.[0]
      };

      setDebugInfo(debugData);

      toast({
        title: "Verificação concluída",
        description: "Status do email verificado com sucesso.",
      });

    } catch (error: any) {
      console.error('❌ Erro na verificação:', error);
      setError(error.message || 'Erro ao verificar email');
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    if (!email) {
      setError('Por favor, insira um email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simular tentativa de login com senha temporária
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'temp_password_test'
      });

      if (error) {
        console.log('🔍 Resultado do teste de login:', error.message);
        setError(`Teste de login: ${error.message}`);
      } else {
        toast({
          title: "Login bem-sucedido!",
          description: "O usuário conseguiu fazer login.",
        });
      }

    } catch (error: any) {
      console.error('❌ Erro no teste de login:', error);
      setError(error.message || 'Erro no teste de login');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    if (!email) {
      setError('Por favor, insira um email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🧪 Criando usuário de teste...');

      const { data, error } = await supabase.functions.invoke('create-confirmed-user', {
        body: {
          email,
          password: 'TestPassword123!',
          fullName: 'Usuário de Teste'
        }
      });

      if (error) {
        console.error('❌ Erro ao criar usuário de teste:', error);
        setError(`Erro ao criar usuário: ${error.message}`);
      } else {
        console.log('✅ Usuário de teste criado:', data);
        toast({
          title: "Usuário criado!",
          description: "Usuário de teste criado com sucesso.",
        });
        
        // Recarregar informações
        await checkEmailStatus();
      }

    } catch (error: any) {
      console.error('❌ Erro ao criar usuário de teste:', error);
      setError(error.message || 'Erro ao criar usuário de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const forceConfirmEmail = async () => {
    if (!email) {
      setError('Por favor, insira um email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔧 Forçando confirmação de email...');

      const { data, error } = await supabase.rpc('force_confirm_user_email', {
        p_email: email
      });

      if (error) {
        console.error('❌ Erro ao forçar confirmação:', error);
        setError(`Erro ao forçar confirmação: ${error.message}`);
      } else {
        const result = data?.[0];
        if (result?.success) {
          console.log('✅ Email confirmado com sucesso:', result);
          toast({
            title: "Email confirmado!",
            description: result.message,
          });
          
          // Recarregar informações
          await checkEmailStatus();
        } else {
          setError(result?.message || 'Erro ao confirmar email');
        }
      }

    } catch (error: any) {
      console.error('❌ Erro ao forçar confirmação:', error);
      setError(error.message || 'Erro ao forçar confirmação');
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateConfirmedUser = async () => {
    if (!email) {
      setError('Digite um email para testar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🧪 Testando Edge Function create-confirmed-user...');
      
      const { data, error } = await supabase.functions.invoke('create-confirmed-user', {
        body: {
          email: email,
          password: 'Teste123!',
          fullName: 'Usuário Teste'
        }
      });

      console.log('📡 Resposta:', { data, error });

      if (error) {
        setError(`Erro na Edge Function: ${error.message}`);
        return;
      }

      if (data.error) {
        setError(`Erro retornado: ${data.error}`);
        return;
      }

      toast({
        title: "Teste bem-sucedido!",
        description: "Edge Function create-confirmed-user funcionando.",
      });

      // Atualizar status do usuário
      await checkEmailStatus();

    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setError(error.message || 'Erro durante o teste');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Debug de Autenticação
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ferramenta para investigar problemas de autenticação
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Verificar Status do Email
            </CardTitle>
            <CardDescription>
              Insira um email para verificar seu status no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={checkEmailStatus}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Verificar
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Resultados da Verificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Auth Users:</span>
                  <Badge variant={debugInfo.existsInAuth ? "default" : "secondary"}>
                    {debugInfo.existsInAuth ? "Existe" : "Não existe"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Verificação:</span>
                  <Badge variant={debugInfo.existsInVerification ? "default" : "secondary"}>
                    {debugInfo.existsInVerification ? "Existe" : "Não existe"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Verificado:</span>
                  <Badge variant={debugInfo.isVerified ? "default" : "destructive"}>
                    {debugInfo.isVerified ? "Sim" : "Não"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {debugInfo.authUser && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados do Auth User
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(debugInfo.authUser, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {debugInfo.verificationRecord && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Dados da Verificação
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(debugInfo.verificationRecord, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={testLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Testar Login
                </Button>
                
                <Button 
                  onClick={createTestUser}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Criar Usuário de Teste
                </Button>

                <Button 
                  onClick={forceConfirmEmail}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Forçar Confirmação
                </Button>

                <Button 
                  onClick={testCreateConfirmedUser}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Testar create-confirmed-user
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <EmailVerificationDebug />
      </div>
    </div>
  );
};

export default AuthDebug; 
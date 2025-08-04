import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não fornecido');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      console.log('🔄 Verificando token:', verificationToken.substring(0, 8) + '...');
      
      // Verificação usando função RPC customizada
      const { data, error } = await supabase.rpc('verify_email_token', {
        p_token: verificationToken
      }).single();

      if (error) {
        console.error('❌ Verification Error:', error);
        setStatus('error');
        setMessage('Erro ao verificar email. Tente novamente mais tarde.');
        setEmail('');
        return;
      }

      console.log('📧 Verification result:', data);

      if (data.success) {
        setStatus('success');
        setMessage('Email verificado com sucesso! Redirecionando para concluir cadastro...');
        setEmail(data.email);
        
        toast({
          title: "Email verificado!",
          description: "Redirecionando para concluir o cadastro...",
        });
        
        // Redirecionar automaticamente para registro com email verificado
        setTimeout(() => {
          navigate(`/register?email_verified=true&verified_email=${encodeURIComponent(data.email)}`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message);
        setEmail(data.email || '');
      }
      
    } catch (error: any) {
      console.error('❌ Error verifying email:', error);
      setStatus('error');
      setMessage('Erro ao verificar email. Tente novamente mais tarde.');
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  const handleRequestNewVerification = () => {
    if (email) {
      navigate(`/auth?email=${encodeURIComponent(email)}&action=verify`);
    } else {
      navigate('/auth');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Verificando Email</CardTitle>
            <CardDescription>
              Aguarde enquanto verificamos seu email...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Email Verificado!</CardTitle>
            <CardDescription>
              Seu email foi confirmado com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                {message}
              </AlertDescription>
            </Alert>

            {email && (
              <div className="text-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 inline mr-2" />
                {email}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/register')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Concluir Cadastro
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Erro na Verificação</CardTitle>
          <CardDescription>
            Não foi possível verificar seu email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

          {email && (
            <div className="text-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 inline mr-2" />
              {email}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleRequestNewVerification}
              className="w-full"
            >
              Solicitar Nova Verificação
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processando callback de autenticação...');
        
        // Obter a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          setStatus('error');
          setMessage('Erro ao processar autenticação. Tente novamente.');
          return;
        }

        if (session?.user) {
          console.log('✅ Usuário autenticado:', session.user.email);
          setStatus('success');
          setMessage('Email verificado com sucesso! Redirecionando...');
          
          // Aguardar um pouco para mostrar a mensagem
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          console.log('❌ Nenhuma sessão encontrada');
          setStatus('error');
          setMessage('Link de verificação inválido ou expirado.');
        }
      } catch (error) {
        console.error('❌ Erro no callback:', error);
        setStatus('error');
        setMessage('Erro inesperado. Tente novamente.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/80 shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">
            Verificação de Email
          </CardTitle>
          <CardDescription>
            Processando sua verificação...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Verificando seu email...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-green-600 font-medium">
                {message}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 font-medium">
                {message}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/register')}
                >
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                >
                  Fazer Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 
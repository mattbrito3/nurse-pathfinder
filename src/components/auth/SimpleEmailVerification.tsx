import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimpleEmailVerificationProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerified: (email: string) => void;
  onBack?: () => void;
  title?: string;
  description?: string;
}

const SimpleEmailVerification: React.FC<SimpleEmailVerificationProps> = ({
  email,
  onEmailChange,
  onVerified,
  onBack,
  title = "Verificar Email",
  description = "Enviaremos um link de verificação para seu email"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const sendVerificationEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Por favor, digite um email válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Sending verification email to:', email);
      
      // Call our custom Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email,
          name: 'Usuário'
        }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Erro ao enviar email');
      }

      console.log('✅ Email verification response:', data);

      if (data.success) {
        setEmailSent(true);
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada e clique no link de verificação.",
          duration: 10000
        });

        // Show development info
        if (data.developmentNote) {
          console.log('🔗 VERIFICAÇÃO DE EMAIL (DESENVOLVIMENTO):');
          console.log('Link direto:', data.verificationUrl);
          console.log('Token:', data.token);
          console.log('Expira em:', new Date(data.expiresAt).toLocaleString('pt-BR'));
          
          toast({
            title: "🔧 Modo Desenvolvimento",
            description: `Link direto disponível no console. Token: ${data.token}`,
            duration: 15000
          });
        }
      } else {
        throw new Error(data.message || 'Erro ao enviar email de verificação');
      }

    } catch (error: any) {
      console.error('❌ Error sending verification email:', error);
      setError(error.message || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    sendVerificationEmail();
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email Enviado!</CardTitle>
          <CardDescription>
            Enviamos um link de verificação para:<br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Verifique sua caixa de entrada e clique no link para confirmar seu email.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Não recebeu o email?
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Reenviar Email
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setError(null);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Alterar Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={sendVerificationEmail}
          className="w-full"
          disabled={isLoading || !email.includes('@')}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Enviar Link de Verificação
            </>
          )}
        </Button>

        {onBack && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleEmailVerification;
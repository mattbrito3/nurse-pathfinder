import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendVerificationEmailReal } from '@/services/resendEmailService';

interface EmailVerificationProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerified: (email: string) => void;
  onBack?: () => void;
  title?: string;
  description?: string;
  startWithCode?: boolean; // Start directly with code step
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onEmailChange,
  onVerified,
  onBack,
  title = "Verificar Email",
  description = "Digite seu email e confirme com o código enviado",
  startWithCode = false
}) => {
  const [step, setStep] = useState<'email' | 'code'>(startWithCode ? 'code' : 'email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState<string>('');
  const { toast } = useToast();
  
  // Refs for code inputs
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send code if starting with code step
  useEffect(() => {
    if (startWithCode && email && step === 'code' && !verificationId) {
      sendVerificationCode();
    }
  }, [startWithCode, email, step]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Generate 6-digit verification code
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send verification code via email
  const sendVerificationCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const verificationCode = generateVerificationCode();
      const newVerificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store verification data in localStorage (in production, use secure backend)
      const verificationData = {
        email: email,
        code: verificationCode,
        timestamp: Date.now(),
        id: newVerificationId,
        attempts: 0
      };
      
      localStorage.setItem(`email_verification_${newVerificationId}`, JSON.stringify(verificationData));
      
      // 📧 SEND REAL EMAIL TO INBOX USING RESEND
      const resendResult = await sendVerificationEmailReal(email, verificationCode);
      
      if (resendResult.success) {
        // 🎉 SUCCESS! Real email sent to inbox!
        toast({
          title: "📧 Email enviado com sucesso!",
          description: `Verifique sua caixa de entrada (${email}) para o código de verificação.`,
          duration: 8000
        });
        
        console.log(`✅ REAL EMAIL SENT TO INBOX!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Code: ${verificationCode}`);
        console.log(`📨 Method: ${resendResult.method}`);
        if (resendResult.emailId) {
          console.log(`📧 Email ID: ${resendResult.emailId}`);
        }
      } else {
        // Fallback notification
        console.warn('Resend failed:', resendResult.error);
        
        toast({
          title: "⚠️ Problema no envio",
          description: `Erro: ${resendResult.error}. Tente novamente ou use outro email.`,
          duration: 10000
        });
      }

      setVerificationId(newVerificationId);
      setStep('code');
      setCountdown(60); // 60 second cooldown
      
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      setError('Erro ao enviar código. Tente novamente.');
    }

    setIsLoading(false);
  };

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  // Handle backspace in code input
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  // Verify the entered code
  const verifyCode = async (enteredCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const storedDataKey = `email_verification_${verificationId}`;
      const storedData = localStorage.getItem(storedDataKey);
      
      if (!storedData) {
        setError('Código expirado. Solicite um novo código.');
        setIsLoading(false);
        return;
      }

      const verificationData = JSON.parse(storedData);
      
      // Check if code is expired (10 minutes)
      const isExpired = Date.now() - verificationData.timestamp > 10 * 60 * 1000;
      if (isExpired) {
        localStorage.removeItem(storedDataKey);
        setError('Código expirado. Solicite um novo código.');
        setIsLoading(false);
        return;
      }

      // Check if too many attempts
      if (verificationData.attempts >= 3) {
        localStorage.removeItem(storedDataKey);
        setError('Muitas tentativas. Solicite um novo código.');
        setIsLoading(false);
        return;
      }

      // Verify code
      if (enteredCode === verificationData.code) {
        // Success!
        localStorage.removeItem(storedDataKey);
        toast({
          title: "Email verificado!",
          description: "Seu email foi confirmado com sucesso.",
        });
        onVerified(email);
      } else {
        // Wrong code
        verificationData.attempts += 1;
        localStorage.setItem(storedDataKey, JSON.stringify(verificationData));
        
        const attemptsLeft = 3 - verificationData.attempts;
        setError(`Código incorreto. ${attemptsLeft} tentativa(s) restante(s).`);
        
        // Clear code inputs
        setCode(['', '', '', '', '', '']);
        codeRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Erro ao verificar código. Tente novamente.');
    }

    setIsLoading(false);
  };

  // Email step
  if (step === 'email') {
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
            onClick={sendVerificationCode}
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
                Enviar Código de Verificação
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
  }

  // Code verification step
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Verificar Código</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos enviado para:<br />
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Código de Verificação</Label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (codeRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Não recebeu o código?
          </p>
          
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Reenviar em {countdown}s
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStep('email');
                setCode(['', '', '', '', '', '']);
                setError(null);
              }}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reenviar Código
            </Button>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setStep('email');
              setCode(['', '', '', '', '', '']);
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
};

export default EmailVerification;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Loader2, CheckCircle, AlertCircle, Bug, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailDebugPanelProps {
  email: string;
  onClose: () => void;
}

const EmailDebugPanel: React.FC<EmailDebugPanelProps> = ({ email, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const runDebugTest = async () => {
    setIsLoading(true);
    setDebugInfo(null);

    try {
      console.log('🔍 Iniciando debug de email para:', email);
      
      // Teste 1: Verificar se a Edge Function responde
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email,
          name: 'Debug Test'
        }
      });
      const responseTime = Date.now() - startTime;

      const debugData = {
        timestamp: new Date().toISOString(),
        email: email,
        responseTime: responseTime,
        hasError: !!error,
        error: error,
        response: data,
        environment: {
          isDevelopment: import.meta.env.DEV,
          origin: window.location.origin,
          userAgent: navigator.userAgent
        }
      };

      setDebugInfo(debugData);
      
      if (error) {
        toast({
          title: "❌ Erro no Debug",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Debug Concluído",
          description: `Resposta em ${responseTime}ms`,
        });
      }

    } catch (error: any) {
      console.error('❌ Erro no debug:', error);
      setDebugInfo({
        timestamp: new Date().toISOString(),
        email: email,
        hasError: true,
        error: error.message,
        environment: {
          isDevelopment: import.meta.env.DEV,
          origin: window.location.origin,
          userAgent: navigator.userAgent
        }
      });
      
      toast({
        title: "❌ Erro no Debug",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyDebugInfo = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      toast({
        title: "📋 Copiado!",
        description: "Informações de debug copiadas para a área de transferência",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-orange-600" />
            <CardTitle>Debug de Email</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
        <CardDescription>
          Ferramenta para diagnosticar problemas no envio de emails
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email para Teste</Label>
          <Input value={email} disabled />
        </div>

        <Button 
          onClick={runDebugTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando Debug...
            </>
          ) : (
            <>
              <Bug className="mr-2 h-4 w-4" />
              Executar Teste de Debug
            </>
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resultado do Debug</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <>
                      <EyeOff className="mr-1 h-4 w-4" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1 h-4 w-4" />
                      Detalhes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDebugInfo}
                >
                  📋 Copiar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={debugInfo.hasError ? "destructive" : "default"}>
                  {debugInfo.hasError ? "❌ Erro" : "✅ Sucesso"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tempo de Resposta</Label>
                <Badge variant="outline">
                  {debugInfo.responseTime}ms
                </Badge>
              </div>
            </div>

            {debugInfo.hasError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro:</strong> {debugInfo.error}
                </AlertDescription>
              </Alert>
            )}

            {debugInfo.response && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Resposta:</strong> {debugInfo.response.message}
                  {debugInfo.response.developmentNote && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {debugInfo.response.developmentNote}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {showDetails && (
              <div className="space-y-4">
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Informações Detalhadas</Label>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Próximos Passos</Label>
                                     <div className="text-sm space-y-1">
                     <p>• Verifique se a NEW_API_KEY_RESEND está configurada no Supabase</p>
                     <p>• Confirme se o domínio está verificado no Resend</p>
                     <p>• Verifique os logs da Edge Function no dashboard do Supabase</p>
                     <p>• Teste com um email diferente para descartar problemas de spam</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailDebugPanel; 

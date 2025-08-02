import { useState } from 'react';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Loader2 } from 'lucide-react';

export function EmailValidationTest() {
  const [testEmail, setTestEmail] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const emailValidation = useEmailValidation(testEmail, {
    debounceMs: 500,
    enableRealTime: true
  });

  const runTests = async () => {
    const tests = [
      { email: 'test@example.com', description: 'Email válido genérico' },
      { email: 'user@dosecerta.online', description: 'Email do domínio da aplicação' },
      { email: 'invalid-email', description: 'Email inválido' },
      { email: 'test@', description: 'Email incompleto' },
      { email: '@example.com', description: 'Email sem usuário' },
      { email: '', description: 'Email vazio' }
    ];

    const results = [];
    
    for (const test of tests) {
      setTestEmail(test.email);
      
      // Aguardar a validação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      results.push({
        email: test.email,
        description: test.description,
        result: { ...emailValidation }
      });
    }

    setTestResults(results);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Validação de Email</CardTitle>
          <CardDescription>
            Teste a funcionalidade de validação de email em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email para Teste</Label>
            <div className="relative">
              <Input
                id="test-email"
                type="email"
                placeholder="Digite um email para testar"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
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
          </div>

          <Button onClick={runTests} className="w-full">
            Executar Testes Automatizados
          </Button>

          <div className="space-y-2">
            <h4 className="font-medium">Status da Validação:</h4>
            <div className="text-sm space-y-1">
              <div>Válido: {emailValidation.isValid ? '✅' : '❌'}</div>
              <div>Disponível: {emailValidation.isAvailable === null ? '⏳' : emailValidation.isAvailable ? '✅' : '❌'}</div>
              <div>Carregando: {emailValidation.isLoading ? '🔄' : '⏸️'}</div>
              <div>Erro: {emailValidation.error || 'Nenhum'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium">{result.description}</div>
                  <div className="text-sm text-muted-foreground">Email: {result.email}</div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>Válido: {result.result.isValid ? '✅' : '❌'}</div>
                    <div>Disponível: {result.result.isAvailable === null ? '⏳' : result.result.isAvailable ? '✅' : '❌'}</div>
                    <div>Mensagem: {result.result.message}</div>
                    {result.result.error && (
                      <div className="text-red-600">Erro: {result.result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
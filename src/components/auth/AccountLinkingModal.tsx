import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AccountLinkingModalProps {
  email: string;
  googleUser: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountLinkingModal({ 
  email, 
  googleUser, 
  onSuccess, 
  onCancel 
}: AccountLinkingModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleLinkAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Primeiro, tentar fazer login com email/senha para validar
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError('Senha incorreta. Tente novamente.');
        setIsLoading(false);
        return;
      }

      // Se o login foi bem-sucedido, vincular a conta Google
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          google_id: googleUser.id,
          auth_providers: ['email', 'google']
        }
      });

      if (updateError) {
        setError('Erro ao vincular contas. Tente novamente.');
        setIsLoading(false);
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Account linking error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Vincular Contas</CardTitle>
          <CardDescription>
            Este email já possui uma conta. Digite sua senha para vincular com o Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>{email}</strong> já está cadastrado em nossa plataforma.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLinkAccounts} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha da conta existente</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="medical"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Vincular Contas
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Após vincular, você poderá fazer login com qualquer método.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
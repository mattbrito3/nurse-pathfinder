import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSetupModalProps {
  email: string;
  googleName: string;
  onComplete: (finalName: string) => void;
}

export function ProfileSetupModal({ 
  email, 
  googleName, 
  onComplete 
}: ProfileSetupModalProps) {
  const [fullName, setFullName] = useState(googleName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validateName = (name: string) => {
    const trimmed = name.trim();
    setIsValid(trimmed.length >= 2 && trimmed.length <= 100);
  };

  const handleNameChange = (value: string) => {
    setFullName(value);
    validateName(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim()
        }
      });

      if (updateError) {
        setError('Erro ao atualizar perfil. Tente novamente.');
        setIsLoading(false);
        return;
      }

      onComplete(fullName.trim());
    } catch (error) {
      console.error('Profile setup error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Configurar Perfil</CardTitle>
          <CardDescription>
            Personalize seu nome para usar na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>{email}</strong> - Login realizado com Google
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className={`pr-10 ${
                      fullName.trim() && isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : fullName.trim() && !isValid
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {fullName.trim() && isValid && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {fullName.trim() && !isValid && (
                    <span className="text-red-600">
                      Nome deve ter entre 2 e 100 caracteres
                    </span>
                  )}
                  {fullName.trim() && isValid && (
                    <span className="text-green-600">
                      Nome válido ✓
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="medical"
                className="w-full"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Continuar
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Você pode alterar seu nome a qualquer momento no perfil.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

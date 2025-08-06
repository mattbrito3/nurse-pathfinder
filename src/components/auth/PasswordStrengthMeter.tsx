import React, { useState } from 'react';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  onPasswordChange: (password: string) => void;
  showGenerator?: boolean;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  onPasswordChange,
  showGenerator = true,
  className = ''
}: PasswordStrengthMeterProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    score,
    level,
    color,
    isPasswordValid
  } = usePasswordStrength(password);

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    onPasswordChange(newPassword);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Função para gerar senha forte (simplificada)
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    // Garantir pelo menos um de cada tipo
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    result += '0123456789'[Math.floor(Math.random() * 10)];
    result += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Adicionar caracteres aleatórios para completar
    for (let i = 4; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Embaralhar a senha
    return result.split('').sort(() => Math.random() - 0.5).join('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Campo de Senha */}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Digite sua senha..."
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showGenerator && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGeneratePassword}
              className="h-8 w-8 p-0 hover:bg-muted"
              title="Gerar senha forte"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePasswordVisibility}
            className="h-8 w-8 p-0 hover:bg-muted"
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Barra de Força - Apenas quando há senha */}
      {password && (
        <div className="space-y-1">
          <Progress 
            value={score} 
            className="h-1.5"
            style={{
              '--progress-background': color
            } as React.CSSProperties}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{level.toLowerCase()}</span>
            <span>{score}%</span>
          </div>
        </div>
      )}
    </div>
  );
} 

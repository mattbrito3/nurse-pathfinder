import { useState, useEffect, useCallback } from 'react';

interface PasswordStrength {
  score: number;
  level: 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito Forte';
  color: string;
  emoji: string;
  feedback: string[];
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
    noCommon: boolean;
  };
}

interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecial?: boolean;
  checkCommonPasswords?: boolean;
}

// Senhas comuns a serem evitadas (movido para fora do hook para evitar recriação)
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  'qwerty', 'abc123', '111111', '123123', 'admin',
  'letmein', 'welcome', 'monkey', '1234567', '1234567890',
  'senha', '123456789', 'qwerty123', 'password123', 'admin123'
];

export function usePasswordStrength(
  password: string,
  options: PasswordStrengthOptions = {}
) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true,
    checkCommonPasswords = true
  } = options;

  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    level: 'Muito Fraca',
    color: '#dc3545',
    emoji: '❌',
    feedback: [],
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
      noCommon: false
    }
  });

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];
    
    // Critérios básicos
    const hasLength = password.length >= minLength;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isNotCommon = !COMMON_PASSWORDS.includes(password.toLowerCase());

    // Pontuação por comprimento
    if (hasLength) {
      score += 20;
      feedback.push('✅ Comprimento adequado');
      
      if (password.length >= 12) {
        score += 10;
        feedback.push('✅ Comprimento excelente');
      }
    } else {
      feedback.push(`❌ Muito curta (mínimo ${minLength} caracteres)`);
    }

    // Pontuação por tipos de caracteres
    if (hasUppercase) {
      score += 15;
      feedback.push('✅ Contém maiúsculas');
    } else if (requireUppercase) {
      feedback.push('❌ Falta letra maiúscula');
    }

    if (hasLowercase) {
      score += 15;
      feedback.push('✅ Contém minúsculas');
    } else if (requireLowercase) {
      feedback.push('❌ Falta letra minúscula');
    }

    if (hasNumber) {
      score += 15;
      feedback.push('✅ Contém números');
    } else if (requireNumbers) {
      feedback.push('❌ Falta número');
    }

    if (hasSpecial) {
      score += 15;
      feedback.push('✅ Contém caracteres especiais');
    } else if (requireSpecial) {
      feedback.push('❌ Falta caractere especial');
    }

    // Bônus por complexidade
    if (hasLength && hasUppercase && hasLowercase && hasNumber) {
      score += 10;
      feedback.push('✅ Combinação complexa');
    }

    // Penalidade por senhas comuns
    if (!isNotCommon && checkCommonPasswords) {
      score -= 50;
      feedback.push('❌ Senha muito comum');
    }

    // Penalidade por padrões simples
    if (/(.)\1{2,}/.test(password)) {
      score -= 20;
      feedback.push('❌ Muitos caracteres repetidos');
    }

    // Penalidade por sequências
    if (/123|abc|qwe|asd|zxc/.test(password.toLowerCase())) {
      score -= 15;
      feedback.push('❌ Sequência muito simples');
    }

    // Limitar score entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Determinar nível de força
    let level: PasswordStrength['level'];
    let color: string;
    let emoji: string;

    if (score < 30) {
      level = 'Muito Fraca';
      color = '#dc3545';
      emoji = '❌';
    } else if (score < 50) {
      level = 'Fraca';
      color = '#fd7e14';
      emoji = '⚠️';
    } else if (score < 70) {
      level = 'Média';
      color = '#ffc107';
      emoji = '⚡';
    } else if (score < 90) {
      level = 'Forte';
      color = '#28a745';
      emoji = '✅';
    } else {
      level = 'Muito Forte';
      color = '#20c997';
      emoji = '🛡️';
    }

    return {
      score,
      level,
      color,
      emoji,
      feedback,
      criteria: {
        length: hasLength,
        uppercase: hasUppercase,
        lowercase: hasLowercase,
        number: hasNumber,
        special: hasSpecial,
        noCommon: isNotCommon
      }
    };
  }, [minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecial, checkCommonPasswords]);

  // Atualizar força quando a senha mudar
  useEffect(() => {
    if (password) {
      const newStrength = calculatePasswordStrength(password);
      setStrength(newStrength);
    } else {
      setStrength({
        score: 0,
        level: 'Muito Fraca',
        color: '#dc3545',
        emoji: '❌',
        feedback: [],
        criteria: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
          noCommon: false
        }
      });
    }
  }, [password]); // Removido calculatePasswordStrength das dependências

  // Função para verificar se a senha atende aos requisitos mínimos
  const isPasswordValid = useCallback(() => {
    return strength.score >= 70; // Senha forte ou muito forte
  }, [strength.score]);

  // Função para obter sugestões de melhoria
  const getSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (!strength.criteria.length) {
      suggestions.push(`Adicione pelo menos ${minLength} caracteres`);
    }
    
    if (!strength.criteria.uppercase && requireUppercase) {
      suggestions.push('Adicione pelo menos uma letra maiúscula');
    }
    
    if (!strength.criteria.lowercase && requireLowercase) {
      suggestions.push('Adicione pelo menos uma letra minúscula');
    }
    
    if (!strength.criteria.number && requireNumbers) {
      suggestions.push('Adicione pelo menos um número');
    }
    
    if (!strength.criteria.special && requireSpecial) {
      suggestions.push('Adicione pelo menos um caractere especial (!@#$%^&*)');
    }
    
    if (!strength.criteria.noCommon && checkCommonPasswords) {
      suggestions.push('Evite senhas comuns como "123456" ou "password"');
    }
    
    return suggestions;
  }, [strength.criteria, minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecial, checkCommonPasswords]);

  // Função para gerar sugestão de senha forte
  const generateStrongPassword = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    // Garantir pelo menos um de cada tipo
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Maiúscula
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
    result += '0123456789'[Math.floor(Math.random() * 10)]; // Número
    result += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Especial
    
    // Adicionar caracteres aleatórios para completar
    for (let i = 4; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Embaralhar a senha
    return result.split('').sort(() => Math.random() - 0.5).join('');
  }, []);

  return {
    strength,
    isPasswordValid,
    getSuggestions,
    generateStrongPassword,
    // Propriedades úteis
    score: strength.score,
    level: strength.level,
    color: strength.color,
    emoji: strength.emoji,
    feedback: strength.feedback,
    criteria: strength.criteria
  };
} 
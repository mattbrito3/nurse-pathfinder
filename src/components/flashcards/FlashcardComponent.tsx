import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  RotateCcw, 
  Clock, 
  Star,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  category_name: string;
  difficulty_level: number;
  mastery_level?: number; // For backward compatibility
  times_seen?: number; // For backward compatibility
  progress?: {
    mastery_level: number;
    times_seen: number;
  } | null;
}

interface FlashcardComponentProps {
  flashcard: FlashcardData;
  onResponse: (quality: number, responseTime: number) => void;
  isLoading?: boolean;
  sessionProgress?: {
    current: number;
    total: number;
    correct: number;
    incorrect: number;
  };
}

const qualityButtons = [
  { value: 0, label: 'Blackout', color: 'bg-red-600 hover:bg-red-700', icon: XCircle, description: 'Não lembrei' },
  { value: 1, label: 'Difícil', color: 'bg-orange-600 hover:bg-orange-700', icon: Target, description: 'Muito difícil' },
  { value: 2, label: 'Difícil', color: 'bg-yellow-600 hover:bg-yellow-700', icon: Brain, description: 'Difícil' },
  { value: 3, label: 'OK', color: 'bg-blue-600 hover:bg-blue-700', icon: CheckCircle, description: 'Correto' },
  { value: 4, label: 'Fácil', color: 'bg-green-600 hover:bg-green-700', icon: Zap, description: 'Fácil' },
  { value: 5, label: 'Perfeito', color: 'bg-emerald-600 hover:bg-emerald-700', icon: Star, description: 'Perfeito!' }
];

const difficultyColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800', 
  3: 'bg-orange-100 text-orange-800',
  4: 'bg-red-100 text-red-800',
  5: 'bg-purple-100 text-purple-800'
};

const masteryColors = {
  0: 'text-muted-foreground',
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-green-500',
  5: 'text-emerald-500'
};

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  flashcard,
  onResponse,
  isLoading = false,
  sessionProgress
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showQuality, setShowQuality] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);

  // Reset card state when flashcard changes
  useEffect(() => {
    console.log('🔄 Resetando card para:', flashcard.id);
    setIsFlipped(false);
    setShowQuality(false);
    setStartTime(Date.now());
    setResponseTime(0);
  }, [flashcard.id]);

  // Also reset when flashcard object changes completely
  useEffect(() => {
    console.log('🔄 Novo flashcard detectado:', flashcard.front);
    setIsFlipped(false);
    setShowQuality(false);
    setStartTime(Date.now());
    setResponseTime(0);
  }, [flashcard.front, flashcard.back]);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setResponseTime(Date.now() - startTime);
      // Small delay before showing quality buttons for better UX
      setTimeout(() => setShowQuality(true), 300);
    }
  };

  const handleQualityResponse = (quality: number) => {
    const finalResponseTime = Date.now() - startTime;
    onResponse(quality, finalResponseTime);
  };

  const getMasteryText = (level: number) => {
    const levels = ['Novo', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Dominado'];
    return levels[level] || 'Novo';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Session Progress */}
      {sessionProgress && (
        <div className="bg-background/80 backdrop-blur rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Progresso da Sessão
            </span>
            <span className="text-sm text-muted-foreground">
              {sessionProgress.current} de {sessionProgress.total}
            </span>
          </div>
          <Progress 
            value={(sessionProgress.current / sessionProgress.total) * 100} 
            className="h-2 mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {sessionProgress.correct} corretas
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {sessionProgress.incorrect} incorretas
            </span>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {flashcard.category_name}
          </Badge>
          <Badge 
            className={cn("text-xs", difficultyColors[flashcard.difficulty_level as keyof typeof difficultyColors])}
          >
            Nível {flashcard.difficulty_level}
          </Badge>
          <div className="flex items-center gap-1 text-xs">
            <Heart className={cn("h-3 w-3", masteryColors[(flashcard.progress?.mastery_level || flashcard.mastery_level || 0) as keyof typeof masteryColors])} />
            <span className="text-muted-foreground">{getMasteryText(flashcard.progress?.mastery_level || flashcard.mastery_level || 0)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Visto {flashcard.progress?.times_seen || flashcard.times_seen || 0}x
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="relative perspective-1000">
        <Card 
          className={cn(
            "relative w-full h-[400px] cursor-pointer transition-all duration-700 transform-style-preserve-3d",
            isFlipped ? "rotate-y-180" : "",
            isLoading && "pointer-events-none opacity-50"
          )}
          onClick={handleFlip}
        >
          {/* Front Side */}
          <CardContent 
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center text-center p-8",
              "bg-gradient-to-br from-blue-200 to-indigo-300 border-2 border-blue-400"
            )}
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-500 rounded-full w-fit mx-auto">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                {flashcard.front}
              </h2>
              {!isFlipped && (
                <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clique para ver a resposta
                </p>
              )}
            </div>
          </CardContent>

          {/* Back Side */}
          <CardContent 
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center p-8",
              "bg-gradient-to-br from-green-200 to-emerald-300 border-2 border-green-400"
            )}
          >
            <div className="space-y-4">
              <div className="p-3 bg-green-500 rounded-full w-fit mx-auto">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                {flashcard.back}
              </h2>
              {responseTime > 0 && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo: {(responseTime / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Response Buttons */}
      {showQuality && isFlipped && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Como foi sua resposta?
            </h3>
            <p className="text-sm text-muted-foreground">
              Sua avaliação ajuda a otimizar suas próximas revisões
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {qualityButtons.map((button) => {
              const IconComponent = button.icon;
              return (
                <Button
                  key={button.value}
                  onClick={() => handleQualityResponse(button.value)}
                  disabled={isLoading}
                  className={cn(
                    "flex flex-col items-center gap-2 h-auto py-4 px-3 text-white transition-all",
                    button.color,
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-semibold text-xs">{button.label}</div>
                    <div className="text-xs opacity-90">{button.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Dica:</strong> Use as teclas 0-5 para responder rapidamente</p>
            <div className="flex justify-center gap-4 text-xs">
              <span>0-2: Incorreto (repetir mais cedo)</span>
              <span>3-5: Correto (intervalo maior)</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 shadow-xl text-center border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-foreground">Processando resposta...</p>
          </div>
        </div>
      )}
    </div>
  );
};
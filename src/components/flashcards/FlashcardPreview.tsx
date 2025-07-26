import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Eye, 
  Play, 
  RotateCcw,
  Clock,
  Target,
  Hash,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardPreviewData {
  id: string;
  front: string;
  back: string;
  difficulty_level: number;
  tags: string[];
  category: {
    name: string;
    color: string;
  };
  progress?: {
    mastery_level: number;
    times_seen: number;
    is_favorite: boolean;
  };
  created_at: string;
}

interface FlashcardPreviewProps {
  flashcard: FlashcardPreviewData;
  onToggleFavorite: (flashcardId: string) => void;
  onStartStudy: (flashcardId: string) => void;
  onPreview: (flashcard: FlashcardPreviewData) => void;
  isLoading?: boolean;
}

const difficultyColors = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  3: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  4: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  5: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const masteryLevels = [
  { level: 0, label: 'Novo', color: 'text-gray-500' },
  { level: 1, label: 'Iniciante', color: 'text-red-500' },
  { level: 2, label: 'Básico', color: 'text-orange-500' },
  { level: 3, label: 'Intermediário', color: 'text-yellow-500' },
  { level: 4, label: 'Avançado', color: 'text-green-500' },
  { level: 5, label: 'Dominado', color: 'text-emerald-500' }
];

export const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({
  flashcard,
  onToggleFavorite,
  onStartStudy,
  onPreview,
  isLoading = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const difficultyLabel = ['', 'Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil'][flashcard.difficulty_level];
  const masteryInfo = masteryLevels.find(m => m.level === (flashcard.progress?.mastery_level || 0));
  const isFavorite = flashcard.progress?.is_favorite || false;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(flashcard);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(flashcard.id);
  };

  const handleStartStudy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartStudy(flashcard.id);
  };

  return (
    <Card 
      className={cn(
        "relative group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        "border-2 hover:border-primary/20",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleFlip}
    >
      {/* Favorite Badge */}
      {isFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive" className="h-6 w-6 p-0 rounded-full flex items-center justify-center">
            <Heart className="h-3 w-3 fill-current" />
          </Badge>
        </div>
      )}

      {/* Mastery Level Indicator */}
      {masteryInfo && masteryInfo.level > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <Badge 
            variant="outline" 
            className={cn("text-xs", masteryInfo.color)}
          >
            {masteryInfo.label}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              style={{ 
                backgroundColor: `${flashcard.category.color}20`,
                color: flashcard.category.color,
                borderColor: `${flashcard.category.color}40`
              }}
              className="text-xs"
            >
              {flashcard.category.name}
            </Badge>
            
            <Badge 
              className={cn("text-xs", difficultyColors[flashcard.difficulty_level as keyof typeof difficultyColors])}
            >
              <Target className="h-3 w-3 mr-1" />
              {difficultyLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="min-h-[120px] relative">
          {/* Front Side */}
          <div className={cn(
            "transition-opacity duration-300",
            isFlipped ? "opacity-0 absolute inset-0" : "opacity-100"
          )}>
            <h3 className="font-semibold text-sm mb-3 line-clamp-3 leading-relaxed">
              {flashcard.front}
            </h3>
            <div className="flex items-center justify-center text-muted-foreground text-xs">
              <RotateCcw className="h-4 w-4 mr-1" />
              Clique para ver a resposta
            </div>
          </div>

          {/* Back Side */}
          <div className={cn(
            "transition-opacity duration-300",
            isFlipped ? "opacity-100" : "opacity-0 absolute inset-0"
          )}>
            <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
              {flashcard.back}
            </p>
          </div>
        </div>

        {/* Tags */}
        {flashcard.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            <Hash className="h-3 w-3 text-muted-foreground mt-0.5" />
            {flashcard.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {flashcard.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{flashcard.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {flashcard.progress && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Visto {flashcard.progress.times_seen}x
              </span>
            )}
            <span>
              {new Date(flashcard.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          {masteryInfo && masteryInfo.level > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3",
                    i < masteryInfo.level 
                      ? "text-yellow-500 fill-current" 
                      : "text-gray-300"
                  )} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons - Show on Hover */}
        <div className={cn(
          "mt-4 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePreview}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
          
          <Button
            size="sm"
            onClick={handleToggleFavorite}
            variant={isFavorite ? "destructive" : "outline"}
            className="px-3"
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
          
          <Button
            size="sm"
            onClick={handleStartStudy}
            className="px-3"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
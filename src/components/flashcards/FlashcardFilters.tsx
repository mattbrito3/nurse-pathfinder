import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Heart,
  Clock,
  Target,
  Hash,
  Calendar,
  BarChart3,
  Eye,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlashcardFilters {
  search: string;
  difficulty: number[];
  tags: string[];
  sortBy: 'created_at' | 'difficulty' | 'alphabetical' | 'times_seen' | 'mastery_level';
  sortOrder: 'asc' | 'desc';
  onlyFavorites: boolean;
  showMastered: boolean;
  searchFields: ('front' | 'back' | 'tags')[];
  masteryLevel: number[];
  dateRange: 'all' | 'last_week' | 'last_month' | 'last_3_months';
}

interface FlashcardFiltersProps {
  filters: FlashcardFilters;
  onFiltersChange: (filters: FlashcardFilters) => void;
  availableTags: string[];
  totalCards: number;
  filteredCards: number;
  isLoading?: boolean;
  isFavoritesPage?: boolean;
}

export const FlashcardFiltersComponent: React.FC<FlashcardFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  totalCards,
  filteredCards,
  isLoading = false,
  isFavoritesPage = false
}) => {
  const updateFilter = (key: keyof FlashcardFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      difficulty: [1, 5],
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
      onlyFavorites: false,
      showMastered: true,
      searchFields: ['front', 'back', 'tags'],
      masteryLevel: [0, 5],
      dateRange: 'all'
    });
  };

  const hasActiveFilters = filters.search || 
    filters.tags.length > 0 || 
    filters.difficulty[0] > 1 || 
    filters.difficulty[1] < 5 || 
    filters.onlyFavorites || 
    !filters.showMastered ||
    filters.searchFields.length < 3 ||
    filters.masteryLevel[0] > 0 ||
    filters.masteryLevel[1] < 5 ||
    filters.dateRange !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar flashcards... (frente, verso ou tags)"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-4"
            disabled={isLoading}
          />
        </div>

        {/* Advanced Search Options */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Buscar em:</span>
          {[
            { key: 'front', label: 'Frente', icon: Eye },
            { key: 'back', label: 'Verso', icon: BarChart3 },
            { key: 'tags', label: 'Tags', icon: Hash }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filters.searchFields.includes(key as any) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newFields = filters.searchFields.includes(key as any)
                  ? filters.searchFields.filter(f => f !== key)
                  : [...filters.searchFields, key as any];
                updateFilter('searchFields', newFields);
              }}
              className="h-7 text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value: any) => updateFilter('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Data de criação</SelectItem>
                  <SelectItem value="difficulty">Dificuldade</SelectItem>
                  <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
                  <SelectItem value="times_seen">Mais estudados</SelectItem>
                  <SelectItem value="mastery_level">Nível de domínio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Ordem</label>
              <Select 
                value={filters.sortOrder} 
                onValueChange={(value: any) => updateFilter('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Decrescente</SelectItem>
                  <SelectItem value="asc">Crescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty Range */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Target className="h-4 w-4" />
              Nível de Dificuldade: {filters.difficulty[0]} - {filters.difficulty[1]}
            </label>
            <Slider
              value={filters.difficulty}
              onValueChange={(value) => updateFilter('difficulty', value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Muito Fácil</span>
              <span>Muito Difícil</span>
            </div>
          </div>

          {/* Mastery Level Range */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nível de Domínio: {filters.masteryLevel[0]} - {filters.masteryLevel[1]}
            </label>
            <Slider
              value={filters.masteryLevel}
              onValueChange={(value) => updateFilter('masteryLevel', value)}
              min={0}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Iniciante</span>
              <span>Dominado</span>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período de Criação
            </label>
            <Select 
              value={filters.dateRange} 
              onValueChange={(value: any) => updateFilter('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="last_week">Última semana</SelectItem>
                <SelectItem value="last_month">Último mês</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap gap-2">
            {!isFavoritesPage && (
              <Button
                variant={filters.onlyFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('onlyFavorites', !filters.onlyFavorites)}
                className="flex items-center gap-2"
              >
                <Heart className={cn("h-4 w-4", filters.onlyFavorites && "fill-current")} />
                Apenas Favoritos
              </Button>
            )}
            
            <Button
              variant={!filters.showMastered ? "destructive" : "outline"}
              size="sm"
              onClick={() => updateFilter('showMastered', !filters.showMastered)}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              {filters.showMastered ? 'Ocultar Dominados' : 'Mostrar Dominados'}
            </Button>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Tags Disponíveis
              </label>
              
              {/* Selected Tags */}
              {filters.tags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Tags selecionadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Available Tags */}
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter(tag => !filters.tags.includes(tag))
                  .slice(0, 20) // Limit to prevent UI overflow
                  .map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
        <span>
          {isLoading ? (
            'Carregando...'
          ) : (
            <>Mostrando <strong>{filteredCards}</strong> de <strong>{totalCards}</strong> flashcards</>
          )}
        </span>
        
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filtros ativos
          </Badge>
        )}
      </div>
    </div>
  );
};
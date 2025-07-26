import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FlashcardFiltersComponent, FlashcardFilters } from '@/components/flashcards/FlashcardFilters';
import { FlashcardPreview } from '@/components/flashcards/FlashcardPreview';
import { useFlashcards } from '@/hooks/useFlashcards';
import { 
  ArrowLeft, 
  Grid3X3, 
  List, 
  Plus,
  BookOpen,
  Search,
  Filter,
  Loader2,
  Hash,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

const BrowsePage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { 
    categories, 
    useFlashcardsByCategory, 
    useFavoriteFlashcards,
    toggleFavorite, 
    startStudySession,
    isTogglingFavorite 
  } = useFlashcards();

  // Check if this is the favorites route
  const isFavoritesRoute = categoryId === 'favorites';
  
  // Check if this is general browse (no specific category)
  const isGeneralBrowse = !categoryId;

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [filters, setFilters] = useState<FlashcardFilters>({
    search: '',
    difficulty: [1, 5],
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    onlyFavorites: isFavoritesRoute,
    showMastered: true,
    searchFields: ['front', 'back', 'tags'],
    masteryLevel: [0, 5],
    dateRange: 'all'
  });

  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

  // Update filters when route changes to favorites
  useEffect(() => {
    if (isFavoritesRoute) {
      setFilters(prev => ({
        ...prev,
        onlyFavorites: true,
        // Reset other filters to show all favorites
        search: '',
        difficulty: [1, 5],
        tags: [],
        masteryLevel: [0, 5],
        dateRange: 'all'
      }));
    }
  }, [isFavoritesRoute]);

  // Get flashcards data
  const { 
    data: categoryFlashcards = [], 
    isLoading: categoryLoading 
  } = useFlashcardsByCategory(isFavoritesRoute ? null : (isGeneralBrowse ? undefined : categoryId));

  const { 
    data: favoriteFlashcards = [], 
    isLoading: favoritesLoading 
  } = useFavoriteFlashcards();

  // Choose the appropriate data source
  const flashcards = isFavoritesRoute ? favoriteFlashcards : categoryFlashcards;
  const flashcardsLoading = isFavoritesRoute ? favoritesLoading : categoryLoading;

  // Get category info
  const currentCategory = categories.find(cat => cat.id === categoryId);

  // Get all available tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    flashcards.forEach(card => {
      card.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [flashcards]);

  // Apply filters
  const filteredFlashcards = useMemo(() => {
    let filtered = [...flashcards];

    // FORCE: If on favorites route, ensure only favorites are shown
    if (isFavoritesRoute) {
      filtered = filtered.filter(card => card.progress?.is_favorite === true);
    }

    // Advanced search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(card => {
        const searchMatches = [];
        
        if (filters.searchFields.includes('front')) {
          searchMatches.push(card.front.toLowerCase().includes(searchLower));
        }
        if (filters.searchFields.includes('back')) {
          searchMatches.push(card.back.toLowerCase().includes(searchLower));
        }
        if (filters.searchFields.includes('tags')) {
          searchMatches.push(card.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false);
        }
        
        return searchMatches.some(match => match);
      });
    }

    // Difficulty filter
    filtered = filtered.filter(card =>
      card.difficulty_level >= filters.difficulty[0] &&
      card.difficulty_level <= filters.difficulty[1]
    );

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(card =>
        filters.tags.every(tag => card.tags?.includes(tag))
      );
    }

    // Favorites filter (only apply if not already on favorites route)
    if (filters.onlyFavorites && !isFavoritesRoute) {
      filtered = filtered.filter(card => card.progress?.is_favorite);
    }

    // Mastery level filter
    filtered = filtered.filter(card => {
      const masteryLevel = card.mastery_level || 0;
      return masteryLevel >= filters.masteryLevel[0] && masteryLevel <= filters.masteryLevel[1];
    });

    // Show mastered filter
    if (!filters.showMastered) {
      filtered = filtered.filter(card => 
        !card.progress || card.mastery_level < 5
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'last_week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'last_month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(card => {
        const cardDate = new Date(card.created_at || 0);
        return cardDate >= cutoffDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'difficulty':
          aValue = a.difficulty_level;
          bValue = b.difficulty_level;
          break;
        case 'alphabetical':
          aValue = a.front.toLowerCase();
          bValue = b.front.toLowerCase();
          break;
        case 'times_seen':
          aValue = a.times_seen || 0;
          bValue = b.times_seen || 0;
          break;
        case 'mastery_level':
          aValue = a.mastery_level || 0;
          bValue = b.mastery_level || 0;
          break;
        default: // created_at
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [flashcards, filters]);

  const handleToggleFavorite = async (flashcardId: string) => {
    try {
      await toggleFavorite(flashcardId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleStartStudy = async (flashcardId: string) => {
    try {
      const session = await startStudySession({
        sessionType: 'practice',
        categoryId: categoryId
      });

      // Store session info
      sessionStorage.setItem(`study_session_${session.id}`, JSON.stringify({
        sessionType: 'practice',
        categoryId: categoryId,
        specificCard: flashcardId
      }));

      navigate(`/dashboard/flashcards/study/${session.id}`);
    } catch (error) {
      console.error('Error starting study:', error);
    }
  };

  const handlePreview = (flashcard: any) => {
    setSelectedCard(flashcard);
  };

  if (!currentCategory && !isFavoritesRoute && !isGeneralBrowse && !flashcardsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Categoria não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A categoria solicitada não existe ou não está disponível.
            </p>
            <Button onClick={() => navigate('/dashboard/flashcards')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Flashcards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/flashcards')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                {isFavoritesRoute 
                  ? 'Meus Favoritos' 
                  : isGeneralBrowse
                    ? 'Busca Avançada'
                    : currentCategory 
                      ? `Explorar: ${currentCategory.name}` 
                      : 'Explorando Flashcards'
                }
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/flashcards/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FlashcardFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                availableTags={availableTags}
                totalCards={flashcards.length}
                filteredCards={filteredFlashcards.length}
                isLoading={flashcardsLoading}
                isFavoritesPage={isFavoritesRoute}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Info, Favorites, or General Browse Header */}
            {(currentCategory || isFavoritesRoute || isGeneralBrowse) && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: isFavoritesRoute ? '#ef4444' : isGeneralBrowse ? '#3b82f6' : currentCategory?.color }}
                    >
                      {isFavoritesRoute ? '⭐' : isGeneralBrowse ? '🔍' : '📚'}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {isFavoritesRoute ? 'Meus Flashcards Favoritos' : isGeneralBrowse ? 'Busca Avançada de Flashcards' : currentCategory?.name}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {isFavoritesRoute 
                          ? 'Todos os seus flashcards marcados como favoritos' 
                          : isGeneralBrowse 
                            ? 'Explore e filtre flashcards de todas as categorias com ferramentas avançadas de busca'
                            : currentCategory?.description
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{flashcards.length} {isFavoritesRoute ? 'favoritos' : 'flashcards disponíveis'}</span>
                    <span>•</span>
                    <span className="font-medium text-primary">{filteredFlashcards.length} exibidos</span>
                    {isFavoritesRoute && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-600 dark:text-yellow-400">⭐ Apenas favoritos</span>
                      </>
                    )}
                    {filters.search && (
                      <>
                        <span>•</span>
                        <span>Busca por: "{filters.search}"</span>
                      </>
                    )}
                  </div>
                  
                  {/* Search Results Summary */}
                  {(filters.search || filters.tags.length > 0 || filters.difficulty[0] > 1 || filters.difficulty[1] < 5) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {filters.search && (
                          <Badge variant="secondary" className="text-xs">
                            <Search className="h-3 w-3 mr-1" />
                            "{filters.search}" em {filters.searchFields.join(', ')}
                          </Badge>
                        )}
                        {filters.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {(filters.difficulty[0] > 1 || filters.difficulty[1] < 5) && (
                          <Badge variant="outline" className="text-xs">
                            Dificuldade: {filters.difficulty[0]}-{filters.difficulty[1]}
                          </Badge>
                        )}
                        {(filters.masteryLevel[0] > 0 || filters.masteryLevel[1] < 5) && (
                          <Badge variant="outline" className="text-xs">
                            Domínio: {filters.masteryLevel[0]}-{filters.masteryLevel[1]}
                          </Badge>
                        )}
                        {filters.dateRange !== 'all' && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {filters.dateRange === 'last_week' ? 'Última semana' :
                             filters.dateRange === 'last_month' ? 'Último mês' :
                             'Últimos 3 meses'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {flashcardsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando flashcards...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!flashcardsLoading && filteredFlashcards.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {flashcards.length === 0 ? 'Nenhum flashcard encontrado' : 'Nenhum resultado'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {flashcards.length === 0 
                      ? 'Esta categoria ainda não possui flashcards. Que tal criar o primeiro?'
                      : 'Tente ajustar os filtros ou termo de busca para encontrar flashcards.'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    {flashcards.length === 0 ? (
                      <Button onClick={() => navigate('/dashboard/flashcards/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Flashcard
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setFilters({
                        search: '',
                        difficulty: [1, 5],
                        tags: [],
                        sortBy: 'created_at',
                        sortOrder: 'desc',
                        onlyFavorites: false,
                        showMastered: true
                      })}>
                        <Filter className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Flashcards Grid/List */}
            {!flashcardsLoading && filteredFlashcards.length > 0 && (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredFlashcards.map(flashcard => (
                  <FlashcardPreview
                    key={flashcard.id}
                    flashcard={flashcard}
                    onToggleFavorite={handleToggleFavorite}
                    onStartStudy={handleStartStudy}
                    onPreview={handlePreview}
                    isLoading={isTogglingFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal (placeholder for future implementation) */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview do Flashcard</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCard(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Pergunta:</h4>
                  <p className="text-muted-foreground">{selectedCard.front}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Resposta:</h4>
                  <p className="text-muted-foreground">{selectedCard.back}</p>
                </div>
                {selectedCard.tags?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCard.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
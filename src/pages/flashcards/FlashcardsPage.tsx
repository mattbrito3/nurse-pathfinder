import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  Star, 
  Target, 
  TrendingUp, 
  BookOpen,
  Plus,
  Filter,
  ChevronRight,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useFlashcards, FlashcardCategory } from '@/hooks/useFlashcards';

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const { 
    categories, 
    dueCards, 
    userStats,
    categoriesLoading,
    dueCardsLoading,
    statsLoading,
    startStudySession,
    isStartingSession
  } = useFlashcards();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleStartReview = async () => {
    try {
      const session = await startStudySession({ 
        sessionType: 'review',
        categoryId: selectedCategory || undefined
      });
      
      // Store session info for the study page
      sessionStorage.setItem(`study_session_${session.id}`, JSON.stringify({
        sessionType: 'review',
        categoryId: selectedCategory
      }));
      
      navigate(`/dashboard/flashcards/study/${session.id}`);
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    }
  };

  const handleStartLearning = async (categoryId: string) => {
    try {
      const session = await startStudySession({ 
        sessionType: 'learning',
        categoryId
      });
      
      // Store session info for the study page
      sessionStorage.setItem(`study_session_${session.id}`, JSON.stringify({
        sessionType: 'learning',
        categoryId
      }));
      
      navigate(`/dashboard/flashcards/study/${session.id}`);
    } catch (error) {
      console.error('Erro ao iniciar aprendizado:', error);
    }
  };

  const handleBrowseCategory = (categoryId: string) => {
    navigate(`/dashboard/flashcards/browse/${categoryId}`);
  };

  const handleRandomExploration = async () => {
    try {
      const session = await startStudySession({ 
        sessionType: 'practice',
        categoryId: undefined // Random exploration across all categories
      });
      
      // Store session info for the study page
      sessionStorage.setItem(`study_session_${session.id}`, JSON.stringify({
        sessionType: 'practice',
        categoryId: null,
        isRandom: true
      }));
      
      navigate(`/dashboard/flashcards/study/${session.id}`);
    } catch (error) {
      console.error('Erro ao iniciar exploração aleatória:', error);
    }
  };

  const handleBrowseFavorites = () => {
    // Navigate to browse page with favorites filter
    navigate('/dashboard/flashcards/browse/favorites');
  };

  if (categoriesLoading || dueCardsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Flashcards Inteligentes</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/flashcards/my')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Meus Flashcards
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/flashcards/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Flashcard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="study" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="study">Estudar</TabsTrigger>
            <TabsTrigger value="explore">Explorar</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Study Tab */}
          <TabsContent value="study" className="space-y-6">
            {/* Quick Study Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Due Cards */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        Cartões para Revisar
                      </CardTitle>
                      <CardDescription>
                        {dueCards.length} cartões aguardando revisão
                      </CardDescription>
                    </div>
                    <Badge variant={dueCards.length > 0 ? "destructive" : "secondary"}>
                      {dueCards.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dueCards.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Próximos cartões por categoria:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dueCards.slice(0, 5).map((card: any) => (
                            <Badge key={card.flashcard_id} variant="outline">
                              {card.category_name}
                            </Badge>
                          ))}
                          {dueCards.length > 5 && (
                            <Badge variant="outline">+{dueCards.length - 5} mais</Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={handleStartReview}
                        disabled={isStartingSession}
                        className="w-full"
                        size="lg"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {isStartingSession ? 'Iniciando...' : 'Começar Revisão'}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Parabéns!</h3>
                      <p className="text-muted-foreground mb-4">
                        Você está em dia com suas revisões
                      </p>
                      <Button variant="outline" onClick={() => navigate('/dashboard/flashcards/browse')}>
                        Explorar Novos Cartões
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Progresso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userStats ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Precisão</span>
                          <span className="font-medium">{userStats.accuracy}%</span>
                        </div>
                        <Progress value={userStats.accuracy} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{userStats.masteredCards}</div>
                          <div className="text-xs text-muted-foreground">Dominados</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-500">{userStats.totalReviews}</div>
                          <div className="text-xs text-muted-foreground">Revisões</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Comece estudando para ver suas estatísticas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Study Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Estudo Focado
                  </CardTitle>
                  <CardDescription>
                    Escolha uma categoria específica para sessão de estudo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <select 
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <Button 
                      onClick={() => handleStartLearning(selectedCategory)}
                      disabled={isStartingSession}
                      className="w-full"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {isStartingSession ? 'Iniciando...' : 'Iniciar Sessão de Estudo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Estudo Inteligente
                  </CardTitle>
                  <CardDescription>
                    Deixe o algoritmo escolher os melhores cartões para você
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Baseado no seu progresso e algoritmo de repetição espaçada
                    </div>
                    <Button 
                      onClick={handleStartReview}
                      disabled={isStartingSession || dueCards.length === 0}
                      className="w-full"
                      variant={dueCards.length > 0 ? "default" : "outline"}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {dueCards.length > 0 ? `Revisar ${dueCards.length} cartões` : 'Nenhum cartão para revisar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-6">
            {/* Quick Discovery Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Exploração Aleatória
                  </CardTitle>
                  <CardDescription>
                    Descubra flashcards de todas as categorias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleRandomExploration()}
                    disabled={isStartingSession}
                    className="w-full"
                    variant="outline"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Explorar Aleatoriamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Meus Favoritos
                  </CardTitle>
                  <CardDescription>
                    Acesse rapidamente seus flashcards favoritos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleBrowseFavorites()}
                    className="w-full"
                    variant="outline"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Ver Favoritos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5 text-blue-500" />
                    Busca Avançada
                  </CardTitle>
                  <CardDescription>
                    Encontre flashcards específicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/dashboard/flashcards/browse')}
                    className="w-full"
                    variant="outline"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Buscar & Filtrar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Categories Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Categorias Disponíveis
                    </CardTitle>
                    <CardDescription>
                      Navegue por área de conhecimento e descubra novos flashcards
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {categories.length} categorias
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="w-4 h-4 bg-muted rounded" />
                      </div>
                      <div className="h-5 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded mb-4" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded flex-1" />
                        <div className="h-8 bg-muted rounded flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                categories.map((category: FlashcardCategory) => (
                  <Card 
                    key={category.id} 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleBrowseCategory(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: category.color }}
                        >
                          📚
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Category Stats */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {category.flashcard_count || 0} cards
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Dif. {category.avg_difficulty || 'N/A'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent double click
                            handleBrowseCategory(category.id);
                          }}
                          className="flex-1 group-hover:border-primary/40"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Navegar
                        </Button>
                      </div>
                      
                      {/* Progress Indicator */}
                      {category.user_progress && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Seu progresso</span>
                            <span className="font-medium">
                              {Math.round((category.user_progress.mastered_count / (category.flashcard_count || 1)) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(category.user_progress.mastered_count / (category.flashcard_count || 1)) * 100}
                            className="h-1"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            {!categoriesLoading && categories.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma categoria encontrada</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Parece que ainda não existem categorias de flashcards. 
                    Que tal criar a primeira categoria e começar a estudar?
                  </p>
                  <Button onClick={() => navigate('/dashboard/flashcards/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Flashcard
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Cartões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.totalCards || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Cartões estudados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Dominados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {userStats?.masteredCards || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nível máximo alcançado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Precisão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats?.accuracy || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Taxa de acerto geral
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Para Revisar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {dueCards.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando revisão
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Histórico de Estudos</CardTitle>
                <CardDescription>
                  Visualize seu progresso ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Gráficos de progresso em breve...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlashcardsPage;
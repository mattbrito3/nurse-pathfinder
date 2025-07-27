import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Eye,
  Calendar,
  Tag,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const MyFlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { useFlashcardsByCategory, deleteFlashcard, isDeletingFlashcard } = useFlashcards();
  
  // Get all flashcards (no category filter)
  const { data: allFlashcards = [], isLoading: flashcardsLoading } = useFlashcardsByCategory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter user's own flashcards (with safety check)
  const myFlashcards = allFlashcards.filter(flashcard => flashcard.created_by === user?.id);

  // Apply search and category filters
  const filteredFlashcards = myFlashcards.filter(flashcard => {
    const matchesSearch = searchQuery === '' || 
      flashcard.front?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flashcard.back?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flashcard.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || flashcard.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories from user's flashcards
  const userCategories = Array.from(
    new Set(myFlashcards.map(f => f.category_id))
  ).map(categoryId => {
    const flashcard = myFlashcards.find(f => f.category_id === categoryId);
    return {
      id: categoryId,
      name: flashcard?.category?.name || 'Sem categoria'
    };
  });

  const handleDelete = async (flashcardId: string, flashcardFront: string) => {
    try {
      await deleteFlashcard(flashcardId);
      toast({
        title: "Flashcard deletado!",
        description: `"${flashcardFront}" foi removido com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o flashcard. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (flashcardsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard/flashcards')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold text-foreground">Meus Flashcards</h1>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <Button variant="ghost" onClick={() => navigate('/dashboard/flashcards')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Meus Flashcards</h1>
              <Badge variant="outline">{myFlashcards.length} flashcards</Badge>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard/flashcards/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Flashcard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por frente, verso ou tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todas as categorias</option>
                  {userCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flashcards List */}
        {filteredFlashcards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {myFlashcards.length === 0 ? 'Nenhum flashcard criado' : 'Nenhum flashcard encontrado'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {myFlashcards.length === 0 
                  ? 'Você ainda não criou nenhum flashcard personalizado. Que tal criar o primeiro?'
                  : 'Tente ajustar os filtros de busca para encontrar seus flashcards.'
                }
              </p>
              {myFlashcards.length === 0 && (
                <Button onClick={() => navigate('/dashboard/flashcards/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Flashcard
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlashcards.map((flashcard) => (
              <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                        {flashcard.category?.name}
                      </CardTitle>
                      <h3 className="text-base font-semibold line-clamp-2">
                        {flashcard.front}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      Nível {flashcard.difficulty_level}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Answer Preview */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">Resposta:</p>
                    <p className="text-sm line-clamp-3">{flashcard.back}</p>
                  </div>

                  {/* Tags */}
                  {flashcard.tags && flashcard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {flashcard.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {flashcard.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{flashcard.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(flashcard.created_at)}
                    </span>
                    {flashcard.progress && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Visto {flashcard.progress.times_seen}x
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/flashcards/edit/${flashcard.id}`)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isDeletingFlashcard}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Deletar Flashcard
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar este flashcard?
                            <br />
                            <br />
                            <strong>"{flashcard.front}"</strong>
                            <br />
                            <br />
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(flashcard.id, flashcard.front)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFlashcardsPage;
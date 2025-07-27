import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Eye, 
  Save, 
  X,
  Target,
  Star,
  Zap,
  Loader2
} from 'lucide-react';
import { FlashcardComponent } from '@/components/flashcards/FlashcardComponent';

const EditFlashcardPage: React.FC = () => {
  const navigate = useNavigate();
  const { flashcardId } = useParams<{ flashcardId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { flashcards, flashcardsLoading, updateFlashcard, isUpdatingFlashcard } = useFlashcards();
  const { categories, categoriesLoading } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    category_id: '',
    front: '',
    back: '',
    difficulty_level: 3,
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Find the flashcard to edit
  const flashcard = flashcards.find(f => f.id === flashcardId);

  // Difficulty options
  const difficultyOptions = [
    { value: 1, label: 'Muito Fácil', color: 'bg-green-100 text-green-800', icon: Star },
    { value: 2, label: 'Fácil', color: 'bg-blue-100 text-blue-800', icon: Zap },
    { value: 3, label: 'Médio', color: 'bg-yellow-100 text-yellow-800', icon: Target },
    { value: 4, label: 'Difícil', color: 'bg-orange-100 text-orange-800', icon: Brain },
    { value: 5, label: 'Muito Difícil', color: 'bg-red-100 text-red-800', icon: Target }
  ];

  // Load flashcard data into form
  useEffect(() => {
    if (!flashcardsLoading && flashcard) {
      // Check if user owns this flashcard
      if (flashcard.created_by !== user?.id) {
        toast({
          title: "Acesso negado",
          description: "Você só pode editar seus próprios flashcards.",
          variant: "destructive"
        });
        navigate('/dashboard/flashcards/my');
        return;
      }

      setFormData({
        category_id: flashcard.category_id || '',
        front: flashcard.front || '',
        back: flashcard.back || '',
        difficulty_level: flashcard.difficulty_level || 3,
        tags: flashcard.tags || []
      });
      setIsLoading(false);
    } else if (!flashcardsLoading && !flashcard) {
      toast({
        title: "Flashcard não encontrado",
        description: "O flashcard que você tentou editar não existe.",
        variant: "destructive"
      });
      navigate('/dashboard/flashcards/my');
    }
  }, [flashcard, flashcardsLoading, user?.id, navigate, toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flashcardId || !formData.category_id || !formData.front.trim() || !formData.back.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha categoria, frente e verso do flashcard.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateFlashcard({
        id: flashcardId,
        updates: formData
      });
      toast({
        title: "Flashcard atualizado!",
        description: "Suas alterações foram salvas com sucesso.",
      });
      navigate('/dashboard/flashcards/my');
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = formData.category_id && formData.front.trim() && formData.back.trim();
  const selectedDifficulty = difficultyOptions.find(d => d.value === formData.difficulty_level);

  if (flashcardsLoading || categoriesLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard/flashcards/my')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold text-foreground">Editar Flashcard</h1>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando flashcard...</span>
          </div>
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
            <Button variant="ghost" onClick={() => navigate('/dashboard/flashcards/my')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Editar Flashcard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!isFormValid}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Preview'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Editar Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => handleInputChange('category_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Front (Question) */}
                  <div className="space-y-2">
                    <Label htmlFor="front">Frente (Pergunta/Termo) *</Label>
                    <Textarea
                      id="front"
                      placeholder="Ex: Qual a dose usual de Paracetamol para adultos?"
                      value={formData.front}
                      onChange={(e) => handleInputChange('front', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Back (Answer) */}
                  <div className="space-y-2">
                    <Label htmlFor="back">Verso (Resposta/Definição) *</Label>
                    <Textarea
                      id="back"
                      placeholder="Ex: 500-1000mg a cada 6-8h, máximo 4g/dia"
                      value={formData.back}
                      onChange={(e) => handleInputChange('back', e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Difficulty Level */}
                  <div className="space-y-2">
                    <Label>Nível de Dificuldade</Label>
                    <Select 
                      value={formData.difficulty_level.toString()} 
                      onValueChange={(value) => handleInputChange('difficulty_level', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {selectedDifficulty && (
                            <div className="flex items-center gap-2">
                              <selectedDifficulty.icon className="h-4 w-4" />
                              {selectedDifficulty.label}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Ex: medicamento, dose"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => navigate('/dashboard/flashcards/my')}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={!isFormValid || isUpdatingFlashcard}
                    >
                      {isUpdatingFlashcard ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {showPreview && isFormValid && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-500" />
                    Preview das Alterações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FlashcardComponent
                    flashcard={{
                      id: 'preview',
                      front: formData.front,
                      back: formData.back,
                      difficulty_level: formData.difficulty_level,
                      tags: formData.tags,
                      category: {
                        name: categories.find(c => c.id === formData.category_id)?.name || 'Categoria'
                      },
                      progress: {
                        mastery_level: flashcard?.progress?.mastery_level || 0,
                        times_seen: flashcard?.progress?.times_seen || 0,
                        is_favorite: flashcard?.progress?.is_favorite || false
                      }
                    }}
                    showViewCount={false}
                  />
                </CardContent>
              </Card>
            )}

            {/* Original vs New Comparison */}
            {flashcard && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Comparação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">📝 Versão Original</h4>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <strong>Frente:</strong> {flashcard.front}
                      <br />
                      <strong>Verso:</strong> {flashcard.back}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">✨ Nova Versão</h4>
                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      <strong>Frente:</strong> {formData.front || '(não preenchido)'}
                      <br />
                      <strong>Verso:</strong> {formData.back || '(não preenchido)'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFlashcardPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Eye, 
  Plus, 
  X,
  Target,
  Star,
  Zap
} from 'lucide-react';
import { FlashcardComponent } from '@/components/flashcards/FlashcardComponent';

const CreateFlashcardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createFlashcard, isCreatingFlashcard } = useFlashcards();
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

  // Difficulty options
  const difficultyOptions = [
    { value: 1, label: 'Muito Fácil', color: 'bg-green-100 text-green-800', icon: Star },
    { value: 2, label: 'Fácil', color: 'bg-blue-100 text-blue-800', icon: Zap },
    { value: 3, label: 'Médio', color: 'bg-yellow-100 text-yellow-800', icon: Target },
    { value: 4, label: 'Difícil', color: 'bg-orange-100 text-orange-800', icon: Brain },
    { value: 5, label: 'Muito Difícil', color: 'bg-red-100 text-red-800', icon: Target }
  ];

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
    
    if (!formData.category_id || !formData.front.trim() || !formData.back.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha categoria, frente e verso do flashcard.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createFlashcard(formData);
      toast({
        title: "Flashcard criado!",
        description: "Seu flashcard personalizado foi criado com sucesso.",
      });
      navigate('/dashboard/flashcards');
    } catch (error) {
      console.error('Erro ao criar flashcard:', error);
      toast({
        title: "Erro ao criar flashcard",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = formData.category_id && formData.front.trim() && formData.back.trim();
  const selectedDifficulty = difficultyOptions.find(d => d.value === formData.difficulty_level);

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
              <Plus className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Criar Flashcard</h1>
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
                  Informações do Flashcard
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
                        {categoriesLoading ? (
                          <SelectItem value="" disabled>Carregando...</SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
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
                        <Plus className="h-4 w-4" />
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

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!isFormValid || isCreatingFlashcard}
                  >
                    {isCreatingFlashcard ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Flashcard
                      </>
                    )}
                  </Button>
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
                    Preview do Flashcard
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
                        mastery_level: 0,
                        times_seen: 0,
                        is_favorite: false
                      }
                    }}
                    showViewCount={false}
                  />
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Dicas para Criar Bons Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">📝 Frente (Pergunta)</h4>
                  <p className="text-sm text-muted-foreground">
                    Seja específico e claro. Use perguntas objetivas que tenham uma resposta definida.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">💡 Verso (Resposta)</h4>
                  <p className="text-sm text-muted-foreground">
                    Respostas concisas e precisas. Evite textos muito longos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">🎯 Dificuldade</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha baseado em quão difícil é lembrar da resposta, não na complexidade do assunto.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">🏷️ Tags</h4>
                  <p className="text-sm text-muted-foreground">
                    Use palavras-chave que ajudem a encontrar o flashcard depois.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFlashcardPage;
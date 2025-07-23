import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  ArrowLeft, 
  Search, 
  Filter, 
  Heart, 
  HeartOff,
  Volume2,
  Tag,
  Star,
  Users
} from "lucide-react";
import { useGlossary, type MedicalTerm } from "@/hooks/useGlossary";
import { useAuth } from "@/hooks/useAuth";

const MedicalGlossary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    categories,
    terms,
    userFavorites,
    filters,
    categoriesLoading,
    termsLoading,
    isToggling,
    updateFilters,
    clearFilters,
    toggleFavorite,
    incrementUsage,
    totalTerms,
    favoriteCount,
    categoriesCount
  } = useGlossary();

  const [selectedTerm, setSelectedTerm] = useState<MedicalTerm | null>(null);

  const handleTermClick = (term: MedicalTerm) => {
    setSelectedTerm(term);
    incrementUsage(term.id);
  };

  const handleToggleFavorite = (termId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      toggleFavorite(termId);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'básico': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediário': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avançado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Glossário Médico</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <span>{totalTerms} termos</span>
              <span>•</span>
              <span>{categoriesCount} categorias</span>
              {user && (
                <>
                  <span>•</span>
                  <span>{favoriteCount} favoritos</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar com filtros */}
          <div className="lg:col-span-1 space-y-6">
            {/* Busca */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Digite um termo..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categoria */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dificuldade */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Dificuldade</label>
                  <Select value={filters.difficulty} onValueChange={(value) => updateFilters({ difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as dificuldades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as dificuldades</SelectItem>
                      <SelectItem value="básico">Básico</SelectItem>
                      <SelectItem value="intermediário">Intermediário</SelectItem>
                      <SelectItem value="avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Favoritos apenas se logado */}
                {user && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="favorites"
                      checked={filters.favoritesOnly}
                      onChange={(e) => updateFilters({ favoritesOnly: e.target.checked })}
                      className="rounded border-border"
                    />
                    <label htmlFor="favorites" className="text-sm font-medium">
                      Apenas favoritos
                    </label>
                  </div>
                )}

                {/* Limpar filtros */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>

            {/* Estatísticas rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de termos</span>
                  <span className="font-semibold">{totalTerms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Categorias</span>
                  <span className="font-semibold">{categoriesCount}</span>
                </div>
                {user && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Seus favoritos</span>
                    <span className="font-semibold">{favoriteCount}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Lista de Termos</TabsTrigger>
                <TabsTrigger value="categories">Por Categoria</TabsTrigger>
              </TabsList>

              {/* Lista de termos */}
              <TabsContent value="list" className="space-y-4">
                {termsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando termos...</p>
                  </div>
                ) : terms.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {filters.search || filters.category || filters.difficulty || filters.favoritesOnly
                          ? 'Nenhum termo encontrado com os filtros aplicados.'
                          : 'Nenhum termo encontrado.'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {terms.map((term) => (
                      <Card 
                        key={term.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                        onClick={() => handleTermClick(term)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{term.term}</h3>
                                {term.pronunciation && (
                                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                    <Volume2 className="h-3 w-3" />
                                  </Button>
                                )}
                                {user && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-6 w-6"
                                    onClick={(e) => handleToggleFavorite(term.id, e)}
                                    disabled={isToggling}
                                  >
                                    {userFavorites.includes(term.id) ? (
                                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                                    ) : (
                                      <HeartOff className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {term.definition}
                              </p>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                {term.category_name && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{ 
                                      borderColor: getCategoryColor(term.category_name),
                                      color: getCategoryColor(term.category_name)
                                    }}
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {term.category_name}
                                  </Badge>
                                )}
                                
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getDifficultyColor(term.difficulty_level)}`}
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  {term.difficulty_level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Por categoria */}
              <TabsContent value="categories" className="space-y-6">
                {categoriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando categorias...</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {categories.map((category) => {
                      const categoryTerms = terms.filter(term => term.category_name === category.name);
                      
                      if (categoryTerms.length === 0) return null;
                      
                      return (
                        <Card key={category.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              {category.name}
                              <Badge variant="secondary" className="ml-auto">
                                {categoryTerms.length}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2">
                              {categoryTerms.slice(0, 5).map((term) => (
                                <div
                                  key={term.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                                  onClick={() => handleTermClick(term)}
                                >
                                  <span className="font-medium">{term.term}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ml-auto ${getDifficultyColor(term.difficulty_level)}`}
                                  >
                                    {term.difficulty_level}
                                  </Badge>
                                </div>
                              ))}
                              {categoryTerms.length > 5 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateFilters({ category: category.name })}
                                  className="mt-2"
                                >
                                  Ver todos os {categoryTerms.length} termos
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal do termo selecionado */}
      {selectedTerm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {selectedTerm.term}
                    {selectedTerm.pronunciation && (
                      <Badge variant="outline" className="text-sm">
                        {selectedTerm.pronunciation}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedTerm.category_name && (
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: getCategoryColor(selectedTerm.category_name),
                          color: getCategoryColor(selectedTerm.category_name)
                        }}
                      >
                        {selectedTerm.category_name}
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={getDifficultyColor(selectedTerm.difficulty_level)}
                    >
                      {selectedTerm.difficulty_level}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTerm(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Definição</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTerm.definition}
                </p>
              </div>

              {selectedTerm.synonyms && selectedTerm.synonyms.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Sinônimos</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.synonyms.map((synonym, index) => (
                      <Badge key={index} variant="secondary">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTerm.related_terms && selectedTerm.related_terms.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Termos Relacionados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.related_terms.map((relatedTerm, index) => (
                      <Badge key={index} variant="outline">
                        {relatedTerm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                {user && (
                  <Button
                    variant={userFavorites.includes(selectedTerm.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFavorite(selectedTerm.id)}
                    disabled={isToggling}
                  >
                    {userFavorites.includes(selectedTerm.id) ? (
                      <>
                        <Heart className="h-4 w-4 mr-2 fill-current" />
                        Remover dos Favoritos
                      </>
                    ) : (
                      <>
                        <HeartOff className="h-4 w-4 mr-2" />
                        Adicionar aos Favoritos
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  variant="medical" 
                  onClick={() => setSelectedTerm(null)}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MedicalGlossary;
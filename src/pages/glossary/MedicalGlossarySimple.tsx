import { useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Filter, Star, ArrowLeft, Users, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expandedMedicalTerms, medicalCategories, difficultyLevels } from '@/data/expandedMedicalTerms';

// Usar a base expandida
const medicalTerms = expandedMedicalTerms;
const categories = ['Todos', ...medicalCategories];
const difficulties = ['Todos', ...difficultyLevels];

const MedicalGlossarySimple = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar e buscar termos
  const filteredTerms = useMemo(() => {
    return medicalTerms.filter(term => {
      const matchesSearch = 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.synonyms?.some(synonym => 
          synonym.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        term.relatedTerms?.some(related => 
          related.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = selectedCategory === 'Todos' || term.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'Todos' || term.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'básico': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediário': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avançado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Cardiovascular': 'bg-red-50 text-red-700 border-red-200',
      'Respiratório': 'bg-blue-50 text-blue-700 border-blue-200',
      'Neurológico': 'bg-purple-50 text-purple-700 border-purple-200',
      'Gastrointestinal': 'bg-orange-50 text-orange-700 border-orange-200',
      'Geniturinário': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Endócrino': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Procedimentos': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Farmacologia': 'bg-pink-50 text-pink-700 border-pink-200',
      'Sinais Vitais': 'bg-amber-50 text-amber-700 border-amber-200',
      'Emergências': 'bg-rose-50 text-rose-700 border-rose-200',
      'Fisiologia': 'bg-teal-50 text-teal-700 border-teal-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Estatísticas
  const stats = useMemo(() => ({
    total: medicalTerms.length,
    categories: medicalCategories.length,
    difficulties: {
      básico: medicalTerms.filter(t => t.difficulty === 'básico').length,
      intermediário: medicalTerms.filter(t => t.difficulty === 'intermediário').length,
      avançado: medicalTerms.filter(t => t.difficulty === 'avançado').length
    }
  }), []);

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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Termos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {filteredTerms.length} exibidos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">
                Sistemas e especialidades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Níveis Básicos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.difficulties.básico}</div>
              <p className="text-xs text-muted-foreground">
                Conceitos fundamentais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Níveis Avançados</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.difficulties.avançado}</div>
              <p className="text-xs text-muted-foreground">
                Conceitos complexos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de busca e filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar termos, definições, sinônimos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
            
            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <div className="flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty === 'Todos' ? 'Todos' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Lista de termos */}
        <div className="grid gap-4">
          {filteredTerms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum termo encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Tente ajustar os filtros ou usar termos de busca diferentes.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTerms.map((term) => (
              <Card key={term.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-primary">
                        {term.term}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(term.category)}
                        >
                          {term.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(term.difficulty)}
                        >
                          {term.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {term.definition}
                  </CardDescription>
                  
                  {term.synonyms && term.synonyms.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        Sinônimos:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {term.synonyms.map((synonym, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        Termos Relacionados:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {term.relatedTerms.map((related, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer com informações */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            📚 {filteredTerms.length} termos encontrados de {medicalTerms.length} disponíveis
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Glossário desenvolvido para estudantes de enfermagem
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalGlossarySimple;
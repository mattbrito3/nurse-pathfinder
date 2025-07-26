import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useGlossary } from '@/hooks/useGlossary';
import {
  ArrowLeft,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { userStats, categories } = useFlashcards();
  const { allTerms } = useGlossary();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'categories'>('overview');

  // Mock data para demonstração - em produção viria do banco
  const weeklyProgress = [
    { day: 'Seg', flashcards: 12, accuracy: 85, timeSpent: 25 },
    { day: 'Ter', flashcards: 18, accuracy: 78, timeSpent: 35 },
    { day: 'Qua', flashcards: 15, accuracy: 92, timeSpent: 40 },
    { day: 'Qui', flashcards: 22, accuracy: 88, timeSpent: 45 },
    { day: 'Sex', flashcards: 8, accuracy: 95, timeSpent: 20 },
    { day: 'Sáb', flashcards: 14, accuracy: 82, timeSpent: 30 },
    { day: 'Dom', flashcards: 10, accuracy: 90, timeSpent: 25 }
  ];

  const categoryStats = categories.map(category => ({
    name: category.name,
    studied: Math.floor(Math.random() * 30) + 10,
    mastered: Math.floor(Math.random() * 15) + 5,
    accuracy: Math.floor(Math.random() * 30) + 70
  }));

  const masteryDistribution = [
    { name: 'Novo', value: 45, color: '#ef4444' },
    { name: 'Iniciante', value: 68, color: '#f97316' },
    { name: 'Básico', value: 52, color: '#eab308' },
    { name: 'Intermediário', value: 34, color: '#22c55e' },
    { name: 'Avançado', value: 18, color: '#3b82f6' },
    { name: 'Dominado', value: 12, color: '#8b5cf6' }
  ];

  const studyStreak = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    studied: Math.random() > 0.3 ? Math.floor(Math.random() * 25) + 5 : 0
  }));

  const totalFlashcards = userStats?.totalCards || 0;
  const masteredCards = userStats?.masteredCards || 0;
  const totalReviews = userStats?.totalReviews || 0;
  const accuracy = userStats?.accuracy || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Analytics</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === 'progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('progress')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Progresso
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('categories')}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Categorias
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Flashcards</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalFlashcards}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 desde a última semana
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cards Dominados</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{masteredCards}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalFlashcards > 0 ? Math.round((masteredCards / totalFlashcards) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Revisões</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 desde ontem
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Precisão</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% desde a última semana
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="flashcards"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Flashcards Estudados"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mastery Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Nível de Domínio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={masteryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {masteryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <>
            {/* Study Streak */}
            <Card>
              <CardHeader>
                <CardTitle>Sequência de Estudos (30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studyStreak}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="studied"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e' }}
                        name="Cards Estudados"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Semanais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="flashcards" fill="#3b82f6" name="Flashcards" />
                      <Bar dataKey="timeSpent" fill="#8b5cf6" name="Tempo (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Precisão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Precisão']} />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.3}
                        name="Precisão (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="studied" fill="#3b82f6" name="Estudados" />
                      <Bar dataKey="mastered" fill="#22c55e" name="Dominados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Accuracy */}
            <Card>
              <CardHeader>
                <CardTitle>Precisão por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Precisão']} />
                      <Bar dataKey="accuracy" fill="#8b5cf6" name="Precisão (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
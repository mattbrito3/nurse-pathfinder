import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';

import {
  ArrowLeft,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Wifi,
  Trophy
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
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'categories'>('overview');
  
  const {
    overallStats,
    weeklyProgress,
    categoryStats,
    masteryDistribution,
    studyStreak,
    isLoading
  } = useAnalytics();

  // Enable real-time updates
  const { isSubscribed } = useRealtimeAnalytics();

  // Debug categoryStats data
  React.useEffect(() => {
    if (categoryStats && categoryStats.length > 0) {
      console.log('📊 Category Stats Debug:', categoryStats);
    }
  }, [categoryStats]);

  // Safe defaults while loading
  const totalFlashcards = overallStats?.totalFlashcards || 0;
  const masteredCards = overallStats?.masteredCards || 0;
  const totalReviews = overallStats?.totalReviews || 0;
  const accuracy = overallStats?.accuracy || 0;
  const currentStreak = overallStats?.currentStreak || 0;
  const averageDaily = overallStats?.averageDaily || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Melhorado para mobile */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" className="h-10 px-2 sm:px-3" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Analytics</h1>
              {isSubscribed && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <Wifi className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                </div>
              )}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Tabs - Melhorados para mobile */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mx-auto sm:mx-0">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </Button>
          <Button
            variant={activeTab === 'progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('progress')}
            className="text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Progresso</span>
            <span className="sm:hidden">Prog</span>
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('categories')}
            className="text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Categorias</span>
            <span className="sm:hidden">Cat</span>
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards - Layout mobile-first */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <Card className="border-0 shadow-sm sm:shadow-md">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-lg sm:text-2xl font-bold">{totalFlashcards}</p>
                    </div>
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm sm:shadow-md">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Dominados</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{masteredCards}</p>
                    </div>
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm sm:shadow-md">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Revisões</p>
                      <p className="text-lg sm:text-2xl font-bold">{totalReviews}</p>
                    </div>
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm sm:shadow-md">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Precisão</p>
                      <p className="text-lg sm:text-2xl font-bold text-orange-600">{accuracy}%</p>
                    </div>
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm sm:shadow-md col-span-2 sm:col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Sequência</p>
                      <p className="text-lg sm:text-2xl font-bold text-red-600">{currentStreak}</p>
                    </div>
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm sm:shadow-md col-span-2 sm:col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Média/Dia</p>
                      <p className="text-lg sm:text-2xl font-bold text-indigo-600">{averageDaily}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mastery Distribution Chart - Melhorado para mobile */}
            <Card className="border-0 shadow-sm sm:shadow-md">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Distribuição de Domínio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : masteryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={masteryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {masteryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm sm:text-base">Estude flashcards para ver a distribuição de domínio!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Trend - Melhorado para mobile */}
            <Card className="border-0 shadow-sm sm:shadow-md">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Tendência de Precisão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : weeklyProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fontSize: 12 }}
                          height={60}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 12 }}
                          width={40}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Precisão']}
                          contentStyle={{ fontSize: '12px' }}
                        />
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm sm:text-base">Estude flashcards para ver a tendência de precisão!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <>
            {/* Study Streak */}
            <Card className="border-0 shadow-sm sm:shadow-md">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Sequência de Estudos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : studyStreak.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studyStreak}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          width={40}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'Flashcards']}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm sm:text-base">Estude flashcards para ver sua sequência!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            {/* Category Performance - Melhorado para mobile */}
            <Card className="border-0 shadow-sm sm:shadow-md">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Performance por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] sm:h-[500px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={categoryStats} 
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={80}
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          labelFormatter={(label) => `Categoria: ${label}`}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Bar 
                          dataKey="studied" 
                          fill="#3b82f6" 
                          name="Estudados"
                          minPointSize={8}
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar 
                          dataKey="mastered" 
                          fill="#22c55e" 
                          name="Dominados"
                          minPointSize={8}
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm sm:text-base">Estude flashcards para ver a performance por categoria!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Accuracy - Melhorado para mobile */}
            <Card className="border-0 shadow-sm sm:shadow-md">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Precisão por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] sm:h-[500px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={categoryStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          label={{ value: 'Precisão (%)', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Precisão']}
                          labelFormatter={(label) => `Categoria: ${label}`}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Bar 
                          dataKey="accuracy" 
                          fill="#8b5cf6" 
                          name="Precisão (%)"
                          minPointSize={8}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm sm:text-base">Estude flashcards para ver a precisão por categoria!</p>
                    </div>
                  )}
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
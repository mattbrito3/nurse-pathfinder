import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Calculator, BookOpen, Brain, FileText, User, Settings, LogOut, BarChart3 } from "lucide-react";
import { useFormattedDashboardStats } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading, formatNumber, getDescription } = useFormattedDashboardStats();

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // O useEffect vai redirecionar
  }

  const tools = [
    {
      icon: Calculator,
      title: "Calculadora de Medicação",
      description: "Cálculos precisos de dosagem com guia passo a passo",
      href: "/dashboard/calculator",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      available: true
    },
    {
      icon: BookOpen,
      title: "Glossário Médico",
      description: "Mais de 1000 termos médicos com definições claras",
      href: "/dashboard/glossary",
      color: "text-green-600",
      bgColor: "bg-green-50",
      available: true
    },
    {
      icon: Brain,
      title: "Flashcards Interativos",
      description: "Sistema de revisão inteligente adaptativo",
      href: "/dashboard/flashcards",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      available: true
    },
    {
      icon: BarChart3,
      title: "Analytics de Progresso",
      description: "Acompanhe seu desempenho com gráficos detalhados",
      href: "/dashboard/analytics",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      available: true
    },
    {
      icon: FileText,
      title: "PDFs Premium",
      description: "Conteúdo educativo exclusivo para download",
      href: "/dashboard/pdfs",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Voltar ao Site
            </Button>
            <h1 className="text-xl font-bold text-foreground">Dashboard - Dose Certa</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              Olá, {user.user_metadata?.full_name || user.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta!
          </h2>
          <p className="text-muted-foreground">
            Acesse suas ferramentas de estudo e continue sua jornada na enfermagem.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cálculos Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(stats.calculationsPerformed)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {getDescription('calculationsPerformed', stats.calculationsPerformed)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Termos Estudados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(stats.termsStudied)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {getDescription('termsStudied', stats.termsStudied)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Flashcards Revisados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(stats.flashcardsReviewed)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {getDescription('flashcardsReviewed', stats.flashcardsReviewed)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dias de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(stats.studyDays)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {getDescription('studyDays', stats.studyDays)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Suas Ferramentas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-lg transition-all duration-300 ${
                  tool.available ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-60'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center justify-between">
                    {tool.title}
                    {!tool.available && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Em Breve
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed mb-4">
                    {tool.description}
                  </CardDescription>
                  <Button 
                    variant={tool.available ? "medical" : "secondary"} 
                    className="w-full"
                    disabled={!tool.available}
                    onClick={() => tool.available && navigate(tool.href)}
                  >
                    {tool.available ? "Acessar" : "Em Desenvolvimento"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas últimas ações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Suas atividades aparecerão aqui em breve.</p>
              <p className="text-sm">Comece usando nossas ferramentas para ver seu progresso!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
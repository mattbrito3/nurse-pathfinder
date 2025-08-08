import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Calculator, BookOpen, Brain, FileText, User, Settings, LogOut, BarChart3, Home, Edit, Menu, X } from "lucide-react";
import { useFormattedDashboardStats } from "@/hooks/useDashboardStats";


const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { stats, isLoading: statsLoading, formatNumber, getDescription } = useFormattedDashboardStats();

  // Detect payment state from query
  const paymentState = useMemo(() => new URLSearchParams(location.search).get('payment'), [location.search]);
  useEffect(() => {
    const shouldPoll = paymentState === 'success' || paymentState === 'pending';
    if (!user || !shouldPoll) return;
    let mounted = true;
    let attempts = 0;
    const maxAttempts = paymentState === 'pending' ? 60 : 15; // Pix pode demorar mais
    const poll = async () => {
      try {
        // hit a cheap endpoint: select active subscription for this user
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${user.id}&status=eq.active&select=*,subscription_plans(name)&limit=1`, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        });
        const data = await res.json();
        if (mounted && Array.isArray(data) && data.length > 0) {
          // remove query param and show toast via URL-free state
          navigate('/dashboard', { replace: true });
          return; // stop polling
        }
      } catch {}
      attempts += 1;
      if (mounted && attempts < maxAttempts) {
        setTimeout(poll, 1000);
      }
    };
    poll();
    return () => { mounted = false; };
  }, [user, paymentState, navigate]);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="ghost" onClick={() => navigate('/')} size="sm" className="shrink-0">
              <Home className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Voltar ao Site</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              <span className="sm:hidden">Dose Certa</span>
              <span className="hidden sm:inline">Dashboard - Dose Certa</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-xs sm:text-sm text-muted-foreground hidden lg:block max-w-32 truncate">
              Olá, {user.user_metadata?.full_name || user.email}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="hidden sm:flex"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-border/40">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">
                  Olá, {user.user_metadata?.full_name || user.email}
                </span>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/profile')}
                  className="justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
    </div>
  );
};

export default Dashboard;

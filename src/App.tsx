import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect} from "react";
import { runGlossaryMigrations } from "@/utils/runMigrations";
import { runGlossaryDataMigrations } from "@/utils/runGlossaryMigrations";
import { ThemeProvider } from "@/contexts/ThemeContext";


// Páginas que carregam imediatamente (críticas)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loading para páginas menos críticas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const MedicationCalculator = lazy(() => import("./pages/calculator/MedicationCalculator"));
const MedicalGlossary = lazy(() => import("./pages/glossary/MedicalGlossary"));
const MedicalGlossarySimple = lazy(() => import("./pages/glossary/MedicalGlossarySimple"));
const FlashcardsPage = lazy(() => import("./pages/flashcards/FlashcardsPage"));
const StudyPage = lazy(() => import("./pages/flashcards/StudyPage"));
const BrowsePage = lazy(() => import("./pages/flashcards/BrowsePage"));
const CreateFlashcardPage = lazy(() => import("./pages/flashcards/CreateFlashcardPage"));

// Configuração otimizada do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      //cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de loading otimizado
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const App = () => {
  // Executar migrações na inicialização
  useEffect(() => {
    const runMigrations = async () => {
      try {
        // Executar migrações de estrutura primeiro
        await runGlossaryMigrations();
        
        // Depois executar migração de dados
        await runGlossaryDataMigrations();
        
        console.log('✅ Todas as migrações executadas com sucesso');
      } catch (error) {
        console.error('❌ Erro ao executar migrações:', error);
      }
    };

    runMigrations();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/calculator" element={<MedicationCalculator />} />
              <Route path="/dashboard/glossary" element={<MedicalGlossary />} />
                                      <Route path="/dashboard/flashcards" element={<FlashcardsPage />} />
            <Route path="/dashboard/flashcards/create" element={<CreateFlashcardPage />} />
            <Route path="/dashboard/flashcards/browse" element={<BrowsePage />} />
            <Route path="/dashboard/flashcards/browse/favorites" element={<BrowsePage />} />
            <Route path="/dashboard/flashcards/browse/:categoryId" element={<BrowsePage />} />
            <Route path="/dashboard/flashcards/study/:sessionId" element={<StudyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

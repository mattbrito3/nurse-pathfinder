import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect} from "react";
import { runGlossaryMigrations } from "@/utils/runMigrations";


// Páginas que carregam imediatamente (críticas)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loading para páginas menos críticas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MedicationCalculator = lazy(() => import("./pages/calculator/MedicationCalculator"));
const MedicalGlossary = lazy(() => import("./pages/glossary/MedicalGlossary"));
const MedicalGlossarySimple = lazy(() => import("./pages/glossary/MedicalGlossarySimple"));

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
  // Executar migrações do glossário na inicialização
  useEffect(() => {
    runGlossaryMigrations().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/calculator" element={<MedicationCalculator />} />
            <Route path="/dashboard/glossary" element={<MedicalGlossary />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

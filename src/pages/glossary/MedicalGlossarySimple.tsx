import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";

const MedicalGlossarySimple = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-bold text-foreground">Glossário Médico - Teste</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>🎉 Glossário Funcionando!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Se você está vendo esta página, a rota está funcionando corretamente.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Termos de Teste:</h3>
              
              <div className="grid gap-3">
                <Card className="p-4">
                  <h4 className="font-medium">Aorta</h4>
                  <p className="text-sm text-muted-foreground">
                    Maior artéria do corpo humano, que transporta sangue oxigenado do coração para todo o organismo.
                  </p>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium">Pressão Arterial</h4>
                  <p className="text-sm text-muted-foreground">
                    Força exercida pelo sangue contra as paredes das artérias durante a circulação.
                  </p>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium">Taquicardia</h4>
                  <p className="text-sm text-muted-foreground">
                                          Aumento da frequência cardíaca acima dos valores normais (&gt;100 bpm em adultos).
                  </p>
                </Card>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="medical" 
                onClick={() => navigate('/dashboard')}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalGlossarySimple;
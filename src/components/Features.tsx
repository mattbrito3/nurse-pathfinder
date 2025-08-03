import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, Brain, FileText, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Calculadora de Medicação",
    description: "Cálculos precisos de dosagem com guia passo a passo para evitar erros de medicação.",
    color: "text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-600/50 dark:to-slate-700/50 border border-blue-200 dark:border-slate-600/30"
  },
  {
    icon: BookOpen,
    title: "Glossário Médico",
    description: "Mais de 1000 termos médicos com definições claras preparadas por profissionais experientes.",
    color: "text-emerald-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-slate-200",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-600/50 dark:to-slate-700/50 border border-emerald-200 dark:border-slate-600/30"
  },
  {
    icon: Brain,
    title: "Flashcards Interativos",
    description: "Sistema de revisão inteligente que se adapta ao seu progresso de aprendizado.",
    color: "text-purple-600 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-slate-200",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-600/50 dark:to-slate-700/50 border border-purple-200 dark:border-slate-600/30"
  },
  {
    icon: Shield,
    title: "Conteúdo Confiável",
    description: "Todo conteúdo revisado por enfermeiros especialistas e atualizado regularmente.",
    color: "text-amber-600 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-slate-200",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-600/50 dark:to-slate-700/50 border border-amber-200 dark:border-slate-600/30"
  },
  {
    icon: Smartphone,
    title: "Acesso Offline",
    description: "Sincronização de dados para acesso sem conexão em qualquer lugar.",
    color: "text-indigo-600 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-slate-200",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-600/50 dark:to-slate-700/50 border border-indigo-200 dark:border-slate-600/30"
  }
];

const Features = () => {
  return (
    <section id="funcionalidades" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-foreground">
            Funcionalidades
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Completas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Todas as ferramentas que você precisa para se destacar na enfermagem, 
            reunidas em uma plataforma moderna e intuitiva.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-slate-700/50 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/20 bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color} transition-colors duration-200`} />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-slate-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="medical" size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            Explorar Todas as Funcionalidades
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
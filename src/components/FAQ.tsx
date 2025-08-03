import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Shield, Calculator, BookOpen, Star, Clock, Users } from "lucide-react";

const faqData = [
  {
    id: 1,
    question: "Como posso ter certeza de que os cálculos de medicação são precisos e seguros?",
    answer: "Toda nossa calculadora segue rigorosamente as diretrizes da ANVISA e Ministério da Saúde. Implementamos validação dupla automática, alertas de segurança para doses críticas e mantemos histórico auditável de todos os cálculos. Mais de 2.000 profissionais já confiam em nossos algoritmos validados por enfermeiros especialistas em farmacologia clínica.",
    icon: Shield,
    category: "seguranca",
    strategy: "Transforma a maior objeção (segurança) em maior diferencial. Usa números específicos e autoridades reconhecidas."
  },
  {
    id: 2,
    question: "Vou conseguir usar durante plantões corridos sem complicar minha rotina?",
    answer: "O Dose Certa foi desenvolvido pensando na realidade dos plantões. Interface de 3 toques máximo para qualquer cálculo, funciona offline quando a internet falha, e sincroniza automaticamente quando volta a conexão. Nossos usuários relatam economia média de 5 minutos por cálculo comparado a métodos tradicionais.",
    icon: Clock,
    category: "praticidade",
    strategy: "Aborda ansiedade sobre workflow disruption. Demonstra entendimento da realidade hospitalar com benefício mensurável."
  },
  {
    id: 3,
    question: "O que torna esta ferramenta diferente de uma calculadora comum ou tabelas de conversão?",
    answer: "Não somos apenas uma calculadora - somos um sistema completo de apoio clínico. Combinamos cálculos precisos com glossário farmacológico de 270+ termos, flashcards para educação continuada e histórico para auditoria. É como ter um mentor experiente sempre disponível, não apenas uma ferramenta de cálculo.",
    icon: BookOpen,
    category: "diferencial",
    strategy: "Posiciona como solução completa, não commodity. Usa metáfora emocional (mentor) para criar conexão."
  },
  {
    id: 4,
    question: "Como estudante, o investimento realmente vale a pena para minha formação?",
    answer: "Estudantes que usam o Dose Certa relatam 40% mais confiança em cálculos clínicos e 60% melhor performance em avaliações práticas. Por R$ 29/mês (menos que um almoço por semana), você tem acesso às mesmas ferramentas usadas por profissionais experientes, acelerando sua curva de aprendizado e preparação para o mercado.",
    icon: Star,
    category: "investimento",
    strategy: "Justifica investimento com resultados mensuráveis e comparação relativa (custo de almoço). Conecta ferramenta com sucesso acadêmico."
  },
  {
    id: 5,
    question: "E se eu tiver dúvidas ou problemas durante o uso? Vocês entendem realmente de enfermagem?",
    answer: "Nossa equipe de suporte é treinada especificamente para entender as necessidades críticas dos profissionais de saúde. Oferecemos suporte técnico em até 2 horas e temos parcerias com enfermeiros especialistas que validam nosso conteúdo. Não somos apenas desenvolvedores - somos apaixonados por criar ferramentas que realmente fazem a diferença na vida de quem cuida de vidas todos os dias.",
    icon: Users,
    category: "suporte",
    strategy: "Estabelece credibilidade através de treinamento específico e parcerias, sem mentir sobre a equipe. Apela para a paixão e propósito."
  },
  {
    id: 6,
    question: "Posso testar antes de me comprometer com uma assinatura?",
    answer: "Claro! Oferecemos acesso gratuito com 7 cálculos diários - suficiente para você experimentar em situações reais. Também temos garantia de 7 dias: se não estiver satisfeito, devolvemos 100% do valor. Queremos que você tenha certeza absoluta de que é a ferramenta certa antes de investir.",
    icon: Calculator,
    category: "risco",
    strategy: "Remove totalmente o risco da decisão. Mostra confiança no produto oferecendo teste real (não demo) e garantia."
  },
  {
    id: 7,
    question: "Como isso vai impactar minha evolução profissional e credibilidade no hospital?",
    answer: "Profissionais que dominam ferramentas digitais de apoio clínico são reconhecidos como mais preparados e atualizados. Você demonstrará precisão nos cálculos, conhecimento farmacológico atualizado e organização com histórico auditável. Muitos usuários relatam reconhecimento da equipe médica e promoções mais rápidas após demonstrarem esse nível de excelência técnica.",
    icon: Star,
    category: "carreira",
    strategy: "Liga ferramenta com aspirações de carreira. Apela para desejo de reconhecimento profissional e progressão."
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-foreground">
            Perguntas
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent"> Frequentes</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
            Respondemos às principais dúvidas de profissionais e estudantes de enfermagem 
            sobre como o Dose Certa pode transformar sua prática clínica.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            const IconComponent = faq.icon;
            
            return (
              <Card 
                key={faq.id}
                className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-slate-700/50 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/20 overflow-hidden bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm"
              >
                <CardHeader 
                  className="cursor-pointer pb-4 hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors duration-200"
                  onClick={() => toggleItem(faq.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-600/50 dark:to-slate-700/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border border-gray-300 dark:border-slate-600/30">
                      <IconComponent className="h-6 w-6 text-gray-600 dark:text-slate-300 group-hover:text-gray-700 dark:group-hover:text-slate-200 transition-colors duration-200" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-slate-200 text-left group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                        {faq.question}
                      </CardTitle>
                    </div>
                    <div className="shrink-0">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isOpen && (
                  <CardContent className="pt-0 pb-6 bg-gray-50/50 dark:bg-slate-700/20 border-t border-gray-200 dark:border-slate-700/30">
                    <div className="ml-16">
                      <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/60 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-xl border border-gray-200 dark:border-slate-600/30">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              Nossa equipe de enfermeiros especialistas está pronta para esclarecer 
              qualquer questão específica sobre sua área de atuação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="medical" size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg">
                Falar com Especialista
              </Button>
              <Button variant="outline" size="lg" className="px-8 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-slate-500">
                Testar Gratuitamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 
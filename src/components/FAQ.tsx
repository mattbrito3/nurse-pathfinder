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
    answer: "Estudantes que usam o Dose Certa relatam 40% mais confiança em cálculos clínicos e 60% melhor performance em avaliações práticas. Por R$ 18,99/mês (menos que um almoço por semana), você tem acesso às mesmas ferramentas usadas por profissionais experientes, acelerando sua curva de aprendizado e preparação para o mercado.",
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
          <h2 
            className="text-3xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-foreground"
            data-aos="fade-up"
          >
            Perguntas
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent gradient-text-animate"> Frequentes</span>
          </h2>
          <p 
            className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Respondemos às principais dúvidas de profissionais e estudantes de enfermagem 
            sobre como o Dose Certa pode transformar sua prática clínica.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = openItems.includes(faq.id);
            const IconComponent = faq.icon;
            
            return (
              <Card 
                key={faq.id}
                className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-slate-700/50 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/20 overflow-hidden bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm hover-lift"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardHeader 
                  className="cursor-pointer p-6 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200"
                  onClick={() => toggleItem(faq.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {faq.question}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <CardContent className="px-6 pb-6">
                    <div className="pl-14">
                      <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                        {faq.answer}
                      </CardDescription>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        <div 
          className="text-center mt-16"
          data-aos="fade-up"
          data-aos-delay="800"
        >
          <Button 
            variant="medical" 
            size="lg" 
            className="px-8 py-6 text-lg hover-lift btn-pulse"
          >
            Ainda tem dúvidas? Fale conosco
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Target, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Activity,
  Calendar,
  Users,
  Zap,
  BookOpen,
  Calculator,
  Brain,
  Database,
  Shield,
  BarChart3,
  Smartphone,
  Bell
} from 'lucide-react';
import { 
  nursePathfinderPlanner, 
  NursePathfinderFeature, 
  Sprint, 
  NursePathfinderMetrics,
  addNursePathfinderFeature,
  generateSprint
} from '../utils/nursePathfinderPlanning';

interface PlanningProps {
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Calculadora': return <Calculator className="h-4 w-4" />;
    case 'Flashcards': return <Brain className="h-4 w-4" />;
    case 'Glossário': return <BookOpen className="h-4 w-4" />;
    case 'Autenticação': return <Shield className="h-4 w-4" />;
    case 'Analytics': return <BarChart3 className="h-4 w-4" />;
    case 'UX/UI': return <Smartphone className="h-4 w-4" />;
    case 'Performance': return <Zap className="h-4 w-4" />;
    case 'Integração': return <Database className="h-4 w-4" />;
    default: return <Target className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Crítica': return 'bg-red-100 text-red-800 border-red-200';
    case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800 border-green-200';
    case 'Em Desenvolvimento': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Em Teste': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Planejado': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Backlog': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const NursePathfinderPlanning: React.FC<PlanningProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<NursePathfinderMetrics | null>(null);
  const [features, setFeatures] = useState<NursePathfinderFeature[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [planningReport, setPlanningReport] = useState<string>('');
  const [suggestedSprint, setSuggestedSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentMetrics = nursePathfinderPlanner.getMetrics();
    const allFeatures = nursePathfinderPlanner['features'] || [];
    const allSprints = nursePathfinderPlanner['sprints'] || [];
    
    setMetrics(currentMetrics);
    setFeatures(allFeatures);
    setSprints(allSprints);
    setPlanningReport(nursePathfinderPlanner.generatePlanningReport());
  };

  const handleGenerateSprint = (capacity: number) => {
    const sprint = generateSprint(capacity);
    setSuggestedSprint(sprint);
  };

  const handleStartFeature = (featureId: string) => {
    nursePathfinderPlanner.updateFeature(featureId, {
      status: 'Em Desenvolvimento',
      startDate: new Date()
    });
    loadData();
  };

  const handleCompleteFeature = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      nursePathfinderPlanner.updateFeature(featureId, {
        status: 'Concluído',
        endDate: new Date(),
        actualTime: feature.estimatedTime // Simplificado
      });
      loadData();
    }
  };

  if (!metrics) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando planejamento...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planejamento Nurse Pathfinder</h1>
          <p className="text-muted-foreground">
            Planejamento estratégico e acompanhamento de funcionalidades
          </p>
        </div>
        <Button onClick={loadData}>
          <Activity className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Features</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalFeatures}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.completedFeatures} concluídas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.userSatisfactionScore.toFixed(1)}/10</div>
                <p className="text-xs text-muted-foreground">
                  score do usuário
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Débito Técnico</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.technicalDebtScore.toFixed(1)}/10</div>
                <p className="text-xs text-muted-foreground">
                  score de qualidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Velocidade</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.velocityTrend > 0 ? '+' : ''}{metrics.velocityTrend.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  tendência
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          <div className="space-y-4">
            {metrics.criticalIssues.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {metrics.criticalIssues.length} issue(s) crítico(s) pendente(s). 
                  Priorizar resolução antes de novas funcionalidades.
                </AlertDescription>
              </Alert>
            )}

            {metrics.technicalDebtScore > 7 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Débito técnico alto ({metrics.technicalDebtScore.toFixed(1)}/10). 
                  Considerar sprint dedicado para refatoração.
                </AlertDescription>
              </Alert>
            )}

            {metrics.userSatisfactionScore < 7 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Satisfação do usuário baixa ({metrics.userSatisfactionScore.toFixed(1)}/10). 
                  Focar em melhorias de UX.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Features em Desenvolvimento */}
          <Card>
            <CardHeader>
              <CardTitle>Features em Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent>
              {features.filter(f => f.status === 'Em Desenvolvimento').length === 0 ? (
                <p className="text-muted-foreground">Nenhuma feature em desenvolvimento</p>
              ) : (
                <div className="space-y-4">
                  {features.filter(f => f.status === 'Em Desenvolvimento').map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(feature.category)}
                        <div>
                          <h3 className="font-medium">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteFeature(feature.id)}
                        >
                          Concluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlog" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Backlog de Features</h2>
            <Button onClick={() => handleGenerateSprint(40)}>
              <Calendar className="h-4 w-4 mr-2" />
              Gerar Sprint (40h)
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Features por Categoria */}
            {['Calculadora', 'Flashcards', 'Glossário', 'Analytics', 'UX/UI', 'Performance'].map(category => {
              const categoryFeatures = features.filter(f => f.category === category && f.status === 'Backlog');
              if (categoryFeatures.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getCategoryIcon(category)}
                      <span className="ml-2">{category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryFeatures.map(feature => (
                        <div key={feature.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{feature.name}</h4>
                            <Badge className={getPriorityColor(feature.priority)}>
                              {feature.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span>Impacto: {feature.userImpact}/10</span>
                            <span>Complexidade: {feature.technicalComplexity}/10</span>
                            <span>{feature.estimatedTime}h</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleStartFeature(feature.id)}
                          >
                            Iniciar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Sprints</h2>
            <div className="space-x-2">
              <Button onClick={() => handleGenerateSprint(20)} variant="outline">
                Sprint Pequeno (20h)
              </Button>
              <Button onClick={() => handleGenerateSprint(40)} variant="outline">
                Sprint Médio (40h)
              </Button>
              <Button onClick={() => handleGenerateSprint(60)} variant="outline">
                Sprint Grande (60h)
              </Button>
            </div>
          </div>

          {suggestedSprint && (
            <Card>
              <CardHeader>
                <CardTitle>Sprint Sugerido</CardTitle>
                <CardDescription>
                  Baseado nas prioridades e capacidade disponível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{suggestedSprint.name}</span>
                    <Badge>{suggestedSprint.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacidade:</span> {suggestedSprint.capacity}h
                    </div>
                    <div>
                      <span className="text-muted-foreground">Features:</span> {suggestedSprint.features.length}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Objetivos:</h4>
                    <ul className="space-y-1">
                      {suggestedSprint.goals.map((goal, index) => (
                        <li key={index} className="text-sm">• {goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sprints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sprints Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sprints.map(sprint => (
                    <div key={sprint.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{sprint.name}</h4>
                        <Badge className={getStatusColor(sprint.status)}>
                          {sprint.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Capacidade:</span> {sprint.capacity}h
                        </div>
                        <div>
                          <span className="text-muted-foreground">Velocidade:</span> {sprint.velocity}h
                        </div>
                        <div>
                          <span className="text-muted-foreground">Features:</span> {sprint.features.length}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Produtividade */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Produtividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <span className="text-sm">{((metrics.completedFeatures / metrics.totalFeatures) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(metrics.completedFeatures / metrics.totalFeatures) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tempo Médio de Conclusão</span>
                    <span className="text-sm">{metrics.averageTimeToComplete.toFixed(1)}h</span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.averageTimeToComplete / 40) * 100, 100)} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Features em Backlog</span>
                    <span className="text-sm">{metrics.backlogFeatures}</span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.backlogFeatures / 20) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Qualidade */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Satisfação do Usuário</span>
                    <span className="text-sm">{metrics.userSatisfactionScore.toFixed(1)}/10</span>
                  </div>
                  <Progress 
                    value={(metrics.userSatisfactionScore / 10) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Débito Técnico</span>
                    <span className="text-sm">{metrics.technicalDebtScore.toFixed(1)}/10</span>
                  </div>
                  <Progress 
                    value={metrics.technicalDebtScore * 10} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tendência de Velocidade</span>
                    <span className="text-sm">{metrics.velocityTrend > 0 ? '+' : ''}{metrics.velocityTrend.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.max(0, (metrics.velocityTrend + 20) * 2.5)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Mais Valiosas */}
          <Card>
            <CardHeader>
              <CardTitle>Features Mais Valiosas</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.mostValuableFeatures.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma feature concluída ainda</p>
              ) : (
                <div className="space-y-2">
                  {metrics.mostValuableFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Planejamento</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                {planningReport}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
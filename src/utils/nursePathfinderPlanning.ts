// Sistema de Planejamento Específico para Nurse Pathfinder
export interface NursePathfinderFeature {
  id: string;
  name: string;
  description: string;
  category: 'Calculadora' | 'Flashcards' | 'Glossário' | 'Autenticação' | 'Analytics' | 'UX/UI' | 'Performance' | 'Integração';
  priority: 'Crítica' | 'Alta' | 'Média' | 'Baixa';
  status: 'Backlog' | 'Planejado' | 'Em Desenvolvimento' | 'Em Teste' | 'Concluído' | 'Cancelado';
  estimatedTime: number; // em horas
  actualTime?: number;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string;
  userImpact: number; // 1-10
  technicalComplexity: number; // 1-10
  businessValue: number; // 1-10
  dependencies: string[]; // IDs de outras features
  acceptanceCriteria: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  features: string[]; // IDs das features
  capacity: number; // horas disponíveis
  velocity: number; // horas completadas
  status: 'Planejado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  goals: string[];
  retrospective: string;
}

export interface NursePathfinderMetrics {
  totalFeatures: number;
  completedFeatures: number;
  inProgressFeatures: number;
  backlogFeatures: number;
  averageTimeToComplete: number;
  userSatisfactionScore: number;
  technicalDebtScore: number;
  velocityTrend: number;
  mostValuableFeatures: string[];
  criticalIssues: string[];
}

export class NursePathfinderPlanner {
  private features: NursePathfinderFeature[] = [];
  private sprints: Sprint[] = [];
  
  constructor() {
    this.loadFromStorage();
    if (this.features.length === 0) {
      this.initializeDefaultFeatures();
    }
  }
  
  // Inicializar features padrão do Nurse Pathfinder
  private initializeDefaultFeatures(): void {
    const defaultFeatures: Omit<NursePathfinderFeature, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: "Melhorar Calculadora de Medicamentos",
        description: "Adicionar mais fórmulas médicas e validações de segurança",
        category: 'Calculadora',
        priority: 'Alta',
        status: 'Backlog',
        estimatedTime: 16,
        userImpact: 9,
        technicalComplexity: 7,
        businessValue: 9,
        dependencies: [],
        acceptanceCriteria: [
          "Suporte a 10+ fórmulas médicas",
          "Validação de dosagem por peso/idade",
          "Histórico de cálculos",
          "Alertas de segurança"
        ],
        notes: "Funcionalidade core do produto, alta prioridade para usuários"
      },
      {
        name: "Sistema de Flashcards Avançado",
        description: "Implementar spaced repetition e categorização inteligente",
        category: 'Flashcards',
        priority: 'Alta',
        status: 'Backlog',
        estimatedTime: 20,
        userImpact: 8,
        technicalComplexity: 8,
        businessValue: 8,
        dependencies: [],
        acceptanceCriteria: [
          "Algoritmo de spaced repetition",
          "Categorização automática",
          "Progresso individual",
          "Modo offline"
        ],
        notes: "Diferencial competitivo importante"
      },
      {
        name: "Glossário Médico Interativo",
        description: "Adicionar busca avançada e relacionamentos entre termos",
        category: 'Glossário',
        priority: 'Média',
        status: 'Backlog',
        estimatedTime: 12,
        userImpact: 7,
        technicalComplexity: 5,
        businessValue: 7,
        dependencies: [],
        acceptanceCriteria: [
          "Busca por sinônimos",
          "Relacionamentos entre termos",
          "Exemplos práticos",
          "Favoritos do usuário"
        ],
        notes: "Melhora a experiência de aprendizado"
      },
      {
        name: "Dashboard de Analytics para Usuários",
        description: "Mostrar progresso individual e estatísticas de estudo",
        category: 'Analytics',
        priority: 'Média',
        status: 'Backlog',
        estimatedTime: 14,
        userImpact: 6,
        technicalComplexity: 6,
        businessValue: 6,
        dependencies: ['Sistema de Flashcards Avançado'],
        acceptanceCriteria: [
          "Gráficos de progresso",
          "Tempo de estudo",
          "Áreas de melhoria",
          "Metas personalizadas"
        ],
        notes: "Ajuda na retenção de usuários"
      },
      {
        name: "Autenticação Social Melhorada",
        description: "Adicionar login com Apple e melhorar segurança",
        category: 'Autenticação',
        priority: 'Média',
        status: 'Backlog',
        estimatedTime: 8,
        userImpact: 5,
        technicalComplexity: 4,
        businessValue: 5,
        dependencies: [],
        acceptanceCriteria: [
          "Login com Apple",
          "2FA opcional",
          "Recuperação de conta",
          "Logs de segurança"
        ],
        notes: "Melhora segurança e facilita login"
      },
      {
        name: "Otimização de Performance",
        description: "Melhorar tempo de carregamento e responsividade",
        category: 'Performance',
        priority: 'Alta',
        status: 'Backlog',
        estimatedTime: 10,
        userImpact: 8,
        technicalComplexity: 6,
        businessValue: 7,
        dependencies: [],
        acceptanceCriteria: [
          "Carregamento < 2s",
          "Lazy loading",
          "Cache inteligente",
          "PWA otimizado"
        ],
        notes: "Crítico para experiência do usuário"
      },
      {
        name: "Modo Offline Completo",
        description: "Permitir uso offline de todas as funcionalidades",
        category: 'UX/UI',
        priority: 'Média',
        status: 'Backlog',
        estimatedTime: 18,
        userImpact: 7,
        technicalComplexity: 8,
        businessValue: 6,
        dependencies: ['Sistema de Flashcards Avançado'],
        acceptanceCriteria: [
          "Sincronização automática",
          "Cache inteligente",
          "Indicadores de status",
          "Resolução de conflitos"
        ],
        notes: "Importante para usuários mobile"
      },
      {
        name: "Sistema de Notificações",
        description: "Lembretes de estudo e atualizações personalizadas",
        category: 'UX/UI',
        priority: 'Baixa',
        status: 'Backlog',
        estimatedTime: 12,
        userImpact: 6,
        technicalComplexity: 5,
        businessValue: 5,
        dependencies: ['Dashboard de Analytics para Usuários'],
        acceptanceCriteria: [
          "Lembretes de estudo",
          "Notificações push",
          "Personalização",
          "Configurações de privacidade"
        ],
        notes: "Aumenta engajamento"
      }
    ];
    
    defaultFeatures.forEach(feature => {
      this.addFeature({
        ...feature,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }
  
  // Adicionar nova feature
  addFeature(feature: Omit<NursePathfinderFeature, 'id'>): string {
    const newFeature: NursePathfinderFeature = {
      ...feature,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.features.push(newFeature);
    this.saveToStorage();
    return newFeature.id;
  }
  
  // Atualizar feature
  updateFeature(id: string, updates: Partial<NursePathfinderFeature>): boolean {
    const feature = this.features.find(f => f.id === id);
    if (!feature) return false;
    
    Object.assign(feature, { ...updates, updatedAt: new Date() });
    this.saveToStorage();
    return true;
  }
  
  // Obter features por categoria
  getFeaturesByCategory(category: NursePathfinderFeature['category']): NursePathfinderFeature[] {
    return this.features.filter(f => f.category === category);
  }
  
  // Obter features por status
  getFeaturesByStatus(status: NursePathfinderFeature['status']): NursePathfinderFeature[] {
    return this.features.filter(f => f.status === status);
  }
  
  // Obter features por prioridade
  getFeaturesByPriority(priority: NursePathfinderFeature['priority']): NursePathfinderFeature[] {
    return this.features.filter(f => f.priority === priority);
  }
  
  // Gerar sprint sugerido
  generateSuggestedSprint(capacity: number): Sprint {
    const backlogFeatures = this.getFeaturesByStatus('Backlog');
    const highPriorityFeatures = backlogFeatures.filter(f => f.priority === 'Alta' || f.priority === 'Crítica');
    
    // Ordenar por valor (business value * user impact / technical complexity)
    const sortedFeatures = highPriorityFeatures.sort((a, b) => {
      const valueA = (a.businessValue * a.userImpact) / a.technicalComplexity;
      const valueB = (b.businessValue * b.userImpact) / b.technicalComplexity;
      return valueB - valueA;
    });
    
    const selectedFeatures: string[] = [];
    let totalTime = 0;
    
    for (const feature of sortedFeatures) {
      if (totalTime + feature.estimatedTime <= capacity) {
        selectedFeatures.push(feature.id);
        totalTime += feature.estimatedTime;
      }
    }
    
    const sprint: Sprint = {
      id: this.generateId(),
      name: `Sprint ${this.sprints.length + 1}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 semanas
      features: selectedFeatures,
      capacity,
      velocity: 0,
      status: 'Planejado',
      goals: selectedFeatures.map(id => {
        const feature = this.features.find(f => f.id === id);
        return `Implementar ${feature?.name}`;
      }),
      retrospective: ''
    };
    
    return sprint;
  }
  
  // Obter métricas do projeto
  getMetrics(): NursePathfinderMetrics {
    const completedFeatures = this.getFeaturesByStatus('Concluído');
    const inProgressFeatures = this.getFeaturesByStatus('Em Desenvolvimento');
    const backlogFeatures = this.getFeaturesByStatus('Backlog');
    
    const averageTimeToComplete = completedFeatures.length > 0
      ? completedFeatures.reduce((sum, f) => sum + (f.actualTime || 0), 0) / completedFeatures.length
      : 0;
    
    const userSatisfactionScore = completedFeatures.length > 0
      ? completedFeatures.reduce((sum, f) => sum + f.userImpact, 0) / completedFeatures.length
      : 0;
    
    const technicalDebtScore = this.calculateTechnicalDebtScore();
    
    const velocityTrend = this.calculateVelocityTrend();
    
    const mostValuableFeatures = this.features
      .filter(f => f.status === 'Concluído')
      .sort((a, b) => (b.businessValue * b.userImpact) - (a.businessValue * a.userImpact))
      .slice(0, 5)
      .map(f => f.name);
    
    const criticalIssues = this.features
      .filter(f => f.priority === 'Crítica' && f.status !== 'Concluído')
      .map(f => f.name);
    
    return {
      totalFeatures: this.features.length,
      completedFeatures: completedFeatures.length,
      inProgressFeatures: inProgressFeatures.length,
      backlogFeatures: backlogFeatures.length,
      averageTimeToComplete,
      userSatisfactionScore,
      technicalDebtScore,
      velocityTrend,
      mostValuableFeatures,
      criticalIssues
    };
  }
  
  // Gerar relatório de planejamento
  generatePlanningReport(): string {
    const metrics = this.getMetrics();
    const backlogFeatures = this.getFeaturesByStatus('Backlog');
    const highPriorityBacklog = backlogFeatures.filter(f => f.priority === 'Alta' || f.priority === 'Crítica');
    
    return `
## Relatório de Planejamento - Nurse Pathfinder

### Resumo Geral
- **Total de funcionalidades:** ${metrics.totalFeatures}
- **Concluídas:** ${metrics.completedFeatures}
- **Em desenvolvimento:** ${metrics.inProgressFeatures}
- **Backlog:** ${metrics.backlogFeatures}

### Métricas de Performance
- **Tempo médio de conclusão:** ${metrics.averageTimeToComplete.toFixed(1)}h
- **Satisfação do usuário:** ${metrics.userSatisfactionScore.toFixed(1)}/10
- **Débito técnico:** ${metrics.technicalDebtScore.toFixed(1)}/10
- **Tendência de velocidade:** ${metrics.velocityTrend > 0 ? '+' : ''}${metrics.velocityTrend.toFixed(1)}%

### Próximas Prioridades (Backlog)
${highPriorityBacklog.map(feature => `
**${feature.name}** (${feature.priority})
- Impacto: ${feature.userImpact}/10
- Complexidade: ${feature.technicalComplexity}/10
- Valor: ${feature.businessValue}/10
- Tempo estimado: ${feature.estimatedTime}h
- Categoria: ${feature.category}
`).join('\n')}

### Funcionalidades Mais Valiosas
${metrics.mostValuableFeatures.map(name => `- ${name}`).join('\n')}

### Issues Críticos
${metrics.criticalIssues.length > 0 
  ? metrics.criticalIssues.map(name => `- ${name}`).join('\n')
  : '- Nenhum issue crítico pendente'
}

### Recomendações
${this.generateRecommendations(metrics)}
    `.trim();
  }
  
  private calculateTechnicalDebtScore(): number {
    // Simular cálculo baseado em features antigas e complexidade
    const oldFeatures = this.features.filter(f => {
      const ageInDays = (new Date().getTime() - f.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return ageInDays > 30;
    });
    
    const avgComplexity = oldFeatures.length > 0
      ? oldFeatures.reduce((sum, f) => sum + f.technicalComplexity, 0) / oldFeatures.length
      : 0;
    
    return Math.min(10, avgComplexity * 0.8);
  }
  
  private calculateVelocityTrend(): number {
    // Simular tendência baseada em sprints recentes
    const recentSprints = this.sprints.filter(s => s.status === 'Concluído');
    if (recentSprints.length < 2) return 0;
    
    const recentSprint = recentSprints[recentSprints.length - 1];
    const previousSprint = recentSprints[recentSprints.length - 2];
    
    const velocityChange = recentSprint.velocity - previousSprint.velocity;
    return (velocityChange / previousSprint.velocity) * 100;
  }
  
  private generateRecommendations(metrics: NursePathfinderMetrics): string {
    const recommendations = [];
    
    if (metrics.criticalIssues.length > 0) {
      recommendations.push('- Priorizar resolução de issues críticos antes de novas funcionalidades');
    }
    
    if (metrics.technicalDebtScore > 7) {
      recommendations.push('- Dedicar sprint para redução de débito técnico');
    }
    
    if (metrics.velocityTrend < -10) {
      recommendations.push('- Revisar processo de desenvolvimento e estimativas');
    }
    
    if (metrics.userSatisfactionScore < 7) {
      recommendations.push('- Focar em melhorias de UX baseadas no feedback dos usuários');
    }
    
    if (metrics.backlogFeatures > 10) {
      recommendations.push('- Revisar e priorizar backlog para evitar sobrecarga');
    }
    
    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : '- Projeto está bem equilibrado, manter ritmo atual';
  }
  
  private generateId(): string {
    return `np_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('nursePathfinderPlanning', JSON.stringify({
        features: this.features,
        sprints: this.sprints
      }));
    } catch (error) {
      console.warn('Não foi possível salvar planejamento no localStorage:', error);
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('nursePathfinderPlanning');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.features = (parsed.features || []).map((feature: any) => ({
          ...feature,
          createdAt: new Date(feature.createdAt),
          updatedAt: new Date(feature.updatedAt),
          startDate: feature.startDate ? new Date(feature.startDate) : undefined,
          endDate: feature.endDate ? new Date(feature.endDate) : undefined
        }));
        this.sprints = (parsed.sprints || []).map((sprint: any) => ({
          ...sprint,
          startDate: new Date(sprint.startDate),
          endDate: new Date(sprint.endDate)
        }));
      }
    } catch (error) {
      console.warn('Não foi possível carregar planejamento do localStorage:', error);
    }
  }
}

// Instância global do planner
export const nursePathfinderPlanner = new NursePathfinderPlanner();

// Funções utilitárias
export const addNursePathfinderFeature = (
  name: string,
  description: string,
  category: NursePathfinderFeature['category'],
  priority: NursePathfinderFeature['priority'],
  estimatedTime: number,
  userImpact: number,
  technicalComplexity: number,
  businessValue: number
): string => {
  return nursePathfinderPlanner.addFeature({
    name,
    description,
    category,
    priority,
    status: 'Backlog',
    estimatedTime,
    userImpact,
    technicalComplexity,
    businessValue,
    dependencies: [],
    acceptanceCriteria: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const generateSprint = (capacity: number): Sprint => {
  return nursePathfinderPlanner.generateSuggestedSprint(capacity);
};

export const getNursePathfinderMetrics = (): NursePathfinderMetrics => {
  return nursePathfinderPlanner.getMetrics();
}; 
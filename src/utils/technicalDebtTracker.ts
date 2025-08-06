// Sistema de Gerenciamento de Débito Técnico
export interface TechnicalDebtItem {
  id: string;
  title: string;
  description: string;
  context: string;
  impact: string;
  temporarySolution: string;
  idealSolution: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  estimatedTime: number; // em horas
  createdAt: Date;
  affectedFiles: string[];
  affectedFeatures: string[];
  status: 'Ativo' | 'Em Resolução' | 'Resolvido';
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface TechnicalDebtMetrics {
  totalItems: number;
  activeItems: number;
  highPriorityItems: number;
  totalEstimatedTime: number;
  averageAge: number; // em dias
  growthRate: number; // itens por semana
}

export class TechnicalDebtTracker {
  private debtItems: TechnicalDebtItem[] = [];
  
  constructor() {
    this.loadFromStorage();
    // Adicionar dados de exemplo se não houver dados
    if (this.debtItems.length === 0) {
      this.addSampleData();
    }
  }
  
  // Adicionar dados de exemplo
  private addSampleData(): void {
    const sampleItems: Omit<TechnicalDebtItem, 'id' | 'createdAt' | 'status'>[] = [
      {
        title: "Refatorar sistema de autenticação",
        description: "O sistema atual usa múltiplas implementações de auth que podem ser consolidadas",
        context: "Implementação rápida para MVP criou inconsistências",
        impact: "Dificulta manutenção e pode causar bugs de segurança",
        temporarySolution: "Manter implementações separadas com documentação",
        idealSolution: "Implementar AuthProvider unificado com Supabase Auth",
        priority: 'Alta',
        estimatedTime: 8,
        affectedFiles: ['src/hooks/useAuth.tsx', 'src/components/auth/GoogleLoginButton.tsx'],
        affectedFeatures: ['Login', 'Registro', 'Autenticação Google']
      },
      {
        title: "Otimizar queries do Supabase",
        description: "Algumas queries estão fazendo múltiplas chamadas desnecessárias",
        context: "Desenvolvimento rápido priorizou funcionalidade sobre performance",
        impact: "Lentidão na interface e alto consumo de recursos",
        temporarySolution: "Implementar cache básico no frontend",
        idealSolution: "Refatorar queries com joins e implementar cache inteligente",
        priority: 'Média',
        estimatedTime: 6,
        affectedFiles: ['src/hooks/useFlashcards.tsx', 'src/hooks/useGlossary.tsx'],
        affectedFeatures: ['Flashcards', 'Glossário', 'Dashboard']
      },
      {
        title: "Implementar tratamento de erros consistente",
        description: "Diferentes componentes tratam erros de formas diferentes",
        context: "Desenvolvimento incremental sem padronização de erros",
        impact: "Experiência do usuário inconsistente e dificulta debugging",
        temporarySolution: "Usar try-catch básico em cada componente",
        idealSolution: "Criar ErrorBoundary e sistema de notificações unificado",
        priority: 'Média',
        estimatedTime: 4,
        affectedFiles: ['src/pages/Dashboard.tsx'],
        affectedFeatures: ['Todas as páginas', 'Sistema de notificações']
      },
      {
        title: "Remover código duplicado em cálculos",
        description: "Lógica de cálculo de medicamentos está duplicada em vários lugares",
        context: "Funcionalidades foram desenvolvidas independentemente",
        impact: "Bugs difíceis de corrigir e manutenção complexa",
        temporarySolution: "Manter duplicação com comentários explicativos",
        idealSolution: "Criar utilitário centralizado de cálculos médicos",
        priority: 'Alta',
        estimatedTime: 5,
        affectedFiles: ['src/utils/medicationCalculations.ts', 'src/pages/calculator/MedicationCalculator.tsx'],
        affectedFeatures: ['Calculadora', 'Histórico de Cálculos']
      },
      {
        title: "Melhorar responsividade mobile",
        description: "Alguns componentes não funcionam bem em telas pequenas",
        context: "Desenvolvimento focado inicialmente em desktop",
        impact: "Experiência ruim para usuários mobile",
        temporarySolution: "Usar breakpoints básicos do Tailwind",
        idealSolution: "Redesenhar componentes com mobile-first approach",
        priority: 'Baixa',
        estimatedTime: 12,
        affectedFiles: ['src/pages/flashcards/StudyPage.tsx'],
        affectedFeatures: ['Dashboard', 'Estudo de Flashcards', 'Glossário']
      }
    ];
    
    sampleItems.forEach(item => {
      this.addDebtItem(item);
    });
  }
  
  // Adicionar novo item de débito técnico
  addDebtItem(item: Omit<TechnicalDebtItem, 'id' | 'createdAt' | 'status'>): string {
    const newItem: TechnicalDebtItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      status: 'Ativo'
    };
    
    this.debtItems.push(newItem);
    this.saveToStorage();
    
    console.log(`Débito técnico registrado: ${newItem.title}`);
    return newItem.id;
  }
  
  // Atualizar status de um item
  updateItemStatus(id: string, status: TechnicalDebtItem['status'], resolutionNotes?: string): boolean {
    const item = this.debtItems.find(item => item.id === id);
    if (!item) return false;
    
    item.status = status;
    if (status === 'Resolvido') {
      item.resolvedAt = new Date();
      item.resolutionNotes = resolutionNotes;
    }
    
    this.saveToStorage();
    return true;
  }
  
  // Obter todos os itens ativos
  getActiveItems(): TechnicalDebtItem[] {
    return this.debtItems.filter(item => item.status === 'Ativo');
  }
  
  // Obter itens por prioridade
  getItemsByPriority(priority: TechnicalDebtItem['priority']): TechnicalDebtItem[] {
    return this.debtItems.filter(item => item.priority === priority && item.status === 'Ativo');
  }
  
  // Obter itens que afetam um arquivo específico
  getItemsByFile(filePath: string): TechnicalDebtItem[] {
    return this.debtItems.filter(item => 
      item.affectedFiles.includes(filePath) && item.status === 'Ativo'
    );
  }
  
  // Obter métricas de débito técnico
  getMetrics(): TechnicalDebtMetrics {
    const activeItems = this.getActiveItems();
    const highPriorityItems = activeItems.filter(item => item.priority === 'Alta');
    
    const totalEstimatedTime = activeItems.reduce((sum, item) => sum + item.estimatedTime, 0);
    
    const averageAge = activeItems.length > 0 
      ? activeItems.reduce((sum, item) => {
          const ageInDays = (new Date().getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + ageInDays;
        }, 0) / activeItems.length
      : 0;
    
    // Calcular taxa de crescimento (itens por semana)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentItems = this.debtItems.filter(item => item.createdAt > oneWeekAgo);
    const growthRate = recentItems.length;
    
    return {
      totalItems: this.debtItems.length,
      activeItems: activeItems.length,
      highPriorityItems: highPriorityItems.length,
      totalEstimatedTime,
      averageAge,
      growthRate
    };
  }
  
  // Gerar relatório de débito técnico
  generateReport(): string {
    const metrics = this.getMetrics();
    const highPriorityItems = this.getItemsByPriority('Alta');
    
    return `
## Relatório de Débito Técnico

### Resumo Geral
- **Total de itens:** ${metrics.totalItems}
- **Itens ativos:** ${metrics.activeItems}
- **Itens de alta prioridade:** ${metrics.highPriorityItems}
- **Tempo estimado total:** ${metrics.totalEstimatedTime}h
- **Idade média:** ${metrics.averageAge.toFixed(1)} dias
- **Taxa de crescimento:** ${metrics.growthRate} itens/semana

### Itens de Alta Prioridade
${highPriorityItems.length > 0 
  ? highPriorityItems.map(item => `
**${item.title}**
- Impacto: ${item.impact}
- Tempo estimado: ${item.estimatedTime}h
- Arquivos afetados: ${item.affectedFiles.join(', ')}
- Criado em: ${item.createdAt.toLocaleDateString()}
`).join('\n')
  : '- Nenhum item de alta prioridade'
}

### Recomendações
${this.generateRecommendations(metrics)}
    `.trim();
  }
  
  private generateRecommendations(metrics: TechnicalDebtMetrics): string {
    const recommendations = [];
    
    if (metrics.highPriorityItems > 5) {
      recommendations.push("- Priorizar resolução de itens de alta prioridade para reduzir riscos");
    }
    
    if (metrics.averageAge > 30) {
      recommendations.push("- Revisar itens antigos que podem ter se tornado obsoletos");
    }
    
    if (metrics.growthRate > 3) {
      recommendations.push("- Revisar processo de desenvolvimento para reduzir criação de débito técnico");
    }
    
    if (metrics.totalEstimatedTime > 40) {
      recommendations.push("- Planejar sprint dedicado para redução de débito técnico");
    }
    
    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : "- Débito técnico está sob controle";
  }
  
  // Gerar plano de resolução
  generateResolutionPlan(): string {
    const activeItems = this.getActiveItems();
    const highPriorityItems = activeItems.filter(item => item.priority === 'Alta');
    const mediumPriorityItems = activeItems.filter(item => item.priority === 'Média');
    
    return `
## Plano de Resolução de Débito Técnico

### Sprint 1 - Alta Prioridade (${highPriorityItems.length} itens)
${highPriorityItems.map((item, index) => `
${index + 1}. **${item.title}** (${item.estimatedTime}h)
   - ${item.description}
   - Solução: ${item.idealSolution}
`).join('\n')}

### Sprint 2 - Média Prioridade (${mediumPriorityItems.length} itens)
${mediumPriorityItems.map((item, index) => `
${index + 1}. **${item.title}** (${item.estimatedTime}h)
   - ${item.description}
   - Solução: ${item.idealSolution}
`).join('\n')}

### Estimativas
- **Sprint 1:** ${highPriorityItems.reduce((sum, item) => sum + item.estimatedTime, 0)}h
- **Sprint 2:** ${mediumPriorityItems.reduce((sum, item) => sum + item.estimatedTime, 0)}h
- **Total:** ${activeItems.reduce((sum, item) => sum + item.estimatedTime, 0)}h
    `.trim();
  }
  
  private generateId(): string {
    return `td_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('technicalDebt', JSON.stringify(this.debtItems));
    } catch (error) {
      console.warn('Não foi possível salvar débito técnico no localStorage:', error);
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('technicalDebt');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.debtItems = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        }));
      }
    } catch (error) {
      console.warn('Não foi possível carregar débito técnico do localStorage:', error);
    }
  }
}

// Instância global do tracker
export const technicalDebtTracker = new TechnicalDebtTracker();

// Funções utilitárias para uso em componentes
export const recordTechnicalDebt = (
  title: string,
  description: string,
  context: string,
  impact: string,
  temporarySolution: string,
  idealSolution: string,
  priority: TechnicalDebtItem['priority'],
  estimatedTime: number,
  affectedFiles: string[],
  affectedFeatures: string[]
): string => {
  return technicalDebtTracker.addDebtItem({
    title,
    description,
    context,
    impact,
    temporarySolution,
    idealSolution,
    priority,
    estimatedTime,
    affectedFiles,
    affectedFeatures
  });
};

export const resolveTechnicalDebt = (id: string, resolutionNotes?: string): boolean => {
  return technicalDebtTracker.updateItemStatus(id, 'Resolvido', resolutionNotes);
}; 

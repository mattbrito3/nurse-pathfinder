// Sistema Simples de Backlog - Dose Certa
export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: 'Calculadora' | 'Flashcards' | 'Glossário' | 'UX/UI' | 'Performance' | 'Autenticação' | 'Outros';
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Backlog' | 'Em Desenvolvimento' | 'Concluído' | 'Cancelado';
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

export class SimpleBacklog {
  private items: BacklogItem[] = [];
  
  constructor() {
    this.loadFromStorage();
    if (this.items.length === 0) {
      this.addSampleItems();
    }
  }
  
  // Adicionar item ao backlog
  addItem(
    title: string,
    description: string,
    category: BacklogItem['category'],
    priority: BacklogItem['priority'] = 'Média',
    notes?: string
  ): string {
    const item: BacklogItem = {
      id: this.generateId(),
      title,
      description,
      category,
      priority,
      status: 'Backlog',
      createdAt: new Date(),
      notes
    };
    
    this.items.push(item);
    this.saveToStorage();
    return item.id;
  }
  
  // Atualizar status de um item
  updateStatus(id: string, status: BacklogItem['status']): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    
    item.status = status;
    if (status === 'Concluído') {
      item.completedAt = new Date();
    }
    
    this.saveToStorage();
    return true;
  }
  
  // Atualizar item
  updateItem(id: string, updates: Partial<BacklogItem>): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    
    Object.assign(item, updates);
    this.saveToStorage();
    return true;
  }
  
  // Remover item
  removeItem(id: string): boolean {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.items.splice(index, 1);
    this.saveToStorage();
    return true;
  }
  
  // Obter todos os items
  getAllItems(): BacklogItem[] {
    return [...this.items].sort((a, b) => {
      // Ordenar por prioridade e depois por data de criação
      const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
  
  // Obter items por status
  getItemsByStatus(status: BacklogItem['status']): BacklogItem[] {
    return this.items.filter(item => item.status === status);
  }
  
  // Obter items por categoria
  getItemsByCategory(category: BacklogItem['category']): BacklogItem[] {
    return this.items.filter(item => item.category === category);
  }
  
  // Obter estatísticas simples
  getStats() {
    const total = this.items.length;
    const backlog = this.items.filter(i => i.status === 'Backlog').length;
    const inProgress = this.items.filter(i => i.status === 'Em Desenvolvimento').length;
    const completed = this.items.filter(i => i.status === 'Concluído').length;
    const cancelled = this.items.filter(i => i.status === 'Cancelado').length;
    
    return {
      total,
      backlog,
      inProgress,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
  
  // Adicionar alguns items de exemplo
  private addSampleItems(): void {
    const sampleItems = [
      {
        title: "Melhorar Calculadora de Medicamentos",
        description: "Adicionar mais fórmulas e validações de segurança",
        category: 'Calculadora' as const,
        priority: 'Alta' as const,
        notes: "Funcionalidade core do produto"
      },
      {
        title: "Sistema de Flashcards Avançado",
        description: "Implementar spaced repetition e categorização",
        category: 'Flashcards' as const,
        priority: 'Alta' as const,
        notes: "Diferencial competitivo"
      },
      {
        title: "Otimizar Performance",
        description: "Melhorar tempo de carregamento da aplicação",
        category: 'Performance' as const,
        priority: 'Média' as const,
        notes: "Importante para UX"
      },
      {
        title: "Adicionar Login com Apple",
        description: "Implementar autenticação social com Apple",
        category: 'Autenticação' as const,
        priority: 'Baixa' as const,
        notes: "Para usuários iOS"
      }
    ];
    
    sampleItems.forEach(item => {
      this.addItem(item.title, item.description, item.category, item.priority, item.notes);
    });
  }
  
  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('doseCertaBacklog', JSON.stringify(this.items));
    } catch (error) {
      console.warn('Não foi possível salvar backlog no localStorage:', error);
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('doseCertaBacklog');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.items = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined
        }));
      }
    } catch (error) {
      console.warn('Não foi possível carregar backlog do localStorage:', error);
    }
  }
}

// Instância global
export const simpleBacklog = new SimpleBacklog();

// Funções utilitárias
export const addBacklogItem = (
  title: string,
  description: string,
  category: BacklogItem['category'],
  priority?: BacklogItem['priority'],
  notes?: string
): string => {
  return simpleBacklog.addItem(title, description, category, priority, notes);
};

export const updateBacklogStatus = (id: string, status: BacklogItem['status']): boolean => {
  return simpleBacklog.updateStatus(id, status);
};

export const getBacklogStats = () => {
  return simpleBacklog.getStats();
}; 

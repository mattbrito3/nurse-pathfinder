// Sistema de Análise de Impacto e Interdependências
export interface ImpactAnalysis {
  featureName: string;
  analysisDate: Date;
  
  // Onda 1 - Impacto Direto
  directImpact: {
    filesToModify: string[];
    componentsToChange: string[];
    apisToAlter: string[];
    databaseChanges: string[];
  };
  
  // Onda 2 - Impacto Indireto
  indirectImpact: {
    dependentFeatures: string[];
    integrationsAffected: string[];
    dataImpact: string[];
    performanceConsiderations: string[];
  };
  
  // Onda 3 - Impacto Sistêmico
  systemicImpact: {
    overallPerformance: string;
    userExperience: string;
    securityImplications: string[];
    scalabilityConcerns: string[];
  };
  
  // Estratégia de Implementação
  implementationStrategy: {
    order: string[];
    validationPoints: string[];
    rollbackPlan: string;
    estimatedTime: number; // em horas
    riskLevel: 'Baixo' | 'Médio' | 'Alto';
  };
  
  // Dependências
  dependencies: {
    internal: string[];
    external: string[];
    blocking: string[];
  };
}

export interface ImpactWave {
  wave: 1 | 2 | 3;
  description: string;
  items: string[];
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  mitigationStrategy: string;
}

export class ImpactAnalyzer {
  private analyses: ImpactAnalysis[] = [];
  
  constructor() {
    this.loadFromStorage();
    // Adicionar dados de exemplo se não houver dados
    if (this.analyses.length === 0) {
      this.addSampleData();
    }
  }
  
  // Adicionar dados de exemplo
  private addSampleData(): void {
    const sampleAnalyses: Omit<ImpactAnalysis, 'analysisDate'>[] = [
      {
        featureName: "Sistema de Notificações Push",
        directImpact: {
          filesToModify: [
            'src/components/NotificationCenter.tsx',
            'src/hooks/useNotifications.tsx',
            'src/services/notificationService.ts'
          ],
          componentsToChange: [
            'Header',
            'Dashboard',
            'FlashcardStudy'
          ],
          apisToAlter: [
            '/api/notifications',
            '/api/user-preferences'
          ],
          databaseChanges: [
            'Criar tabela notifications',
            'Adicionar campo notification_preferences em user_profiles'
          ]
        },
        indirectImpact: {
          dependentFeatures: [
            'Sistema de Flashcards',
            'Calculadora de Medicamentos',
            'Dashboard Analytics'
          ],
          integrationsAffected: [
            'Supabase Realtime',
            'Browser Push API'
          ],
          dataImpact: [
            'Aumento no volume de dados armazenados',
            'Novos tipos de eventos para tracking'
          ],
          performanceConsiderations: [
            'Latência de push notifications',
            'Cache de preferências de usuário'
          ]
        },
        systemicImpact: {
          overallPerformance: "Leve impacto na performance inicial, melhoria na experiência do usuário",
          userExperience: "Significativa melhoria na retenção e engajamento",
          securityImplications: [
            'Permissões de push notifications',
            'Validação de tokens de dispositivo'
          ],
          scalabilityConcerns: [
            'Limite de push notifications por usuário',
            'Rate limiting para evitar spam'
          ]
        },
        implementationStrategy: {
          order: [
            'Configurar serviço de push notifications',
            'Criar tabela de notificações no banco',
            'Implementar hook useNotifications',
            'Criar componente NotificationCenter',
            'Integrar com funcionalidades existentes',
            'Testar em diferentes dispositivos'
          ],
          validationPoints: [
            'Notificações chegam corretamente',
            'Preferências são respeitadas',
            'Performance não é afetada',
            'Funciona em iOS e Android'
          ],
          rollbackPlan: "Desabilitar push notifications e manter notificações in-app",
          estimatedTime: 16,
          riskLevel: 'Médio'
        },
        dependencies: {
          internal: [
            'Sistema de autenticação',
            'User profiles',
            'Supabase Realtime'
          ],
          external: [
            'Firebase Cloud Messaging',
            'Apple Push Notification Service'
          ],
          blocking: [
            'Configuração de certificados push',
            'Aprovação nas app stores'
          ]
        }
      },
      {
        featureName: "Modo Offline para Flashcards",
        directImpact: {
          filesToModify: [
            'src/hooks/useFlashcards.tsx',
            'src/services/flashcardService.ts',
            'src/utils/offlineStorage.ts'
          ],
          componentsToChange: [
            'FlashcardComponent',
            'StudyPage',
            'BrowsePage'
          ],
          apisToAlter: [
            '/api/flashcards/sync',
            '/api/flashcards/offline'
          ],
          databaseChanges: [
            'Adicionar campo last_synced em flashcards',
            'Criar tabela offline_changes'
          ]
        },
        indirectImpact: {
          dependentFeatures: [
            'Sistema de Progresso',
            'Analytics de Estudo',
            'Sincronização de Dados'
          ],
          integrationsAffected: [
            'IndexedDB',
            'Service Workers'
          ],
          dataImpact: [
            'Dados duplicados localmente',
            'Estratégia de merge para conflitos'
          ],
          performanceConsiderations: [
            'Tamanho do cache local',
            'Velocidade de sincronização'
          ]
        },
        systemicImpact: {
          overallPerformance: "Melhoria significativa na performance offline, leve overhead online",
          userExperience: "Experiência consistente mesmo sem internet",
          securityImplications: [
            'Dados sensíveis armazenados localmente',
            'Criptografia de dados offline'
          ],
          scalabilityConcerns: [
            'Limite de armazenamento local',
            'Estratégia de limpeza de cache'
          ]
        },
        implementationStrategy: {
          order: [
            'Implementar sistema de cache local',
            'Criar service worker para offline',
            'Modificar hooks para suportar offline',
            'Implementar sincronização',
            'Adicionar indicadores de status',
            'Testar cenários offline'
          ],
          validationPoints: [
            'Flashcards funcionam offline',
            'Sincronização resolve conflitos',
            'Performance online não é afetada',
            'Cache é limpo adequadamente'
          ],
          rollbackPlan: "Desabilitar modo offline e manter funcionalidade online",
          estimatedTime: 12,
          riskLevel: 'Baixo'
        },
        dependencies: {
          internal: [
            'Sistema de flashcards',
            'User authentication',
            'Progress tracking'
          ],
          external: [
            'IndexedDB API',
            'Service Workers API'
          ],
          blocking: [
            'Configuração de service worker',
            'Testes em diferentes browsers'
          ]
        }
      }
    ];
    
    sampleAnalyses.forEach(analysis => {
      this.createImpactAnalysis(
        analysis.featureName,
        analysis.directImpact,
        analysis.indirectImpact,
        analysis.systemicImpact,
        analysis.implementationStrategy,
        analysis.dependencies
      );
    });
  }
  
  // Criar nova análise de impacto
  createImpactAnalysis(
    featureName: string,
    directImpact: ImpactAnalysis['directImpact'],
    indirectImpact: ImpactAnalysis['indirectImpact'],
    systemicImpact: ImpactAnalysis['systemicImpact'],
    implementationStrategy: ImpactAnalysis['implementationStrategy'],
    dependencies: ImpactAnalysis['dependencies']
  ): string {
    const analysis: ImpactAnalysis = {
      featureName,
      analysisDate: new Date(),
      directImpact,
      indirectImpact,
      systemicImpact,
      implementationStrategy,
      dependencies
    };
    
    this.analyses.push(analysis);
    this.saveToStorage();
    
    console.log(`Análise de impacto criada para: ${featureName}`);
    return this.generateAnalysisId(analysis);
  }
  
  // Gerar relatório de análise de impacto
  generateImpactReport(featureName: string): string {
    const analysis = this.analyses.find(a => a.featureName === featureName);
    if (!analysis) {
      return `Análise de impacto não encontrada para: ${featureName}`;
    }
    
    const waves = this.generateImpactWaves(analysis);
    
    return `
## Análise de Impacto - ${analysis.featureName}

**Data da Análise:** ${analysis.analysisDate.toLocaleDateString()}
**Nível de Risco:** ${analysis.implementationStrategy.riskLevel}
**Tempo Estimado:** ${analysis.implementationStrategy.estimatedTime}h

### Onda 1 - Impacto Direto
**Descrição:** Modificações diretas necessárias para implementar a funcionalidade

**Arquivos a Modificar:**
${analysis.directImpact.filesToModify.map(file => `- ${file}`).join('\n')}

**Componentes a Alterar:**
${analysis.directImpact.componentsToChange.map(component => `- ${component}`).join('\n')}

**APIs a Alterar:**
${analysis.directImpact.apisToAlter.map(api => `- ${api}`).join('\n')}

**Mudanças no Banco de Dados:**
${analysis.directImpact.databaseChanges.map(db => `- ${db}`).join('\n')}

### Onda 2 - Impacto Indireto
**Descrição:** Funcionalidades e integrações que podem ser afetadas indiretamente

**Funcionalidades Dependentes:**
${analysis.indirectImpact.dependentFeatures.map(feature => `- ${feature}`).join('\n')}

**Integrações Afetadas:**
${analysis.indirectImpact.integrationsAffected.map(integration => `- ${integration}`).join('\n')}

**Impacto nos Dados:**
${analysis.indirectImpact.dataImpact.map(impact => `- ${impact}`).join('\n')}

**Considerações de Performance:**
${analysis.indirectImpact.performanceConsiderations.map(perf => `- ${perf}`).join('\n')}

### Onda 3 - Impacto Sistêmico
**Descrição:** Impactos no sistema como um todo

**Performance Geral:** ${analysis.systemicImpact.overallPerformance}

**Experiência do Usuário:** ${analysis.systemicImpact.userExperience}

**Implicações de Segurança:**
${analysis.systemicImpact.securityImplications.map(security => `- ${security}`).join('\n')}

**Preocupações de Escalabilidade:**
${analysis.systemicImpact.scalabilityConcerns.map(scalability => `- ${scalability}`).join('\n')}

### Estratégia de Implementação

**Ordem de Implementação:**
${analysis.implementationStrategy.order.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Pontos de Validação:**
${analysis.implementationStrategy.validationPoints.map(point => `- ${point}`).join('\n')}

**Plano de Rollback:**
${analysis.implementationStrategy.rollbackPlan}

### Dependências

**Dependências Internas:**
${analysis.dependencies.internal.map(dep => `- ${dep}`).join('\n')}

**Dependências Externas:**
${analysis.dependencies.external.map(dep => `- ${dep}`).join('\n')}

**Dependências Bloqueantes:**
${analysis.dependencies.blocking.map(dep => `- ${dep}`).join('\n')}

### Análise de Ondas de Impacto

${waves.map(wave => `
**Onda ${wave.wave} - ${wave.description}**
- **Itens:** ${wave.items.length}
- **Nível de Risco:** ${wave.riskLevel}
- **Estratégia de Mitigação:** ${wave.mitigationStrategy}

${wave.items.map(item => `  - ${item}`).join('\n')}
`).join('\n')}

### Recomendações

${this.generateRecommendations(analysis)}
    `.trim();
  }
  
  // Gerar ondas de impacto
  private generateImpactWaves(analysis: ImpactAnalysis): ImpactWave[] {
    const waves: ImpactWave[] = [];
    
    // Onda 1
    const wave1Items = [
      ...analysis.directImpact.filesToModify,
      ...analysis.directImpact.componentsToChange,
      ...analysis.directImpact.apisToAlter,
      ...analysis.directImpact.databaseChanges
    ];
    
    waves.push({
      wave: 1,
      description: 'Impacto Direto',
      items: wave1Items,
      riskLevel: this.calculateRiskLevel(wave1Items.length, analysis.implementationStrategy.riskLevel),
      mitigationStrategy: 'Implementar com testes unitários abrangentes'
    });
    
    // Onda 2
    const wave2Items = [
      ...analysis.indirectImpact.dependentFeatures,
      ...analysis.indirectImpact.integrationsAffected,
      ...analysis.indirectImpact.dataImpact,
      ...analysis.indirectImpact.performanceConsiderations
    ];
    
    waves.push({
      wave: 2,
      description: 'Impacto Indireto',
      items: wave2Items,
      riskLevel: this.calculateRiskLevel(wave2Items.length, analysis.implementationStrategy.riskLevel),
      mitigationStrategy: 'Validar integrações e funcionalidades dependentes'
    });
    
    // Onda 3
    const wave3Items = [
      analysis.systemicImpact.overallPerformance,
      analysis.systemicImpact.userExperience,
      ...analysis.systemicImpact.securityImplications,
      ...analysis.systemicImpact.scalabilityConcerns
    ];
    
    waves.push({
      wave: 3,
      description: 'Impacto Sistêmico',
      items: wave3Items,
      riskLevel: this.calculateRiskLevel(wave3Items.length, analysis.implementationStrategy.riskLevel),
      mitigationStrategy: 'Monitorar métricas e performance pós-implantação'
    });
    
    return waves;
  }
  
  private calculateRiskLevel(itemCount: number, baseRisk: string): 'Baixo' | 'Médio' | 'Alto' {
    if (itemCount <= 3) return 'Baixo';
    if (itemCount <= 8) return 'Médio';
    return 'Alto';
  }
  
  private generateRecommendations(analysis: ImpactAnalysis): string {
    const recommendations = [];
    
    if (analysis.implementationStrategy.riskLevel === 'Alto') {
      recommendations.push('- Implementar em ambiente de staging primeiro');
      recommendations.push('- Planejar rollback detalhado');
      recommendations.push('- Validar cada onda de impacto antes de prosseguir');
    }
    
    if (analysis.dependencies.blocking.length > 0) {
      recommendations.push('- Resolver dependências bloqueantes antes da implementação');
    }
    
    if (analysis.directImpact.filesToModify.length > 10) {
      recommendations.push('- Considerar dividir a implementação em fases menores');
    }
    
    if (analysis.indirectImpact.dependentFeatures.length > 5) {
      recommendations.push('- Coordenar com equipes responsáveis pelas funcionalidades dependentes');
    }
    
    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : '- Implementação de baixo risco, seguir estratégia padrão';
  }
  
  // Verificar conflitos com análises anteriores
  checkConflicts(featureName: string): string[] {
    const currentAnalysis = this.analyses.find(a => a.featureName === featureName);
    if (!currentAnalysis) return [];
    
    const conflicts: string[] = [];
    
    // Verificar conflitos de arquivos
    this.analyses.forEach(analysis => {
      if (analysis.featureName === featureName) return;
      
      const fileConflicts = currentAnalysis.directImpact.filesToModify.filter(file =>
        analysis.directImpact.filesToModify.includes(file)
      );
      
      if (fileConflicts.length > 0) {
        conflicts.push(`Conflito de arquivos com ${analysis.featureName}: ${fileConflicts.join(', ')}`);
      }
    });
    
    return conflicts;
  }
  
  // Obter todas as análises
  getAllAnalyses(): ImpactAnalysis[] {
    return [...this.analyses];
  }
  
  // Obter análise por nome
  getAnalysis(featureName: string): ImpactAnalysis | undefined {
    return this.analyses.find(a => a.featureName === featureName);
  }
  
  private generateAnalysisId(analysis: ImpactAnalysis): string {
    return `impact_${analysis.featureName.replace(/\s+/g, '_')}_${analysis.analysisDate.getTime()}`;
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('impactAnalyses', JSON.stringify(this.analyses));
    } catch (error) {
      console.warn('Não foi possível salvar análises de impacto no localStorage:', error);
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('impactAnalyses');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.analyses = parsed.map((analysis: any) => ({
          ...analysis,
          analysisDate: new Date(analysis.analysisDate)
        }));
      }
    } catch (error) {
      console.warn('Não foi possível carregar análises de impacto do localStorage:', error);
    }
  }
}

// Instância global do analisador
export const impactAnalyzer = new ImpactAnalyzer();

// Funções utilitárias para uso em componentes
export const createImpactAnalysis = (
  featureName: string,
  directImpact: ImpactAnalysis['directImpact'],
  indirectImpact: ImpactAnalysis['indirectImpact'],
  systemicImpact: ImpactAnalysis['systemicImpact'],
  implementationStrategy: ImpactAnalysis['implementationStrategy'],
  dependencies: ImpactAnalysis['dependencies']
): string => {
  return impactAnalyzer.createImpactAnalysis(
    featureName,
    directImpact,
    indirectImpact,
    systemicImpact,
    implementationStrategy,
    dependencies
  );
};

export const getImpactReport = (featureName: string): string => {
  return impactAnalyzer.generateImpactReport(featureName);
};

export const checkImpactConflicts = (featureName: string): string[] => {
  return impactAnalyzer.checkConflicts(featureName);
}; 

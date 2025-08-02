// Templates para Diferentes Tipos de Funcionalidades
export interface FeatureTemplate {
  name: string;
  description: string;
  phases: FeaturePhase[];
  validationCriteria: ValidationCriteria;
  estimatedTime: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
}

export interface FeaturePhase {
  name: string;
  description: string;
  objectives: string[];
  successCriteria: string[];
  validationMethod: string;
  estimatedTime: number;
}

export interface ValidationCriteria {
  technical: string[];
  integration: string[];
  userExperience: string[];
}

// Templates para Interface do Usuário
export const uiFeatureTemplate: FeatureTemplate = {
  name: 'Interface do Usuário',
  description: 'Funcionalidades que envolvem componentes visuais e interações do usuário',
  phases: [
    {
      name: 'Estrutura',
      description: 'Layout e componentes básicos',
      objectives: [
        'Criar estrutura HTML/JSX básica',
        'Definir hierarquia de componentes',
        'Implementar layout responsivo básico'
      ],
      successCriteria: [
        'Componente renderiza sem erros',
        'Layout funciona em diferentes tamanhos de tela',
        'Estrutura de dados está correta'
      ],
      validationMethod: 'Teste visual e console sem erros',
      estimatedTime: 2
    },
    {
      name: 'Comportamento',
      description: 'Interações e lógica de negócio',
      objectives: [
        'Implementar handlers de eventos',
        'Adicionar lógica de estado',
        'Conectar com APIs e dados'
      ],
      successCriteria: [
        'Interações funcionam conforme esperado',
        'Estado é gerenciado corretamente',
        'Dados são carregados e exibidos'
      ],
      validationMethod: 'Teste funcional das interações',
      estimatedTime: 3
    },
    {
      name: 'Refinamento Visual',
      description: 'Estilos e animações',
      objectives: [
        'Aplicar estilos CSS/Tailwind',
        'Adicionar animações e transições',
        'Polir detalhes visuais'
      ],
      successCriteria: [
        'Interface segue design system',
        'Animações são suaves e apropriadas',
        'Visual está polido e profissional'
      ],
      validationMethod: 'Revisão visual e teste de usabilidade',
      estimatedTime: 2
    },
    {
      name: 'Otimização',
      description: 'Performance e acessibilidade',
      objectives: [
        'Otimizar performance de renderização',
        'Implementar acessibilidade (ARIA)',
        'Adicionar testes de acessibilidade'
      ],
      successCriteria: [
        'Performance é aceitável (< 100ms para interações)',
        'Acessibilidade atende padrões WCAG',
        'Testes de acessibilidade passam'
      ],
      validationMethod: 'Testes de performance e acessibilidade',
      estimatedTime: 1
    }
  ],
  validationCriteria: {
    technical: [
      'Componente renderiza sem erros no console',
      'Performance de renderização < 100ms',
      'Código segue padrões de linting',
      'Testes unitários passam'
    ],
    integration: [
      'Integra corretamente com outros componentes',
      'Não quebra funcionalidades existentes',
      'APIs são chamadas corretamente',
      'Estado global é atualizado adequadamente'
    ],
    userExperience: [
      'Interface é intuitiva e clara',
      'Fluxo de trabalho faz sentido',
      'Feedback visual é apropriado',
      'Responsividade funciona em todos os dispositivos'
    ]
  },
  estimatedTime: 8,
  riskLevel: 'Baixo'
};

// Templates para Integrações Externas
export const integrationFeatureTemplate: FeatureTemplate = {
  name: 'Integração Externa',
  description: 'Funcionalidades que se conectam com APIs e serviços externos',
  phases: [
    {
      name: 'Simulações',
      description: 'Mock APIs e dados de teste',
      objectives: [
        'Criar mocks para APIs externas',
        'Definir contratos de dados',
        'Implementar dados de teste realistas'
      ],
      successCriteria: [
        'Mocks retornam dados consistentes',
        'Contratos de API estão documentados',
        'Dados de teste cobrem cenários principais'
      ],
      validationMethod: 'Teste com dados mock',
      estimatedTime: 2
    },
    {
      name: 'Conexões Básicas',
      description: 'Integração simples com APIs reais',
      objectives: [
        'Implementar chamadas HTTP básicas',
        'Configurar autenticação',
        'Tratar respostas básicas'
      ],
      successCriteria: [
        'APIs são chamadas com sucesso',
        'Autenticação funciona',
        'Dados são recebidos corretamente'
      ],
      validationMethod: 'Teste de integração com APIs reais',
      estimatedTime: 3
    },
    {
      name: 'Tratamento de Erros',
      description: 'Robustez e fallbacks',
      objectives: [
        'Implementar tratamento de erros',
        'Adicionar retry logic',
        'Criar fallbacks para falhas'
      ],
      successCriteria: [
        'Erros são tratados graciosamente',
        'Sistema se recupera de falhas',
        'Usuário recebe feedback apropriado'
      ],
      validationMethod: 'Teste de cenários de erro',
      estimatedTime: 2
    },
    {
      name: 'Otimização',
      description: 'Performance e cache',
      objectives: [
        'Implementar cache de dados',
        'Otimizar frequência de chamadas',
        'Adicionar monitoramento'
      ],
      successCriteria: [
        'Cache reduz chamadas desnecessárias',
        'Performance é aceitável',
        'Monitoramento detecta problemas'
      ],
      validationMethod: 'Teste de performance e monitoramento',
      estimatedTime: 1
    }
  ],
  validationCriteria: {
    technical: [
      'APIs são chamadas corretamente',
      'Autenticação funciona em todos os cenários',
      'Tratamento de erros é robusto',
      'Performance é aceitável (< 2s para chamadas)'
    ],
    integration: [
      'Integração não afeta outras funcionalidades',
      'Fallbacks funcionam quando APIs falham',
      'Dados são consistentes entre chamadas',
      'Rate limiting é respeitado'
    ],
    userExperience: [
      'Loading states são apropriados',
      'Erros são comunicados claramente',
      'Dados são atualizados em tempo real',
      'Interface permanece responsiva'
    ]
  },
  estimatedTime: 8,
  riskLevel: 'Médio'
};

// Templates para Processamento de Dados
export const dataProcessingFeatureTemplate: FeatureTemplate = {
  name: 'Processamento de Dados',
  description: 'Funcionalidades que envolvem manipulação e análise de dados',
  phases: [
    {
      name: 'Lógica Central',
      description: 'Algoritmos principais',
      objectives: [
        'Implementar algoritmos de processamento',
        'Definir estruturas de dados',
        'Criar funções de transformação'
      ],
      successCriteria: [
        'Algoritmos produzem resultados corretos',
        'Estruturas de dados são eficientes',
        'Transformações funcionam conforme especificado'
      ],
      validationMethod: 'Teste unitário dos algoritmos',
      estimatedTime: 4
    },
    {
      name: 'Validações',
      description: 'Verificações de entrada e saída',
      objectives: [
        'Implementar validação de entrada',
        'Adicionar verificações de integridade',
        'Criar validação de saída'
      ],
      successCriteria: [
        'Dados inválidos são rejeitados',
        'Integridade dos dados é mantida',
        'Saída é validada antes de retorno'
      ],
      validationMethod: 'Teste com dados válidos e inválidos',
      estimatedTime: 2
    },
    {
      name: 'Otimização',
      description: 'Performance e eficiência',
      objectives: [
        'Otimizar algoritmos para performance',
        'Implementar cache quando apropriado',
        'Reduzir uso de memória'
      ],
      successCriteria: [
        'Performance é aceitável (< 1s para operações)',
        'Uso de memória é otimizado',
        'Cache funciona corretamente'
      ],
      validationMethod: 'Teste de performance e profiling',
      estimatedTime: 2
    },
    {
      name: 'Monitoramento',
      description: 'Logs e métricas',
      objectives: [
        'Adicionar logs detalhados',
        'Implementar métricas de performance',
        'Criar alertas para problemas'
      ],
      successCriteria: [
        'Logs fornecem visibilidade adequada',
        'Métricas são coletadas corretamente',
        'Alertas funcionam para cenários críticos'
      ],
      validationMethod: 'Verificação de logs e métricas',
      estimatedTime: 1
    }
  ],
  validationCriteria: {
    technical: [
      'Algoritmos produzem resultados corretos',
      'Performance é aceitável (< 1s)',
      'Uso de memória é otimizado',
      'Logs fornecem visibilidade adequada'
    ],
    integration: [
      'Dados são processados corretamente',
      'Validações não quebram fluxos existentes',
      'Cache não causa inconsistências',
      'Monitoramento não impacta performance'
    ],
    userExperience: [
      'Resultados são apresentados claramente',
      'Progresso é indicado para operações longas',
      'Erros são comunicados de forma útil',
      'Dados são atualizados quando necessário'
    ]
  },
  estimatedTime: 9,
  riskLevel: 'Médio'
};

// Função para obter template baseado no tipo de funcionalidade
export function getFeatureTemplate(featureType: 'ui' | 'integration' | 'data-processing'): FeatureTemplate {
  switch (featureType) {
    case 'ui':
      return uiFeatureTemplate;
    case 'integration':
      return integrationFeatureTemplate;
    case 'data-processing':
      return dataProcessingFeatureTemplate;
    default:
      return uiFeatureTemplate;
  }
}

// Função para gerar plano de implementação baseado no template
export function generateImplementationPlan(
  featureName: string,
  featureType: 'ui' | 'integration' | 'data-processing'
): string {
  const template = getFeatureTemplate(featureType);
  
  return `
## Plano de Implementação - ${featureName}

**Tipo:** ${template.name}
**Tempo Estimado:** ${template.estimatedTime}h
**Nível de Risco:** ${template.riskLevel}

### Fases de Implementação

${template.phases.map((phase, index) => `
#### Fase ${index + 1}: ${phase.name} (${phase.estimatedTime}h)
**Descrição:** ${phase.description}

**Objetivos:**
${phase.objectives.map(obj => `- ${obj}`).join('\n')}

**Critérios de Sucesso:**
${phase.successCriteria.map(criteria => `- ${criteria}`).join('\n')}

**Método de Validação:** ${phase.validationMethod}
`).join('\n')}

### Critérios de Validação

#### Validação Técnica
${template.validationCriteria.technical.map(criteria => `- ${criteria}`).join('\n')}

#### Validação de Integração
${template.validationCriteria.integration.map(criteria => `- ${criteria}`).join('\n')}

#### Validação de Experiência do Usuário
${template.validationCriteria.userExperience.map(criteria => `- ${criteria}`).join('\n')}

### Checklist de Implementação

${template.phases.map((phase, index) => `
**Fase ${index + 1} - ${phase.name}:**
${phase.objectives.map(obj => `- [ ] ${obj}`).join('\n')}
`).join('\n')}

### Pontos de Validação

${template.phases.map((phase, index) => `- [ ] Fase ${index + 1}: ${phase.validationMethod}`).join('\n')}
  `.trim();
}

// Função para validar implementação baseada no template
export function validateImplementation(
  featureName: string,
  featureType: 'ui' | 'integration' | 'data-processing',
  phaseResults: { [key: string]: boolean }
): { isValid: boolean; issues: string[]; recommendations: string[] } {
  const template = getFeatureTemplate(featureType);
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Verificar se todas as fases foram completadas
  template.phases.forEach((phase, index) => {
    const phaseKey = `phase_${index + 1}`;
    if (!phaseResults[phaseKey]) {
      issues.push(`Fase ${index + 1} (${phase.name}) não foi validada`);
      recommendations.push(`Complete a validação da fase ${index + 1}: ${phase.validationMethod}`);
    }
  });
  
  // Verificar critérios de validação
  const allValidationCriteria = [
    ...template.validationCriteria.technical,
    ...template.validationCriteria.integration,
    ...template.validationCriteria.userExperience
  ];
  
  if (allValidationCriteria.length === 0) {
    issues.push('Nenhum critério de validação definido');
    recommendations.push('Defina critérios específicos de validação para esta funcionalidade');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
} 
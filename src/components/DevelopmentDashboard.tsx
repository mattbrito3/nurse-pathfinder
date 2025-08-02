import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SimpleBacklog } from './SimpleBacklog';
import { 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Activity
} from 'lucide-react';

interface DashboardProps {
  className?: string;
}

export const DevelopmentDashboard: React.FC<DashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('backlog');

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dev Dashboard</h1>
          <p className="text-muted-foreground">
            Ferramentas para desenvolvimento do Nurse Pathfinder
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        </TabsList>

        <TabsContent value="backlog" className="space-y-6">
          <SimpleBacklog />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Features</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  4 em backlog, 2 concluídas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas Prioridades</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Calculadora e Flashcards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25%</div>
                <p className="text-xs text-muted-foreground">
                  2 de 8 features concluídas
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Como usar o Backlog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Adicionar Ideias</h4>
                <p className="text-sm text-muted-foreground">
                  Clique em "Adicionar Item" e preencha o título, descrição, categoria e prioridade.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">2. Gerenciar Status</h4>
                <p className="text-sm text-muted-foreground">
                  Use os botões "Iniciar", "Concluir" ou "Cancelar" para atualizar o status das features.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">3. Filtrar e Organizar</h4>
                <p className="text-sm text-muted-foreground">
                  Use os filtros para ver apenas backlog, em desenvolvimento ou concluído.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">4. Acompanhar Progresso</h4>
                <p className="text-sm text-muted-foreground">
                  Veja as estatísticas no topo da página para acompanhar seu progresso.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas de Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Comandos Úteis</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use no console do navegador:
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    addBacklogItem("Título", "Descrição", "Calculadora", "Alta")
                  </code>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Categorias Disponíveis</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Calculadora</li>
                    <li>• Flashcards</li>
                    <li>• Glossário</li>
                    <li>• UX/UI</li>
                    <li>• Performance</li>
                    <li>• Autenticação</li>
                    <li>• Outros</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
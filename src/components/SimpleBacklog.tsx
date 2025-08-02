import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit,
  Trash2,
  Calculator,
  Brain,
  BookOpen,
  Smartphone,
  Zap,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { 
  simpleBacklog, 
  BacklogItem, 
  addBacklogItem,
  updateBacklogStatus,
  getBacklogStats
} from '../utils/simpleBacklog';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Calculadora': return <Calculator className="h-4 w-4" />;
    case 'Flashcards': return <Brain className="h-4 w-4" />;
    case 'Glossário': return <BookOpen className="h-4 w-4" />;
    case 'UX/UI': return <Smartphone className="h-4 w-4" />;
    case 'Performance': return <Zap className="h-4 w-4" />;
    case 'Autenticação': return <Shield className="h-4 w-4" />;
    default: return <MoreHorizontal className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
    case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800 border-green-200';
    case 'Em Desenvolvimento': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Backlog': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Concluído': return <CheckCircle className="h-4 w-4" />;
    case 'Em Desenvolvimento': return <Clock className="h-4 w-4" />;
    case 'Cancelado': return <XCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export const SimpleBacklog: React.FC = () => {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [stats, setStats] = useState(getBacklogStats());
  const [filter, setFilter] = useState<'all' | 'backlog' | 'inProgress' | 'completed'>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'Outros' as BacklogItem['category'],
    priority: 'Média' as BacklogItem['priority'],
    notes: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(simpleBacklog.getAllItems());
    setStats(getBacklogStats());
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;
    
    addBacklogItem(
      newItem.title,
      newItem.description,
      newItem.category,
      newItem.priority,
      newItem.notes || undefined
    );
    
    setNewItem({
      title: '',
      description: '',
      category: 'Outros',
      priority: 'Média',
      notes: ''
    });
    
    setIsAddingItem(false);
    loadItems();
  };

  const handleStatusChange = (id: string, status: BacklogItem['status']) => {
    updateBacklogStatus(id, status);
    loadItems();
  };

  const handleRemoveItem = (id: string) => {
    simpleBacklog.removeItem(id);
    loadItems();
  };

  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'backlog': return item.status === 'Backlog';
      case 'inProgress': return item.status === 'Em Desenvolvimento';
      case 'completed': return item.status === 'Concluído';
      default: return true;
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backlog Nurse Pathfinder</h1>
          <p className="text-muted-foreground">
            Suas ideias e tarefas em um lugar só
          </p>
        </div>
        
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar ao Backlog</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="O que você quer implementar?"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Detalhes da funcionalidade..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={newItem.category} onValueChange={(value: BacklogItem['category']) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calculadora">Calculadora</SelectItem>
                      <SelectItem value="Flashcards">Flashcards</SelectItem>
                      <SelectItem value="Glossário">Glossário</SelectItem>
                      <SelectItem value="UX/UI">UX/UI</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Autenticação">Autenticação</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={newItem.priority} onValueChange={(value: BacklogItem['priority']) => setNewItem({ ...newItem, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notas (opcional)</label>
                <Textarea
                  placeholder="Observações adicionais..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.backlog}</div>
            <p className="text-xs text-muted-foreground">Backlog</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Em Desenvolvimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Concluído</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </Button>
        <Button 
          variant={filter === 'backlog' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('backlog')}
        >
          Backlog ({stats.backlog})
        </Button>
        <Button 
          variant={filter === 'inProgress' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('inProgress')}
        >
          Em Desenvolvimento ({stats.inProgress})
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Concluído ({stats.completed})
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Nenhum item no backlog' : 
                 filter === 'backlog' ? 'Nenhum item pendente' :
                 filter === 'inProgress' ? 'Nenhum item em desenvolvimento' :
                 'Nenhum item concluído'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status}</span>
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        📝 {item.notes}
                      </p>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Criado em {item.createdAt.toLocaleDateString('pt-BR')}
                      {item.completedAt && (
                        <span className="ml-2">
                          • Concluído em {item.completedAt.toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    {item.status === 'Backlog' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(item.id, 'Em Desenvolvimento')}
                      >
                        Iniciar
                      </Button>
                    )}
                    
                    {item.status === 'Em Desenvolvimento' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(item.id, 'Concluído')}
                      >
                        Concluir
                      </Button>
                    )}
                    
                    {item.status !== 'Concluído' && item.status !== 'Cancelado' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(item.id, 'Cancelado')}
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  History, 
  Star, 
  Trash2, 
  Search, 
  Download, 
  Share, 
  Clock,
  Calculator,
  Heart,
  Filter,
  Calendar,
  Zap,
  FileText,
  Copy
} from "lucide-react";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import type { CalculationHistory as CalculationHistoryType, CalculationType } from "@/types/calculator";
import { toast } from "sonner";

interface CalculationHistoryProps {
  onReloadCalculation?: (calculation: CalculationHistoryType) => void;
}

const CalculationHistory = ({ onReloadCalculation }: CalculationHistoryProps) => {
  const {
    history,
    isLoading,
    toggleFavorite,
    removeCalculation,
    clearHistory,
    getStats,
    filterHistory,
    shareCalculation,
    downloadReport
  } = useCalculationHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CalculationType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const stats = getStats();
  
  const filteredHistory = filterHistory(
    filterType === 'all' ? undefined : filterType,
    showFavoritesOnly,
    searchTerm
  );

  const getTypeLabel = (type: CalculationType) => {
    const labels = {
      dosage: 'Dosagem',
      infusion: 'Gotejamento',
      conversion: 'Conversão',
      concentration: 'Diluição',
      pediatric: 'Pediátrico'
    };
    return labels[type];
  };

  const getTypeColor = (type: CalculationType) => {
    const colors = {
      dosage: 'bg-blue-50 text-blue-700 border-blue-200',
      infusion: 'bg-green-50 text-green-700 border-green-200',
      conversion: 'bg-purple-50 text-purple-700 border-purple-200',
      concentration: 'bg-orange-50 text-orange-700 border-orange-200',
      pediatric: 'bg-pink-50 text-pink-700 border-pink-200'
    };
    return colors[type];
  };

  const formatResult = (calculation: CalculationHistoryType) => {
    switch (calculation.type) {
      case 'dosage':
        const dosage = calculation.calculation;
        return `${dosage.result?.volumeToAdminister || 0}${dosage.result?.unit || 'ml'}`;
      
      case 'infusion':
        const infusion = calculation.calculation;
        const mlh = infusion.result?.mlPerHour || 0;
        const drops = infusion.equipmentType === 'macro' 
          ? infusion.result?.dropsPerMinute 
          : infusion.result?.microdropsPerMinute;
        return infusion.equipmentType === 'bomba' 
          ? `${mlh}ml/h` 
          : `${mlh}ml/h (${drops} gtt/min)`;
      
      case 'conversion':
        const conversion = calculation.calculation;
        return `${conversion.result?.convertedValue || 0} ${conversion.toUnit}`;
      
      case 'concentration':
        const concentration = calculation.calculation;
        return `${concentration.result?.finalConcentration || 0}${concentration.result?.concentrationUnit || 'mg/ml'}`;
      
      default:
        return 'N/A';
    }
  };

  const handleShare = async (calculation: CalculationHistoryType) => {
    const result = await shareCalculation(calculation);
    if (result.success) {
      toast.success(
        result.method === 'native' 
          ? 'Cálculo compartilhado!' 
          : 'Cálculo copiado para a área de transferência!'
      );
    } else {
      toast.error(result.error || 'Erro ao compartilhar');
    }
  };

  const handleDownload = () => {
    const itemsToDownload = selectedItems.length > 0
      ? history.filter(item => selectedItems.includes(item.id))
      : filteredHistory;
    
    if (itemsToDownload.length === 0) {
      toast.error('Nenhum cálculo selecionado para download');
      return;
    }

    downloadReport(itemsToDownload);
    toast.success(`Relatório baixado com ${itemsToDownload.length} cálculo(s)`);
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(item => item.id));
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
      try {
        await clearHistory();
        setSelectedItems([]);
        toast.success('Histórico limpo com sucesso');
      } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        toast.error('Erro ao limpar histórico. Tente novamente.');
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Cálculos
        </CardTitle>
        <CardDescription>
          Gerencie e compartilhe seus cálculos realizados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.todayCount}</div>
            <div className="text-sm text-green-700">Hoje</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.favorites}</div>
            <div className="text-sm text-purple-700">Favoritos</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...Object.values(stats.byType), 0)}
            </div>
            <div className="text-sm text-orange-700">Mais Usado</div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por medicamento ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={(value: CalculationType | 'all') => setFilterType(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="dosage">Dosagem</SelectItem>
                <SelectItem value="infusion">Gotejamento</SelectItem>
                <SelectItem value="conversion">Conversão</SelectItem>
                <SelectItem value="concentration">Diluição</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center gap-2"
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favoritos
            </Button>
          </div>

          {/* Ações em lote */}
          {filteredHistory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedItems.length === filteredHistory.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
              
              {selectedItems.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar ({selectedItems.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedItems([])}
                  >
                    Limpar Seleção
                  </Button>
                </>
              )}

              {history.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearHistory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Histórico
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Lista de Cálculos */}
        {filteredHistory.length === 0 ? (
          <Alert>
            <Calculator className="h-4 w-4" />
            <AlertDescription>
              {searchTerm || showFavoritesOnly || filterType !== 'all'
                ? 'Nenhum cálculo encontrado com os filtros aplicados.'
                : 'Nenhum cálculo realizado ainda. Comece fazendo alguns cálculos!'
              }
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((calculation) => (
              <Card 
                key={calculation.id} 
                className={`transition-all hover:shadow-md ${
                  selectedItems.includes(calculation.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Checkbox de seleção */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(calculation.id)}
                        onChange={() => toggleSelection(calculation.id)}
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getTypeColor(calculation.type)}>
                            {getTypeLabel(calculation.type)}
                          </Badge>
                          
                          {calculation.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}

                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {calculation.timestamp.toLocaleDateString('pt-BR')} às{' '}
                            {calculation.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>

                        <div>
                          <div className="font-medium">
                            {calculation.medicationName || getTypeLabel(calculation.type)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Resultado: <span className="font-mono font-medium text-green-600">
                              {formatResult(calculation)}
                            </span>
                          </div>
                        </div>

                        {/* Alertas se houver */}
                        {calculation.calculation.result?.alerts?.length > 0 && (
                          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            ⚠️ {calculation.calculation.result.alerts[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await toggleFavorite(calculation.id);
                          } catch (error) {
                            console.error('Erro ao alterar favorito:', error);
                            toast.error('Erro ao alterar favorito');
                          }
                        }}
                      >
                        <Star className={`h-4 w-4 ${calculation.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(calculation)}
                      >
                        <Share className="h-4 w-4" />
                      </Button>

                      {onReloadCalculation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReloadCalculation(calculation)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja remover este cálculo?')) {
                            try {
                              await removeCalculation(calculation.id);
                              toast.success('Cálculo removido');
                            } catch (error) {
                              console.error('Erro ao remover cálculo:', error);
                              toast.error('Erro ao remover cálculo');
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botões de ação globais */}
        {filteredHistory.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalculationHistory;
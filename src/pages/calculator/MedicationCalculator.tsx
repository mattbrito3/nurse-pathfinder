import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, ArrowLeft, AlertTriangle, CheckCircle, Info, Clock, History, Crown, Lock, Zap } from "lucide-react";
import { calculateDosage, calculateInfusion, convertUnits, calculateConcentration } from "@/utils/medicationCalculations";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import { useCalculatorLimits } from "@/hooks/useCalculatorLimits";
import CalculationHistory from "@/components/calculator/CalculationHistory";
import { toast } from "sonner";
import type { DosageCalculation, InfusionCalculation, UnitConversion, ConcentrationCalculation, CalculationType, CalculationHistory as CalculationHistoryType } from "@/types/calculator";


const MedicationCalculator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CalculationType | 'history'>('dosage');
  const { addCalculation } = useCalculationHistory();
  
  // Hook para gerenciar limites baseados no plano
  const {
    limits,
    usage,
    isLoading: limitsLoading,
    canUseFeature,
    canCalculate,
    getRemainingUsage,
    incrementUsage,
    isFreePlan,
    usagePercentage
  } = useCalculatorLimits();

  // 📌 Definir explicitamente se deve mostrar as abas premium
  const shouldShowPremiumTabs = !isFreePlan && !limitsLoading;

  // Estados para cada tipo de cálculo
  const [dosageData, setDosageData] = useState<DosageCalculation>({
    patientWeight: 0,
    medicationName: '',
    prescribedDose: 0,       
    prescribedUnit: 'mg/kg',
    availableConcentration: 0,
    concentrationUnit: 'mg/ml',
    ampouleVolume: undefined
  });

  const [infusionData, setInfusionData] = useState<InfusionCalculation>({
    totalVolume: 0,
    totalTime: 0,
    timeUnit: 'h',
    equipmentType: 'macro',
  });

  const [conversionData, setConversionData] = useState<UnitConversion>({
    value: 0,
    fromUnit: 'mg',
    toUnit: 'g',
    category: 'weight'
  });

  const [concentrationData, setConcentrationData] = useState<ConcentrationCalculation>({
    drugAmount: 0,
    drugUnit: 'mg',
    diluentVolume: 0
  });

  // Verificar se pode calcular antes de prosseguir
  const handleCalculationAttempt = async (calculationFn: () => Promise<void>) => {
    if (!canCalculate()) {
      toast.error('Limite diário atingido!', {
        description: `Você usou ${usage?.daily_calculations || 0} de ${limits.maxDailyCalculations} cálculos hoje. Assine um plano para uso ilimitado!`,
        action: {
          label: 'Ver Planos',
          onClick: () => navigate('/pricing')
        }
      });
      return;
    }

    // Incrementar uso antes do cálculo
    const success = await incrementUsage();
    if (!success) {
      toast.error('Erro ao processar cálculo', {
        description: 'Tente novamente ou entre em contato com o suporte.'
      });
      return;
    }

    // Executar o cálculo
    await calculationFn();
  };

  const handleDosageCalculation = async () => {
    await handleCalculationAttempt(async () => {
      // Validações antes do cálculo
      const errors: string[] = [];
      
      if (!dosageData.patientWeight || dosageData.patientWeight <= 0) {
        errors.push('Peso do paciente é obrigatório e deve ser maior que zero');
      }
      
      if (!dosageData.prescribedDose || dosageData.prescribedDose <= 0) {
        errors.push('Dose prescrita é obrigatória e deve ser maior que zero');
      }
      
      if (!dosageData.availableConcentration || dosageData.availableConcentration <= 0) {
        errors.push('Concentração disponível é obrigatória e deve ser maior que zero');
      }
      
      if (!dosageData.medicationName?.trim()) {
        errors.push('Nome do medicamento é obrigatório');
      }
      
      if ((dosageData.concentrationUnit === 'mg/ampola' || dosageData.concentrationUnit === 'g/ampola') 
          && (!dosageData.ampouleVolume || dosageData.ampouleVolume <= 0)) {
        errors.push('Volume da ampola é obrigatório para ampolas secas');
      }
      
      if (errors.length > 0) {
        toast.error(`Corrija os seguintes erros:\n• ${errors.join('\n• ')}`);
        return;
      }
      
      const result = calculateDosage(dosageData);
      setDosageData(result);
      
      if (result.result) {
        // Só salvar no histórico se o usuário tiver acesso
        if (canUseFeature('history')) {
          await addCalculation('dosage', result, result.medicationName);
          toast.success('Cálculo realizado e salvo no histórico!');
        } else {
          toast.success('Cálculo realizado!', {
            description: 'Assine um plano para ter acesso ao histórico de cálculos.'
          });
        }
      }
    });
  };

  const handleInfusionCalculation = async () => {
    // Validações antes do cálculo
    const errors: string[] = [];
    
    if (!infusionData.totalVolume || infusionData.totalVolume <= 0) {
      errors.push('Volume total é obrigatório e deve ser maior que zero');
    }
    if (!infusionData.totalTime || infusionData.totalTime <= 0) {
      errors.push('Tempo total é obrigatório e deve ser maior que zero');
    }

    if (errors.length > 0) {
      toast.error('Dados inválidos', {
        description: errors.join('; ')
      });
      return;
    }

    // Realizar cálculo
    const result = calculateInfusion(infusionData);
    setInfusionData(result);
    
    if (result.result) {
      // Só salvar no histórico se o usuário tiver acesso
      if (canUseFeature('history')) {
        await addCalculation('infusion', result, 'Solução IV');
        toast.success('Cálculo realizado e salvo no histórico!');
      } else {
        toast.success('Cálculo realizado!');
      }
    }
  };

  const handleConversionCalculation = async () => {
    // Validações antes do cálculo
    const errors: string[] = [];
    
    if (!conversionData.value || conversionData.value <= 0) {
      errors.push('Valor é obrigatório e deve ser maior que zero');
    }
    if (conversionData.fromUnit === conversionData.toUnit) {
      errors.push('Unidades de origem e destino devem ser diferentes');
    }

    if (errors.length > 0) {
      toast.error('Dados inválidos', {
        description: errors.join('; ')
      });
      return;
    }

    // Realizar cálculo
    const result = convertUnits(conversionData);
    setConversionData(result);
    
    if (result.result) {
      // Só salvar no histórico se o usuário tiver acesso
      if (canUseFeature('history')) {
        await addCalculation('conversion', result, 'Conversão de Unidades');
        toast.success('Conversão realizada e salva no histórico!');
      } else {
        toast.success('Conversão realizada!');
      }
    }
  };

  const handleConcentrationCalculation = async () => {
    // Validações antes do cálculo
    const errors: string[] = [];
    
    if (!concentrationData.drugAmount || concentrationData.drugAmount <= 0) {
      errors.push('Quantidade do medicamento é obrigatória e deve ser maior que zero');
    }
    if (!concentrationData.diluentVolume || concentrationData.diluentVolume <= 0) {
      errors.push('Volume do diluente é obrigatório e deve ser maior que zero');
    }

    if (errors.length > 0) {
      toast.error('Dados inválidos', {
        description: errors.join('; ')
      });
      return;
    }

    // Realizar cálculo
    const result = calculateConcentration(concentrationData);
    setConcentrationData(result);
    
    if (result.result) {
      // Só salvar no histórico se o usuário tiver acesso
      if (canUseFeature('history')) {
        await addCalculation('concentration', result, 'Cálculo de Concentração');
        toast.success('Cálculo realizado e salvo no histórico!');
      } else {
        toast.success('Cálculo realizado!');
      }
    }
  };

  // Componente de upgrade para features bloqueadas
  const UpgradePrompt = ({ feature }: { feature: string }) => (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
          <Crown className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle className="text-orange-800">Feature Premium</CardTitle>
        <CardDescription className="text-orange-600">
          {feature} está disponível apenas para assinantes
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-orange-700">
          Desbloqueie todas as funcionalidades da calculadora com um plano premium:
        </p>
        <ul className="text-sm text-orange-600 space-y-1">
          <li>✨ Cálculo de gotejamento</li>
          <li>✨ Conversão de unidades</li>
          <li>✨ Cálculo de diluições</li>
          <li>✨ Histórico completo</li>
          <li>✨ Uso ilimitado</li>
        </ul>
        <Button 
          onClick={() => navigate('/pricing')} 
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Crown className="h-4 w-4 mr-2" />
          Ver Planos Premium
        </Button>
      </CardContent>
    </Card>
  );

  // Componente de uso restante
  const UsageIndicator = () => {
    if (!isFreePlan || limitsLoading) return null;

    const remaining = getRemainingUsage();
    const used = usage?.daily_calculations || 0;
    const total = limits.maxDailyCalculations;

    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Uso Diário</span>
            </div>
            <Badge variant={remaining > 2 ? "secondary" : "destructive"}>
              {remaining} restantes
            </Badge>
          </div>
          <Progress value={usagePercentage} className="mb-2" />
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">{used} de {total} usados hoje</span>
            <span className="text-blue-500">Reseta em 24h</span>
          </div>
          {remaining <= 2 && (
            <Alert className="mt-3 border-orange-200 bg-orange-50">
              <Zap className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Poucos cálculos restantes! <button 
                  onClick={() => navigate('/pricing')}
                  className="underline font-medium hover:text-orange-900"
                >
                  Assine agora
                </button> para uso ilimitado.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // Apenas implementar cálculo de dosagem por enquanto, outros serão adicionados depois...
  // (mantendo apenas o necessário para não deixar o código muito longo)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Calculadora de Medicação</h1>
            </div>
          </div>
          {isFreePlan && (
            <Button variant="outline" onClick={() => navigate('/pricing')}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Indicador de uso para plano gratuito */}
          <UsageIndicator />

          {/* Alerta de segurança */}
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Importante:</strong> Esta calculadora é uma ferramenta educativa. Sempre valide os cálculos e consulte protocolos institucionais antes da administração.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalculationType | 'history')}>
            <TabsList className={`grid w-full ${shouldShowPremiumTabs ? 'grid-cols-5' : 'grid-cols-2'}`}>
              <TabsTrigger value="dosage">Dosagem</TabsTrigger>
              
              {/* ✅ Abas premium condicionais */}
              {shouldShowPremiumTabs && (
                <>
                  <TabsTrigger value="infusion">Gotejamento</TabsTrigger>
                  <TabsTrigger value="conversion">Conversão</TabsTrigger>
                  <TabsTrigger value="concentration">Diluição</TabsTrigger>
                </>
              )}
              
              {canUseFeature('history') ? (
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              ) : isFreePlan ? (
                <TabsTrigger value="history" disabled className="flex items-center gap-2 opacity-50">
                  <Lock className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              ) : null}
            </TabsList>

            {/* Cálculo de Dosagem - Sempre disponível */}
            <TabsContent value="dosage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Cálculo de Dosagem por Peso
                  </CardTitle>
                  <CardDescription>
                    Calcule a dose e volume necessário baseado no peso do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formulário de dosagem */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientWeight">Peso do Paciente (kg)</Label>
                      <Input
                        id="patientWeight"
                        type="number"
                        value={dosageData.patientWeight || ''}
                        onChange={(e) => setDosageData({...dosageData, patientWeight: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 70"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicationName">Nome do Medicamento</Label>
                      <Input
                        id="medicationName"
                        value={dosageData.medicationName}
                        onChange={(e) => setDosageData({...dosageData, medicationName: e.target.value})}
                        placeholder="Ex: Dipirona"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prescribedDose">Dose Prescrita</Label>
                      <Input
                        id="prescribedDose"
                        type="number"
                        value={dosageData.prescribedDose || ''}
                        onChange={(e) => setDosageData({...dosageData, prescribedDose: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 10"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prescribedUnit">Unidade da Dose</Label>
                      <Select value={dosageData.prescribedUnit} onValueChange={(value) => setDosageData({...dosageData, prescribedUnit: value as any})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg/kg">mg/kg</SelectItem>
                          <SelectItem value="mcg/kg">mcg/kg</SelectItem>
                          <SelectItem value="mg">mg (dose fixa)</SelectItem>
                          <SelectItem value="g">g (dose fixa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="availableConcentration">Concentração Disponível</Label>
                      <Input
                        id="availableConcentration"
                        type="number"
                        value={dosageData.availableConcentration || ''}
                        onChange={(e) => setDosageData({...dosageData, availableConcentration: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 500"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="concentrationUnit">Unidade da Concentração</Label>
                      <Select value={dosageData.concentrationUnit} onValueChange={(value) => setDosageData({...dosageData, concentrationUnit: value as any})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg/ml">mg/ml</SelectItem>
                          <SelectItem value="mcg/ml">mcg/ml</SelectItem>
                          <SelectItem value="g/ml">g/ml</SelectItem>
                          <SelectItem value="mg/ampola">mg/ampola (seca)</SelectItem>
                          <SelectItem value="g/ampola">g/ampola (seca)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(dosageData.concentrationUnit === 'mg/ampola' || dosageData.concentrationUnit === 'g/ampola') && (
                    <div className="space-y-2">
                      <Label htmlFor="ampouleVolume">Volume para Diluição (ml)</Label>
                      <Input
                        id="ampouleVolume"
                        type="number"
                        value={dosageData.ampouleVolume || ''}
                        onChange={(e) => setDosageData({...dosageData, ampouleVolume: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 10"
                        className="h-12 text-base"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleDosageCalculation} 
                    className="w-full h-12 text-base font-semibold"
                    disabled={!canCalculate() && isFreePlan}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Calcular Dosagem
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🧮 Cálculo de Gotejamento - Premium */}
            <TabsContent value="infusion" className="space-y-6">
              {!isFreePlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Cálculo de Gotejamento
                    </CardTitle>
                    <CardDescription>
                      Calcule o gotejamento de soluções intravenosas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalVolume">Volume Total (ml)</Label>
                          <Input
                            id="totalVolume"
                            type="number"
                            value={infusionData.totalVolume || ''}
                            onChange={(e) => setInfusionData({...infusionData, totalVolume: parseFloat(e.target.value) || 0})}
                            placeholder="Ex: 500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="totalTime">Tempo Total</Label>
                          <div className="flex gap-2">
                            <Input
                              id="totalTime"
                              type="number"
                              value={infusionData.totalTime || ''}
                              onChange={(e) => setInfusionData({...infusionData, totalTime: parseFloat(e.target.value) || 0})}
                              placeholder="Ex: 8"
                            />
                            <Select 
                              value={infusionData.timeUnit} 
                              onValueChange={(value) => setInfusionData({...infusionData, timeUnit: value as 'h' | 'min'})}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="h">Horas</SelectItem>
                                <SelectItem value="min">Minutos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipmentType">Tipo de Equipo</Label>
                        <Select 
                          value={infusionData.equipmentType} 
                          onValueChange={(value) => setInfusionData({...infusionData, equipmentType: value as 'macro' | 'micro'})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="macro">Macrogotejador (20 gotas/ml)</SelectItem>
                            <SelectItem value="micro">Microgotejador (60 gotas/ml)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={() => handleCalculationAttempt(handleInfusionCalculation)} 
                        className="w-full"
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calcular Gotejamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <UpgradePrompt feature="Cálculo de Gotejamento" />
              )}
            </TabsContent>

            {/* 🔄 Conversão de Unidades - Premium */}
            <TabsContent value="conversion" className="space-y-6">
              {!isFreePlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Conversão de Unidades
                    </CardTitle>
                    <CardDescription>
                      Converta entre diferentes unidades de medida
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="conversionValue">Valor</Label>
                        <Input
                          id="conversionValue"
                          type="number"
                          value={conversionData.value || ''}
                          onChange={(e) => setConversionData({...conversionData, value: parseFloat(e.target.value) || 0})}
                          placeholder="Ex: 1000"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fromUnit">De</Label>
                          <Select 
                            value={conversionData.fromUnit} 
                            onValueChange={(value) => setConversionData({...conversionData, fromUnit: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg (miligramas)</SelectItem>
                              <SelectItem value="g">g (gramas)</SelectItem>
                              <SelectItem value="kg">kg (quilogramas)</SelectItem>
                              <SelectItem value="ml">ml (mililitros)</SelectItem>
                              <SelectItem value="l">L (litros)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="toUnit">Para</Label>
                          <Select 
                            value={conversionData.toUnit} 
                            onValueChange={(value) => setConversionData({...conversionData, toUnit: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg (miligramas)</SelectItem>
                              <SelectItem value="g">g (gramas)</SelectItem>
                              <SelectItem value="kg">kg (quilogramas)</SelectItem>
                              <SelectItem value="ml">ml (mililitros)</SelectItem>
                              <SelectItem value="l">L (litros)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleCalculationAttempt(handleConversionCalculation)} 
                        className="w-full"
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Converter Unidades
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <UpgradePrompt feature="Conversão de Unidades" />
              )}
            </TabsContent>

            {/* 🧪 Cálculo de Diluição - Premium */}
            <TabsContent value="concentration" className="space-y-6">
              {!isFreePlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Cálculo de Diluição
                    </CardTitle>
                    <CardDescription>
                      Calcule concentrações e diluições de medicamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="drugAmount">Quantidade do Medicamento</Label>
                          <Input
                            id="drugAmount"
                            type="number"
                            value={concentrationData.drugAmount || ''}
                            onChange={(e) => setConcentrationData({...concentrationData, drugAmount: parseFloat(e.target.value) || 0})}
                            placeholder="Ex: 500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="drugUnit">Unidade</Label>
                          <Select 
                            value={concentrationData.drugUnit} 
                            onValueChange={(value) => setConcentrationData({...concentrationData, drugUnit: value as 'mg' | 'g' | 'mcg' | 'UI'})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="mcg">mcg</SelectItem>
                              <SelectItem value="UI">UI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="diluentVolume">Volume do Diluente (ml)</Label>
                        <Input
                          id="diluentVolume"
                          type="number"
                          value={concentrationData.diluentVolume || ''}
                          onChange={(e) => setConcentrationData({...concentrationData, diluentVolume: parseFloat(e.target.value) || 0})}
                          placeholder="Ex: 250"
                        />
                      </div>

                      <Button 
                        onClick={() => handleCalculationAttempt(handleConcentrationCalculation)} 
                        className="w-full"
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calcular Concentração
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <UpgradePrompt feature="Cálculo de Diluição" />
              )}
            </TabsContent>

            {/* Histórico */}
            <TabsContent value="history">
              {canUseFeature('history') ? (
                <CalculationHistory />
              ) : (
                <UpgradePrompt feature="Histórico de Cálculos" />
              )}
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MedicationCalculator;
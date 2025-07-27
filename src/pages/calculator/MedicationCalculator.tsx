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
import { Calculator, ArrowLeft, AlertTriangle, CheckCircle, Info, Clock, History, X } from "lucide-react";
import { calculateDosage, calculateInfusion, convertUnits, calculateConcentration } from "@/utils/medicationCalculations";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import CalculationHistory from "@/components/calculator/CalculationHistory";
import type { DosageCalculation, InfusionCalculation, UnitConversion, ConcentrationCalculation, CalculationType, CalculationHistory as CalculationHistoryType } from "@/types/calculator";
import { toast } from "sonner";
import { 
  handleMedicationNameInput, 
  handleNumericInput, 
  validateDosageForm,
  getMedicationSuggestions,
  type ValidationResult 
} from "@/utils/inputValidation";

const MedicationCalculator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CalculationType | 'history'>('dosage');
  const { addCalculation } = useCalculationHistory();

  // 🛡️ Validation states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [medicationSuggestions, setMedicationSuggestions] = useState<string[]>([]);

  // Estados para cada tipo de cálculo
  const [dosageData, setDosageData] = useState<DosageCalculation>({
    patientWeight: 0,
    medicationName: '',
    prescribedDose: 0,        // ✅ ADICIONAR
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

  const handleDosageCalculation = async () => {
    // 🛡️ Comprehensive validation using our new system
    const validation = validateDosageForm({
      medicationName: dosageData.medicationName,
      patientWeight: dosageData.patientWeight,
      prescribedDose: dosageData.prescribedDose,
      availableConcentration: dosageData.availableConcentration,
      ampouleVolume: dosageData.ampouleVolume
    });

    // Update validation states
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);

    // Block calculation if there are errors
    if (!validation.isValid) {
      toast.error("Corrija os erros antes de calcular", {
        description: validation.errors[0]
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      toast.warning("Atenção", {
        description: validation.warnings[0]
      });
    }

    // Original validation logic (keeping for additional checks)
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
      await addCalculation('dosage', result, result.medicationName);
      toast.success('Cálculo realizado e salvo no histórico!');
    }
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
      toast.error(`Corrija os seguintes erros:\n• ${errors.join('\n• ')}`);
      return;
    }
    
    const result = calculateInfusion(infusionData);
    setInfusionData(result);
    
    if (result.result) {
      await addCalculation('infusion', result, 'Gotejamento');
      toast.success('Cálculo realizado e salvo no histórico!');
    }
  };

  const handleConversion = async () => {
    // Validações antes do cálculo
    const errors: string[] = [];
    
    if (!conversionData.value || conversionData.value <= 0) {
      errors.push('Valor é obrigatório e deve ser maior que zero');
    }
    
    if (conversionData.fromUnit === conversionData.toUnit) {
      errors.push('Unidade de origem deve ser diferente da unidade de destino');
    }
    
    if (errors.length > 0) {
      toast.error(`Corrija os seguintes erros:\n• ${errors.join('\n• ')}`);
      return;
    }
    
    const result = convertUnits(conversionData);
    setConversionData(result);
    
    if (result.result) {
      await addCalculation('conversion', result, 'Conversão de Unidades');
      toast.success('Conversão realizada e salva no histórico!');
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
      toast.error(`Corrija os seguintes erros:\n• ${errors.join('\n• ')}`);
      return;
    }
    
    const result = calculateConcentration(concentrationData);
    setConcentrationData(result);
    
    if (result.result) {
      await addCalculation('concentration', result, 'Diluição');
      toast.success('Cálculo realizado e salvo no histórico!');
    }
  };

  // Função para recarregar cálculo do histórico
  const handleReloadCalculation = (calculation: CalculationHistoryType) => {
    switch (calculation.type) {
      case 'dosage':
        setDosageData(calculation.calculation as DosageCalculation);
        setActiveTab('dosage');
        toast.success('Cálculo carregado!');
        break;
      case 'infusion':
        setInfusionData(calculation.calculation as InfusionCalculation);
        setActiveTab('infusion');
        toast.success('Cálculo carregado!');
        break;
      case 'conversion':
        setConversionData(calculation.calculation as UnitConversion);
        setActiveTab('conversion');
        toast.success('Conversão carregada!');
        break;
      case 'concentration':
        setConcentrationData(calculation.calculation as ConcentrationCalculation);
        setActiveTab('concentration');
        toast.success('Cálculo carregado!');
        break;
    }
  };

  const renderResult = (result: any, type: string) => {
    if (!result) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Resultado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resultado principal */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {type === 'dosage' && `${result.volumeToAdminister} ${result.unit}`}
              {type === 'infusion' && (
                <div className="space-y-1">
                  <div>{result.mlPerHour} ml/h</div>
                  {infusionData.equipmentType === 'macro' && (
                    <div className="text-lg">{result.dropsPerMinute} gotas/min</div>
                  )}
                  {infusionData.equipmentType === 'micro' && (
                    <div className="text-lg">{result.microdropsPerMinute} microgotas/min</div>
                  )}
                </div>
              )}
              {type === 'conversion' && `${result.convertedValue} ${conversionData.toUnit}`}
              {type === 'concentration' && `${result.finalConcentration} ${result.concentrationUnit}`}
            </div>
          </div>

          {/* Passos do cálculo */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Passo a passo:
            </h4>
            <div className="space-y-1">
              {result.steps?.map((step: string, index: number) => (
                <div key={index} className="text-sm text-muted-foreground font-mono">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Alertas de segurança */}
          {result.alerts && result.alerts.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Alertas de Segurança:
              </h4>
              <div className="space-y-2">
                {result.alerts.map((alert: string, index: number) => (
                  <Alert key={index} className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      {alert}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Dicas de segurança (para concentração) */}
          {result.safetyTips && result.safetyTips.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Dicas de Segurança:
              </h4>
              <div className="space-y-1">
                {result.safetyTips.map((tip: string, index: number) => (
                  <div key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                <span className="sm:hidden">Calculadora</span>
                <span className="hidden sm:inline">Calculadora de Medicação</span>
              </h1>
            </div>
          </div>
          <Badge variant="secondary" className="hidden md:flex text-xs">
            Profissional
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Alerta de segurança */}
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Importante:</strong> Esta calculadora é uma ferramenta educativa. Sempre valide os cálculos e consulte protocolos institucionais antes da administração.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalculationType | 'history')}>
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="dosage" className="text-xs sm:text-sm px-2 py-2">
                <span className="sm:hidden">Dose</span>
                <span className="hidden sm:inline">Dosagem</span>
              </TabsTrigger>
              <TabsTrigger value="infusion" className="text-xs sm:text-sm px-2 py-2">
                <span className="sm:hidden">Gotej.</span>
                <span className="hidden sm:inline">Gotejamento</span>
              </TabsTrigger>
              <TabsTrigger value="conversion" className="text-xs sm:text-sm px-2 py-2">
                <span className="sm:hidden">Conv.</span>
                <span className="hidden sm:inline">Conversão</span>
              </TabsTrigger>
              <TabsTrigger value="concentration" className="text-xs sm:text-sm px-2 py-2">
                <span className="sm:hidden">Dil.</span>
                <span className="hidden sm:inline">Diluição</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-2">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sm:hidden">Hist.</span>
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>

            {/* Cálculo de Dosagem */}
            <TabsContent value="dosage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cálculo de Dosagem por Peso</CardTitle>
                  <CardDescription>
                    Calcule a dose de medicamento baseada no peso do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso do Paciente (kg)</Label>
                      <Input
                        id="weight"
                        type="text"
                        value={dosageData.patientWeight || ''}
                        onChange={(e) => handleNumericInput(
                          e.target.value,
                          'Peso do paciente',
                          (value) => setDosageData({...dosageData, patientWeight: value})
                        )}
                        placeholder="Ex: 70"
                        className="text-right"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="medication">Nome do Medicamento</Label>
                      <div className="relative">
                        <Input
                          id="medication"
                          value={dosageData.medicationName}
                          onChange={(e) => {
                            handleMedicationNameInput(
                              e.target.value,
                              (value) => {
                                setDosageData({...dosageData, medicationName: value});
                                const suggestions = getMedicationSuggestions(value);
                                setMedicationSuggestions(suggestions);
                              }
                            );
                          }}
                          placeholder="Ex: Dipirona (apenas letras)"
                          className="pr-8"
                        />
                        {/* Medication suggestions dropdown */}
                        {medicationSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                            {medicationSuggestions.map((med, index) => (
                              <button
                                key={index}
                                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                                onClick={() => {
                                  setDosageData({...dosageData, medicationName: med});
                                  setMedicationSuggestions([]);
                                }}
                              >
                                {med}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prescribed-dose">Dose Prescrita</Label>
                      <Input
                        id="prescribed-dose"
                        type="text"
                        value={dosageData.prescribedDose || ''}
                        onChange={(e) => handleNumericInput(
                          e.target.value,
                          'Dose prescrita',
                          (value) => setDosageData({...dosageData, prescribedDose: value})
                        )}
                        placeholder="Ex: 15 (apenas números)"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prescribed-unit">Unidade da Prescrição</Label>
                      <Select value={dosageData.prescribedUnit} onValueChange={(value: any) => setDosageData({...dosageData, prescribedUnit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg/kg">mg/kg</SelectItem>
                          <SelectItem value="mcg/kg">mcg/kg</SelectItem>
                          <SelectItem value="UI/kg">UI/kg</SelectItem>
                          <SelectItem value="mg">mg (dose fixa)</SelectItem>
                          <SelectItem value="mcg">mcg (dose fixa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="concentration">Concentração Disponível</Label>
                      <Input
                        id="concentration"
                        type="text"
                        value={dosageData.availableConcentration || ''}
                        onChange={(e) => handleNumericInput(
                          e.target.value,
                          'Concentração',
                          (value) => setDosageData({...dosageData, availableConcentration: value})
                        )}
                        placeholder="Ex: 500 (apenas números)"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="concentration-unit">Unidade da Concentração</Label>
                      <Select value={dosageData.concentrationUnit} onValueChange={(value: any) => setDosageData({...dosageData, concentrationUnit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg/ml">mg/ml</SelectItem>
                          <SelectItem value="mcg/ml">mcg/ml</SelectItem>
                          <SelectItem value="UI/ml">UI/ml</SelectItem>
                          <SelectItem value="mg/ampola">mg/ampola</SelectItem>
                          <SelectItem value="g/ampola">g/ampola</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(dosageData.concentrationUnit === 'mg/ampola' || dosageData.concentrationUnit === 'g/ampola') && (
                      <div className="space-y-2">
                        <Label htmlFor="ampoule-volume">Volume da Ampola (ml)</Label>
                        <Input
                          id="ampoule-volume"
                          type="text"
                          value={dosageData.ampouleVolume || ''}
                          onChange={(e) => handleNumericInput(
                            e.target.value,
                            'Volume da ampola',
                            (value) => setDosageData({...dosageData, ampouleVolume: value})
                          )}
                          placeholder="Ex: 10 (apenas números)"
                          className="text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* 🚨 Validation Errors */}
                  {validationErrors.length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <div className="space-y-1">
                          {validationErrors.map((error, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <X className="h-3 w-3" />
                              {error}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* ⚠️ Validation Warnings */}
                  {validationWarnings.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <div className="space-y-1">
                          {validationWarnings.map((warning, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Info className="h-3 w-3" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleDosageCalculation} 
                    className="w-full" 
                    variant="medical"
                    disabled={validationErrors.length > 0}
                  >
                    Calcular Dosagem
                  </Button>
                </CardContent>
              </Card>

              {renderResult(dosageData.result, 'dosage')}
            </TabsContent>

            {/* Cálculo de Gotejamento */}
            <TabsContent value="infusion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cálculo de Gotejamento</CardTitle>
                  <CardDescription>
                    Calcule a velocidade de infusão para soros e medicamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume Total (ml)</Label>
                      <Input
                        id="volume"
                        type="text"
                        value={infusionData.totalVolume || ''}
                        onChange={(e) => handleNumericInput(
                          e.target.value,
                          'Volume total',
                          (value) => setInfusionData({...infusionData, totalVolume: value})
                        )}
                        placeholder="Ex: 500 (apenas números)"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Tempo Total</Label>
                      <Input
                        id="time"
                        type="text"
                        value={infusionData.totalTime || ''}
                        onChange={(e) => handleNumericInput(
                          e.target.value,
                          'Tempo total',
                          (value) => setInfusionData({...infusionData, totalTime: value})
                        )}
                        placeholder="Ex: 6 (apenas números)"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-unit">Unidade de Tempo</Label>
                      <Select value={infusionData.timeUnit} onValueChange={(value: any) => setInfusionData({...infusionData, timeUnit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h">Horas</SelectItem>
                          <SelectItem value="min">Minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipment">Tipo de Equipo</Label>
                      <Select value={infusionData.equipmentType} onValueChange={(value: any) => setInfusionData({...infusionData, equipmentType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="macro">Macrogotas (20 gtt/ml)</SelectItem>
                          <SelectItem value="micro">Microgotas (60 gtt/ml)</SelectItem>
                          <SelectItem value="bomba">Bomba de Infusão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleInfusionCalculation} className="w-full" variant="medical">
                    Calcular Gotejamento
                  </Button>
                </CardContent>
              </Card>

              {renderResult(infusionData.result, 'infusion')}
            </TabsContent>

            {/* Conversão de Unidades */}
            <TabsContent value="conversion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversão de Unidades</CardTitle>
                  <CardDescription>
                    Converta entre diferentes unidades de medida
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">Valor</Label>
                      <Input
                        id="value"
                        type="number"
                        value={conversionData.value || ''}
                        onChange={(e) => setConversionData({...conversionData, value: Number(e.target.value)})}
                        placeholder="Ex: 1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-unit">De</Label>
                      <Select value={conversionData.fromUnit} onValueChange={(value) => setConversionData({...conversionData, fromUnit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="mcg">mcg</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="to-unit">Para</Label>
                      <Select value={conversionData.toUnit} onValueChange={(value) => setConversionData({...conversionData, toUnit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="mcg">mcg</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleConversion} className="w-full" variant="medical">
                    Converter
                  </Button>
                </CardContent>
              </Card>

              {renderResult(conversionData.result, 'conversion')}
            </TabsContent>

            {/* Cálculo de Concentração */}
            <TabsContent value="concentration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cálculo de Diluição</CardTitle>
                  <CardDescription>
                    Calcule a concentração final após diluição
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drug-amount">Quantidade do Medicamento</Label>
                      <Input
                        id="drug-amount"
                        type="number"
                        value={concentrationData.drugAmount || ''}
                        onChange={(e) => setConcentrationData({...concentrationData, drugAmount: Number(e.target.value)})}
                        placeholder="Ex: 1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="drug-unit">Unidade</Label>
                      <Select value={concentrationData.drugUnit} onValueChange={(value: any) => setConcentrationData({...concentrationData, drugUnit: value})}>
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

                    <div className="space-y-2">
                      <Label htmlFor="diluent-volume">Volume do Diluente (ml)</Label>
                      <Input
                        id="diluent-volume"
                        type="number"
                        value={concentrationData.diluentVolume || ''}
                        onChange={(e) => setConcentrationData({...concentrationData, diluentVolume: Number(e.target.value)})}
                        placeholder="Ex: 10"
                      />
                    </div>
                  </div>

                  <Button onClick={handleConcentrationCalculation} className="w-full" variant="medical">
                    Calcular Concentração
                  </Button>
                </CardContent>
              </Card>

              {renderResult(concentrationData.result, 'concentration')}
            </TabsContent>

            {/* Histórico */}
            <TabsContent value="history">
              <CalculationHistory onReloadCalculation={handleReloadCalculation} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MedicationCalculator;
import {
  FieldConfig,
  CurrentConditions,
  Recommendation,
  RecommendationType,
  UrgencyLevel,
  ConfidenceLevel,
  FactorContribution,
  AlternativeSchedule,
  WeatherForecastDay,
  CROP_COEFFICIENTS,
  SOIL_PROPERTIES,
  CropType,
  GrowthStage,
  SoilType,
} from '../types';

export interface DecisionInputs {
  field: FieldConfig;
  conditions: CurrentConditions;
  forecast: WeatherForecastDay[];
  et0: number; // reference evapotranspiration mm/day
}

export interface DecisionResult {
  recommendation: RecommendationType;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  urgency: UrgencyLevel;
  waterAmount: number;
  waterAmountVolume?: number;
  explanation: {
    primaryFactors: FactorContribution[];
    text: string;
    thresholds: {
      current: number;
      critical: number;
      fieldCapacity: number;
      wiltingPoint: number;
    };
  };
  alternativeSchedules: AlternativeSchedule[];
  estimatedSavings: number;
}

/**
 * Calculate crop water requirement (ETc = Kc × ET₀)
 */
export function calculateCropWaterRequirement(
  cropType: CropType,
  growthStage: GrowthStage,
  et0: number
): number {
  const kc = CROP_COEFFICIENTS[cropType][growthStage];
  return kc * et0;
}

/**
 * Calculate soil moisture deficit
 */
export function calculateMoistureDeficit(
  currentMoisture: number,
  fieldCapacity: number,
  wiltingPoint: number
): { deficit: number; deficitPercent: number; availableWater: number } {
  const availableWater = fieldCapacity - wiltingPoint;
  const currentAvailable = currentMoisture - wiltingPoint;
  const deficit = availableWater - currentAvailable;
  const deficitPercent = (deficit / availableWater) * 100;
  return { deficit, deficitPercent: Math.max(0, deficitPercent), availableWater };
}

/**
 * Calculate days to critical threshold
 */
export function calculateDaysToCritical(
  currentMoisture: number,
  wiltingPoint: number,
  dailyETc: number,
  forecastRainfall: number
): number {
  const netDailyDepletion = dailyETc - (forecastRainfall / 7); // distribute weekly rain
  if (netDailyDepletion <= 0) return 999; // moisture increasing
  const moistureAboveWilting = currentMoisture - wiltingPoint;
  return Math.floor(moistureAboveWilting / netDailyDepletion);
}

/**
 * Calculate irrigation amount needed to reach field capacity
 */
export function calculateIrrigationAmount(
  currentMoisture: number,
  fieldCapacity: number,
  rootZoneDepth: number = 1.0 // meters, default 1m
): number {
  const deficit = fieldCapacity - currentMoisture;
  // Convert % deficit to mm: deficit% * available_water_capacity * root_zone_depth / 100
  // Simplified: 1% moisture ≈ 10mm for 1m root zone in loam
  return Math.round(deficit * 10 * rootZoneDepth);
}

/**
 * Main decision engine
 */
export function generateRecommendation(inputs: DecisionInputs): DecisionResult {
  const { field, conditions, forecast, et0 } = inputs;
  
  // Get soil properties
  const soil = SOIL_PROPERTIES[field.soilType];
  const fieldCapacity = soil.fieldCapacity;
  const wiltingPoint = soil.wiltingPoint;
  
  // Get crop coefficient
  const kc = CROP_COEFFICIENTS[field.cropType][field.growthStage];
  const etc = kc * et0; // crop evapotranspiration mm/day
  
  // Current state
  const currentMoisture = conditions.soilMoisture;
  const { deficit, deficitPercent, availableWater } = calculateMoistureDeficit(
    currentMoisture,
    fieldCapacity,
    wiltingPoint
  );
  
  // Forecast analysis (next 48 hours = 2 days)
  const forecastRainfall48h = forecast.slice(0, 2).reduce((sum, day) => sum + day.rainfall, 0);
  const forecastRainfall7d = forecast.slice(0, 7).reduce((sum, day) => sum + day.rainfall, 0);
  
  // Days to critical
  const daysToCritical = calculateDaysToCritical(currentMoisture, wiltingPoint, etc, forecastRainfall7d);
  
  // Calculate irrigation amount
  const waterAmountMm = calculateIrrigationAmount(currentMoisture, fieldCapacity);
  const waterAmountVolume = field.fieldSize ? Math.round(waterAmountMm * field.fieldSize * 10) : undefined; // m³
  
  // Decision logic
  let recommendation: RecommendationType;
  let urgency: UrgencyLevel;
  let confidence = 1.0;
  let explanationText = '';
  
  // Data quality impact on confidence
  const qualityImpact = {
    high: 0,
    medium: 0.15,
    low: 0.35,
  };
  confidence -= qualityImpact[conditions.dataQuality];
  
  // Source impact
  if (conditions.moistureSource === 'estimated') confidence -= 0.2;
  else if (conditions.moistureSource === 'manual') confidence -= 0.1;
  
  // Missing data penalties
  if (conditions.temperature === undefined) confidence -= 0.05;
  if (conditions.humidity === undefined) confidence -= 0.05;
  if (!forecast.length) confidence -= 0.15;
  
  // Decision rules
  if (currentMoisture < 40 && forecastRainfall48h < 10) {
    recommendation = 'irrigate';
    urgency = currentMoisture < 30 ? 'immediate' : 'within_24h';
    explanationText = `Soil moisture critically low at ${currentMoisture}% (below 40% threshold). With only ${forecastRainfall48h.toFixed(1)}mm rain forecasted in 48h, irrigate ${waterAmountMm}mm to reach field capacity.`;
  } else if (currentMoisture < 40 && forecastRainfall48h >= 10) {
    recommendation = 'wait';
    urgency = 'monitor';
    explanationText = `Soil moisture low at ${currentMoisture}%, but ${forecastRainfall48h.toFixed(1)}mm rain expected in 48h. Wait and monitor - rain may replenish moisture.`;
  } else if (currentMoisture >= 40 && currentMoisture < 60) {
    if (etc > 6) { // high evapotranspiration
      recommendation = 'check_field';
      urgency = 'within_24h';
      explanationText = `Moisture moderate at ${currentMoisture}% but high evaporation (ETc: ${etc.toFixed(1)}mm/day). Check soil at root depth manually.`;
    } else {
      recommendation = 'wait';
      urgency = 'monitor';
      explanationText = `Moisture adequate at ${currentMoisture}%. Daily crop water use is ${etc.toFixed(1)}mm. Monitor daily.`;
    }
  } else { // moisture >= 60%
    recommendation = 'wait';
    urgency = 'monitor';
    explanationText = `Soil moisture sufficient at ${currentMoisture}% (above 60%). No irrigation needed today.`;
  }
  
  // Special case: data quality too low
  if (confidence < 0.5) {
    recommendation = 'check_field';
    urgency = 'monitor';
    explanationText = `Sensor data unreliable (confidence: ${Math.round(confidence * 100)}%). Manual field inspection recommended.`;
  }
  
  confidence = Math.max(0.1, Math.min(1, confidence));
  
  const confidenceLevel: ConfidenceLevel = 
    confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
  
  // Factor contributions for explanation
  const factors: FactorContribution[] = [
    {
      factor: 'moisture_deficit',
      contribution: Math.min(0.5, deficitPercent / 100),
      label: 'Moisture Deficit',
      icon: '💧',
    },
    {
      factor: 'crop_requirement',
      contribution: Math.min(0.35, etc / 10),
      label: 'Crop Water Requirement',
      icon: '🌱',
    },
    {
      factor: 'forecasted_rainfall',
      contribution: Math.min(0.2, forecastRainfall48h / 20),
      label: 'Forecasted Rainfall',
      icon: '🌧️',
    },
    {
      factor: 'evapotranspiration',
      contribution: Math.min(0.15, etc / 8),
      label: 'Evapotranspiration Rate',
      icon: '🌡️',
    },
  ].filter(f => f.contribution > 0.02);
  
  // Normalize contributions
  const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0);
  factors.forEach(f => { f.contribution = f.contribution / totalContribution; });
  
  // Alternative schedules
  const alternativeSchedules: AlternativeSchedule[] = [
    {
      name: 'Fixed (Every 3 days)',
      description: 'Traditional calendar-based irrigation',
      waterUsePercent: 125,
      outcomeEstimate: 'Adequate but wastes ~25% water',
    },
    {
      name: 'Minimal (Drought mode)',
      description: 'Conservative approach, irrigate only at critical threshold',
      waterUsePercent: 85,
      outcomeEstimate: 'Saves water but risk of crop stress',
    },
  ];
  
  // Estimated savings (simplified calculation)
  const weeklyFixedWater = (etc * 7 / 3) * 3; // 3 irrigations per week fixed
  const weeklySmartWater = recommendation === 'irrigate' ? waterAmountMm : 0;
  const estimatedSavings = Math.max(0, Math.round((weeklyFixedWater - weeklySmartWater) * 1000 * (field.fieldSize || 1)));
  
  return {
    recommendation,
    confidence,
    confidenceLevel,
    urgency,
    waterAmount: waterAmountMm,
    waterAmountVolume,
    explanation: {
      primaryFactors: factors,
      text: explanationText,
      thresholds: {
        current: currentMoisture,
        critical: 40,
        fieldCapacity,
        wiltingPoint,
      },
    },
    alternativeSchedules,
    estimatedSavings,
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date only
 */
export function formatDateOnly(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateOnly(dateString);
}

/**
 * Calculate water savings vs fixed schedule
 */
export function calculateWaterSavings(
  recommendation: RecommendationType,
  waterAmount: number,
  etc: number,
  fieldSize: number = 1
): number {
  const weeklyFixed = etc * 7 / 3 * 3; // 3x per week
  const weeklySmart = recommendation === 'irrigate' ? waterAmount : 0;
  return Math.max(0, (weeklyFixed - weeklySmart) * fieldSize * 1000); // liters
}
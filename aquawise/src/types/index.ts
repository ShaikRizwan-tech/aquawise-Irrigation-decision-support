export type CropType = 'wheat' | 'rice' | 'cotton' | 'tomatoes' | 'corn' | 'soybeans' | 'potatoes' | 'onions';
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
export type SoilType = 'clay' | 'loam' | 'sandy' | 'silt' | 'clay_loam' | 'sandy_loam';
export type RecommendationType = 'irrigate' | 'check_field' | 'wait';
export type UrgencyLevel = 'immediate' | 'within_24h' | 'monitor';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type MoistureSource = 'sensor' | 'manual' | 'estimated';
export type DataQuality = 'high' | 'medium' | 'low';

export interface Location {
  lat: number;
  lon: number;
}

export interface FieldConfig {
  fieldId: string;
  fieldName: string;
  cropType: CropType;
  growthStage: GrowthStage;
  soilType: SoilType;
  fieldSize?: number; // hectares
  location?: Location;
  zoneCount: number;
  createdAt: string;
  lastModified: string;
}

export interface CurrentConditions {
  fieldId: string;
  timestamp: string;
  soilMoisture: number; // percentage
  moistureSource: MoistureSource;
  dataQuality: DataQuality;
  recentRainfall: number; // mm
  rainfallPeriod: string; // e.g., "24h"
  temperature?: number; // celsius
  humidity?: number; // percentage
  lastIrrigation?: string; // ISO date
}

export interface FactorContribution {
  factor: string;
  contribution: number; // 0-1
  label: string;
  icon: string;
}

export interface RecommendationExplanation {
  primaryFactors: FactorContribution[];
  text: string;
  thresholds?: {
    current: number;
    critical: number;
    fieldCapacity: number;
    wiltingPoint: number;
  };
}

export interface AlternativeSchedule {
  name: string;
  description: string;
  waterUsePercent: number; // relative to recommendation
  outcomeEstimate: string;
}

export interface Recommendation {
  recommendationId: string;
  fieldId: string;
  timestamp: string;
  recommendation: RecommendationType;
  confidence: number; // 0-1
  confidenceLevel: ConfidenceLevel;
  urgency: UrgencyLevel;
  waterAmount: number; // mm
  waterAmountVolume?: number; // m³ if field size known
  explanation: RecommendationExplanation;
  alternativeSchedules: AlternativeSchedule[];
  estimatedSavings: number; // liters
}

export interface IrrigationEvent {
  eventId: string;
  fieldId: string;
  timestamp: string;
  amount: number; // mm
  method: 'manual' | 'scheduled' | 'sensor_triggered';
  notes?: string;
}

export interface SensorStatus {
  sensorId: string;
  fieldId: string;
  zoneId?: string;
  type: 'moisture' | 'temperature' | 'humidity' | 'rainfall';
  lastReading: string;
  lastReadingValue: number;
  batteryLevel?: number; // percentage
  status: 'online' | 'offline' | 'low_battery';
}

export interface WeatherForecastDay {
  date: string;
  rainfall: number; // mm
  temperatureMax: number;
  temperatureMin: number;
  humidity: number;
  et0: number; // reference evapotranspiration
  alert?: string;
}

export interface WaterSavingsEstimate {
  weeklySaved: number; // liters
  seasonalSaved: number; // liters
  savingsPercentage: number; // vs fixed schedule
  costSavings?: number; // currency
}

export interface HistoryEntry {
  entryId: string;
  fieldId: string;
  date: string;
  recommendation: RecommendationType;
  confidence: number;
  actionTaken: 'followed' | 'modified' | 'ignored';
  actualMoistureAfter?: number;
  outcome?: 'good' | 'adequate' | 'stress';
  notes?: string;
}

export interface FieldSummary {
  field: FieldConfig;
  currentConditions?: CurrentConditions;
  latestRecommendation?: Recommendation;
  sensors: SensorStatus[];
}

export const CROP_COEFFICIENTS: Record<CropType, Record<GrowthStage, number>> = {
  wheat: { seedling: 0.3, vegetative: 0.7, flowering: 1.15, fruiting: 1.10, maturity: 0.4 },
  rice: { seedling: 1.10, vegetative: 1.10, flowering: 1.30, fruiting: 1.20, maturity: 0.90 },
  cotton: { seedling: 0.35, vegetative: 0.70, flowering: 1.15, fruiting: 1.10, maturity: 0.50 },
  tomatoes: { seedling: 0.45, vegetative: 0.75, flowering: 1.15, fruiting: 1.10, maturity: 0.80 },
  corn: { seedling: 0.30, vegetative: 0.80, flowering: 1.15, fruiting: 1.10, maturity: 0.60 },
  soybeans: { seedling: 0.40, vegetative: 0.70, flowering: 1.15, fruiting: 1.10, maturity: 0.50 },
  potatoes: { seedling: 0.50, vegetative: 0.80, flowering: 1.15, fruiting: 1.10, maturity: 0.75 },
  onions: { seedling: 0.35, vegetative: 0.70, flowering: 1.00, fruiting: 0.90, maturity: 0.70 },
};

export const SOIL_PROPERTIES: Record<SoilType, { fieldCapacity: number; wiltingPoint: number; availableWaterCapacity: number }> = {
  clay: { fieldCapacity: 45, wiltingPoint: 25, availableWaterCapacity: 200 },
  loam: { fieldCapacity: 35, wiltingPoint: 15, availableWaterCapacity: 200 },
  sandy: { fieldCapacity: 20, wiltingPoint: 8, availableWaterCapacity: 120 },
  silt: { fieldCapacity: 40, wiltingPoint: 18, availableWaterCapacity: 220 },
  clay_loam: { fieldCapacity: 40, wiltingPoint: 20, availableWaterCapacity: 210 },
  sandy_loam: { fieldCapacity: 25, wiltingPoint: 10, availableWaterCapacity: 150 },
};

export const CROP_LABELS: Record<CropType, string> = {
  wheat: 'Wheat',
  rice: 'Rice',
  cotton: 'Cotton',
  tomatoes: 'Tomatoes',
  corn: 'Corn',
  soybeans: 'Soybeans',
  potatoes: 'Potatoes',
  onions: 'Onions',
};

export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  seedling: 'Seedling',
  vegetative: 'Vegetative',
  flowering: 'Flowering',
  fruiting: 'Fruiting/Grain Filling',
  maturity: 'Maturity',
};

export const SOIL_TYPE_LABELS: Record<SoilType, string> = {
  clay: 'Clay',
  loam: 'Loam',
  sandy: 'Sandy',
  silt: 'Silt',
  clay_loam: 'Clay Loam',
  sandy_loam: 'Sandy Loam',
};

export const RECOMMENDATION_LABELS: Record<RecommendationType, string> = {
  irrigate: 'IRRIGATE',
  check_field: 'CHECK FIELD',
  wait: 'WAIT',
};

export const RECOMMENDATION_BADGE_CLASSES: Record<RecommendationType, string> = {
  irrigate: 'badge-irrigate',
  check_field: 'badge-check',
  wait: 'badge-wait',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  immediate: 'Immediate',
  within_24h: 'Within 24h',
  monitor: 'Monitor',
};
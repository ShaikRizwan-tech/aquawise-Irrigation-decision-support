import {
  FieldConfig,
  CurrentConditions,
  WeatherForecastDay,
  SensorStatus,
  IrrigationEvent,
  HistoryEntry,
  CropType,
  GrowthStage,
  SoilType,
} from '../types';
import { generateId } from './decisionEngine';

// Mock fields for development
export const mockFields: FieldConfig[] = [
  {
    fieldId: 'field-1',
    fieldName: 'North Field',
    cropType: 'wheat',
    growthStage: 'flowering',
    soilType: 'loam',
    fieldSize: 5.2,
    location: { lat: 28.6139, lon: 77.2090 },
    zoneCount: 1,
    createdAt: '2026-09-15T08:00:00Z',
    lastModified: '2026-10-08T14:30:00Z',
  },
  {
    fieldId: 'field-2',
    fieldName: 'South Field',
    cropType: 'cotton',
    growthStage: 'vegetative',
    soilType: 'clay_loam',
    fieldSize: 3.8,
    location: { lat: 28.6139, lon: 77.2090 },
    zoneCount: 2,
    createdAt: '2026-09-20T10:00:00Z',
    lastModified: '2026-10-05T09:15:00Z',
  },
  {
    fieldId: 'field-3',
    fieldName: 'East Vegetable Plot',
    cropType: 'tomatoes',
    growthStage: 'fruiting',
    soilType: 'sandy_loam',
    fieldSize: 1.5,
    location: { lat: 28.6139, lon: 77.2090 },
    zoneCount: 1,
    createdAt: '2026-10-01T07:00:00Z',
    lastModified: '2026-10-07T16:45:00Z',
  },
];

// Mock current conditions
export const mockConditions: Record<string, CurrentConditions> = {
  'field-1': {
    fieldId: 'field-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    soilMoisture: 42,
    moistureSource: 'sensor',
    dataQuality: 'high',
    recentRainfall: 5.2,
    rainfallPeriod: '24h',
    temperature: 28,
    humidity: 65,
    lastIrrigation: '2026-10-06T00:00:00Z',
  },
  'field-2': {
    fieldId: 'field-2',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    soilMoisture: 58,
    moistureSource: 'sensor',
    dataQuality: 'high',
    recentRainfall: 12.5,
    rainfallPeriod: '24h',
    temperature: 31,
    humidity: 72,
    lastIrrigation: '2026-10-05T00:00:00Z',
  },
  'field-3': {
    fieldId: 'field-3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    soilMoisture: 35,
    moistureSource: 'manual',
    dataQuality: 'medium',
    recentRainfall: 0,
    rainfallPeriod: '24h',
    temperature: 29,
    humidity: 58,
    lastIrrigation: '2026-10-07T00:00:00Z',
  },
};

// Mock weather forecast (7 days)
export const mockForecast: WeatherForecastDay[] = [
  { date: new Date(Date.now() + 0 * 86400000).toISOString().split('T')[0], rainfall: 0, temperatureMax: 32, temperatureMin: 20, humidity: 60, et0: 5.8 },
  { date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], rainfall: 0, temperatureMax: 33, temperatureMin: 21, humidity: 55, et0: 6.2 },
  { date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], rainfall: 2.5, temperatureMax: 30, temperatureMin: 19, humidity: 70, et0: 4.8 },
  { date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], rainfall: 0, temperatureMax: 31, temperatureMin: 20, humidity: 62, et0: 5.5 },
  { date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], rainfall: 8.0, temperatureMax: 28, temperatureMin: 18, humidity: 80, et0: 3.8 },
  { date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], rainfall: 0, temperatureMax: 29, temperatureMin: 18, humidity: 65, et0: 5.0 },
  { date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0], rainfall: 0, temperatureMax: 30, temperatureMin: 19, humidity: 60, et0: 5.3 },
];

// Mock sensors
export const mockSensors: Record<string, SensorStatus[]> = {
  'field-1': [
    {
      sensorId: 'sensor-1',
      fieldId: 'field-1',
      type: 'moisture',
      lastReading: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastReadingValue: 42,
      batteryLevel: 85,
      status: 'online',
    },
    {
      sensorId: 'sensor-2',
      fieldId: 'field-1',
      type: 'temperature',
      lastReading: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      lastReadingValue: 28,
      batteryLevel: 90,
      status: 'online',
    },
  ],
  'field-2': [
    {
      sensorId: 'sensor-3',
      fieldId: 'field-2',
      type: 'moisture',
      lastReading: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      lastReadingValue: 58,
      batteryLevel: 72,
      status: 'online',
    },
    {
      sensorId: 'sensor-4',
      fieldId: 'field-2',
      type: 'rainfall',
      lastReading: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      lastReadingValue: 12.5,
      batteryLevel: 88,
      status: 'online',
    },
  ],
  'field-3': [
    {
      sensorId: 'sensor-5',
      fieldId: 'field-3',
      type: 'moisture',
      lastReading: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      lastReadingValue: 35,
      batteryLevel: 45,
      status: 'low_battery',
    },
  ],
};

// Mock irrigation history
export const mockIrrigationHistory: Record<string, IrrigationEvent[]> = {
  'field-1': [
    { eventId: generateId(), fieldId: 'field-1', timestamp: '2026-10-06T00:00:00Z', amount: 25, method: 'scheduled' },
    { eventId: generateId(), fieldId: 'field-1', timestamp: '2026-10-03T00:00:00Z', amount: 30, method: 'scheduled' },
    { eventId: generateId(), fieldId: 'field-1', timestamp: '2026-09-30T00:00:00Z', amount: 25, method: 'scheduled' },
    { eventId: generateId(), fieldId: 'field-1', timestamp: '2026-09-27T00:00:00Z', amount: 20, method: 'sensor_triggered' },
  ],
  'field-2': [
    { eventId: generateId(), fieldId: 'field-2', timestamp: '2026-10-05T00:00:00Z', amount: 35, method: 'scheduled' },
    { eventId: generateId(), fieldId: 'field-2', timestamp: '2026-10-01T00:00:00Z', amount: 30, method: 'scheduled' },
    { eventId: generateId(), fieldId: 'field-2', timestamp: '2026-09-28T00:00:00Z', amount: 40, method: 'scheduled' },
  ],
  'field-3': [
    { eventId: generateId(), fieldId: 'field-3', timestamp: '2026-10-07T00:00:00Z', amount: 15, method: 'manual' },
    { eventId: generateId(), fieldId: 'field-3', timestamp: '2026-10-04T00:00:00Z', amount: 20, method: 'scheduled' },
    { eventId: generateId(), fieldId: 'field-3', timestamp: '2026-10-01T00:00:00Z', amount: 15, method: 'scheduled' },
  ],
};

// Mock history entries
export const mockHistory: Record<string, HistoryEntry[]> = {
  'field-1': [
    { entryId: generateId(), fieldId: 'field-1', date: '2026-10-08', recommendation: 'irrigate', confidence: 0.85, actionTaken: 'followed', actualMoistureAfter: 68, outcome: 'good' },
    { entryId: generateId(), fieldId: 'field-1', date: '2026-10-06', recommendation: 'irrigate', confidence: 0.9, actionTaken: 'followed', actualMoistureAfter: 72, outcome: 'good' },
    { entryId: generateId(), fieldId: 'field-1', date: '2026-10-04', recommendation: 'wait', confidence: 0.75, actionTaken: 'followed', actualMoistureAfter: 52, outcome: 'adequate' },
    { entryId: generateId(), fieldId: 'field-1', date: '2026-10-02', recommendation: 'check_field', confidence: 0.65, actionTaken: 'modified', actualMoistureAfter: 45, outcome: 'adequate' },
    { entryId: generateId(), fieldId: 'field-1', date: '2026-09-30', recommendation: 'irrigate', confidence: 0.88, actionTaken: 'followed', actualMoistureAfter: 70, outcome: 'good' },
  ],
  'field-2': [
    { entryId: generateId(), fieldId: 'field-2', date: '2026-10-08', recommendation: 'wait', confidence: 0.8, actionTaken: 'followed', actualMoistureAfter: 60, outcome: 'good' },
    { entryId: generateId(), fieldId: 'field-2', date: '2026-10-05', recommendation: 'irrigate', confidence: 0.85, actionTaken: 'followed', actualMoistureAfter: 75, outcome: 'good' },
    { entryId: generateId(), fieldId: 'field-2', date: '2026-10-03', recommendation: 'wait', confidence: 0.7, actionTaken: 'followed', actualMoistureAfter: 58, outcome: 'adequate' },
  ],
  'field-3': [
    { entryId: generateId(), fieldId: 'field-3', date: '2026-10-08', recommendation: 'irrigate', confidence: 0.75, actionTaken: 'followed', actualMoistureAfter: 55, outcome: 'good' },
    { entryId: generateId(), fieldId: 'field-3', date: '2026-10-06', recommendation: 'check_field', confidence: 0.6, actionTaken: 'ignored', actualMoistureAfter: 32, outcome: 'stress' },
    { entryId: generateId(), fieldId: 'field-3', date: '2026-10-04', recommendation: 'irrigate', confidence: 0.82, actionTaken: 'followed', actualMoistureAfter: 58, outcome: 'good' },
  ],
};

// Crop options for dropdown
export const cropOptions: { value: CropType; label: string; icon: string }[] = [
  { value: 'wheat', label: 'Wheat 🌾', icon: '🌾' },
  { value: 'rice', label: 'Rice 🌾', icon: '🌾' },
  { value: 'cotton', label: 'Cotton 🌿', icon: '🌿' },
  { value: 'tomatoes', label: 'Tomatoes 🍅', icon: '🍅' },
  { value: 'corn', label: 'Corn 🌽', icon: '🌽' },
  { value: 'soybeans', label: 'Soybeans 🌱', icon: '🌱' },
  { value: 'potatoes', label: 'Potatoes 🥔', icon: '🥔' },
  { value: 'onions', label: 'Onions 🧅', icon: '🧅' },
];

// Growth stage options
export const growthStageOptions: { value: GrowthStage; label: string }[] = [
  { value: 'seedling', label: 'Seedling' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'fruiting', label: 'Fruiting/Grain Filling' },
  { value: 'maturity', label: 'Maturity' },
];

// Soil type options
export const soilTypeOptions: { value: SoilType; label: string }[] = [
  { value: 'clay', label: 'Clay' },
  { value: 'loam', label: 'Loam' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silt', label: 'Silt' },
  { value: 'clay_loam', label: 'Clay Loam' },
  { value: 'sandy_loam', label: 'Sandy Loam' },
];

// Default ET0 by month (rough estimates for North India)
export const defaultET0ByMonth: number[] = [
  3.5, // Jan
  4.2, // Feb
  5.8, // Mar
  7.2, // Apr
  8.5, // May
  7.8, // Jun
  6.2, // Jul
  5.5, // Aug
  5.8, // Sep
  5.2, // Oct
  4.0, // Nov
  3.2, // Dec
];

export function getDefaultET0(): number {
  const month = new Date().getMonth();
  return defaultET0ByMonth[month];
}
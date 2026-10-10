import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { FieldConfig, CurrentConditions, Recommendation, SensorStatus, IrrigationEvent, HistoryEntry, WeatherForecastDay } from '../types';
import { mockFields, mockConditions, mockForecast, mockSensors, mockIrrigationHistory, mockHistory, getDefaultET0 } from '../utils/mockData';
import { generateRecommendation, DecisionInputs } from '../utils/decisionEngine';

interface AppContextType {
  fields: FieldConfig[];
  currentFieldId: string | null;
  setCurrentFieldId: (id: string) => void;
  currentField: FieldConfig | null;
  conditions: Record<string, CurrentConditions>;
  updateConditions: (fieldId: string, conditions: Partial<CurrentConditions>) => void;
  recommendations: Record<string, Recommendation>;
  refreshRecommendation: (fieldId: string) => void;
  sensors: Record<string, SensorStatus[]>;
  irrigationHistory: Record<string, IrrigationEvent[]>;
  history: Record<string, HistoryEntry[]>;
  forecast: WeatherForecastDay[];
  et0: number;
  addField: (field: Omit<FieldConfig, 'fieldId' | 'createdAt' | 'lastModified'>) => string;
  updateField: (fieldId: string, updates: Partial<FieldConfig>) => void;
  deleteField: (fieldId: string) => void;
  addIrrigationEvent: (fieldId: string, event: Omit<IrrigationEvent, 'eventId' | 'fieldId'>) => void;
  addHistoryEntry: (fieldId: string, entry: Omit<HistoryEntry, 'entryId' | 'fieldId'>) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<FieldConfig[]>(mockFields);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(mockFields[0]?.fieldId || null);
  const [conditions, setConditions] = useState<Record<string, CurrentConditions>>(mockConditions);
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation>>({});
  const [sensors] = useState<Record<string, SensorStatus[]>>(mockSensors);
  const [irrigationHistory, setIrrigationHistory] = useState<Record<string, IrrigationEvent[]>>(mockIrrigationHistory);
  const [history, setHistory] = useState<Record<string, HistoryEntry[]>>(mockHistory);
  const [forecast] = useState<WeatherForecastDay[]>(mockForecast);
  const [et0] = useState<number>(getDefaultET0());
  const [isLoading, setIsLoading] = useState(false);

  const currentField = fields.find(f => f.fieldId === currentFieldId) || null;

  const refreshRecommendation = useCallback((fieldId: string) => {
    const field = fields.find(f => f.fieldId === fieldId);
    const fieldConditions = conditions[fieldId];
    if (!field || !fieldConditions) return;

    const inputs: DecisionInputs = {
      field,
      conditions: fieldConditions,
      forecast,
      et0,
    };

    const result = generateRecommendation(inputs);
    const newRecommendation: Recommendation = {
      recommendationId: `rec-${Date.now()}`,
      fieldId,
      timestamp: new Date().toISOString(),
      recommendation: result.recommendation,
      confidence: result.confidence,
      confidenceLevel: result.confidenceLevel,
      urgency: result.urgency,
      waterAmount: result.waterAmount,
      waterAmountVolume: result.waterAmountVolume,
      explanation: result.explanation,
      alternativeSchedules: result.alternativeSchedules,
      estimatedSavings: result.estimatedSavings,
    };

    setRecommendations(prev => ({ ...prev, [fieldId]: newRecommendation }));
  }, [fields, conditions, forecast, et0]);

  // Initial recommendation generation
  useEffect(() => {
    if (currentFieldId) {
      refreshRecommendation(currentFieldId);
    }
  }, [currentFieldId, refreshRecommendation]);

  // Recalculate when conditions change
  useEffect(() => {
    if (currentFieldId) {
      refreshRecommendation(currentFieldId);
    }
  }, [conditions, currentFieldId, refreshRecommendation]);

  const updateConditions = useCallback((fieldId: string, updates: Partial<CurrentConditions>) => {
    setConditions(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        ...updates,
        timestamp: new Date().toISOString(),
      },
    }));
  }, []);

  const addField = useCallback((fieldData: Omit<FieldConfig, 'fieldId' | 'createdAt' | 'lastModified'>) => {
    const newField: FieldConfig = {
      ...fieldData,
      fieldId: `field-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setFields(prev => [...prev, newField]);
    return newField.fieldId;
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FieldConfig>) => {
    setFields(prev => prev.map(f => 
      f.fieldId === fieldId ? { ...f, ...updates, lastModified: new Date().toISOString() } : f
    ));
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(f => f.fieldId !== fieldId));
    setConditions(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
    setRecommendations(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
    setIrrigationHistory(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
    setHistory(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
    if (currentFieldId === fieldId) {
      setCurrentFieldId(fields.find(f => f.fieldId !== fieldId)?.fieldId || null);
    }
  }, [currentFieldId, fields]);

  const addIrrigationEvent = useCallback((fieldId: string, event: Omit<IrrigationEvent, 'eventId' | 'fieldId'>) => {
    const newEvent: IrrigationEvent = {
      ...event,
      eventId: `evt-${Date.now()}`,
      fieldId,
    };
    setIrrigationHistory(prev => ({
      ...prev,
      [fieldId]: [newEvent, ...(prev[fieldId] || [])],
    }));
  }, []);

  const addHistoryEntry = useCallback((fieldId: string, entry: Omit<HistoryEntry, 'entryId' | 'fieldId'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      entryId: `hist-${Date.now()}`,
      fieldId,
    };
    setHistory(prev => ({
      ...prev,
      [fieldId]: [newEntry, ...(prev[fieldId] || [])],
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      fields,
      currentFieldId,
      setCurrentFieldId,
      currentField,
      conditions,
      updateConditions,
      recommendations,
      refreshRecommendation,
      sensors,
      irrigationHistory,
      history,
      forecast,
      et0,
      addField,
      updateField,
      deleteField,
      addIrrigationEvent,
      addHistoryEntry,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
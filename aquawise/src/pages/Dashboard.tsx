import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RecommendationCard } from '../components/RecommendationCard';
import { InputPanel } from '../components/InputPanel';
import { VisualizationPanel } from '../components/VisualizationPanel';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { 
  SettingsIcon, 
  DownloadIcon, 
  CalendarIcon, 
  RefreshCwIcon,
  XIcon,
} from '../icons';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const Dashboard: React.FC = () => {
  const { 
    fields, 
    currentFieldId, 
    setCurrentFieldId, 
    currentField, 
    conditions, 
    recommendations,
    forecast,
    et0,
    updateConditions,
    refreshRecommendation,
    addIrrigationEvent,
    addHistoryEntry,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showFieldDetails, setShowFieldDetails] = useState(false);

  const currentConditions = currentFieldId ? conditions[currentFieldId] : null;
  const currentRecommendation = currentFieldId ? recommendations[currentFieldId] : null;

  // Handle mark complete
  const handleMarkComplete = () => {
    if (!currentFieldId || !currentRecommendation || !currentConditions) return;
    
    addIrrigationEvent(currentFieldId, {
      timestamp: new Date().toISOString(),
      amount: currentRecommendation.waterAmount,
      method: 'scheduled',
      notes: 'Marked complete from dashboard',
    });
    
    addHistoryEntry(currentFieldId, {
      date: new Date().toISOString().split('T')[0],
      recommendation: currentRecommendation.recommendation,
      confidence: currentRecommendation.confidence,
      actionTaken: 'followed',
      actualMoistureAfter: Math.min(100, currentConditions.soilMoisture + currentRecommendation.waterAmount * 0.5),
      outcome: 'good',
    });

    // Update conditions to reflect irrigation
    updateConditions(currentFieldId, {
      soilMoisture: Math.min(100, currentConditions.soilMoisture + Math.round(currentRecommendation.waterAmount * 0.5)),
      lastIrrigation: new Date().toISOString(),
      moistureSource: 'estimated',
      dataQuality: 'medium',
    });
  };

  // Handle override
  const handleOverride = () => {
    if (!currentFieldId || !currentRecommendation || !currentConditions) return;
    
    addHistoryEntry(currentFieldId, {
      date: new Date().toISOString().split('T')[0],
      recommendation: currentRecommendation.recommendation,
      confidence: currentRecommendation.confidence,
      actionTaken: 'modified',
      notes: 'Farmer overrode recommendation',
    });
  };

  if (!currentField) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Field Selected</h2>
          <p className="text-gray-500 mb-6">Please set up a field first to see irrigation recommendations.</p>
          <Button onClick={() => window.location.href = '/setup'}>Set Up Field</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-xl font-bold text-gray-900">AquaWise</h1>
              <span className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                v1.0
              </span>
            </div>
            
            {/* Field Selector */}
            <div className="flex items-center gap-3 flex-1 sm:flex-none">
              <Select
                value={currentFieldId || ''}
                onChange={(e) => setCurrentFieldId(e.target.value)}
                options={fields.map(f => ({ value: f.fieldId, label: f.fieldName }))}
                placeholder="Select a field"
                className="w-full sm:w-64"
              />
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(new Date().toISOString())}</span>
                <span>•</span>
                <span>ET₀: {et0.toFixed(1)} mm/day</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setShowFieldDetails(true)}>
                  <SettingsIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <DownloadIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => refreshRecommendation(currentFieldId!)}>
                  <RefreshCwIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Recommendation Card - Hero Element */}
        <div className="mb-6 animate-fade-in">
          <RecommendationCard
            recommendation={currentRecommendation}
            onOverride={handleOverride}
            onViewCalculation={() => setShowCalculation(true)}
            onMarkComplete={handleMarkComplete}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel - Left 30% (lg:col-span-4) */}
          <aside className="lg:col-span-4">
            <InputPanel
              conditions={currentConditions || {
                fieldId: currentFieldId!,
                timestamp: new Date().toISOString(),
                soilMoisture: 50,
                moistureSource: 'manual',
                dataQuality: 'medium',
                recentRainfall: 0,
                rainfallPeriod: '24h',
              }}
              onUpdate={updateConditions}
              fieldId={currentFieldId!}
              forecast={forecast}
              et0={et0}
              recommendation={currentRecommendation ? { 
                recommendation: currentRecommendation.recommendation, 
                waterAmount: currentRecommendation.waterAmount 
              } : null}
            />
          </aside>

          {/* Visualization & Explanation Panel - Right 70% (lg:col-span-8) */}
          <section className="lg:col-span-8">
            <VisualizationPanel
              recommendation={currentRecommendation}
              conditions={currentConditions}
              forecast={forecast}
              field={currentField ? {
                fieldName: currentField.fieldName,
                cropType: currentField.cropType,
                soilType: currentField.soilType,
              } : null}
              history={[]} // Would come from history context
            />
          </section>
        </div>
      </main>

      {/* Field Details Modal */}
      {showFieldDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Field Details: {currentField.fieldName}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFieldDetails(false)}>
                <span className="sr-only">Close</span>
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Crop</p>
                    <p className="font-medium text-gray-900 capitalize">{currentField.cropType}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Growth Stage</p>
                    <p className="font-medium text-gray-900 capitalize">{currentField.growthStage}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Soil Type</p>
                    <p className="font-medium text-gray-900 capitalize">{currentField.soilType.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Field Size</p>
                    <p className="font-medium text-gray-900">{currentField.fieldSize || '—'} ha</p>
                  </div>
                </div>
                
                {currentConditions && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Current Conditions</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Moisture: <strong>{currentConditions.soilMoisture}%</strong></span>
                      <span>Rainfall: <strong>{currentConditions.recentRainfall}mm</strong></span>
                      <span>Temp: <strong>{currentConditions.temperature || '—'}°C</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowFieldDetails(false)}>Close</Button>
              <Button variant="primary" onClick={() => { setShowFieldDetails(false); window.location.href = '/setup'; }}>
                Edit Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Modal */}
      {showCalculation && currentRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Calculation Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCalculation(false)}>
                <span className="sr-only">Close</span>
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Inputs Used</p>
                  <dl className="grid grid-cols-2 gap-2 text-gray-600">
                    <dt>Soil Moisture</dt>
                    <dd className="font-medium">{currentConditions?.soilMoisture}%</dd>
                    <dt>Crop Type</dt>
                    <dd className="font-medium capitalize">{currentField.cropType}</dd>
                    <dt>Growth Stage</dt>
                    <dd className="font-medium capitalize">{currentField.growthStage}</dd>
                    <dt>Soil Type</dt>
                    <dd className="font-medium capitalize">{currentField.soilType.replace('_', ' ')}</dd>
                    <dt>ET₀ (Reference)</dt>
                    <dd className="font-medium">{et0.toFixed(1)} mm/day</dd>
                    <dt>Kc (Crop Coeff.)</dt>
                    <dd className="font-medium">{currentRecommendation.explanation.primaryFactors.find(f => f.factor === 'crop_requirement')?.contribution ? '—' : '—'}</dd>
                  </dl>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Calculation Steps</p>
                  <ol className="space-y-2 text-gray-600 list-decimal list-inside">
                    <li>Crop water requirement (ETc) = Kc × ET₀</li>
                    <li>Moisture deficit = Field Capacity - Current Moisture</li>
                    <li>Days to critical = (Current - Wilting Point) / Daily ETc</li>
                    <li>48h rainfall forecast checked</li>
                    <li>Decision rules applied based on thresholds</li>
                    <li>Irrigation amount = Deficit × Root zone factor</li>
                  </ol>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Result</p>
                  <dl className="grid grid-cols-2 gap-2 text-gray-600">
                    <dt>Recommendation</dt>
                    <dd className="font-medium capitalize">{currentRecommendation.recommendation.replace('_', ' ')}</dd>
                    <dt>Water Amount</dt>
                    <dd className="font-medium">{currentRecommendation.waterAmount} mm</dd>
                    <dt>Urgency</dt>
                    <dd className="font-medium capitalize">{currentRecommendation.urgency.replace('_', ' ')}</dd>
                    <dt>Confidence</dt>
                    <dd className="font-medium">{Math.round(currentRecommendation.confidence * 100)}%</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <Button variant="secondary" onClick={() => setShowCalculation(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
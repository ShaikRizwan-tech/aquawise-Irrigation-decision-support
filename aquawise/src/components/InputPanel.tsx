import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { CurrentConditions, MoistureSource, DataQuality } from '../types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Slider } from './ui/Slider';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  ThermometerIcon, 
  HumidityIcon, 
  CloudRainIcon, 
  DropletIcon,
  AlertCircleIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../icons';

interface InputPanelProps {
  conditions: CurrentConditions;
  onUpdate: (fieldId: string, updates: Partial<CurrentConditions>) => void;
  fieldId: string;
  forecast: { date: string; rainfall: number }[];
  et0: number;
  recommendation: { recommendation: string; waterAmount: number } | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  conditions,
  onUpdate,
  fieldId,
  forecast,
  et0,
  recommendation,
}) => {
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideNote, setOverrideNote] = useState('');
  const [rainfallInput, setRainfallInput] = useState(conditions.recentRainfall.toString());

  // Debounced update for real-time recommendation
  const [debouncedMoisture, setDebouncedMoisture] = useState(conditions.soilMoisture);
  const [debouncedRainfall, setDebouncedRainfall] = useState(conditions.recentRainfall);

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(fieldId, {
        soilMoisture: debouncedMoisture,
        recentRainfall: debouncedRainfall,
        timestamp: new Date().toISOString(),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedMoisture, debouncedRainfall, fieldId, onUpdate]);

  const handleMoistureChange = (value: number) => {
    setDebouncedMoisture(value);
  };

  const handleRainfallChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRainfallInput(value);
    const num = parseFloat(value) || 0;
    setDebouncedRainfall(num);
  };

  const handleRainfallBlur = () => {
    const num = parseFloat(rainfallInput) || 0;
    onUpdate(fieldId, {
      recentRainfall: num,
      timestamp: new Date().toISOString(),
    });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onUpdate(fieldId, { temperature: num, timestamp: new Date().toISOString() });
    }
  };

  const handleHumidityChange = (value: number) => {
    onUpdate(fieldId, { humidity: value, timestamp: new Date().toISOString() });
  };

  const handleOverride = () => {
    onUpdate(fieldId, {
      // Could add an override flag to conditions
    });
    setIsOverrideOpen(false);
  };

  const dataQualityColors: Record<DataQuality, string> = {
    high: 'bg-primary-500',
    medium: 'bg-warning-500',
    low: 'bg-danger-500',
  };

  const dataQualityLabels: Record<DataQuality, string> = {
    high: 'Live sensor data',
    medium: 'Manual entry',
    low: 'Estimated (stale)',
  };

  const moistureSourceColors: Record<MoistureSource, string> = {
    sensor: 'bg-primary-500',
    manual: 'bg-warning-500',
    estimated: 'bg-gray-500',
  };

  const moistureSourceLabels: Record<MoistureSource, string> = {
    sensor: 'Sensor',
    manual: 'Manual',
    estimated: 'Estimated',
  };

  const forecastRainfall48h = forecast.slice(0, 2).reduce((sum, day) => sum + day.rainfall, 0);
  const forecastRainfall7d = forecast.slice(0, 7).reduce((sum, day) => sum + day.rainfall, 0);

  return (
    <div className="space-y-6">
      {/* Current Conditions Section */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-3">
          <h3 className="section-title">Current Conditions</h3>
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', dataQualityColors[conditions.dataQuality])} />
            <span className="text-xs text-gray-500">{dataQualityLabels[conditions.dataQuality]}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Soil Moisture - Main Input */}
          <div>
            <label className="input-label">Soil Moisture</label>
            <Slider
              value={debouncedMoisture}
              onChange={handleMoistureChange}
              min={0}
              max={100}
              step={1}
              unit="%"
              showValue
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Wilting Point ~15%</span>
              <span className="text-xs text-gray-500">Field Capacity ~35%</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn('w-2 h-2 rounded-full', moistureSourceColors[conditions.moistureSource])} />
              <span className="text-xs text-gray-500">Source: {moistureSourceLabels[conditions.moistureSource]}</span>
              {conditions.moistureSource === 'sensor' && (
                <span className="text-xs text-primary-600">Updated {new Date(conditions.timestamp).toLocaleTimeString()}</span>
              )}
            </div>
          </div>

          {/* Recent Rainfall */}
          <div>
            <label className="input-label flex items-center gap-2">
              <CloudRainIcon className="w-4 h-4 text-gray-400" />
              Recent Rainfall
            </label>
            <Input
              type="number"
              value={rainfallInput}
              onChange={handleRainfallChange}
              onBlur={handleRainfallBlur}
              placeholder="0"
              step="0.1"
              min="0"
              max="200"
              helperText="Rainfall in last 24 hours (mm)"
            />
          </div>

          {/* Temperature */}
          <div>
            <label className="input-label flex items-center gap-2">
              <ThermometerIcon className="w-4 h-4 text-gray-400" />
              Temperature
            </label>
            <Input
              type="number"
              value={conditions.temperature?.toString() || ''}
              onChange={handleTemperatureChange}
              placeholder="Optional"
              step="0.1"
              min="-10"
              max="50"
              helperText={conditions.temperature ? undefined : 'Optional - uses weather API if available'}
            />
          </div>

          {/* Humidity */}
          <div>
            <label className="input-label flex items-center gap-2">
              <HumidityIcon className="w-4 h-4 text-gray-400" />
              Humidity
            </label>
            <Slider
              value={conditions.humidity || 60}
              onChange={handleHumidityChange}
              min={0}
              max={100}
              step={1}
              unit="%"
              showValue
            />
          </div>

          {/* Data Quality Indicator */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <InfoIcon className="w-4 h-4" />
              <span>
                <strong>Data Quality:</strong> {dataQualityLabels[conditions.dataQuality]} 
                {conditions.moistureSource === 'sensor' && ` • Last update: ${new Date(conditions.timestamp).toLocaleTimeString()}`}
              </span>
            </div>
            {conditions.dataQuality === 'low' && (
              <p className="text-xs text-danger-600 mt-1">
                ⚠ Sensor data older than 24h. Recommendation confidence reduced.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Section */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-3 cursor-pointer" onClick={() => setIsForecastOpen(!isForecastOpen)}>
          <h3 className="section-title flex items-center gap-2">
            <CloudRainIcon className="w-5 h-5" />
            7-Day Forecast
          </h3>
          <span className={cn('transition-transform', isForecastOpen ? 'rotate-180' : '')}>
            {isForecastOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </span>
        </CardHeader>
        {isForecastOpen && (
          <CardContent className="space-y-4">
            {/* Rainfall Mini Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Rainfall (mm)</h4>
              <div className="flex items-end gap-1 h-24">
                {forecast.map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary-500 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(4, (day.rainfall / Math.max(...forecast.map(f => f.rainfall), 1)) * 100)}%` }}
                      title={`${day.rainfall}mm`}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>48h: {forecastRainfall48h.toFixed(1)}mm</span>
                <span>7-day: {forecastRainfall7d.toFixed(1)}mm</span>
              </div>
            </div>

            {/* ET0 & Weather Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <ThermometerIcon className="w-4 h-4" />
                  <span>Avg ET₀</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{et0.toFixed(1)} mm/day</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <DropletIcon className="w-4 h-4" />
                  <span>Crop ETc</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {recommendation ? (recommendation.waterAmount * 0.8).toFixed(1) : '~'} mm/day
                </div>
              </div>
            </div>

            {/* Weather Alert */}
            {forecast.some(day => day.rainfall > 20) && (
              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-2 text-warning-800">
                  <AlertCircleIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{"Heavy rain expected (>20mm)"}</span>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Manual Override Section */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-3 cursor-pointer" onClick={() => setIsOverrideOpen(!isOverrideOpen)}>
          <h3 className="section-title flex items-center gap-2">
            <AlertCircleIcon className="w-5 h-5" />
            Manual Override
          </h3>
          <span className={cn('transition-transform', isOverrideOpen ? 'rotate-180' : '')}>
            {isOverrideOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </span>
        </CardHeader>
        {isOverrideOpen && (
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Mark this recommendation as reviewed or add field observations.
            </p>
            <Input
              label="Notes"
              placeholder="e.g., Soil feels moist at root depth, postponing irrigation..."
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              helperText="Optional notes for your records"
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setIsOverrideOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleOverride} className="flex-1">
                Save Override
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Days Since Rain</div>
              <div className="text-2xl font-bold text-gray-900">
                {conditions.lastIrrigation 
                  ? Math.floor((Date.now() - new Date(conditions.lastIrrigation).getTime()) / 86400000)
                  : '—'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Last Irrigation</div>
              <div className="text-sm font-medium text-gray-900">
                {conditions.lastIrrigation 
                  ? new Date(conditions.lastIrrigation).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
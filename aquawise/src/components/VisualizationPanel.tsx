import React from 'react';
import { cn } from '../utils/cn';
import { Recommendation } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { 
  DropletIcon, 
  AlertCircleIcon, 
  CheckCircleIcon, 
  CloudRainIcon,
  ThermometerIcon,
  SunIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from '../icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VisualizationPanelProps {
  recommendation: Recommendation | null;
  conditions: {
    soilMoisture: number;
    timestamp: string;
  } | null;
  forecast: { date: string; rainfall: number; et0: number }[];
  field: {
    fieldName: string;
    cropType: string;
    soilType: string;
    fieldSize?: number;
  } | null;
  history: { date: string; soilMoisture?: number; rainfall?: number; irrigation?: number }[];
}

const generateMoistureTrendData = (
  history: { date: string; soilMoisture?: number; rainfall?: number; irrigation?: number }[],
  forecast: { date: string; rainfall: number; et0: number }[],
  currentMoisture: number,
  fieldCapacity: number = 35,
  wiltingPoint: number = 15
) => {
  // Last 7 days from history
  const historicalData = history.slice(-7).map((entry, index) => ({
    label: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
    moisture: entry.soilMoisture ?? (currentMoisture - index * 2), // estimate if missing
    rainfall: entry.rainfall || 0,
    irrigation: entry.irrigation || 0,
    isForecast: false,
  }));

  // Next 3 days forecast
  const forecastData = forecast.slice(0, 3).map((day, index) => {
    const lastMoisture = historicalData[historicalData.length - 1]?.moisture || currentMoisture;
    const estimatedMoisture = Math.max(wiltingPoint, lastMoisture - day.et0 + day.rainfall);
    return {
      label: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      moisture: estimatedMoisture,
      rainfall: day.rainfall,
      irrigation: 0,
      isForecast: true,
    };
  });

  return [...historicalData, ...forecastData];
};

const getChartData = (trendData: ReturnType<typeof generateMoistureTrendData>, fieldCapacity: number, wiltingPoint: number) => {
  const labels = trendData.map(d => d.label);
  const moistureData = trendData.map(d => d.moisture);
  const isForecast = trendData.map(d => d.isForecast || false);

  return {
    labels,
    datasets: [
      {
        label: 'Soil Moisture (%)',
        data: moistureData,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: moistureData.map((m, i) => 
          m < 40 ? '#ef4444' : m < 60 ? '#f59e0b' : '#16a34a'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        segment: {
          borderDash: (ctx: { p0DataIndex: number }) => isForecast[ctx.p0DataIndex] ? [5, 5] : undefined,
        },
      },
      {
        label: 'Field Capacity',
        data: Array(labels.length).fill(fieldCapacity),
        borderColor: '#16a34a',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Critical Threshold',
        data: Array(labels.length).fill(40),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Wilting Point',
        data: Array(labels.length).fill(wiltingPoint),
        borderColor: '#991b1b',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
    ],
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      callbacks: {
        label: (context: any) => {
          if (context.dataset.label === 'Soil Moisture (%)') {
            return `Soil Moisture: ${context.parsed.y}%`;
          }
          return `${context.dataset.label}: ${context.parsed.y}%`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      min: 0,
      max: 100,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
      ticks: { 
        font: { size: 11 },
        callback: (tickValue: string | number) => `${tickValue}%`,
      },
    },
  },
};

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  recommendation,
  conditions,
  forecast,
  field,
  history = [],
}) => {
  if (!recommendation || !conditions || !field) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse h-96">
          <CardContent className="h-full" />
        </Card>
        <Card className="animate-pulse h-64">
          <CardContent className="h-full" />
        </Card>
      </div>
    );
  }

  const trendData = generateMoistureTrendData(history, forecast, conditions.soilMoisture);
  const chartData = getChartData(trendData, 35, 15); // Using default loam values

  const factorIcons: Record<string, React.ReactNode> = {
    moisture_deficit: <DropletIcon className="w-5 h-5" />,
    crop_requirement: <SunIcon className="w-5 h-5" />,
    forecasted_rainfall: <CloudRainIcon className="w-5 h-5" />,
    evapotranspiration: <ThermometerIcon className="w-5 h-5" />,
  };

  const factorColors: Record<string, string> = {
    moisture_deficit: 'text-primary-600',
    crop_requirement: 'text-warning-600',
    forecasted_rainfall: 'text-blue-600',
    evapotranspiration: 'text-danger-600',
  };

  const recommendationColors = {
    irrigate: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-800', icon: <DropletIcon className="w-5 h-5" /> },
    check_field: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-800', icon: <AlertCircleIcon className="w-5 h-5" /> },
    wait: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-800', icon: <CheckCircleIcon className="w-5 h-5" /> },
  };

  const recStyle = recommendationColors[recommendation.recommendation];

  return (
    <div className="space-y-6">
      {/* Decision Explanation Card */}
      <Card>
        <CardHeader>
          <h3 className="section-title flex items-center gap-2">
            <span className={cn('p-2 rounded-lg', recStyle.bg)}>{recStyle.icon}</span>
            Why This Recommendation?
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Factor Breakdown */}
          <div className="space-y-3">
            {recommendation.explanation.primaryFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className={cn('p-2 rounded-lg bg-gray-100', factorColors[factor.factor])}>
                  {factorIcons[factor.factor] || <MinusIcon className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{factor.label}</span>
                    <span className="font-semibold text-gray-900">{Math.round(factor.contribution * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${factor.contribution * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Insights */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Insights</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                Current moisture: <strong>{conditions.soilMoisture}%</strong> 
                {conditions.soilMoisture < 40 ? ' (Below critical threshold)' : conditions.soilMoisture < 60 ? ' (Moderate)' : ' (Adequate)'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-warning-500 rounded-full" />
                48h rainfall forecast: <strong>{forecast.slice(0, 2).reduce((s, d) => s + d.rainfall, 0).toFixed(1)}mm</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-danger-500 rounded-full" />
                Daily crop water use (ETc): <strong>~{(recommendation.waterAmount * 0.8).toFixed(1)}mm</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Confidence: <strong>{Math.round(recommendation.confidence * 100)}%</strong> ({recommendation.confidenceLevel})
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Moisture Trend Chart */}
      <Card>
        <CardHeader>
          <h3 className="section-title flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Soil Moisture Trend (7 Days + 3 Day Forecast)
          </h3>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-primary-500 rounded" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-primary-500 rounded opacity-50" />
              <span>Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-primary-600" />
              <span>Field Capacity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-danger-600" />
              <span>Critical (40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-danger-800" />
              <span>Wilting Point</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Savings Estimate */}
      <Card>
        <CardHeader>
          <h3 className="section-title flex items-center gap-2">
            <DropletIcon className="w-5 h-5 text-primary-600" />
            Water Savings Estimate
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="8"
                    strokeDasharray={`${(recommendation.estimatedSavings / 20000) * 251.2} 251.2`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round((recommendation.estimatedSavings / 20000) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(recommendation.estimatedSavings / 1000).toFixed(1)} kL
                </p>
                <p className="text-sm text-gray-500">saved this week vs. fixed schedule</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-600">
                ~{(recommendation.estimatedSavings * 4 / 1000).toFixed(0)} kL/month
              </p>
              <p className="text-sm text-gray-500">Projected monthly savings</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{recommendation.estimatedSavings > 0 ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-500">Saving vs Fixed</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {field.fieldSize ? ((recommendation.estimatedSavings * 4) / (field.fieldSize * 10000)).toFixed(1) : '—'}
              </p>
              <p className="text-xs text-gray-500">mm/ha saved</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {Math.round(recommendation.confidence * 100)}%
              </p>
              <p className="text-xs text-gray-500">Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Schedule Comparison */}
      <Card>
        <CardHeader>
          <h3 className="section-title flex items-center gap-2">
            <TrendingDownIcon className="w-5 h-5" />
            Alternative Schedules
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendation.alternativeSchedules.map((alt, index) => (
            <div 
              key={index}
              className={cn('p-3 rounded-lg border transition-colors cursor-pointer', 
                index === 0 ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-semibold',
                    index === 0 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-700'
                  )}>
                    {index === 0 ? 'Recommended' : 'Alternative'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{alt.name}</p>
                    <p className="text-sm text-gray-500">{alt.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {index === 0 ? 'Baseline' : `${alt.waterUsePercent > 100 ? '+' : ''}{alt.waterUsePercent - 100}% water`}
                  </p>
                  <p className="text-xs text-gray-500">{alt.outcomeEstimate}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Need to add TrendingUpIcon and TrendingDownIcon to icons
import React from 'react';
import { cn } from '../utils/cn';
import { Recommendation, RecommendationType, UrgencyLevel } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { 
  DropletIcon, 
  AlertCircleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../icons';

interface RecommendationCardProps {
  recommendation: Recommendation | null;
  onOverride?: () => void;
  onViewCalculation?: () => void;
  onMarkComplete?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const recommendationStyles: Record<RecommendationType, { bg: string; border: string; icon: React.ReactNode; title: string }> = {
  irrigate: { 
    bg: 'bg-danger-50', 
    border: 'border-danger-200', 
    icon: <DropletIcon className="w-8 h-8 text-danger-600" />,
    title: 'IRRIGATE'
  },
  check_field: { 
    bg: 'bg-warning-50', 
    border: 'border-warning-200', 
    icon: <AlertCircleIcon className="w-8 h-8 text-warning-600" />,
    title: 'CHECK FIELD'
  },
  wait: { 
    bg: 'bg-primary-50', 
    border: 'border-primary-200', 
    icon: <CheckCircleIcon className="w-8 h-8 text-primary-600" />,
    title: 'WAIT'
  },
};

const urgencyStyles: Record<UrgencyLevel, { icon: React.ReactNode; label: string; color: string }> = {
  immediate: { icon: <AlertCircleIcon className="w-4 h-4" />, label: 'Immediate', color: 'text-danger-600' },
  within_24h: { icon: <ClockIcon className="w-4 h-4" />, label: 'Within 24h', color: 'text-warning-600' },
  monitor: { icon: <InfoIcon className="w-4 h-4" />, label: 'Monitor', color: 'text-primary-600' },
};

const confidenceStyles = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high': return 'bg-primary-500';
    case 'medium': return 'bg-warning-500';
    case 'low': return 'bg-danger-500';
  }
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onOverride,
  onViewCalculation,
  onMarkComplete,
  isExpanded = false,
  onToggleExpand,
}) => {
  if (!recommendation) {
    return (
      <Card className="animate-pulse">
        <CardContent className="py-8">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const style = recommendationStyles[recommendation.recommendation];
  const urgency = urgencyStyles[recommendation.urgency];

  // Calculate threshold positions for visualization
  const thresholds = recommendation.explanation.thresholds;
  const thresholdPositions = thresholds ? (() => {
    const { current, critical, fieldCapacity, wiltingPoint } = thresholds;
    const totalRange = fieldCapacity - wiltingPoint;
    const criticalPos = ((critical - wiltingPoint) / totalRange) * 100;
    const currentPos = ((current - wiltingPoint) / totalRange) * 100;
    const fieldCapPos = ((fieldCapacity - wiltingPoint) / totalRange) * 100;
    return { current, critical, fieldCapacity, wiltingPoint, criticalPos, currentPos, fieldCapPos };
  })() : null;

  return (
    <Card className={cn(style.bg, style.border, 'border-2 overflow-hidden animate-fade-in')}>
      <CardContent className="p-6">
        {/* Main Recommendation Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              {style.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{style.title}</h2>
              <p className="text-lg text-gray-600 mt-1">{recommendation.explanation.text}</p>
            </div>
          </div>
          
          {/* Confidence & Urgency */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Confidence</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all duration-500', confidenceStyles(recommendation.confidenceLevel))}
                  style={{ width: `${Math.round(recommendation.confidence * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 w-16 text-right">
                {Math.round(recommendation.confidence * 100)}%
              </span>
            </div>
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border', 
              recommendation.urgency === 'immediate' ? 'border-danger-200' : 
              recommendation.urgency === 'within_24h' ? 'border-warning-200' : 'border-primary-200'
            )}>
              {urgency.icon}
              <span className={cn('text-sm font-medium', urgency.color)}>{urgency.label}</span>
            </div>
          </div>
        </div>

        {/* Water Amount & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <DropletIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Water Amount</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{recommendation.waterAmount}</span>
              <span className="text-gray-500">mm</span>
            </div>
            {recommendation.waterAmountVolume && (
              <p className="text-xs text-gray-500 mt-1">≈ {recommendation.waterAmountVolume.toLocaleString()} m³</p>
            )}
          </div>
          
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="text-sm font-medium">Crop Need (ETc)</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <span className="text-gray-500">~</span>{Math.round(recommendation.waterAmount * 0.8)} mm/day
            </div>
          </div>
          
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="text-sm font-medium">Est. Savings</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary-600">
                {(recommendation.estimatedSavings / 1000).toFixed(1)}
              </span>
              <span className="text-gray-500">kL/week</span>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-slide-in">
            {/* Factor Breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Why This Recommendation?</h3>
              <div className="space-y-2">
                {recommendation.explanation.primaryFactors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-lg">{factor.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{factor.label}</span>
                        <span className="text-gray-500">{Math.round(factor.contribution * 100)}%</span>
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
            </div>

            {/* Threshold Indicators */}
            {thresholds && thresholdPositions && (
              <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Moisture Thresholds</h3>
                <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 bottom-0 bg-danger-200" 
                    style={{ left: '0%', width: `${thresholdPositions.criticalPos}%` }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 bg-warning-200" 
                    style={{ left: `${thresholdPositions.criticalPos}%`, width: `${thresholdPositions.fieldCapPos - thresholdPositions.criticalPos}%` }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 bg-primary-200" 
                    style={{ left: `${thresholdPositions.fieldCapPos}%`, width: `${100 - thresholdPositions.fieldCapPos}%` }}
                  />
                  {/* Current position marker */}
                  <div 
                    className="absolute top-1/2 w-3 h-3 bg-primary-600 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg"
                    style={{ left: `${thresholdPositions.currentPos}%` }}
                    title={`Current: ${thresholdPositions.current}%`}
                  />
                  {/* Critical threshold marker */}
                  <div 
                    className="absolute top-1/2 w-0.5 h-8 bg-danger-600 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${thresholdPositions.criticalPos}%` }}
                    title={`Critical: ${thresholdPositions.critical}%`}
                  />
                  {/* Field capacity marker */}
                  <div 
                    className="absolute top-1/2 w-0.5 h-8 bg-primary-600 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${thresholdPositions.fieldCapPos}%` }}
                    title={`Field Capacity: ${thresholdPositions.fieldCapacity}%`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Wilting Point ({thresholdPositions.wiltingPoint}%)</span>
                  <span>Critical ({thresholdPositions.critical}%)</span>
                  <span>Field Capacity ({thresholdPositions.fieldCapacity}%)</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {onOverride && (
                <Button variant="secondary" onClick={onOverride} className="flex-1 sm:flex-none">
                  Override Recommendation
                </Button>
              )}
              {onViewCalculation && (
                <Button variant="ghost" onClick={onViewCalculation} className="flex-1 sm:flex-none">
                  View Calculation
                </Button>
              )}
              {onMarkComplete && (
                <Button variant="primary" onClick={onMarkComplete} className="flex-1 sm:flex-none">
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
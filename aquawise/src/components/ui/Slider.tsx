import React from 'react';
import { cn } from '../../utils/cn';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  unit?: string;
  disabled?: boolean;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, min, max, step = 1, value, onChange, showValue = true, unit = '', disabled, id, ...props }, ref) => {
    const sliderId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label htmlFor={sliderId} className="input-label mb-0">
              {label}
            </label>
            {showValue && (
              <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {value}{unit}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            id={sliderId}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-5',
              '[&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:bg-primary-600',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-white',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:transition-all',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-5',
              '[&::-moz-range-thumb]:h-5',
              '[&::-moz-range-thumb]:bg-primary-600',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:border-white',
            )}
            {...props}
          />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary-500 rounded"
            style={{ width: `${percentage}%`, transform: 'translateY(-50%)' }}
            aria-hidden="true"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
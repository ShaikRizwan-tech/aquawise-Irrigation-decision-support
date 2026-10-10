import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Slider } from '../components/ui/Slider';
import { Badge } from '../components/ui/Badge';
import { FieldConfig, CropType, GrowthStage, SoilType } from '../types';
import { cropOptions, growthStageOptions, soilTypeOptions } from '../utils/mockData';
import { SOIL_PROPERTIES, CROP_COEFFICIENTS } from '../types';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
  FieldIcon,
  CropIcon,
  DropletIcon,
  SunIcon,
} from '../icons';
import { cn } from '../utils/cn';

export const FieldSetup: React.FC = () => {
  const { addField, fields } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    fieldName: '',
    cropType: 'wheat' as CropType,
    growthStage: 'vegetative' as GrowthStage,
    soilType: 'loam' as SoilType,
    fieldSize: '',
    location: '',
    zoneCount: '1',
  });

  // Calculate preview values
  const soil = SOIL_PROPERTIES[formData.soilType];
  const kc = CROP_COEFFICIENTS[formData.cropType][formData.growthStage];
  const estimatedEtc = (kc * 5.5).toFixed(1); // Using default ET0
  const waterReq = Math.round((soil.fieldCapacity - 50) * 10); // Rough estimate

  const checkFormValidity = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fieldName.trim()) newErrors.fieldName = 'Field name is required';
    if (!formData.cropType) newErrors.cropType = 'Crop type is required';
    if (!formData.growthStage) newErrors.growthStage = 'Growth stage is required';
    if (!formData.soilType) newErrors.soilType = 'Soil type is required';
    if (formData.fieldSize && (parseFloat(formData.fieldSize) < 0.1 || parseFloat(formData.fieldSize) > 10000)) {
      newErrors.fieldSize = 'Field size must be between 0.1 and 10000 hectares';
    }
    if (formData.zoneCount && (parseInt(formData.zoneCount) < 1 || parseInt(formData.zoneCount) > 10)) {
      newErrors.zoneCount = 'Zones must be between 1 and 10';
    }
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const validateForm = () => {
    const { isValid, errors: newErrors } = checkFormValidity();
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const newFieldId = addField({
      fieldName: formData.fieldName.trim(),
      cropType: formData.cropType,
      growthStage: formData.growthStage,
      soilType: formData.soilType,
      fieldSize: formData.fieldSize ? parseFloat(formData.fieldSize) : undefined,
      location: formData.location ? { lat: 0, lon: 0 } : undefined, // Simplified
      zoneCount: parseInt(formData.zoneCount) || 1,
    });

    // Reset form for next field
    setFormData({
      fieldName: '',
      cropType: 'wheat',
      growthStage: 'vegetative',
      soilType: 'loam',
      fieldSize: '',
      location: '',
      zoneCount: '1',
    });
    setErrors({});
    setIsSubmitting(false);

    // Navigate to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const handleAddAnother = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    addField({
      fieldName: formData.fieldName.trim(),
      cropType: formData.cropType,
      growthStage: formData.growthStage,
      soilType: formData.soilType,
      fieldSize: formData.fieldSize ? parseFloat(formData.fieldSize) : undefined,
      location: formData.location ? { lat: 0, lon: 0 } : undefined,
      zoneCount: parseInt(formData.zoneCount) || 1,
    });

    // Reset form
    setFormData({
      fieldName: '',
      cropType: 'wheat',
      growthStage: 'vegetative',
      soilType: 'loam',
      fieldSize: '',
      location: '',
      zoneCount: '1',
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">AquaWise</h1>
              <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                Field Setup
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Step 2 of 2</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Core Fields Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FieldIcon className="w-5 h-5 text-primary-600" />
                    Core Field Information
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Required fields for irrigation recommendations</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <Input
                    label="Field Name"
                    value={formData.fieldName}
                    onChange={(e) => handleChange('fieldName', e.target.value)}
                    placeholder="e.g., North Field, Block A"
                    error={errors.fieldName}
                    maxLength={50}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Crop Type"
                      value={formData.cropType}
                      onChange={(e) => handleChange('cropType', e.target.value as CropType)}
                      options={cropOptions.map((o: { value: CropType; label: string; icon: string }) => ({ value: o.value, label: o.label }))}
                      placeholder="Select crop"
                      error={errors.cropType}
                      required
                    />

                    <Select
                      label="Growth Stage"
                      value={formData.growthStage}
                      onChange={(e) => handleChange('growthStage', e.target.value as GrowthStage)}
                      options={growthStageOptions.map((o: { value: GrowthStage; label: string }) => ({ value: o.value, label: o.label }))}
                      placeholder="Select stage"
                      error={errors.growthStage}
                      required
                    />
                  </div>

                  <Select
                    label="Soil Type"
                    value={formData.soilType}
                    onChange={(e) => handleChange('soilType', e.target.value as SoilType)}
                    options={soilTypeOptions.map((o: { value: SoilType; label: string }) => ({ value: o.value, label: o.label }))}
                    placeholder="Select soil type"
                    error={errors.soilType}
                    required
                  />
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <SunIcon className="w-5 h-5 text-warning-600" />
                      Advanced Settings
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Optional parameters for more precise calculations</p>
                </CardHeader>
                {showAdvanced && (
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Field Size (hectares)"
                        type="number"
                        value={formData.fieldSize}
                        onChange={(e) => handleChange('fieldSize', e.target.value)}
                        placeholder="Optional"
                        step="0.1"
                        min="0.1"
                        max="10000"
                        error={errors.fieldSize}
                        helperText="For water volume calculations (m³)"
                      />

                      <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="City or coordinates (optional)"
                        helperText="Used for local weather data"
                      />
                    </div>

                    <Select
                      label="Number of Irrigation Zones"
                      value={formData.zoneCount}
                      onChange={(e) => handleChange('zoneCount', e.target.value)}
                      options={Array.from({ length: 10 }, (_, i) => ({ 
                        value: String(i + 1), 
                        label: `${i + 1} Zone${i > 0 ? 's' : ''}` 
                      }))}
                      placeholder="Select zones"
                      error={errors.zoneCount}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Continue to Dashboard'}
                </Button>
                {fields.length > 0 && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={handleAddAnother}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Another Field
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => window.location.href = '/dashboard'}
                  disabled={fields.length === 0}
                  className="flex-1 sm:flex-none"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 h-fit">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Field Summary Preview</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <CropIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {formData.fieldName || 'Unnamed Field'}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">{formData.cropType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-white rounded">
                      <p className="text-gray-500">Stage</p>
                      <p className="font-medium capitalize">{formData.growthStage}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-gray-500">Soil</p>
                      <p className="font-medium capitalize">{formData.soilType.replace('_', ' ')}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-gray-500">Size</p>
                      <p className="font-medium">{formData.fieldSize || '—'} ha</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-gray-500">Zones</p>
                      <p className="font-medium">{formData.zoneCount}</p>
                    </div>
                  </div>
                </div>

                {/* Estimated Requirements */}
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <h4 className="font-medium text-primary-900 mb-3 flex items-center gap-2">
                    <DropletIcon className="w-4 h-4" />
                    Estimated Water Requirements
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crop Coefficient (Kc)</span>
                      <span className="font-semibold text-gray-900">{kc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily ETc (est.)</span>
                      <span className="font-semibold text-gray-900">{estimatedEtc} mm/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Field Capacity</span>
                      <span className="font-semibold text-gray-900">{soil.fieldCapacity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wilting Point</span>
                      <span className="font-semibold text-gray-900">{soil.wiltingPoint}%</span>
                    </div>
                    <div className="flex justify-between border-t border-primary-100 pt-2">
                      <span className="text-gray-600">Avail. Water Capacity</span>
                      <span className="font-semibold text-gray-900">{soil.availableWaterCapacity} mm/m</span>
                    </div>
                  </div>
                </div>

                {/* Validation Status */}
                <div className="p-3 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Validation Status</h4>
                  <div className="space-y-1 text-sm">
                    {[
                      { label: 'Field name', valid: !!formData.fieldName.trim() },
                      { label: 'Crop type', valid: !!formData.cropType },
                      { label: 'Growth stage', valid: !!formData.growthStage },
                      { label: 'Soil type', valid: !!formData.soilType },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={cn('flex items-center gap-1', item.valid ? 'text-primary-600' : 'text-gray-400')}>
                          {item.valid ? '✓' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      form="field-setup-form"
                      className="w-full"
                      disabled={isSubmitting || !checkFormValidity().isValid}
                    >
                      {fields.length > 0 ? 'Add Field & Continue' : 'Save & Continue to Dashboard'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="mt-6">
              <CardContent className="pt-0">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <InfoIcon className="w-4 h-4 text-primary-600" />
                    Quick Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Use sensor data for best accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Field capacity varies by soil type</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Growth stage affects crop water needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Add multiple fields for zone management</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
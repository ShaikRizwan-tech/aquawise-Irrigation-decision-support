import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { 
  DropletIcon, 
  SunIcon, 
  CloudRainIcon, 
  BarChartIcon,
  ArrowRightIcon,
  FieldIcon,
  CropIcon,
  CheckCircleIcon,
} from '../icons';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: DropletIcon,
      title: 'Water Savings',
      description: 'Reduce irrigation water use by 20-30% compared to fixed schedules through data-driven recommendations.',
      color: 'text-primary-600',
      bg: 'bg-primary-100',
    },
    {
      icon: SunIcon,
      title: 'Smart Recommendations',
      description: 'Get real-time irrigation decisions based on crop stage, soil type, weather forecasts, and field conditions.',
      color: 'text-warning-600',
      bg: 'bg-warning-100',
    },
    {
      icon: CloudRainIcon,
      title: 'Weather Integration',
      description: 'Automatically factors in 7-day rainfall forecasts and evapotranspiration rates for optimal timing.',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  const methodology = [
    'Crop water requirement (ETc) = Crop coefficient (Kc) × Reference ET (ET₀)',
    'Soil moisture deficit calculated from field capacity and current readings',
    'Days to critical threshold estimated from daily depletion rates',
    '48-hour rainfall forecast checked before recommending irrigation',
    'Confidence scoring based on data quality and source reliability',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span>Version 1.0 • Weather-Aware Irrigation Decisions</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              AquaWise
              <br />
              <span className="text-primary-600">Smart Irrigation Decisions</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Reduce water waste and improve crop health with data-driven irrigation recommendations 
              based on real-time field conditions and weather forecasts.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => window.location.href = '/setup'}>
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn How It Works
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                <span>FAO-based calculations</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                <span>No sensors required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Feature Overview */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AquaWise?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three pillars that make irrigation decisions smarter, not harder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover h-full">
                <CardContent className="p-6">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.bg)}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to get your first irrigation recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute left-1/2 top-8 w-1 h-24 bg-primary-200 md:hidden" />
              <Card className="text-center p-6 h-full">
                <CardContent>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary-600">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Up Your Field</h3>
                    <p className="text-gray-600 mb-4">
                      Enter crop type, growth stage, soil type, and field size. 
                      Takes less than 2 minutes.
                    </p>
                    <div className="flex justify-center gap-2">
                      <FieldIcon className="w-5 h-5 text-gray-400" />
                      <CropIcon className="w-5 h-5 text-gray-400" />
                      <DropletIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-8 w-1 h-24 bg-primary-200 md:hidden" />
              <Card className="text-center p-6 h-full">
                <CardContent>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary-600">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Current Conditions</h3>
                    <p className="text-gray-600 mb-4">
                      Input soil moisture, recent rainfall, and optionally temperature/humidity. 
                      Sensor or manual entry works.
                    </p>
                    <div className="flex justify-center gap-2">
                      <SunIcon className="w-5 h-5 text-gray-400" />
                      <CloudRainIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>              </Card>
            </div>

            <div className="relative">
              <Card className="text-center p-6 h-full">
                <CardContent>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary-600">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Recommendation</h3>
                    <p className="text-gray-600 mb-4">
                      Receive instant irrigation decision with confidence level, 
                      water amount, and detailed explanation.
                    </p>
                    <div className="flex justify-center gap-2">
                      <BarChartIcon className="w-5 h-5 text-gray-400" />
                      <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Decision Methodology
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transparent, science-based approach built on FAO irrigation guidelines.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {methodology.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Optimize Your Irrigation?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join farmers saving water and improving yields with AquaWise. 
            Start your first field setup in under 2 minutes.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50"
            onClick={() => window.location.href = '/setup'}
          >
            Start Free - No Account Required
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <DropletIcon className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">AquaWise</span>
            </div>
            <p className="text-gray-400 text-sm">
              Weather-Aware Irrigation Decision Support v1.0
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Based on FAO-56 guidelines</span>
              <span>Open source methodology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
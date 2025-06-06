import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planType: string) => void;
}

export function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const plans = [
    {
      name: 'Pro',
      price: '$50',
      period: '/month',
      features: [
        'Unlimited SWMS Generation',
        'AI-Powered Safety Recommendations',
        'Digital Signatures',
        'QR Code Check-ins',
        'Export to PDF',
        'Email Support'
      ],
      color: 'blue',
      popular: false
    },
    {
      name: 'Enterprise',
      price: '$100',
      period: '/month',
      features: [
        'Everything in Pro',
        'Multi-Company Management',
        'Advanced Analytics',
        'Custom Branding',
        'Priority Support',
        'API Access',
        'Compliance Reporting',
        'Team Collaboration'
      ],
      color: 'purple',
      popular: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Continue Creating SWMS
          </DialogTitle>
          <p className="text-gray-600 text-center mt-2">
            You've used your free trial SWMS. Choose a plan to continue building professional safety documents.
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-6 ${
                plan.popular
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-primary/30 bg-primary/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${
                  plan.color === 'purple' ? 'text-purple-700' : 'text-primary'
                }`}>
                  {plan.name}
                </h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className={`h-5 w-5 ${
                      plan.color === 'purple' ? 'text-purple-500' : 'text-primary'
                    }`} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onSubscribe(plan.name.toLowerCase())}
                className={`w-full py-3 text-lg font-semibold ${
                  plan.color === 'purple'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                Choose {plan.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Maybe Later
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>30-day money-back guarantee • Cancel anytime • Secure payment processing</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
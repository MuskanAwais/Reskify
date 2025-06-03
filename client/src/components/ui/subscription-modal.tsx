import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: string) => void;
  swmsCount: number;
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onSubscribe, 
  swmsCount 
}: SubscriptionModalProps) {
  const plans = [
    {
      id: "pro",
      name: "Pro Plan",
      price: "$50",
      period: "/month",
      credits: "10 SWMS per month",
      features: [
        "AI-powered SWMS generation",
        "Visual table editor",
        "QR check-in system",
        "Multi-language support",
        "Voice control",
        "Priority support"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$100",
      period: "/month",
      credits: "25 SWMS per month",
      features: [
        "Everything in Pro",
        "Custom branding",
        "API access",
        "Advanced analytics",
        "Team management",
        "Dedicated support"
      ],
      popular: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Subscription Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Trial Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-800">Trial Period Complete</h3>
                <p className="text-orange-700">
                  You've used your free trial SWMS. This is SWMS #{swmsCount + 1}. 
                  Choose a subscription plan to continue creating professional SWMS documents.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-blue-500 border-2 scale-105' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-blue-600 font-medium mt-2">{plan.credits}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'
                    } text-white`}
                    onClick={() => onSubscribe(plan.id)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe to {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-800">Secure Payment</span>
            </div>
            <p className="text-gray-600 text-sm">
              Your payment is processed securely through Stripe. Cancel anytime. 
              No hidden fees or long-term commitments.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
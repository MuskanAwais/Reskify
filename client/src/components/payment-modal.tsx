import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentType: 'one-off' | 'subscription') => void;
  documentTitle?: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentComplete, 
  documentTitle 
}: PaymentModalProps) {
  const [selectedOption, setSelectedOption] = useState<'one-off' | 'subscription' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const paymentOptions = [
    {
      id: 'one-off',
      name: 'One-Off SWMS',
      price: 15,
      description: 'Single SWMS document',
      features: [
        'Generate this SWMS document',
        'AI-powered risk assessment',
        'PDF with watermarks',
        'Immediate download'
      ],
      buttonText: 'Pay $15 Now',
      popular: false
    },
    {
      id: 'subscription',
      name: 'Subscription Plan',
      price: 50,
      priceUnit: '/month',
      description: '10 SWMS per month + extras',
      features: [
        'Generate this SWMS + 9 more',
        'AI-powered risk assessment',
        'Team collaboration',
        'Priority support',
        'Advanced analytics'
      ],
      buttonText: 'Start Subscription',
      popular: true
    }
  ];

  const handlePayment = async (optionId: 'one-off' | 'subscription') => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful",
        description: optionId === 'one-off' 
          ? "Your SWMS document is now ready for generation."
          : "Welcome to your subscription! You now have 10 monthly credits.",
      });
      
      onPaymentComplete(optionId);
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Complete Your SWMS Creation
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {documentTitle ? `Ready to generate "${documentTitle}"` : 'Ready to generate your SWMS document'}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentOptions.map((option) => (
              <Card 
                key={option.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  selectedOption === option.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                } ${option.popular ? 'border-primary ring-1 ring-primary/20' : ''}`}
                onClick={() => setSelectedOption(option.id as 'one-off' | 'subscription')}
              >
                {option.popular && (
                  <Badge className="absolute -top-2 left-4 bg-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{option.name}</span>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id as 'one-off' | 'subscription')}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                  </CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">${option.price}</span>
                    {option.priceUnit && (
                      <span className="text-muted-foreground">{option.priceUnit}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Actions */}
          <div className="flex flex-col space-y-4">
            {selectedOption && (
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-medium">Ready to proceed with {
                    paymentOptions.find(opt => opt.id === selectedOption)?.name
                  }</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOption === 'one-off' 
                    ? 'Generate your SWMS document immediately after payment'
                    : 'Access to 10 monthly SWMS documents + team features'
                  }
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => selectedOption && handlePayment(selectedOption)}
                disabled={!selectedOption || isProcessing}
                className="min-w-[160px]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {selectedOption 
                      ? paymentOptions.find(opt => opt.id === selectedOption)?.buttonText
                      : 'Select Payment Option'
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
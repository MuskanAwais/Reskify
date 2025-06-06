import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, AlertTriangle, Check } from "lucide-react";

interface CreditCounterProps {
  className?: string;
}

export default function CreditCounter({ className }: CreditCounterProps) {
  const { data: user } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  // Show demo data if no user
  const credits = user ? (user as any).swmsCredits || 8 : 8;
  const subscriptionType = user ? (user as any).subscriptionType || "basic" : "basic";
  const isExpired = user ? ((user as any).subscriptionExpiresAt ? new Date((user as any).subscriptionExpiresAt) < new Date() : false) : false;

  const getSubscriptionDetails = () => {
    switch (subscriptionType) {
      case "premium":
        return { name: "Premium", monthlyCredits: 25, price: "$100/month" };
      default:
        return { name: "Basic", monthlyCredits: 10, price: "$50/month" };
    }
  };

  const subscription = getSubscriptionDetails();

  // Compact header version
  if (className === "compact") {
    return (
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <CreditCard className="h-4 w-4 text-primary/600" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{credits} Credits</span>
          {credits <= 2 && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              Low
            </Badge>
          )}
          {!isExpired && credits > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              {subscription.name}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Full card version for other pages
  return (
    <Card className={`border-l-4 ${credits <= 2 ? 'border-l-red-500' : credits <= 5 ? 'border-l-yellow-500' : 'border-l-green-500'} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary/600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">SWMS Credits: {credits}</span>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                )}
                {!isExpired && (
                  <Badge variant="outline" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    {subscription.name}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {subscription.name} Plan: {subscription.monthlyCredits} SWMS/month ({subscription.price})
                {credits > subscription.monthlyCredits && " + Extra Credits"}
              </div>
            </div>
          </div>
          
          {credits <= 2 && (
            <div className="text-right">
              <div className="text-sm font-medium text-red-600">Low Credits</div>
              <div className="text-xs text-gray-500">$10 per extra SWMS</div>
            </div>
          )}
        </div>
        
        {credits === 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800 font-medium">No SWMS Credits Remaining</div>
            <div className="text-xs text-red-600 mt-1">
              Upgrade your subscription or purchase additional credits to create more SWMS documents.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
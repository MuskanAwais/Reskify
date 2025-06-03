import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";

export default function SafetyLibrary() {
  // Check if user has access to Safety Library
  const { data: subscription } = useQuery({
    queryKey: ['/api/user/subscription']
  });

  const hasAccess = subscription?.features?.safetyLibrary || false;

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Standard Practice Guide</h1>
            <p className="text-muted-foreground">
              Access comprehensive Australian safety standards and practice guides
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Professional Feature</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Standard Practice Guide access is available with Professional and Enterprise subscriptions
            </p>

            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center">
                <span>• Complete Australian safety standards database</span>
              </div>
              <div className="flex items-center justify-center">
                <span>• AS/NZS standards and Safe Work Australia guidelines</span>
              </div>
              <div className="flex items-center justify-center">
                <span>• Searchable compliance documentation</span>
              </div>
              <div className="flex items-center justify-center">
                <span>• Regular updates and notifications</span>
              </div>
            </div>

            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has access, show full Safety Library interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safety Library</h1>
          <p className="text-muted-foreground">
            Access comprehensive Australian safety standards and practice guides
          </p>
        </div>
      </div>
      {/* Full interface would go here for users with access */}
    </div>
  );
}
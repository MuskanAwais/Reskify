import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Crown, Unlock, Search, ExternalLink, Filter } from "lucide-react";

export default function SafetyLibrary() {
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Check if user has access to Safety Library
  const { data: subscription } = useQuery({
    queryKey: ['/api/user/subscription']
  });

  // Get safety library data
  const { data: safetyLibrary = [] } = useQuery({
    queryKey: ['/api/safety-library'],
    enabled: adminUnlocked || subscription?.features?.safetyLibrary
  });

  const hasAccess = adminUnlocked || subscription?.features?.safetyLibrary || false;

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

            <div className="flex gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Access
              </Button>
              
              {/* Temporary Admin Toggle */}
              <Button 
                variant="outline" 
                onClick={() => setAdminUnlocked(!adminUnlocked)}
                className="border-orange-200 text-orange-600 hover:bg-orange-50 px-6 py-2"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            </div>
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
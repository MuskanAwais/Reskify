import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  FileText, 
  ExternalLink, 
  Crown, 
  Lock,
  Filter,
  Calendar,
  Building,
  AlertTriangle,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SafetyStandard {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  authority: string;
  effectiveDate: Date | null;
  url: string | null;
  tags: string[];
}

interface UserSubscription {
  subscriptionType: string;
  hasAccess: boolean;
}

export default function StandardPracticeGuide() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Check user subscription for access control
  const { data: userSubscription } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: () => apiRequest('GET', '/api/user/subscription')
  });

  // Fetch safety standards
  const { data: safetyStandards, isLoading } = useQuery({
    queryKey: ['/api/safety-library'],
    queryFn: () => apiRequest('GET', '/api/safety-library'),
    enabled: userSubscription?.hasAccess !== false
  });

  const hasAccess = userSubscription?.subscriptionType === 'professional' || 
                   userSubscription?.subscriptionType === 'enterprise';

  const categories = [
    "All",
    "General Safety",
    "Electrical Safety", 
    "Structural Safety",
    "Chemical Safety",
    "Confined Spaces",
    "Management Systems",
    "Fire Safety",
    "Environmental"
  ];

  const filteredStandards = safetyStandards?.filter((standard: SafetyStandard) => {
    const matchesSearch = standard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || standard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Required",
      description: "Standard Practice Guide access requires Professional or Enterprise subscription"
    });
  };

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Standard Practice Guide</h1>
            <p className="text-lg text-gray-600 mb-6">
              Access comprehensive Australian safety standards and practice guides
            </p>
          </div>

          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-8">
              <div className="space-y-4">
                <Crown className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Professional Feature</h3>
                <p className="text-gray-600">
                  Standard Practice Guide access is available with Professional and Enterprise subscriptions
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Complete Australian safety standards database</p>
                  <p>• AS/NZS standards and Safe Work Australia guidelines</p>
                  <p>• Searchable compliance documentation</p>
                  <p>• Regular updates and notifications</p>
                </div>
                <Button onClick={handleUpgrade} className="mt-4">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Standard Practice Guide</h1>
          <p className="text-gray-600 mt-2">Australian safety standards and compliance documentation</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-primary border-primary/20">
          <Shield className="w-4 h-4 mr-2" />
          Professional Access
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search standards, codes, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standards List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStandards.map((standard: SafetyStandard) => (
            <Card key={standard.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {standard.code}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {standard.category}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {standard.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {standard.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Authority:</span>
                    <span className="font-medium">{standard.authority}</span>
                  </div>
                  {standard.effectiveDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Effective:</span>
                      <span className="font-medium">
                        {new Date(standard.effectiveDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {standard.url && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(standard.url!, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Standard
                      </Button>
                    </div>
                  )}
                </div>

                {standard.tags.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-1">
                      {standard.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredStandards.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No standards found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filter selection
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
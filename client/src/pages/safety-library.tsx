import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdmin } from "@/App";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Crown, Unlock, Search, ExternalLink, Filter, Shield } from "lucide-react";

export default function SafetyLibrary() {
  const { isAdminMode } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  // Check if user has access to Safety Library
  const { data: subscription } = useQuery({
    queryKey: ['/api/user/subscription']
  });

  // Get safety library data
  const { data: safetyLibrary = [] } = useQuery({
    queryKey: ['/api/safety-library']
  });

  const hasAccess = isAdminMode || adminUnlocked || 
    (subscription as any)?.plan === "pro" || 
    (subscription as any)?.plan === "enterprise" ||
    (subscription as any)?.plan === "Pro Plan";

  if (!hasAccess) {
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

        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Professional Feature</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Safety Library access is available with Professional and Enterprise subscriptions
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

  // Filter data based on search and category
  const safetyData = Array.isArray(safetyLibrary) ? safetyLibrary : [];
  const filteredLibrary = safetyData.filter((item: any) => {
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(safetyData.map((item: any) => item.category))).filter(cat => cat && cat.trim() !== '');

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
        
        {adminUnlocked && (
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
            Admin Mode Active
          </Badge>
        )}
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search safety codes, standards, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category, index) => (
                    <SelectItem key={`${category}-${index}`} value={category || 'unknown'}>
                      {category || 'Unknown Category'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredLibrary.length} of {safetyData.length} safety standards
            </span>
            {(searchTerm || selectedCategory) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="text-primary hover:text-primary/80"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Standards Grid */}
      <div className="grid gap-4">
        {filteredLibrary.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLibrary.map((item: any) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Authority:</span>
                        {item.authority}
                      </span>
                      {item.effectiveDate && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Effective:</span>
                          {new Date(item.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {item.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
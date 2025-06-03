import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  ExternalLink, 
  Book, 
  Filter,
  Calendar,
  Building,
  AlertCircle,
  Download
} from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Electrical",
  "Height Safety", 
  "General Safety",
  "Confined Spaces",
  "Management Systems",
  "Plant & Equipment",
  "Hazardous Materials"
];

export default function SafetyLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

  const { data: safetyLibrary, isLoading } = useQuery({
    queryKey: ["/api/safety-library", { search: searchQuery, category: selectedCategory !== "All Categories" ? selectedCategory : undefined }],
  });

  const filteredItems = safetyLibrary || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Safety Code Library</h2>
          <p className="text-gray-600">Access Australian safety codes, standards, and regulations</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
          className="border-primary text-primary hover:bg-primary/10"
        >
          <Filter className="mr-2 h-4 w-4" />
          Advanced Search
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Basic Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search safety codes, regulations, standards..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Search Options */}
            {isAdvancedSearch && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Authority</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standards-australia">Standards Australia</SelectItem>
                        <SelectItem value="safe-work-australia">Safe Work Australia</SelectItem>
                        <SelectItem value="state-government">State Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Effective date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-year">Last 12 months</SelectItem>
                        <SelectItem value="last-3-years">Last 3 years</SelectItem>
                        <SelectItem value="last-5-years">Last 5 years</SelectItem>
                        <SelectItem value="all">All dates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Australian Standard</SelectItem>
                        <SelectItem value="code-of-practice">Code of Practice</SelectItem>
                        <SelectItem value="regulation">Regulation</SelectItem>
                        <SelectItem value="guidance">Guidance Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
          </p>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>

        {/* Results List */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  No safety codes match your search criteria. Try adjusting your search terms or filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Book className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-gray-800">{item.code}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      
                      <h4 className="text-base font-medium text-gray-700 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {item.authority}
                        </div>
                        {item.effectiveDate && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Effective: {new Date(item.effectiveDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 4).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {item.url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-primary border-primary hover:bg-primary/10"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                        Add to SWMS
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Australian Standards</p>
                <p className="text-xs text-gray-500">Browse all AS/NZS standards</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Safe Work Australia</p>
                <p className="text-xs text-gray-500">Codes of practice and guidance</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Industry Specific</p>
                <p className="text-xs text-gray-500">Trade-specific requirements</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

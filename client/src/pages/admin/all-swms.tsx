import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search, Download, Eye, Calendar, User, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AllSwms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const { toast } = useToast();

  const { data: allSwms, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/all-swms'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Use only real SWMS data from database
  const swmsData = Array.isArray(allSwms) ? allSwms : [];

  const filteredData = swmsData.filter((swms: any) => {
    if (!swms) return false;
    const title = swms.title || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (id: number) => {
    console.log(`Editing SWMS ${id}`);
    toast({
      title: "Edit SWMS",
      description: "SWMS editing functionality coming soon",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/admin/swms/${id}`);
      toast({
        title: "Success",
        description: "SWMS document deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete SWMS document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (id: number) => {
    console.log(`Downloading SWMS ${id}`);
    toast({
      title: "Download",
      description: "SWMS download functionality coming soon",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All SWMS Documents</h1>
          <p className="text-gray-600">Manage and monitor all SWMS documents in the system</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredData.length} Total Documents
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, user, company, or trade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
          >
            All
          </Button>
          <Button
            variant={selectedType === "general" ? "default" : "outline"}
            onClick={() => setSelectedType("general")}
          >
            General
          </Button>
          <Button
            variant={selectedType === "ai" ? "default" : "outline"}
            onClick={() => setSelectedType("ai")}
          >
            AI Generated
          </Button>
        </div>
      </div>

      {/* SWMS Documents Grid */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SWMS Documents Found</h3>
            <p className="text-gray-600">
              {searchTerm ? "No documents match your search criteria." : "No SWMS documents have been created yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((swms: any) => (
            <Card key={swms.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {swms.title || "Untitled SWMS"}
                      </h3>
                      <Badge variant="outline">
                        {swms.type || "General"}
                      </Badge>
                      <Badge 
                        className={
                          swms.status === "active" ? "bg-green-100 text-green-800" :
                          swms.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {swms.status || "Active"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{swms.user || "Unknown User"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{swms.createdAt ? new Date(swms.createdAt).toLocaleDateString() : "No Date"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{swms.trade || "No Trade"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{swms.documentSize || "0 KB"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(swms.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(swms.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(swms.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
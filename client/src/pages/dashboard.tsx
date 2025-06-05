import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/App";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { 
  FileText, 
  Shield, 
  Copy, 
  Bot, 
  Search,
  ExternalLink,
  MoreVertical,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/dashboard/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: safetyLibrary } = useQuery({
    queryKey: ["/api/safety-library"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardData || {
    activeSwms: 0,
    totalSwms: 0,
    complianceScore: 0,
    templatesUsed: 0,
    aiSuggestions: 0,
    recentDocuments: []
  };

  const topSafetyCodes = (Array.isArray(safetyLibrary) ? safetyLibrary : safetyLibrary?.documents || []).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Manage your Safe Work Method Statements and safety compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft SWMS</p>
                <p className="text-2xl font-bold text-gray-800">3</p>
                <p className="text-xs text-gray-500 mt-1">Save and complete later</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed SWMS</p>
                <p className="text-2xl font-bold text-gray-800">12</p>
                <p className="text-xs text-gray-500 mt-1">Project-specific documentation</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SWMS Builder Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New SWMS</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-primary border-primary/20">
                Quick Start
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Building Your SWMS</h3>
              <p className="text-gray-600 mb-6">
                Create comprehensive safety documentation tailored to your trade and project requirements.
              </p>
              <Link href="/swms-builder">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  Create SWMS
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent SWMS Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent SWMS Documents</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentDocuments.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No SWMS documents created yet</p>
                <p className="text-gray-400 text-xs mt-1">Create your first SWMS to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentDocuments.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          Modified {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`status-${doc.status}`}
                      >
                        {doc.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

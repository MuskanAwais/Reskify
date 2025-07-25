import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/App";
import { Link } from "wouter";
import { translate } from "@/lib/language-direct";
import { 
  FileText, 
  Shield, 
  Copy, 
  Coins, 
  Search,
  ExternalLink,
  MoreVertical,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();

  const { data: dashboardData, isLoading, error } = useQuery<{
    draftSwms: number;
    completedSwms: number;
    totalSwms: number;
    credits: number;
    subscription: string;
    recentSwms: any[];
    recentDocuments: any[];
  }>({
    queryKey: [`/api/dashboard/${user?.id || 999}`],
    enabled: true, // Always enabled, use demo user ID
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Debug logging
  console.log('Dashboard data:', dashboardData);
  console.log('Dashboard error:', error);
  console.log('Dashboard loading:', isLoading);



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
    draftSwms: 0,
    completedSwms: 0,
    totalSwms: 0,
    recentDocuments: []
  };



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{translate('nav.dashboard')}</h2>
        <p className="text-gray-600">{translate('manageSafetyCompliance')}</p>
      </div>

      {/* Stats Cards - Unified order: Create New SWMS & Credits first */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/swms-builder">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Create New SWMS</p>
                  <p className="text-2xl font-bold text-gray-800">+</p>
                  <p className="text-xs text-gray-500 mt-1">Start building documentation</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Credits</p>
                <p className="text-2xl font-bold text-gray-800">{dashboardData?.credits || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Available SWMS generations</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Coins className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/my-swms?filter=draft">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-orange-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{translate('draftSwms')}</p>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData?.draftSwms || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{translate('saveCompleteLater')}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-orange-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/my-swms?filter=completed">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-green-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{translate('completedSwms')}</p>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData?.completedSwms || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{translate('projectSpecificDocumentation')}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-green-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent SWMS Documents - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{translate('recentSwmsDocuments')}</CardTitle>
              <Link href="/my-swms">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  {translate('viewAll')}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {((stats as any).recentDocuments || []).length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No SWMS documents created yet</p>
                <p className="text-gray-400 text-xs mt-1">Create your first SWMS to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {((stats as any).recentDocuments || []).map((doc: any, index: number) => (
                  <Link key={index} href={doc.status === 'draft' ? `/swms-builder?edit=${doc.id}` : `/my-swms`}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, AlertTriangle, Eye, Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SecurityMonitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: securityData, isLoading } = useQuery({
    queryKey: ['/api/admin/security-monitoring'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: contentLogs } = useQuery({
    queryKey: ['/api/admin/content-logs'],
    refetchInterval: 60000, // Refresh every minute
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest("POST", `/api/admin/security-alerts/${alertId}/resolve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security-monitoring'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve security alert.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const data = (securityData as any) || {
    totalLogs: 0,
    logsLast24h: 0,
    highRiskContent: 0,
    unresolvedAlerts: 0,
    riskDistribution: { low: 0, medium: 0, high: 0 },
    alerts: [],
    recentActivity: []
  };

  const logs = (contentLogs as any) || [];

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = log.inputContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.outputContent?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.contentType === filterType;
    const matchesRisk = riskFilter === "all" || log.riskLevel === riskFilter;
    return matchesSearch && matchesType && matchesRisk;
  });

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-red-100 text-red-800",
      critical: "bg-red-600 text-white"
    };
    return <Badge className={colors[severity as keyof typeof colors] || colors.low}>{severity}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[risk as keyof typeof colors] || colors.low}>{risk}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
          <p className="text-gray-600">Monitor content generation and security alerts</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {data.unresolvedAlerts} Unresolved Alerts
        </Badge>
      </div>

      {/* Security Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Content Logs</p>
                <p className="text-2xl font-bold">{data.totalLogs}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 24 Hours</p>
                <p className="text-2xl font-bold">{data.logsLast24h}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk Content</p>
                <p className="text-2xl font-bold">{data.highRiskContent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{data.unresolvedAlerts}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.riskDistribution.low}</p>
              <p className="text-sm text-green-700">Low Risk</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{data.riskDistribution.medium}</p>
              <p className="text-sm text-yellow-700">Medium Risk</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{data.riskDistribution.high}</p>
              <p className="text-sm text-red-700">High Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.slice(0, 5).map((alert: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{alert.alertType.replace(/_/g, ' ').toUpperCase()}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      onClick={() => resolveAlertMutation.mutate(index)}
                      disabled={resolveAlertMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Generation Logs</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="swms_generation">SWMS Generation</option>
                <option value="ai_query">AI Query</option>
                <option value="form_submission">Form Submission</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Logs Found</h3>
              <p className="text-gray-600">No content generation activity matches your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.slice(0, 20).map((log: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{log.contentType?.replace(/_/g, ' ')}</Badge>
                      {getRiskBadge(log.riskLevel)}
                      <span className="text-sm text-gray-500">User {log.userId}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Input:</p>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs">
                        {log.inputContent?.substring(0, 150)}
                        {log.inputContent?.length > 150 && '...'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Output:</p>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs">
                        {log.outputContent?.substring(0, 150)}
                        {log.outputContent?.length > 150 && '...'}
                      </p>
                    </div>
                  </div>
                  
                  {log.violations && log.violations.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded">
                      <p className="text-sm font-medium text-red-800">Violations:</p>
                      <p className="text-xs text-red-600">{log.violations.join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
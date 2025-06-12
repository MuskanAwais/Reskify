import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity, Server, Database, Wifi, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function SystemHealth() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['/api/admin/system-health'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const mockHealthData = {
    uptime: "99.98%",
    responseTime: "245ms",
    cpuUsage: 23.5,
    memoryUsage: 67.2,
    diskUsage: 45.8,
    activeConnections: 342,
    services: [
      { name: "Web Server", status: "healthy", uptime: "99.99%", lastCheck: "2 minutes ago" },
      { name: "Database", status: "healthy", uptime: "99.97%", lastCheck: "1 minute ago" },
      { name: "API Gateway", status: "healthy", uptime: "99.98%", lastCheck: "3 minutes ago" },
      { name: "File Storage", status: "warning", uptime: "98.45%", lastCheck: "5 minutes ago" },
      { name: "Email Service", status: "healthy", uptime: "99.89%", lastCheck: "2 minutes ago" }
    ],
    recentIssues: [
      { 
        severity: "warning", 
        message: "High memory usage detected on server-2", 
        time: "15 minutes ago",
        resolved: false 
      },
      { 
        severity: "info", 
        message: "Scheduled maintenance completed successfully", 
        time: "2 hours ago",
        resolved: true 
      },
      { 
        severity: "error", 
        message: "Temporary database connection timeout", 
        time: "6 hours ago",
        resolved: true 
      }
    ]
  };

  // Use only real data from API
  const data = healthData || {
    uptime: "Online",
    avgResponseTime: "Real-time",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    totalRequests: 0,
    errorRate: 0,
    databaseSize: "0MB",
    networkTraffic: "0GB"
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-600">Real-time monitoring and system status</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{data.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{data.responseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold">{data.activeConnections}</p>
              </div>
              <Wifi className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.services.filter(s => s.status === 'healthy').length}/{data.services.length}
                </p>
              </div>
              <Server className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm">{data.cpuUsage}%</span>
              </div>
              <Progress value={data.cpuUsage} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm">{data.memoryUsage}%</span>
              </div>
              <Progress value={data.memoryUsage} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm">{data.diskUsage}%</span>
              </div>
              <Progress value={data.diskUsage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-gray-500">
                        Uptime: {service.uptime} • Last check: {service.lastCheck}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(issue.severity)}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{issue.message}</p>
                    {issue.resolved && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Resolved</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{issue.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
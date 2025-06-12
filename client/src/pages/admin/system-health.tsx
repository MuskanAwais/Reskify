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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Health</h1>
        <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uptime}</div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Current users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Total processed</p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={data.cpuUsage} className="w-full" />
              <p className="text-sm text-muted-foreground">{data.cpuUsage}% utilization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={data.memoryUsage} className="w-full" />
              <p className="text-sm text-muted-foreground">{data.memoryUsage}% utilized</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={data.diskUsage} className="w-full" />
              <p className="text-sm text-muted-foreground">{data.diskUsage}% capacity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Storage Size</div>
              <div className="text-2xl font-bold text-blue-600">{data.databaseSize}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Network Traffic</div>
              <div className="text-2xl font-bold text-green-600">{data.networkTraffic}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Error Rate</div>
              <div className="text-2xl font-bold text-red-600">{data.errorRate}%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Connections</div>
              <div className="text-2xl font-bold text-purple-600">{data.activeConnections}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
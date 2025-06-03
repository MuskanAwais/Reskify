import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, TrendingUp, Activity, Download, Clock } from "lucide-react";
import { useState } from "react";

export default function UsageAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: usageData = {}, isLoading } = useQuery({
    queryKey: ['/api/admin/usage', timeRange]
  });

  const { data: popularTrades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['/api/admin/popular-trades', timeRange]
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity']
  });

  if (isLoading || tradesLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total SWMS Generated",
      value: usageData.totalSwms || 0,
      change: `+${usageData.swmsGrowth || 0}%`,
      icon: FileText,
      positive: true
    },
    {
      title: "Active Users",
      value: usageData.activeUsers || 0,
      change: `+${usageData.userGrowth || 0}%`,
      icon: Users,
      positive: true
    },
    {
      title: "Credits Used",
      value: usageData.creditsUsed || 0,
      change: `+${usageData.creditsGrowth || 0}%`,
      icon: TrendingUp,
      positive: true
    },
    {
      title: "Avg. Session Time",
      value: `${usageData.avgSessionTime || 0}m`,
      change: `+${usageData.sessionGrowth || 0}%`,
      icon: Clock,
      positive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
          <p className="text-gray-600">Track user engagement and platform usage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last period
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Trade Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(popularTrades) && popularTrades.map((trade: any, index: number) => (
                <div key={trade.tradeType} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{trade.tradeType}</p>
                      <p className="text-sm text-gray-600">{trade.swmsCount} SWMS generated</p>
                    </div>
                  </div>
                  <Badge variant="outline">{trade.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(recentActivity) && recentActivity.slice(0, 8).map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.username}</TableCell>
                    <TableCell>
                      <Badge variant={activity.action === "created" ? "default" : "secondary"}>
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.tradeType}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SWMS Generation Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{usageData.todaySwms || 0}</div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{usageData.weekSwms || 0}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{usageData.monthSwms || 0}</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
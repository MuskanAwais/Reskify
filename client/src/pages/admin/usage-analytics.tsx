import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, Brain, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function UsageAnalytics() {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ['/api/admin/usage-analytics'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const mockUsageData = {
    totalSwmsGenerated: 1847,
    generalSwmsCount: 1352,
    aiSwmsCount: 495,
    weeklyGrowth: 23.5,
    dailyData: [
      { date: 'Mon', general: 45, ai: 12, total: 57 },
      { date: 'Tue', general: 52, ai: 18, total: 70 },
      { date: 'Wed', general: 38, ai: 15, total: 53 },
      { date: 'Thu', general: 67, ai: 22, total: 89 },
      { date: 'Fri', general: 71, ai: 25, total: 96 },
      { date: 'Sat', general: 28, ai: 8, total: 36 },
      { date: 'Sun', general: 31, ai: 9, total: 40 }
    ],
    tradeUsage: [
      { trade: 'Electrical', count: 287, percentage: 15.5 },
      { trade: 'Plumbing', count: 234, percentage: 12.7 },
      { trade: 'Carpentry', count: 198, percentage: 10.7 },
      { trade: 'Roofing', count: 176, percentage: 9.5 },
      { trade: 'Concrete', count: 165, percentage: 8.9 },
      { trade: 'Others', count: 787, percentage: 42.7 }
    ],
    featureUsage: [
      { name: 'General SWMS', value: 73.2, color: '#3b82f6' },
      { name: 'AI SWMS', value: 26.8, color: '#10b981' }
    ]
  };

  const data = usageData || mockUsageData;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
        <p className="text-gray-600">SWMS generation and feature usage insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total SWMS</p>
                <p className="text-2xl font-bold">{data?.totalSwmsGenerated?.toLocaleString() || '0'}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">General SWMS</p>
                <p className="text-2xl font-bold">{data?.generalSwmsCount?.toLocaleString() || '0'}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI SWMS</p>
                <p className="text-2xl font-bold">{data?.aiSwmsCount?.toLocaleString() || '0'}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Growth</p>
                <p className="text-2xl font-bold">+{data?.weeklyGrowth || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily SWMS Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="general" fill="#3b82f6" name="General SWMS" />
                <Bar dataKey="ai" fill="#10b981" name="AI SWMS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.featureUsage || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {(data.featureUsage || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total SWMS" />
                <Line type="monotone" dataKey="ai" stroke="#10b981" strokeWidth={2} name="AI SWMS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.tradeUsage || []).map((trade: any) => (
                <div key={trade.trade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{trade.trade}</div>
                    <div className="text-sm text-gray-500">{trade.count} documents</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${trade.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{trade.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Day</th>
                  <th className="text-left p-3">General SWMS</th>
                  <th className="text-left p-3">AI SWMS</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">AI Usage %</th>
                </tr>
              </thead>
              <tbody>
                {(data.dailyData || []).map((day: any) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{day.date}</td>
                    <td className="p-3">{day.general}</td>
                    <td className="p-3">{day.ai}</td>
                    <td className="p-3 font-medium">{day.total}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {((day.ai / day.total) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
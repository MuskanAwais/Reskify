import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { Loader2, FileText, Shield, AlertTriangle, TrendingUp, MapPin, Wrench, HardHat, Clock, CheckCircle2, Calendar, Activity } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

interface AnalyticsData {
  totalDocuments: number;
  activeDocuments: number;
  draftDocuments: number;
  riskLevels: Array<{
    level: string;
    count: number;
    color: string;
  }>;
  activityPatterns: {
    daily: Array<{ day: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  topHazards: Array<{ hazard: string; count: number }>;
  hrcwFrequency: Array<{ category: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  topEquipment: Array<{ equipment: string; count: number }>;
  topPPE: Array<{ ppe: string; count: number }>;
  averageCompleteness: number;
  averageUpdateDays: number;
  recentActivity: Array<{
    id: number;
    eventType: string;
    documentTitle: string;
    timestamp: string;
  }>;
}

export default function ComprehensiveAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
          <p>Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Document Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive construction safety insights and patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">SWMS created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeDocuments}</div>
            <p className="text-xs text-muted-foreground">Completed SWMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Documents</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.draftDocuments}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completeness Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageCompleteness}%</div>
            <p className="text-xs text-muted-foreground">Average document quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Patterns Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Activity Patterns
            </CardTitle>
            <CardDescription>When SWMS documents are created most often</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.activityPatterns.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Creation Trends
            </CardTitle>
            <CardDescription>Document creation patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.activityPatterns.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hazards and HRCW Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Hazards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Most Common Hazards
            </CardTitle>
            <CardDescription>Top hazards identified across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topHazards.slice(0, 8).map((hazard, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">{hazard.hazard}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(hazard.count / Math.max(...analytics.topHazards.map(h => h.count))) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{hazard.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High-Risk Construction Work Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              High-Risk Work Categories
            </CardTitle>
            <CardDescription>HRCW categories most frequently identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.hrcwFrequency.slice(0, 8).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(category.count / Math.max(...analytics.hrcwFrequency.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location and Equipment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Analysis
            </CardTitle>
            <CardDescription>Most common work locations and sites</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topLocations} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment Usage Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Equipment Usage Patterns
            </CardTitle>
            <CardDescription>Most frequently specified plant & equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topEquipment.slice(0, 8).map((equipment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">{equipment.equipment}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(equipment.count / Math.max(...analytics.topEquipment.map(e => e.count))) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{equipment.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PPE and Quality Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PPE Requirements Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              PPE Requirements Analysis
            </CardTitle>
            <CardDescription>Most common PPE combinations and requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPPE.slice(0, 8).map((ppe, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">{ppe.ppe}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(ppe.count / Math.max(...analytics.topPPE.map(p => p.count))) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{ppe.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review & Update Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Document Quality Metrics
            </CardTitle>
            <CardDescription>Quality and update patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.averageCompleteness}%</div>
                <div className="text-sm text-green-700">Average Completeness</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.averageUpdateDays}</div>
                <div className="text-sm text-blue-700">Days to Complete</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-3">Risk Level Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.riskLevels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, count }) => `${level}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.riskLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest SWMS document activity and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.documentTitle}</p>
                  <p className="text-xs text-gray-500">{activity.eventType}</p>
                </div>
                <div className="text-xs text-gray-400">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
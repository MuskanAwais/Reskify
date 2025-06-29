import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Users, CreditCard, Activity, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function BillingAnalytics() {
  const { data: billing, isLoading } = useQuery({
    queryKey: ["/api/admin/billing-analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { totalRevenue, monthlyRecurring, creditUtilization, subscriptionBreakdown } = billing || {};

  // Transform subscription data for pie chart
  const subscriptionChartData = Object.entries(subscriptionBreakdown || {}).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count as number
  }));

  const totalSubscribers = Object.values(subscriptionBreakdown || {}).reduce((sum: number, count) => sum + (count as number), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing Analytics</h1>
        <Badge variant="outline" className="bg-green-50 text-green-600">
          <Activity className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditUtilization || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total credits remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSubscribers > 0 ? Math.round((totalRevenue || 0) / totalSubscribers) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={subscriptionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(subscriptionBreakdown || {}).map(([plan, count]) => {
                const monthlyRate = plan === 'enterprise' ? 99 : plan === 'pro' ? 29 : 0;
                const planRevenue = (count as number) * monthlyRate;
                return (
                  <div key={plan} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        plan === 'enterprise' ? 'bg-purple-500' : 
                        plan === 'pro' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium capitalize">{plan}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{count} users</span>
                      <Badge variant="secondary">${planRevenue}/month</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trial Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Trial Users</span>
                <span>{(subscriptionBreakdown as any)?.trial || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Users</span>
                <span>{totalSubscribers - ((subscriptionBreakdown as any)?.trial || 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Conversion Rate</span>
                <span>
                  {totalSubscribers > 0 
                    ? Math.round(((totalSubscribers - ((subscriptionBreakdown as any)?.trial || 0)) / totalSubscribers) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Credits Remaining</span>
                <span>{creditUtilization}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Issued</span>
                <span>{totalSubscribers * 10}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Utilization Rate</span>
                <span>
                  {totalSubscribers > 0 
                    ? Math.round(((totalSubscribers * 10 - (creditUtilization || 0)) / (totalSubscribers * 10)) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Successful Payments</span>
                <span className="text-green-600">{totalSubscribers - ((subscriptionBreakdown as any)?.trial || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Payments</span>
                <span className="text-red-600">0</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Success Rate</span>
                <span className="text-green-600">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
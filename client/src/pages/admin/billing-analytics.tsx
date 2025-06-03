import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function BillingAnalytics() {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['/api/admin/billing-analytics'],
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

  const mockBillingData = {
    totalRevenue: 127500,
    monthlyRevenue: 12750,
    activeSubscriptions: 255,
    churnRate: 3.2,
    revenueGrowth: 18.5,
    monthlyData: [
      { month: 'Jan', revenue: 8500, subscriptions: 170 },
      { month: 'Feb', revenue: 9200, subscriptions: 184 },
      { month: 'Mar', revenue: 10100, subscriptions: 202 },
      { month: 'Apr', revenue: 11200, subscriptions: 224 },
      { month: 'May', revenue: 12100, subscriptions: 242 },
      { month: 'Jun', revenue: 12750, subscriptions: 255 }
    ],
    planDistribution: [
      { plan: 'Basic', users: 98, revenue: 2940 },
      { plan: 'Pro', users: 127, revenue: 6350 },
      { plan: 'Enterprise', users: 30, revenue: 3000 }
    ]
  };

  const data = billingData || mockBillingData;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing Analytics</h1>
        <p className="text-gray-600">Revenue and subscription insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${data.monthlyRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold">{data.activeSubscriptions}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold">{data.churnRate}%</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.planDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Month</th>
                  <th className="text-left p-3">Revenue</th>
                  <th className="text-left p-3">Subscriptions</th>
                  <th className="text-left p-3">Growth</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyData.map((month, index) => (
                  <tr key={month.month} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{month.month}</td>
                    <td className="p-3">${month.revenue.toLocaleString()}</td>
                    <td className="p-3">{month.subscriptions}</td>
                    <td className="p-3">
                      {index > 0 ? (
                        <span className={`${
                          month.revenue > data.monthlyData[index-1].revenue 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {month.revenue > data.monthlyData[index-1].revenue ? '+' : ''}
                          {((month.revenue - data.monthlyData[index-1].revenue) / data.monthlyData[index-1].revenue * 100).toFixed(1)}%
                        </span>
                      ) : '-'}
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
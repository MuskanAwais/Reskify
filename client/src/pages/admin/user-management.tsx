import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Crown, Settings } from "lucide-react";

export default function UserManagement() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const mockUsers = [
    { id: 1, username: "John Doe", email: "john@abc-construction.com", company: "ABC Construction", plan: "Pro Plan", status: "active", swmsCount: 23, lastActive: "2 hours ago" },
    { id: 2, username: "Sarah Wilson", email: "sarah@buildtech.com", company: "BuildTech Pty Ltd", plan: "Enterprise Plan", status: "active", swmsCount: 47, lastActive: "1 day ago" },
    { id: 3, username: "Mike Chen", email: "mike@steelworks.com", company: "SteelWorks Industries", plan: "Basic Plan", status: "inactive", swmsCount: 8, lastActive: "1 week ago" },
    { id: 4, username: "Emma Thompson", email: "emma@electricpro.com", company: "ElectricPro Services", plan: "Pro Plan", status: "active", swmsCount: 31, lastActive: "30 minutes ago" }
  ];

  const userData = users || mockUsers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{userData.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{userData.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pro Users</p>
                <p className="text-2xl font-bold">{userData.filter(u => u.plan.includes('Pro')).length}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total SWMS</p>
                <p className="text-2xl font-bold">{userData.reduce((sum, u) => sum + u.swmsCount, 0)}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Company</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">SWMS Count</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last Active</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{user.company}</td>
                    <td className="p-3">
                      <Badge variant={user.plan.includes('Enterprise') ? 'default' : user.plan.includes('Pro') ? 'secondary' : 'outline'}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{user.swmsCount}</td>
                    <td className="p-3">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-600">{user.lastActive}</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
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
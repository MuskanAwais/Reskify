import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, Download, Upload, Trash2, RefreshCw, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DataManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: databaseStats, isLoading } = useQuery({
    queryKey: ['/api/admin/database-stats'],
  });

  const backupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/backup");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Backup Created",
        description: "Database backup has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database-stats'] });
    },
    onError: () => {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const mockStats = {
    totalRecords: 15847,
    databaseSize: "2.4 GB",
    lastBackup: "2024-06-03T10:30:00Z",
    tables: [
      { name: "swms_documents", records: 3421, size: "1.2 GB" },
      { name: "users", records: 1247, size: "45 MB" },
      { name: "safety_library", records: 156, size: "12 MB" },
      { name: "user_sessions", records: 8923, size: "234 MB" },
      { name: "activity_logs", records: 2100, size: "890 MB" }
    ],
    backups: [
      { id: 1, date: "2024-06-03T10:30:00Z", size: "2.4 GB", status: "completed" },
      { id: 2, date: "2024-06-02T10:30:00Z", size: "2.3 GB", status: "completed" },
      { id: 3, date: "2024-06-01T10:30:00Z", size: "2.2 GB", status: "completed" }
    ]
  };

  const data = databaseStats || mockStats;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600">Database administration and backup management</p>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{data.totalRecords.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Database Size</p>
                <p className="text-2xl font-bold">{data.databaseSize}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-sm font-semibold">
                  {new Date(data.lastBackup).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(data.lastBackup).toLocaleTimeString()}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Table Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.tables.map((table, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-sm text-gray-600">{table.records.toLocaleString()} records</p>
                  </div>
                  <Badge variant="outline">{table.size}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backup Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Backup Management</CardTitle>
              <Button
                onClick={() => backupMutation.mutate()}
                disabled={backupMutation.isPending}
                size="sm"
              >
                {backupMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Create Backup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(backup.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(backup.date).toLocaleTimeString()} • {backup.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {backup.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="w-6 h-6" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Upload className="w-6 h-6" />
              <span>Import Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="w-6 h-6" />
              <span>Cleanup Old Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
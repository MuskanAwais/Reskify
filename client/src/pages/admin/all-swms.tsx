import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search, Download, Eye, Calendar, User } from "lucide-react";
import { useState } from "react";

export default function AllSwms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const { data: allSwms, isLoading } = useQuery({
    queryKey: ['/api/admin/all-swms'],
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

  const mockSwmsData = [
    {
      id: 1,
      title: "Electrical Installation - Office Building",
      type: "General SWMS",
      user: "John Doe",
      company: "ABC Construction",
      trade: "Electrical",
      createdAt: "2024-06-01",
      status: "active",
      riskLevel: "Medium",
      documentSize: "234 KB"
    },
    {
      id: 2,
      title: "AI Generated: Plumbing Works - Residential Complex",
      type: "AI SWMS",
      user: "Sarah Wilson",
      company: "BuildTech Pty Ltd",
      trade: "Plumbing",
      createdAt: "2024-06-02",
      status: "active",
      riskLevel: "High",
      documentSize: "187 KB"
    },
    {
      id: 3,
      title: "Roofing Installation - Commercial Property",
      type: "General SWMS",
      user: "Mike Chen",
      company: "SteelWorks Industries",
      trade: "Roofing",
      createdAt: "2024-06-01",
      status: "archived",
      riskLevel: "High",
      documentSize: "298 KB"
    },
    {
      id: 4,
      title: "AI Generated: Concrete Pouring - Warehouse Foundation",
      type: "AI SWMS",
      user: "Emma Thompson",
      company: "ElectricPro Services",
      trade: "Concrete",
      createdAt: "2024-06-03",
      status: "active",
      riskLevel: "Medium",
      documentSize: "156 KB"
    },
    {
      id: 5,
      title: "Carpentry Works - Custom Kitchen Installation",
      type: "General SWMS",
      user: "David Brown",
      company: "WoodCraft Solutions",
      trade: "Carpentry",
      createdAt: "2024-05-28",
      status: "active",
      riskLevel: "Low",
      documentSize: "145 KB"
    }
  ];

  const swmsData = Array.isArray(allSwms) ? allSwms : mockSwmsData;

  const filteredData = swmsData.filter((swms: any) => {
    const matchesSearch = swms.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.trade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || 
                       (selectedType === "general" && swms.type === "General SWMS") ||
                       (selectedType === "ai" && swms.type === "AI SWMS");
    
    return matchesSearch && matchesType;
  });

  const totalSwms = swmsData.length;
  const generalCount = swmsData.filter((s: any) => s.type === "General SWMS").length;
  const aiCount = swmsData.filter((s: any) => s.type === "AI SWMS").length;
  const activeCount = swmsData.filter((s: any) => s.status === "active").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All SWMS Documents</h1>
          <p className="text-gray-600">Complete overview of all generated SWMS documents</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{totalSwms}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">General SWMS</p>
                <p className="text-2xl font-bold">{generalCount}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI SWMS</p>
                <p className="text-2xl font-bold">{aiCount}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents, users, companies, or trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("all")}
          >
            All
          </Button>
          <Button
            variant={selectedType === "general" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("general")}
          >
            General
          </Button>
          <Button
            variant={selectedType === "ai" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("ai")}
          >
            AI Generated
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All SWMS Documents ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Document</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Trade</th>
                  <th className="text-left p-3">Risk Level</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((swms) => (
                  <tr key={swms.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{swms.title}</div>
                        <div className="text-gray-500 text-xs flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {swms.company}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={swms.type === 'AI SWMS' ? 'default' : 'secondary'}>
                        {swms.type}
                      </Badge>
                    </td>
                    <td className="p-3">{swms.user}</td>
                    <td className="p-3">
                      <Badge variant="outline">{swms.trade}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={
                        swms.riskLevel === 'High' ? 'destructive' : 
                        swms.riskLevel === 'Medium' ? 'default' : 'secondary'
                      }>
                        {swms.riskLevel}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-1 h-3 w-3" />
                        {swms.createdAt}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={swms.status === 'active' ? 'default' : 'outline'}>
                        {swms.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Download, Trash2, FileText, Filter } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SwmsDocument {
  id: number;
  title: string;
  projectAddress: string;
  tradeType: string;
  jobName: string;
  username: string;
  userEmail: string;
  companyName?: string;
  createdAt: string;
  creditsUsed: number;
  status: string;
}

export default function AllSwms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrade, setFilterTrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSwms, setSelectedSwms] = useState<SwmsDocument | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: swmsDocuments = [], isLoading } = useQuery({
    queryKey: ['/api/admin/all-swms']
  });

  const { data: tradeTypes = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['/api/admin/trade-types']
  });

  const deleteSwmsMutation = useMutation({
    mutationFn: async (swmsId: number) => {
      return apiRequest("DELETE", `/api/admin/swms/${swmsId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-swms'] });
      toast({
        title: "SWMS Deleted",
        description: "The SWMS document has been successfully deleted."
      });
    }
  });

  const filteredSwms = Array.isArray(swmsDocuments) ? swmsDocuments.filter((swms: SwmsDocument) => {
    const matchesSearch = swms.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.projectAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (swms.companyName && swms.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTrade = filterTrade === "all" || swms.tradeType === filterTrade;
    const matchesStatus = filterStatus === "all" || swms.status === filterStatus;
    
    return matchesSearch && matchesTrade && matchesStatus;
  }) : [];

  const handleViewSwms = (swms: SwmsDocument) => {
    setSelectedSwms(swms);
    setIsViewDialogOpen(true);
  };

  const handleDownloadSwms = async (swmsId: number) => {
    try {
      const response = await apiRequest("GET", `/api/swms/${swmsId}/download`);
      // Handle download logic here
      toast({
        title: "Download Started",
        description: "Your SWMS document is being downloaded."
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the SWMS document.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || tradesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All SWMS Documents</h1>
          <p className="text-gray-600">View and manage all SWMS documents in the system</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>SWMS Documents ({filteredSwms.length})</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search SWMS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={filterTrade} onValueChange={setFilterTrade}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trade Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {Array.isArray(tradeTypes) && tradeTypes.map((trade: string) => (
                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSwms.map((swms: SwmsDocument) => (
                <TableRow key={swms.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{swms.title}</div>
                      <div className="text-sm text-gray-500">{swms.jobName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{swms.projectAddress}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{swms.tradeType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{swms.username}</div>
                      <div className="text-sm text-gray-500">{swms.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{swms.companyName || "N/A"}</TableCell>
                  <TableCell>{new Date(swms.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{swms.creditsUsed}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSwms(swms)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadSwms(swms.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSwmsMutation.mutate(swms.id)}
                        disabled={deleteSwmsMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SWMS Details</DialogTitle>
          </DialogHeader>
          {selectedSwms && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="text-sm">{selectedSwms.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Trade Type</label>
                  <p className="text-sm">{selectedSwms.tradeType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Job Name</label>
                  <p className="text-sm">{selectedSwms.jobName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Credits Used</label>
                  <p className="text-sm">{selectedSwms.creditsUsed}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Project Address</label>
                  <p className="text-sm">{selectedSwms.projectAddress}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-sm">{selectedSwms.username} ({selectedSwms.userEmail})</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
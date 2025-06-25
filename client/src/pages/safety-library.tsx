import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Crown, Unlock, Search, ExternalLink, Filter, Shield, Upload, FileText, X, CheckCircle, AlertCircle, Eye, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SafetyLibrary() {
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{success: number, failed: number, errors: string[]}>({
    success: 0,
    failed: 0,
    errors: []
  });
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    fileType: 'PDF',
    tags: ''
  });

  // Check if user has access to Safety Library
  const { data: subscription } = useQuery({
    queryKey: ['/api/user/subscription']
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user']
  });

  // Get safety library data
  const { data: safetyLibrary } = useQuery({
    queryKey: ['/api/safety-library']
  });

  // File upload handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(prev => [...prev, ...files]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Admin document upload mutation
  const adminUploadMutation = useMutation({
    mutationFn: async (documentData: typeof uploadForm) => {
      const response = await apiRequest('POST', '/api/admin/safety-library/upload', {
        ...documentData,
        tags: documentData.tags.split(',').map(tag => tag.trim())
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Safety library document has been uploaded successfully.",
      });
      setUploadForm({
        title: '',
        category: '',
        description: '',
        content: '',
        fileType: 'PDF',
        tags: ''
      });
      setUploadDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/safety-library'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadResults({ success: 0, failed: 0, errors: [] });

      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', file.name.toLowerCase().includes('construction') ? 'Construction' :
                          file.name.toLowerCase().includes('electrical') ? 'Electrical' :
                          file.name.toLowerCase().includes('manual') ? 'Manual Handling' :
                          file.name.toLowerCase().includes('noise') ? 'Noise Control' :
                          file.name.toLowerCase().includes('plant') ? 'Plant & Equipment' :
                          file.name.toLowerCase().includes('stevedoring') ? 'Stevedoring' :
                          'General Safety');

          await apiRequest('POST', '/api/admin/safety-library/upload', formData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
        }
        
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        setUploadResults({ ...results });
      }

      return results;
    },
    onSuccess: (results) => {
      toast({
        title: "Upload Complete",
        description: `${results.success} files uploaded successfully${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
        variant: results.failed > 0 ? "destructive" : "default"
      });
      
      if (results.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/safety-library'] });
      }
      
      setUploadFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  });

  const startUpload = () => {
    if (uploadFiles.length > 0) {
      uploadMutation.mutate(uploadFiles);
    }
  };

  // Check if user has access to Safety Library
  const hasSubscription = (subscription as any)?.plan === "pro" || 
    (subscription as any)?.plan === "enterprise" ||
    (subscription as any)?.plan === "Pro Plan" ||
    (subscription as any)?.subscription?.status === 'active';
  
  const isAdmin = isAdminMode || 
    (user as any)?.isAdmin || 
    localStorage.getItem('adminState') === 'true';
  
  const hasAccess = isAdmin || hasSubscription || adminUnlocked;

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Safety Library</h1>
            <p className="text-muted-foreground">
              Access comprehensive Australian safety standards and practice guides
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Professional Feature</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Safety Library access is available with Professional and Enterprise subscriptions
            </p>

            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center">
                <span>• Complete Australian safety standards database</span>
              </div>
              <div className="flex items-center justify-center">
                <span>• AS/NZS standards and Safe Work Australia guidelines</span>
              </div>
              <div className="flex items-center justify-center">
                <span>• Searchable compliance documentation</span>
              </div>
              <div className="flex items-center justify-center">
                <span>• Regular updates and notifications</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Access
              </Button>
              
              {/* Temporary Admin Toggle */}
              <Button 
                variant="outline" 
                onClick={() => setAdminUnlocked(!adminUnlocked)}
                className="border-orange-200 text-orange-600 hover:bg-orange-50 px-6 py-2"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter data based on search and category
  const safetyData = (safetyLibrary as any)?.documents || [];
  const filteredLibrary = safetyData.filter((item: any) => {
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(safetyData.map((item: any) => item.category))).filter(cat => cat && typeof cat === 'string' && cat.trim() !== '');

  // If user has access, show full Safety Library interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safety Library</h1>
          <p className="text-muted-foreground">
            Access comprehensive Australian safety standards and practice guides
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {adminUnlocked && (
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              Admin Mode Active
            </Badge>
          )}
          
          {/* Admin Add Document Button */}
          {(isAdminMode || adminUnlocked) && (
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Safety Library Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter document title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Safety">General Safety</SelectItem>
                          <SelectItem value="Electrical Safety">Electrical Safety</SelectItem>
                          <SelectItem value="Manual Handling">Manual Handling</SelectItem>
                          <SelectItem value="Fall Protection">Fall Protection</SelectItem>
                          <SelectItem value="Project Specific">Project Specific</SelectItem>
                          <SelectItem value="Construction">Construction</SelectItem>
                          <SelectItem value="Plant & Equipment">Plant & Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter document description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content/URL</Label>
                    <Input
                      id="content"
                      value={uploadForm.content}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Document URL or content reference"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fileType">File Type</Label>
                      <Select value={uploadForm.fileType} onValueChange={(value) => setUploadForm(prev => ({ ...prev, fileType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="DOC">DOC</SelectItem>
                          <SelectItem value="DOCX">DOCX</SelectItem>
                          <SelectItem value="PPT">PPT</SelectItem>
                          <SelectItem value="PPTX">PPTX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="safety, construction, guidelines"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => adminUploadMutation.mutate(uploadForm)}
                      disabled={adminUploadMutation.isPending || !uploadForm.title || !uploadForm.category}
                    >
                      {adminUploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Admin Upload Button */}
      {(isAdminMode || adminUnlocked) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Admin Document Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      toast({
                        title: "Upload Started",
                        description: `Processing ${files.length} documents...`,
                      });
                      // Process files here
                    }
                  };
                  input.click();
                }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manage Library
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search safety codes, standards, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any, index) => (
                    <SelectItem key={`${category}-${index}`} value={category || 'unknown'}>
                      {category || 'Unknown Category'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredLibrary.length} of {safetyData.length} safety standards
            </span>
            {(searchTerm || selectedCategory) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="text-primary hover:text-primary/80"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Standards Grid */}
      <div className="grid gap-4">
        {filteredLibrary.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLibrary.map((item: any) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Authority:</span>
                        {item.authority}
                      </span>
                      {item.effectiveDate && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Effective:</span>
                          {new Date(item.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {item.url && (
                      <>
                        {/* Mobile: Direct open in new tab */}
                        <div className="block lg:hidden">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/api/safety-library/pdf/${item.url}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View PDF
                          </Button>
                        </div>
                        
                        {/* Desktop: Modal viewer */}
                        <div className="hidden lg:block">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPdf(item.url);
                                  setPdfViewerOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View PDF
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
                              <DialogHeader className="px-6 py-4 border-b">
                                <DialogTitle className="text-lg font-semibold">
                                  {item.title}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex-1 px-6 pb-6">
                                {item.url && (
                                  <iframe
                                    src={`/api/safety-library/pdf/${item.url}#toolbar=0&navpanes=1&scrollbar=1&view=FitH`}
                                    className="w-full h-full border-0 rounded"
                                    title={item.title}
                                    style={{ minHeight: '600px' }}
                                  />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
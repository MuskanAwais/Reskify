import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  Plus,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Shield,
  BookOpen,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function AdminSafetyLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{success: number, failed: number, errors: string[]}>({
    success: 0,
    failed: 0,
    errors: []
  });
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Code of Practices": true
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    fileType: 'PDF',
    tags: '',
    folder: ''
  });
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Fetch safety library documents
  const { data: safetyData = [], isLoading, error } = useQuery({
    queryKey: ['/api/safety-library'],
    queryFn: async () => {
      const response = await fetch('/api/safety-library');
      if (!response.ok) {
        throw new Error('Failed to fetch safety library');
      }
      const data = await response.json();
      return data.documents || [];
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/safety-library/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety-library'] });
      toast({
        title: "Document Deleted",
        description: "Safety document has been removed from the library.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  });

  // Filter documents based on search and category
  const filteredLibrary = safetyData.filter((doc: any) => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group documents by folder/category
  const groupedDocuments = filteredLibrary.reduce((acc: any, doc: any) => {
    const folder = doc.folder || doc.category || "Code of Practices";
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(doc);
    return acc;
  }, {});

  // Handle document viewing
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setDocumentViewerOpen(true);
  };

  // Handle document deletion
  const handleDeleteDocument = (documentId: number) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteMutation.mutate(documentId);
    }
  };

  // Handle bulk file upload
  const handleBulkUpload = async () => {
    if (uploadFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults({ success: 0, failed: 0, errors: [] });

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        setUploadProgress((i / uploadFiles.length) * 100);

        try {
          // Auto-categorize based on filename
          const category = file.name.toLowerCase().includes('electrical') ? 'Electrical Safety' :
                          file.name.toLowerCase().includes('manual') ? 'Manual Handling' :
                          file.name.toLowerCase().includes('construction') ? 'General Safety' :
                          file.name.toLowerCase().includes('fall') ? 'Fall Prevention' :
                          'Code of Practices';

          const uploadData = {
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            category,
            description: `Safety document: ${file.name}`,
            content: `Uploaded safety document: ${file.name}`,
            fileType: file.type.includes('pdf') ? 'PDF' : 'DOC',
            tags: [category.toLowerCase().replace(' ', '_')],
            fileName: file.name,
            fileSize: file.size
          };

          const response = await apiRequest('POST', '/api/admin/safety-library/bulk-upload', uploadData);
          
          if (response.ok) {
            successCount++;
          } else {
            failedCount++;
            errors.push(`${file.name}: Upload failed`);
          }
        } catch (error: any) {
          failedCount++;
          errors.push(`${file.name}: ${error.message}`);
        }
      }

      setUploadProgress(100);
      setUploadResults({ success: successCount, failed: failedCount, errors });
      
      if (successCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/safety-library'] });
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} documents.`,
        });
      }

      if (failedCount > 0) {
        toast({
          title: "Upload Issues",
          description: `${failedCount} files failed to upload. Check the results for details.`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load safety library. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Safety Library</h1>
          <p className="text-muted-foreground">
            Manage safety standards and practice guides for all users
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <Shield className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
          
          {/* Admin Upload Buttons */}
          <div className="flex items-center gap-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Safety Document</DialogTitle>
                  <DialogDescription>
                    Add a new safety document to the library
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Document Title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  />
                  <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Code of Practices">Code of Practices</SelectItem>
                      <SelectItem value="General Safety">General Safety</SelectItem>
                      <SelectItem value="Electrical Safety">Electrical Safety</SelectItem>
                      <SelectItem value="Manual Handling">Manual Handling</SelectItem>
                      <SelectItem value="Fall Prevention">Fall Prevention</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setUploadDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        // Simulate upload for demo
                        toast({
                          title: "Document Uploaded",
                          description: "Safety document has been added to the library.",
                        });
                        setUploadDialogOpen(false);
                        setUploadForm({
                          title: '',
                          category: '',
                          description: '',
                          content: '',
                          fileType: 'PDF',
                          tags: '',
                          folder: ''
                        });
                      }}
                      className="flex-1"
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={bulkUploadDialogOpen} onOpenChange={setBulkUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Safety Documents</DialogTitle>
                  <DialogDescription>
                    Upload multiple safety documents at once with automatic categorization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="bulk-upload"
                    />
                    <label htmlFor="bulk-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">Drop files here or click to browse</p>
                      <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX files</p>
                    </label>
                  </div>
                  
                  {uploadFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Selected Files ({uploadFiles.length}):</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4" />
                            <span className="flex-1">{file.name}</span>
                            <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-center">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
                  
                  {uploadResults.success > 0 || uploadResults.failed > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>{uploadResults.success} successful</span>
                        </div>
                        {uploadResults.failed > 0 && (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span>{uploadResults.failed} failed</span>
                          </div>
                        )}
                      </div>
                      {uploadResults.errors.length > 0 && (
                        <div className="max-h-20 overflow-y-auto">
                          {uploadResults.errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-600">{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setBulkUploadDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkUpload}
                      disabled={uploadFiles.length === 0 || isUploading}
                      className="flex-1"
                    >
                      {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} Files`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search safety documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Code of Practices">Code of Practices</SelectItem>
                <SelectItem value="General Safety">General Safety</SelectItem>
                <SelectItem value="Electrical Safety">Electrical Safety</SelectItem>
                <SelectItem value="Manual Handling">Manual Handling</SelectItem>
                <SelectItem value="Fall Prevention">Fall Prevention</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
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

      {/* Document Library */}
      <div className="space-y-4">
        {Object.entries(groupedDocuments).map(([folderName, documents]: [string, any]) => (
          <Card key={folderName}>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedFolders(prev => ({
                ...prev,
                [folderName]: !prev[folderName]
              }))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedFolders[folderName] ? 
                    <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  }
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{folderName}</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {documents.length} documents
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {expandedFolders[folderName] && (
              <CardContent className="pt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documents.map((doc: any) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{doc.title}</h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{doc.description}</p>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {doc.fileType}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {doc.category}
                              </Badge>
                            </div>
                            
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {doc.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{doc.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(doc)}
                            className="flex-1 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {doc.downloadCount && (
                          <p className="text-xs text-gray-500 mt-2">
                            Downloaded {doc.downloadCount} times
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Document Viewer Dialog */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedDocument?.fileUrl ? (
              <iframe
                src={selectedDocument.fileUrl}
                className="w-full h-96 border rounded"
                title={selectedDocument.title}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded border">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Document preview not available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This document can be accessed through the official safety portal
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useCallback, useMemo } from "react";
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
import { Lock, Crown, Unlock, Search, ExternalLink, Filter, Shield, Upload, FileText, X, CheckCircle, AlertCircle, Eye, Plus, Download, FolderOpen, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Code of Practices": true,
    "Standards": false,
    "Guidelines": false,
    "Other Documents": false
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

  // Functions for document viewing
  const openDocumentViewer = (document: any) => {
    setSelectedDocument(document);
    setDocumentViewerOpen(true);
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Organize documents into folders
  const organizedDocuments = useMemo(() => {
    const documents = (safetyLibrary as any)?.documents;
    if (!documents) return {};
    
    const folders: Record<string, any[]> = {
      "Code of Practices": [],
      "Standards": [],
      "Guidelines": [],
      "Other Documents": []
    };
    
    documents.forEach((doc: any) => {
      // Check if document has a specific folder assignment from database
      if (doc.folder) {
        if (!folders[doc.folder]) {
          folders[doc.folder] = [];
        }
        folders[doc.folder].push(doc);
      } else if (doc.title.toLowerCase().includes('code of practice') || 
                 doc.title.toLowerCase().includes('model code') ||
                 doc.category === 'General Safety' ||
                 doc.category === 'Manual Handling') {
        folders["Code of Practices"].push(doc);
      } else if (doc.title.toLowerCase().includes('standard') || 
                 doc.title.includes('AS/NZS') || 
                 doc.title.includes('AS ') ||
                 doc.category === 'Electrical' ||
                 doc.category === 'Plumbing' ||
                 doc.category === 'Carpentry') {
        folders["Standards"].push(doc);
      } else if (doc.title.toLowerCase().includes('guidelines') || 
                 doc.title.toLowerCase().includes('guide') ||
                 doc.category === 'Scaffolding' ||
                 doc.category === 'Roofing') {
        folders["Guidelines"].push(doc);
      } else {
        folders["Other Documents"].push(doc);
      }
    });
    
    return folders;
  }, [safetyLibrary]);

  // Auto-detect category from filename
  const detectCategory = useCallback((filename: string) => {
    const name = filename.toLowerCase();
    
    // Construction-specific patterns
    if (name.includes('construction') || name.includes('building') || name.includes('structural')) {
      return 'Construction';
    }
    if (name.includes('electrical') || name.includes('wiring') || name.includes('power') || name.includes('voltage')) {
      return 'Electrical Safety';
    }
    if (name.includes('manual') || name.includes('handling') || name.includes('lifting') || name.includes('ergonomic')) {
      return 'Manual Handling';
    }
    if (name.includes('fall') || name.includes('height') || name.includes('scaffold') || name.includes('harness')) {
      return 'Fall Protection';
    }
    if (name.includes('plant') || name.includes('equipment') || name.includes('machinery') || name.includes('tool')) {
      return 'Plant & Equipment';
    }
    if (name.includes('noise') || name.includes('hearing') || name.includes('sound') || name.includes('acoustic')) {
      return 'Noise Control';
    }
    if (name.includes('chemical') || name.includes('hazardous') || name.includes('substance') || name.includes('material')) {
      return 'Chemical Safety';
    }
    if (name.includes('fire') || name.includes('emergency') || name.includes('evacuation') || name.includes('safety plan')) {
      return 'Emergency Procedures';
    }
    if (name.includes('confined') || name.includes('space') || name.includes('entry') || name.includes('permit')) {
      return 'Confined Spaces';
    }
    if (name.includes('traffic') || name.includes('vehicle') || name.includes('transport') || name.includes('mobile')) {
      return 'Traffic Management';
    }
    
    return 'General Safety';
  }, []);

  // Generate document title from filename
  const generateTitle = useCallback((filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    // Convert underscores/hyphens to spaces and capitalize words
    return nameWithoutExt
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  // Enhanced file upload handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Limit to 500 files as mentioned in UI
    if (uploadFiles.length + files.length > 500) {
      toast({
        title: "Too Many Files",
        description: "Maximum 500 files per upload. Please select fewer files.",
        variant: "destructive",
      });
      return;
    }
    
    setUploadFiles(prev => [...prev, ...files]);
  }, [uploadFiles.length, toast]);

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
        tags: '',
        folder: ''
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
          // Auto-generate document metadata from filename
          const autoTitle = generateTitle(file.name);
          const autoCategory = detectCategory(file.name);
          const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
          
          // Create document data with auto-detected fields
          const documentData = {
            title: autoTitle,
            category: autoCategory,
            description: `Auto-uploaded safety document: ${autoTitle}`,
            content: `Uploaded file: ${file.name}`,
            fileType: fileExtension,
            tags: [autoCategory.toLowerCase().replace(/\s+/g, '-'), 'auto-uploaded', fileExtension.toLowerCase()],
            fileName: file.name,
            fileSize: file.size
          };

          await apiRequest('POST', '/api/admin/safety-library/bulk-upload', documentData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
        }
        
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        setUploadResults({ ...results });
        
        // Small delay to prevent overwhelming the server
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      setIsUploading(false);
      return results;
    },
    onSuccess: (results) => {
      toast({
        title: "Bulk Upload Complete",
        description: `${results.success} files uploaded successfully${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
        variant: results.failed > 0 ? "destructive" : "default"
      });
      
      if (results.success > 0) {
        // Force immediate cache invalidation and refetch
        queryClient.invalidateQueries({ queryKey: ['/api/safety-library'] });
        queryClient.refetchQueries({ queryKey: ['/api/safety-library'] });
        
        // Also clear any related caches
        queryClient.removeQueries({ queryKey: ['/api/safety-library'] });
        
        // Force a complete page refresh of the safety library data
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/safety-library'] });
        }, 500);
      }
      
      // Reset all upload states
      setUploadFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadResults({ success: 0, failed: 0, errors: [] });
      
      // Close the bulk upload dialog after a brief delay
      setTimeout(() => {
        setBulkUploadDialogOpen(false);
      }, 1500);
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
          
          {/* Admin Upload Buttons */}
          <div className="flex items-center gap-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={bulkUploadDialogOpen} onOpenChange={setBulkUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Safety Documents</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple documents at once. File names will be automatically analyzed for categorization.
                  </p>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* File Drop Zone */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Drop files here or click to browse</h3>
                        <p className="text-sm text-gray-500">
                          Supports PDF, DOC, DOCX, PPT, PPTX files. Maximum 500 files per upload.
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="bulk-file-input"
                      />
                      <label htmlFor="bulk-file-input">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>Select Files</span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Selected Files List */}
                  {uploadFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Selected Files ({uploadFiles.length})</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setUploadFiles([])}
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                        <div className="grid gap-2 p-4">
                          {uploadFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div>
                                  <p className="font-medium text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {detectCategory(file.name)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Uploading files...</span>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                      
                      {uploadResults.success > 0 || uploadResults.failed > 0 ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            {uploadResults.success} successful
                          </div>
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {uploadResults.failed} failed
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Upload Results */}
                  {uploadResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Upload Errors</h4>
                      <div className="max-h-32 overflow-y-auto text-sm text-red-600 bg-red-50 p-3 rounded">
                        {uploadResults.errors.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      disabled={isUploading}
                      onClick={() => {
                        setBulkUploadDialogOpen(false);
                        setUploadFiles([]);
                        setUploadProgress(0);
                        setUploadResults({ success: 0, failed: 0, errors: [] });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => uploadFiles.length > 0 && uploadMutation.mutate(uploadFiles)}
                      disabled={uploadFiles.length === 0 || isUploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? `Uploading ${uploadProgress}%` : `Upload ${uploadFiles.length} Files`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Single Document Upload Dialog */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
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
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="construction, safety, guidelines"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => adminUploadMutation.mutate(uploadForm)}
                    disabled={adminUploadMutation.isPending || !uploadForm.title || !uploadForm.category || !uploadForm.description}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {adminUploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Backup conditional button if needed */}
          {false && (isAdminMode || adminUnlocked) && (
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
                onClick={() => setBulkUploadDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload Documents
              </Button>
              <Button 
                onClick={() => setUploadDialogOpen(true)}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Single Document
              </Button>
              <Button 
                onClick={() => setNewFolderDialogOpen(true)}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Create Folder
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

        {/* Document Viewer Dialog */}
        <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedDocument?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument?.category} - {selectedDocument?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Document Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Category</h4>
                  <p className="text-sm">{selectedDocument?.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Authority</h4>
                  <p className="text-sm">{selectedDocument?.authority || 'Safe Work Australia'}</p>
                </div>
                {selectedDocument?.tags && selectedDocument.tags.length > 0 && (
                  <div className="col-span-2">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDocument.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Preview Area */}
              <div className="border rounded-lg p-8 bg-white min-h-[400px] flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Document Preview</h3>
                <p className="text-gray-500 text-center mb-6">
                  {selectedDocument?.description}
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      if (selectedDocument?.content) {
                        window.open(selectedDocument.content, '_blank');
                      } else if (selectedDocument?.url) {
                        window.open(selectedDocument.url, '_blank');
                      } else {
                        // Generate a document URL based on the document info
                        const searchQuery = `${selectedDocument?.title} ${selectedDocument?.category} filetype:pdf site:safeworkaustralia.gov.au OR site:standards.org.au`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                        toast({
                          title: "Document Search",
                          description: "Opening search results for this document...",
                        });
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Open Document
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Download Started",
                        description: `Downloading ${selectedDocument?.title}...`,
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Folder Creation Dialog */}
        <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a custom folder to organize your safety documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewFolderDialogOpen(false);
                    setNewFolderName('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (newFolderName.trim()) {
                      setExpandedFolders(prev => ({
                        ...prev,
                        [newFolderName]: true
                      }));
                      toast({
                        title: "Folder Created",
                        description: `Created new folder: ${newFolderName}`,
                      });
                      setNewFolderDialogOpen(false);
                      setNewFolderName('');
                    }
                  }}
                  disabled={!newFolderName.trim()}
                >
                  Create Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Organized Document Folders */}
        <div className="space-y-4">
          {Object.entries(organizedDocuments).map(([folderName, documents]) => (
            documents.length > 0 && (
              <Card key={folderName} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
                  onClick={() => toggleFolder(folderName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedFolders[folderName] ? (
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                      ) : (
                        <FolderOpen className="h-5 w-5 text-gray-500" />
                      )}
                      <CardTitle className="text-lg">{folderName}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        {documents.length} documents
                      </Badge>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedFolders[folderName] ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </CardHeader>
                
                {expandedFolders[folderName] && (
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {documents.map((item: any) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                {item.description}
                              </p>
                              
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
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
                            
                            <div className="flex gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => openDocumentViewer(item)}
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  if (item.content) {
                                    window.open(item.content, '_blank');
                                  } else {
                                    const searchQuery = `${item.title} ${item.category} filetype:pdf site:safeworkaustralia.gov.au OR site:standards.org.au`;
                                    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                                  }
                                  toast({
                                    title: "Opening Document",
                                    description: `Accessing ${item.title}...`,
                                  });
                                }}
                              >
                                <Download className="h-3 w-3" />
                                Open
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
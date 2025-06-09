import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  PenTool, 
  Send, 
  Mail, 
  CheckCircle, 
  Clock, 
  User, 
  Download,
  Printer,
  Save,
  Eye,
  X,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Signature {
  id: string;
  signatory: string;
  role: string;
  email: string;
  signatureData?: string; // Base64 signature image
  signedAt?: string;
  ipAddress?: string;
  status: 'pending' | 'signed' | 'declined';
  typeSignature?: string;
}

interface DigitalSignatureSystemProps {
  swmsId: string;
  swmsTitle: string;
  isCompliant: boolean;
  onSignaturesUpdate: (signatures: Signature[]) => void;
}

export default function DigitalSignatureSystem({ 
  swmsId, 
  swmsTitle, 
  isCompliant,
  onSignaturesUpdate 
}: DigitalSignatureSystemProps) {
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [newSignatory, setNewSignatory] = useState({
    name: '',
    role: '',
    email: ''
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSignatureIndex, setCurrentSignatureIndex] = useState<number | null>(null);
  const [typeSignature, setTypeSignature] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  useEffect(() => {
    // Load existing signatures
    loadSignatures();
    // Set up auto-save interval
    const autoSaveInterval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(autoSaveInterval);
  }, [swmsId]);

  const loadSignatures = async () => {
    try {
      const response = await apiRequest('GET', `/api/swms/${swmsId}/signatures`);
      const data = await response.json();
      setSignatures(data.signatures || []);
      onSignaturesUpdate(data.signatures || []);
    } catch (error) {
      console.error('Failed to load signatures:', error);
    }
  };

  const autoSave = async () => {
    try {
      setAutoSaveStatus('saving');
      await apiRequest('POST', `/api/swms/${swmsId}/auto-save`, {
        signatures,
        timestamp: new Date().toISOString()
      });
      setAutoSaveStatus('saved');
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Auto-save failed:', error);
    }
  };

  const sendSignatureRequest = async (signature: Signature) => {
    try {
      const response = await apiRequest('POST', `/api/swms/${swmsId}/send-signature-request`, {
        signatory: signature.signatory,
        email: signature.email,
        role: signature.role,
        swmsTitle,
        signatureId: signature.id
      });
      
      if (response.ok) {
        toast({
          title: "Signature request sent",
          description: `Email sent to ${signature.email} for signature approval`,
        });
        
        // Update signature status to pending
        const updatedSignatures = signatures.map(sig => 
          sig.id === signature.id ? { ...sig, status: 'pending' as const } : sig
        );
        setSignatures(updatedSignatures);
        onSignaturesUpdate(updatedSignatures);
      }
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: "Could not send signature request email",
        variant: "destructive"
      });
    }
  };

  const addSignatory = () => {
    if (!newSignatory.name || !newSignatory.email) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and email for the signatory",
        variant: "destructive",
      });
      return;
    }

    const signature: Signature = {
      id: `sig-${Date.now()}`,
      signatory: newSignatory.name,
      role: newSignatory.role || 'Worker',
      email: newSignatory.email,
      status: 'pending'
    };

    const updatedSignatures = [...signatures, signature];
    setSignatures(updatedSignatures);
    onSignaturesUpdate(updatedSignatures);
    
    setNewSignatory({ name: '', role: '', email: '' });
    
    toast({
      title: "Signatory Added",
      description: `${newSignatory.name} has been added to the signature list`,
    });
  };

  const removeSignatory = (signatureId: string) => {
    const updatedSignatures = signatures.filter(sig => sig.id !== signatureId);
    setSignatures(updatedSignatures);
    onSignaturesUpdate(updatedSignatures);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCompliant) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isCompliant) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (currentSignatureIndex === null) return;

    let signatureData = '';
    
    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL();
    } else {
      if (!typeSignature.trim()) {
        toast({
          title: "No Signature",
          description: "Please enter your typed signature",
          variant: "destructive",
        });
        return;
      }
      signatureData = typeSignature;
    }

    const updatedSignatures = [...signatures];
    updatedSignatures[currentSignatureIndex] = {
      ...updatedSignatures[currentSignatureIndex],
      signatureData,
      typeSignature: signatureMode === 'type' ? typeSignature : undefined,
      signedAt: new Date().toISOString(),
      status: 'signed'
    };

    try {
      await apiRequest('POST', `/api/swms/${swmsId}/sign`, {
        signatureId: updatedSignatures[currentSignatureIndex].id,
        signatureData,
        typeSignature: signatureMode === 'type' ? typeSignature : undefined,
        ipAddress: await getUserIP()
      });

      setSignatures(updatedSignatures);
      onSignaturesUpdate(updatedSignatures);
      setCurrentSignatureIndex(null);
      setTypeSignature('');
      clearSignature();

      toast({
        title: "Signature Saved",
        description: "Your signature has been successfully recorded",
      });

      // Send notification to other signatories
      await sendSignatureNotifications(updatedSignatures[currentSignatureIndex]);
      
    } catch (error) {
      toast({
        title: "Signature Failed",
        description: "Failed to save signature. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  };

  const sendSignatureNotifications = async (signedSignature: Signature) => {
    try {
      await apiRequest('POST', `/api/swms/${swmsId}/notify-signature`, {
        signedBy: signedSignature.signatory,
        swmsTitle,
        remainingSignatories: signatures.filter(s => s.status === 'pending')
      });
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  };

  const sendForSignature = async (signature: Signature) => {
    try {
      await apiRequest('POST', `/api/swms/${swmsId}/send-signature-request`, {
        signatureId: signature.id,
        email: signature.email,
        signatory: signature.signatory,
        swmsTitle,
        swmsId
      });

      toast({
        title: "Signature Request Sent",
        description: `Email sent to ${signature.signatory} (${signature.email})`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send signature request email",
        variant: "destructive",
      });
    }
  };

  const sendAllSignatureRequests = async () => {
    const pendingSignatures = signatures.filter(s => s.status === 'pending');
    
    try {
      await apiRequest('POST', `/api/swms/${swmsId}/send-all-signature-requests`, {
        signatures: pendingSignatures,
        swmsTitle,
        swmsId
      });

      toast({
        title: "All Requests Sent",
        description: `Signature requests sent to ${pendingSignatures.length} recipients`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send some signature requests",
        variant: "destructive",
      });
    }
  };

  const printDocument = () => {
    window.print();
  };

  const downloadPDF = async () => {
    try {
      const response = await apiRequest('POST', `/api/swms/${swmsId}/generate-pdf`, {
        includeSignatures: true
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${swmsTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_signed.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const allSigned = signatures.length > 0 && signatures.every(s => s.status === 'signed');
  const pendingCount = signatures.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Auto-save Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Digital Signatures</h3>
        <div className="flex items-center gap-2 text-sm">
          {autoSaveStatus === 'saving' && (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Auto-saved</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <X className="h-4 w-4 text-red-600" />
              <span>Save failed</span>
            </>
          )}
        </div>
      </div>

      {/* Compliance Check */}
      {!isCompliant && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This SWMS must pass compliance validation before signatures can be collected.
            Please resolve all critical issues in the previous steps.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Signatory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add Signatory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newSignatory.name}
                onChange={(e) => setNewSignatory({ ...newSignatory, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newSignatory.role}
                onValueChange={(value) => setNewSignatory({ ...newSignatory, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Site Supervisor">Site Supervisor</SelectItem>
                  <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Worker">Worker</SelectItem>
                  <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="Client Representative">Client Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newSignatory.email}
                onChange={(e) => setNewSignatory({ ...newSignatory, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
          </div>
          <Button onClick={addSignatory} className="w-full">
            <User className="h-4 w-4 mr-2" />
            Add Signatory
          </Button>
        </CardContent>
      </Card>

      {/* Signature List */}
      {signatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Required Signatures ({signatures.filter(s => s.status === 'signed').length}/{signatures.length})</span>
              {pendingCount > 0 && isCompliant && (
                <Button onClick={sendAllSignatureRequests} variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send All Requests
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signatures.map((signature, index) => (
                <div key={signature.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{signature.signatory}</h4>
                      <p className="text-sm text-gray-600">{signature.role} • {signature.email}</p>
                      {signature.signedAt && (
                        <p className="text-xs text-gray-500">
                          Signed on {new Date(signature.signedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        signature.status === 'signed' ? 'default' :
                        signature.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {signature.status}
                      </Badge>
                      {signature.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => sendForSignature(signature)}
                            variant="outline"
                            size="sm"
                            disabled={!isCompliant}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setCurrentSignatureIndex(index)}
                            variant="outline"
                            size="sm"
                            disabled={!isCompliant}
                          >
                            <PenTool className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeSignatory(signature.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Show signature if signed */}
                  {signature.status === 'signed' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      {signature.typeSignature ? (
                        <div className="text-center font-cursive text-lg text-gray-700">
                          {signature.typeSignature}
                        </div>
                      ) : signature.signatureData && (
                        <img 
                          src={signature.signatureData} 
                          alt="Signature" 
                          className="max-h-20 mx-auto"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Pad */}
      {currentSignatureIndex !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              Sign as {signatures[currentSignatureIndex]?.signatory}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={signatureMode === 'draw' ? 'default' : 'outline'}
                  onClick={() => setSignatureMode('draw')}
                  size="sm"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Draw
                </Button>
                <Button
                  variant={signatureMode === 'type' ? 'default' : 'outline'}
                  onClick={() => setSignatureMode('type')}
                  size="sm"
                >
                  Type
                </Button>
              </div>

              {signatureMode === 'draw' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="border border-gray-300 rounded w-full max-w-md mx-auto cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex gap-2 mt-3 justify-center">
                    <Button onClick={clearSignature} variant="outline" size="sm">
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="typeSignature">Type your signature</Label>
                  <Input
                    id="typeSignature"
                    value={typeSignature}
                    onChange={(e) => setTypeSignature(e.target.value)}
                    placeholder="Enter your full name as signature"
                    className="font-cursive text-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setCurrentSignatureIndex(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={saveSignature}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Signature
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Actions */}
      {allSigned && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Document Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All required signatures have been collected. This SWMS is now fully executed and ready for use.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3 mt-4">
              <Button onClick={downloadPDF} variant="default">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={printDocument} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
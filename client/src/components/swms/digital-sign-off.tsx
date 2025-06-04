import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  PenTool, 
  Calendar, 
  Clock, 
  User, 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface Signature {
  id: string;
  name: string;
  role: string;
  signature: string;
  timestamp: Date;
  ipAddress?: string;
}

interface DigitalSignOffProps {
  swmsData: {
    title: string;
    jobName: string;
    jobNumber: string;
    projectAddress: string;
    tradeType: string;
    riskAssessments: any[];
  };
  onSignOff: (signatures: Signature[]) => void;
  onDownloadPDF: () => void;
}

export function DigitalSignOff({ swmsData, onSignOff, onDownloadPDF }: DigitalSignOffProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [currentSigner, setCurrentSigner] = useState({
    name: '',
    role: '',
    signature: ''
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requiredSignatures = [
    { role: 'Site Supervisor', description: 'Responsible for overall site safety and SWMS implementation' },
    { role: 'Project Manager', description: 'Approves SWMS and ensures compliance with project requirements' },
    { role: 'Safety Officer', description: 'Validates safety measures and compliance with regulations' },
    { role: 'Trade Supervisor', description: 'Confirms trade-specific safety requirements and procedures' }
  ];

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setCurrentSigner({
        ...currentSigner,
        signature: canvas.toDataURL()
      });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setCurrentSigner({ ...currentSigner, signature: '' });
  };

  const addSignature = () => {
    if (!currentSigner.name.trim() || !currentSigner.role.trim() || !currentSigner.signature) {
      return;
    }

    const newSignature: Signature = {
      id: `sig-${Date.now()}`,
      name: currentSigner.name,
      role: currentSigner.role,
      signature: currentSigner.signature,
      timestamp: new Date(),
      ipAddress: 'xxx.xxx.xxx.xxx' // In real implementation, get from server
    };

    const updatedSignatures = [...signatures, newSignature];
    setSignatures(updatedSignatures);
    setCurrentSigner({ name: '', role: '', signature: '' });
    clearSignature();

    // Check if all required signatures are collected
    if (updatedSignatures.length >= requiredSignatures.length) {
      onSignOff(updatedSignatures);
    }
  };

  const removeSignature = (id: string) => {
    setSignatures(signatures.filter(sig => sig.id !== id));
  };

  const isSignatureComplete = signatures.length >= requiredSignatures.length;
  const remainingSignatures = requiredSignatures.filter(
    req => !signatures.some(sig => sig.role === req.role)
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* SWMS Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SWMS Document Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Document Title</h3>
              <p className="font-medium">{swmsData.title}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Job Details</h3>
              <p>{swmsData.jobName} ({swmsData.jobNumber})</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Project Location</h3>
              <p>{swmsData.projectAddress}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Trade Type</h3>
              <Badge variant="outline">{swmsData.tradeType}</Badge>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Risk Assessments</h3>
              <p className="text-sm">{swmsData.riskAssessments.length} assessments included</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Document Status</h3>
              <Badge className={isSignatureComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {isSignatureComplete ? 'Fully Signed' : 'Pending Signatures'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Collection */}
      {!isSignatureComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Digital Signature Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  value={currentSigner.name}
                  onChange={(e) => setCurrentSigner({ ...currentSigner, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role/Position</label>
                <select
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={currentSigner.role}
                  onChange={(e) => setCurrentSigner({ ...currentSigner, role: e.target.value })}
                >
                  <option value="">Select your role</option>
                  {remainingSignatures.map((req) => (
                    <option key={req.role} value={req.role}>
                      {req.role}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Digital Signature</label>
              <div className="border border-input rounded-md p-4 bg-background">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full border border-dashed border-muted-foreground/30 rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Sign above by drawing with your mouse or finger
                  </p>
                  <Button variant="outline" size="sm" onClick={clearSignature}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={addSignature}
              disabled={!currentSigner.name.trim() || !currentSigner.role.trim() || !currentSigner.signature}
              className="w-full"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Add Signature
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Required Signatures Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Signature Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requiredSignatures.map((req) => {
              const signature = signatures.find(sig => sig.role === req.role);
              return (
                <div key={req.role} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {signature ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="font-medium">{req.role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.description}</p>
                    {signature && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {signature.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(signature.timestamp, 'dd/MM/yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(signature.timestamp, 'HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {signature ? (
                      <Badge className="bg-green-100 text-green-800">Signed</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Signatures */}
      {signatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Collected Signatures ({signatures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signatures.map((signature) => (
                <div key={signature.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{signature.name}</h4>
                      <p className="text-sm text-muted-foreground">{signature.role}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{format(signature.timestamp, 'dd/MM/yyyy HH:mm')}</p>
                      {signature.ipAddress && <p>IP: {signature.ipAddress}</p>}
                    </div>
                  </div>
                  <div className="border rounded p-2 bg-muted/20">
                    <img 
                      src={signature.signature} 
                      alt={`${signature.name}'s signature`}
                      className="max-h-20 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Actions */}
      {isSignatureComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  SWMS Fully Signed and Approved
                </h3>
                <p className="text-sm text-green-600">
                  All required signatures have been collected. The document is now legally binding.
                </p>
              </div>
              <Button onClick={onDownloadPDF} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Signed SWMS PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Notice */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Legal Digital Signature Notice</p>
            <p>
              By signing this document digitally, you acknowledge that your electronic signature 
              has the same legal effect as a handwritten signature and you agree to be bound by 
              the terms and safety requirements outlined in this SWMS document.
            </p>
            <p>
              This document complies with the Electronic Transactions Act and Work Health and Safety regulations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
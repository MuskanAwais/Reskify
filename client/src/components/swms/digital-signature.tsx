import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PenTool, CheckCircle, Clock, FileCheck, User, Witness } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DigitalSignatureProps {
  documentId: number;
  documentTitle: string;
  currentStatus: string;
  signatureStatus: string;
  signedBy?: string;
  signedAt?: string;
  signatureTitle?: string;
  witnessName?: string;
  witnessSignedAt?: string;
  onSignatureUpdate?: () => void;
}

export default function DigitalSignature({
  documentId,
  documentTitle,
  currentStatus,
  signatureStatus,
  signedBy,
  signedAt,
  signatureTitle,
  witnessName,
  witnessSignedAt,
  onSignatureUpdate
}: DigitalSignatureProps) {
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [isWitnessDialogOpen, setIsWitnessDialogOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [witnessNameInput, setWitnessNameInput] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const witnessCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signDocumentMutation = useMutation({
    mutationFn: async (signatureData: any) => {
      const response = await apiRequest("POST", `/api/swms/${documentId}/sign`, signatureData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Signed",
        description: "The SWMS document has been successfully signed.",
      });
      setIsSignatureDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
      onSignatureUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Signature Failed",
        description: error.message || "Failed to sign the document.",
        variant: "destructive",
      });
    },
  });

  const addWitnessMutation = useMutation({
    mutationFn: async (witnessData: any) => {
      const response = await apiRequest("POST", `/api/swms/${documentId}/witness`, witnessData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Witness Added",
        description: "Witness signature has been added successfully.",
      });
      setIsWitnessDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
      onSignatureUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Witness Failed",
        description: error.message || "Failed to add witness signature.",
        variant: "destructive",
      });
    },
  });

  const setupCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 200;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    if (!isDrawing) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setupCanvas(canvas);
  };

  const getSignatureData = (canvas: HTMLCanvasElement) => {
    return canvas.toDataURL();
  };

  useEffect(() => {
    if (canvasRef.current) {
      setupCanvas(canvasRef.current);
    }
  }, [isSignatureDialogOpen]);

  useEffect(() => {
    if (witnessCanvasRef.current) {
      setupCanvas(witnessCanvasRef.current);
    }
  }, [isWitnessDialogOpen]);

  const handleSign = () => {
    if (!canvasRef.current || !signerName.trim() || !signerTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name, title, and signature.",
        variant: "destructive",
      });
      return;
    }

    const signatureData = getSignatureData(canvasRef.current);
    signDocumentMutation.mutate({
      signedBy: signerName,
      signatureTitle: signerTitle,
      signatureData: signatureData,
    });
  };

  const handleWitness = () => {
    if (!witnessCanvasRef.current || !witnessNameInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide witness name and signature.",
        variant: "destructive",
      });
      return;
    }

    const witnessSignatureData = getSignatureData(witnessCanvasRef.current);
    addWitnessMutation.mutate({
      witnessName: witnessNameInput,
      witnessSignature: witnessSignatureData,
    });
  };

  const getStatusBadge = () => {
    switch (signatureStatus) {
      case "signed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Signed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline"><PenTool className="w-3 h-3 mr-1" />Unsigned</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Digital Signature
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document</Label>
            <p className="text-sm text-gray-600">{documentTitle}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <p className="text-sm text-gray-600 capitalize">{currentStatus}</p>
          </div>
        </div>

        {signatureStatus === "signed" && (
          <div className="space-y-3">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Signed By
                </Label>
                <p className="text-sm">{signedBy}</p>
                <p className="text-xs text-gray-500">{signatureTitle}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Signed At</Label>
                <p className="text-sm">{signedAt ? new Date(signedAt).toLocaleString() : "-"}</p>
              </div>
            </div>

            {witnessName && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Witness className="w-4 h-4" />
                    Witness
                  </Label>
                  <p className="text-sm">{witnessName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Witnessed At</Label>
                  <p className="text-sm">{witnessSignedAt ? new Date(witnessSignedAt).toLocaleString() : "-"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {signatureStatus !== "signed" && (
            <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Sign Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Digital Signature</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        value={signerTitle}
                        onChange={(e) => setSignerTitle(e.target.value)}
                        placeholder="e.g., Site Manager, Safety Officer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Signature *</Label>
                    <div className="border rounded-lg">
                      <canvas
                        ref={canvasRef}
                        className="border-2 border-dashed border-gray-300 rounded cursor-crosshair"
                        onMouseDown={(e) => startDrawing(e, canvasRef.current!)}
                        onMouseMove={(e) => draw(e, canvasRef.current!)}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearCanvas(canvasRef.current!)}
                      >
                        Clear Signature
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsSignatureDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSign}
                      disabled={signDocumentMutation.isPending}
                    >
                      {signDocumentMutation.isPending ? "Signing..." : "Sign Document"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {signatureStatus === "signed" && !witnessName && (
            <Dialog open={isWitnessDialogOpen} onOpenChange={setIsWitnessDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Witness className="w-4 h-4" />
                  Add Witness
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Witness Signature</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Witness Name *</Label>
                    <Input
                      value={witnessNameInput}
                      onChange={(e) => setWitnessNameInput(e.target.value)}
                      placeholder="Enter witness full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Witness Signature *</Label>
                    <div className="border rounded-lg">
                      <canvas
                        ref={witnessCanvasRef}
                        className="border-2 border-dashed border-gray-300 rounded cursor-crosshair"
                        onMouseDown={(e) => startDrawing(e, witnessCanvasRef.current!)}
                        onMouseMove={(e) => draw(e, witnessCanvasRef.current!)}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearCanvas(witnessCanvasRef.current!)}
                      >
                        Clear Signature
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsWitnessDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWitness}
                      disabled={addWitnessMutation.isPending}
                    >
                      {addWitnessMutation.isPending ? "Adding..." : "Add Witness"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>Digital signatures are legally binding and provide document integrity protection.</p>
          <p>By signing, you confirm that you have reviewed and approved this SWMS document.</p>
        </div>
      </CardContent>
    </Card>
  );
}
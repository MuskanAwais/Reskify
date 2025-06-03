import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { QrCode, MapPin, Clock, User, CheckCircle, AlertTriangle, Smartphone } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QRCheckInProps {
  documentId: number;
  documentTitle: string;
  jobLocation: string;
  onCheckInUpdate?: () => void;
}

interface CheckInRecord {
  id: number;
  workerName: string;
  workerRole: string;
  checkedInAt: string;
  latitude: number;
  longitude: number;
  deviceInfo: string;
  signatureData?: string;
  verificationStatus: "verified" | "pending" | "failed";
}

export default function QRCheckIn({
  documentId,
  documentTitle,
  jobLocation,
  onCheckInUpdate
}: QRCheckInProps) {
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checkInRecords } = useQuery({
    queryKey: [`/api/swms/${documentId}/check-ins`],
  });

  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/swms/${documentId}/generate-qr`);
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      toast({
        title: "QR Code Generated",
        description: "QR code created for on-site check-ins.",
      });
    },
    onError: () => {
      toast({
        title: "QR Generation Failed",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (checkInData: any) => {
      const response = await apiRequest("POST", `/api/swms/${documentId}/check-in`, checkInData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-In Successful",
        description: "Worker has been checked in with location verification.",
      });
      setIsCheckInDialogOpen(false);
      setWorkerName("");
      setWorkerRole("");
      queryClient.invalidateQueries({ queryKey: [`/api/swms/${documentId}/check-ins`] });
      onCheckInUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Check-In Failed",
        description: error.message || "Failed to check in worker.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isCheckInDialogOpen) {
      getCurrentLocation();
    }
  }, [isCheckInDialogOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError("");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown location error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleCheckIn = () => {
    if (!workerName.trim() || !workerRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide worker name and role.",
        variant: "destructive",
      });
      return;
    }

    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Location verification is required for check-in.",
        variant: "destructive",
      });
      return;
    }

    const checkInData = {
      workerName,
      workerRole,
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      deviceInfo: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    checkInMutation.mutate(checkInData);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Check-In System
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generateQRMutation.mutate()}
              disabled={generateQRMutation.isPending}
            >
              {generateQRMutation.isPending ? "Generating..." : "Generate QR"}
            </Button>
            <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Manual Check-In
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Worker Check-In</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Worker Name *</Label>
                    <Input
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      placeholder="Enter worker full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Role/Position *</Label>
                    <Input
                      value={workerRole}
                      onChange={(e) => setWorkerRole(e.target.value)}
                      placeholder="e.g., Electrician, Site Supervisor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Location Verification
                    </Label>
                    {currentLocation ? (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          Location verified: {formatLocation(currentLocation.lat, currentLocation.lng)}
                        </p>
                      </div>
                    ) : locationError ? (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">{locationError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={getCurrentLocation}
                        >
                          Retry Location
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">Getting location...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCheckIn}
                      disabled={checkInMutation.isPending || !currentLocation}
                    >
                      {checkInMutation.isPending ? "Checking In..." : "Check In"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document</Label>
            <p className="text-sm text-gray-600">{documentTitle}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Job Location</Label>
            <p className="text-sm text-gray-600">{jobLocation}</p>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="space-y-3">
            <Separator />
            <div className="text-center space-y-2">
              <Label className="text-sm font-medium">QR Code for Mobile Check-In</Label>
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 border rounded" />
              </div>
              <p className="text-xs text-gray-500">
                Workers can scan this code to check in with location verification
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Check-In Records</Label>
            <Badge variant="outline">
              {checkInRecords?.length || 0} workers
            </Badge>
          </div>
          
          {checkInRecords && checkInRecords.length > 0 ? (
            <div className="space-y-3">
              {checkInRecords.map((record: CheckInRecord) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{record.workerName}</span>
                      {getVerificationBadge(record.verificationStatus)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.checkedInAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {record.workerRole}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {formatLocation(record.latitude, record.longitude)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No check-ins recorded yet</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-4 space-y-1">
          <p>• All check-ins are geo-stamped and time-stamped for audit compliance</p>
          <p>• Location verification ensures workers are on-site</p>
          <p>• Digital signatures can be captured during check-in process</p>
        </div>
      </CardContent>
    </Card>
  );
}
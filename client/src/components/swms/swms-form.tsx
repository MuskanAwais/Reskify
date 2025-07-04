import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  AlertTriangle, 
  HardHat,
  Wrench,
  Phone,
  CreditCard,
  PenTool,
  CheckCircle,
  Crown,
  Package,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Scale
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from '@/lib/queryClient';

interface StepContentProps {
  step: number;
  formData: any;
  onDataChange: (data: any) => void;
  onNext?: () => void;
  isProcessingCredit?: boolean;
  setIsProcessingCredit?: (value: boolean) => void;
  userData?: any;
  isLoadingCredits?: boolean;
  creditsError?: any;
  userBillingData?: any;
  isLoadingUserCredits?: boolean;
  userCreditsError?: any;
}

interface SWMSFormProps {
  step: number;
  data?: any;
  onNext?: () => void;
  onDataChange?: (data: any) => void;
  userData?: any;
  isLoadingCredits?: boolean;
  creditsError?: any;
  setIsProcessingCredit?: (processing: boolean) => void;
}

const StepContent = ({ step, formData, onDataChange, onNext, isProcessingCredit, setIsProcessingCredit, userData, isLoadingCredits, creditsError, userBillingData, isLoadingUserCredits, userCreditsError }: StepContentProps) => {
  const { toast } = useToast();
  
  // Calculate credits and billing info from userData
  const userCredits = userData?.swmsCredits || 0;
  const subscriptionCredits = userData?.subscriptionCredits || 0;
  const addonCredits = userData?.addonCredits || 0;
  const totalCredits = subscriptionCredits + addonCredits;
  const hasCredits = totalCredits > 0;

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    onDataChange(newData);
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Building className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <p className="text-gray-600 text-sm">
              Enter project information and contractor details
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobName">Job/Project Name</Label>
                  <Input
                    id="jobName"
                    value={formData.jobName || ""}
                    onChange={(e) => updateFormData({ jobName: e.target.value })}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jobNumber">Job Number</Label>
                  <Input
                    id="jobNumber"
                    value={formData.jobNumber || ""}
                    onChange={(e) => updateFormData({ jobNumber: e.target.value })}
                    placeholder="Enter job number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="projectAddress">Project Address</Label>
                <Textarea
                  id="projectAddress"
                  value={formData.projectAddress || ""}
                  onChange={(e) => updateFormData({ projectAddress: e.target.value })}
                  placeholder="Enter full project address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => updateFormData({ startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tradeType">Trade Type</Label>
                  <Select
                    value={formData.tradeType || ""}
                    onValueChange={(value) => updateFormData({ tradeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trade type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General Construction</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Carpentry">Carpentry</SelectItem>
                      <SelectItem value="Tiling">Tiling</SelectItem>
                      <SelectItem value="Roofing">Roofing</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="Painting">Painting</SelectItem>
                      <SelectItem value="Landscaping">Landscaping</SelectItem>
                      <SelectItem value="Demolition">Demolition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-900">Personnel Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="swmsCreatorName">SWMS Creator Name</Label>
                    <Input
                      id="swmsCreatorName"
                      value={formData.swmsCreatorName || ""}
                      onChange={(e) => updateFormData({ swmsCreatorName: e.target.value })}
                      placeholder="Person creating SWMS"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="swmsCreatorPosition">SWMS Creator Position</Label>
                    <Input
                      id="swmsCreatorPosition"
                      value={formData.swmsCreatorPosition || ""}
                      onChange={(e) => updateFormData({ swmsCreatorPosition: e.target.value })}
                      placeholder="Job title/position"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="principalContractor">Principal Contractor</Label>
                    <Input
                      id="principalContractor"
                      value={formData.principalContractor || ""}
                      onChange={(e) => updateFormData({ principalContractor: e.target.value })}
                      placeholder="Principal contractor name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectManager">Project Manager</Label>
                    <Input
                      id="projectManager"
                      value={formData.projectManager || ""}
                      onChange={(e) => updateFormData({ projectManager: e.target.value })}
                      placeholder="Project manager name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteSupervisor">Site Supervisor</Label>
                    <Input
                      id="siteSupervisor"
                      value={formData.siteSupervisor || ""}
                      onChange={(e) => updateFormData({ siteSupervisor: e.target.value })}
                      placeholder="Site supervisor name"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Work Activities & Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Generate tasks with high-risk work selection and manage comprehensive risk assessments
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Work activities and risk assessment content will be loaded here...</p>
            </CardContent>
          </Card>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Personal Protective Equipment</h3>
            <p className="text-gray-600 text-sm">
              Select appropriate PPE for identified risks
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PPE Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p>PPE selection interface will be loaded here...</p>
            </CardContent>
          </Card>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plant Equipment & Training</h3>
            <p className="text-gray-600 text-sm">
              Specify equipment requirements and training needs
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Equipment Register</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Plant equipment and training content will be loaded here...</p>
            </CardContent>
          </Card>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Phone className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Emergency & Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Configure emergency procedures and monitoring requirements
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Emergency and monitoring procedures will be loaded here...</p>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment</h3>
            <p className="text-gray-600 text-sm">
              Complete payment to generate your SWMS document.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Credits Display */}
                {userCredits > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">Available Credits: {userCredits}</p>
                        <p className="text-green-600 text-sm">Each SWMS requires 1 credit to generate</p>
                      </div>
                      <Button
                        size="lg"
                        disabled={userCredits < 1 || isProcessingCredit}
                        onClick={async () => {
                          setIsProcessingCredit?.(true);
                          try {
                            const response = await fetch('/api/user/use-credit', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({ swmsId: formData.draftId })
                            });

                            if (response.ok) {
                              onNext?.();
                            } else {
                              toast({
                                title: "Credit Usage Failed",
                                description: "Unable to process credit. Please try again.",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error('Error using credit:', error);
                            toast({
                              title: "Error",
                              description: "Something went wrong. Please try again.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsProcessingCredit?.(false);
                          }
                        }}
                      >
                        {hasCredits ? 'Use Current Credits (1 credit)' : 'No Credits Available'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legal Disclaimer</h3>
            <p className="text-gray-600 text-sm">
              Review and accept the terms and conditions for SWMS creation.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Important Notice</h4>
                <p className="text-amber-700 text-sm">
                  This SWMS is a template and must be reviewed, adapted, and approved by a competent person 
                  before use. The user is responsible for ensuring compliance with all applicable workplace 
                  health and safety legislation.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms1"
                    checked={formData.acceptTerms1 || false}
                    onCheckedChange={(checked) => updateFormData({ acceptTerms1: checked })}
                  />
                  <Label htmlFor="terms1" className="text-sm leading-relaxed">
                    I acknowledge that this SWMS template requires review and adaptation to specific 
                    workplace conditions and hazards before implementation.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms2"
                    checked={formData.acceptTerms2 || false}
                    onCheckedChange={(checked) => updateFormData({ acceptTerms2: checked })}
                  />
                  <Label htmlFor="terms2" className="text-sm leading-relaxed">
                    I understand that this document does not replace the need for proper risk assessments 
                    and on-site safety evaluations conducted by qualified personnel.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms3"
                    checked={formData.acceptTerms3 || false}
                    onCheckedChange={(checked) => updateFormData({ acceptTerms3: checked })}
                  />
                  <Label htmlFor="terms3" className="text-sm leading-relaxed">
                    I agree to use this SWMS template responsibly and in compliance with all applicable 
                    workplace health and safety regulations and standards.
                  </Label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Limitation of Liability</h4>
                <p className="text-gray-700 text-sm">
                  The creators of this SWMS template system provide this tool for informational purposes only. 
                  Users are solely responsible for ensuring the accuracy, completeness, and compliance of any 
                  SWMS document generated. The system providers accept no liability for any damages, injuries, 
                  or losses arising from the use of this template or the information contained within.
                </p>
              </div>

              <div className="mt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="disclaimer"
                    checked={formData.acceptedDisclaimer || false}
                    onCheckedChange={(checked) => updateFormData({ acceptedDisclaimer: checked })}
                    className="mt-1"
                  />
                  <Label htmlFor="disclaimer" className="text-sm leading-relaxed">
                    I have read, understood, and accept these terms and conditions. I acknowledge that this document requires professional review and site-specific customization before use, and I understand the limitations of liability outlined above.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 8:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <PenTool className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Signatures</h3>
            <p className="text-gray-600 text-sm">
              Add authorizing signatures for document validation
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Person Creating and Authorising SWMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creatorName">Name</Label>
                  <Input
                    id="creatorName"
                    value={formData.creatorName || ""}
                    onChange={(e) => updateFormData({ creatorName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="creatorPhone">Phone Number</Label>
                  <Input
                    id="creatorPhone"
                    value={formData.creatorPhone || ""}
                    onChange={(e) => updateFormData({ creatorPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Signature</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateFormData({ creatorSignatureMethod: 'upload' })}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      formData.creatorSignatureMethod === 'upload'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData({ creatorSignatureMethod: 'type' })}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      formData.creatorSignatureMethod === 'type'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    Type Name
                  </button>
                </div>

                {formData.creatorSignatureMethod === 'upload' && (
                  <div>
                    <Label htmlFor="creatorSignatureUpload" className="text-sm text-gray-700">
                      Upload signature image (PNG, JPG, GIF - Max 2MB)
                    </Label>
                    <input
                      id="creatorSignatureUpload"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('File size must be less than 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            updateFormData({ 
                              creatorSignatureImage: event.target?.result as string,
                              creatorSignatureText: null
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="mt-2 block w-full text-sm text-gray-500 
                        file:mr-4 file:py-2 file:px-4 
                        file:rounded-lg file:border-0 
                        file:text-sm file:font-medium 
                        file:bg-blue-50 file:text-blue-700 
                        hover:file:bg-blue-100"
                    />
                    {formData.creatorSignatureImage && (
                      <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
                        <p className="text-sm text-green-600 mb-2">✓ Signature uploaded successfully</p>
                        <img 
                          src={formData.creatorSignatureImage} 
                          alt="Creator signature" 
                          className="max-h-16 border border-gray-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => updateFormData({ creatorSignatureImage: null })}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove signature
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {formData.creatorSignatureMethod === 'type' && (
                  <div>
                    <Label htmlFor="creatorSignatureText" className="text-sm text-gray-700">
                      Type your full name as signature
                    </Label>
                    <Input
                      id="creatorSignatureText"
                      value={formData.creatorSignatureText || ""}
                      onChange={(e) => updateFormData({ 
                        creatorSignatureText: e.target.value,
                        creatorSignatureImage: null
                      })}
                      placeholder="Enter your full name"
                      className="mt-2 font-serif text-lg italic"
                    />
                    {formData.creatorSignatureText && (
                      <div className="mt-2 p-3 bg-white border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Signature preview:</p>
                        <div className="font-serif text-xl italic text-blue-900 border-b border-gray-300 pb-1 inline-block">
                          {formData.creatorSignatureText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 9:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Generation</h3>
            <p className="text-gray-600 text-sm">
              Your SWMS is being generated and will be available for download
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SWMS Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
                <h4 className="text-lg font-semibold text-green-800">SWMS Generated Successfully!</h4>
                <p className="text-gray-600">
                  Your Safe Work Method Statement has been created and is ready for use.
                </p>
                <Button size="lg" className="mt-4">
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return <div>Step {step} content goes here</div>;
  }
};

export default function SWMSForm({ step, data = {}, onNext, onDataChange, userData, isLoadingCredits, creditsError, setIsProcessingCredit }: SWMSFormProps) {
  const [isProcessingCredit, setIsProcessingCreditLocal] = useState(false);

  return (
    <StepContent 
      step={step}
      formData={data}
      onDataChange={onDataChange || (() => {})}
      onNext={onNext}
      isProcessingCredit={isProcessingCredit}
      setIsProcessingCredit={setIsProcessingCredit || setIsProcessingCreditLocal}
      userData={userData}
      isLoadingCredits={isLoadingCredits}
      creditsError={creditsError}
    />
  );
}
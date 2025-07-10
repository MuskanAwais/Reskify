import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Shield, Wrench, AlertTriangle, PenTool, Scale, CreditCard } from "lucide-react";
import FinalStepComponent from "./FinalStepComponent";

interface SwmsFormProps {
  step: number;
  data: any;
  onDataChange: (data: any) => void;
  onNext?: () => void;
  userData?: any;
  isLoadingCredits?: boolean;
  creditsError?: any;
  setIsProcessingCredit?: (value: boolean) => void;
}

const TRADE_TYPES = [
  "General", "Electrical", "Plumbing", "Carpentry", "Tiling & Waterproofing", "Concrete", "Steel", "Roofing",
  "HVAC", "Painting", "Landscaping", "Demolition", "Excavation", "Scaffolding", "Flooring", "Glazing",
  "Insulation", "Drywall", "Plastering", "Mechanical", "Fire Protection", "Civil Works", "Paving",
  "Fencing", "Waterproofing", "Structural", "Masonry", "Crane Operations", "Multi-Trade"
];

const HRCW_CATEGORIES = [
  { id: 1, title: "Risk of a person falling more than 2 metres", description: "Work on ladders, scaffolding, roofs, elevated platforms" },
  { id: 2, title: "Work on a telecommunication tower", description: "Telecommunication infrastructure work" },
  { id: 3, title: "Demolition of load-bearing elements", description: "Demolition affecting structural integrity" },
  { id: 4, title: "Work involving disturbance of asbestos", description: "Asbestos removal or disturbance work" },
  { id: 5, title: "Structural alterations requiring temporary support", description: "Alterations needing temporary structural support" },
  { id: 6, title: "Work in or near confined spaces", description: "Confined space entry or work nearby" },
  { id: 7, title: "Work in shafts, trenches or tunnels", description: "Excavation deeper than 1.5m or tunnel work" },
  { id: 8, title: "Work involving explosives", description: "Use of explosives for construction" },
  { id: 9, title: "Work on pressurised gas systems", description: "Gas distribution mains or piping work" },
  { id: 10, title: "Work on chemical, fuel or refrigerant lines", description: "Hazardous substance piping work" },
  { id: 11, title: "Work on energised electrical installations", description: "Live electrical work and installations" },
  { id: 12, title: "Work in contaminated or flammable atmospheres", description: "Areas with contaminated or explosive atmospheres" },
  { id: 13, title: "Tilt-up or precast concrete work", description: "Tilt-up or precast concrete element work" },
  { id: 14, title: "Work on roads with traffic management", description: "Road construction or maintenance with traffic control" },
  { id: 15, title: "Work involving diving operations", description: "Underwater construction or inspection work" },
  { id: 16, title: "Work in areas with extremes of temperature", description: "Hot work environments or cold storage areas" },
  { id: 17, title: "Work involving the use of hazardous chemicals", description: "Use of chemicals requiring special handling" },
  { id: 18, title: "Work involving ionising radiation", description: "Work with radioactive materials or X-ray equipment" }
];

const PPE_STANDARD = [
  { id: 'hard-hat', name: 'Hard Hat', description: 'AS/NZS 1801 compliant hard hat' },
  { id: 'hi-vis-vest', name: 'High-Visibility Vest', description: 'AS/NZS 4602.1 compliant high-visibility clothing' },
  { id: 'steel-cap-boots', name: 'Steel Cap Boots', description: 'AS/NZS 2210.3 compliant safety footwear' },
  { id: 'safety-glasses', name: 'Safety Glasses', description: 'AS/NZS 1337.1 compliant eye protection' },
  { id: 'gloves', name: 'Work Gloves', description: 'AS/NZS 2161 compliant general work gloves' },
  { id: 'hearing-protection', name: 'Hearing Protection', description: 'AS/NZS 1270 compliant hearing protection' },
  { id: 'long-pants', name: 'Long Pants', description: 'Full-length work pants' },
  { id: 'long-sleeve-shirt', name: 'Long Sleeve Shirt', description: 'Full-length sleeve work shirt' },
  { id: 'sunscreen', name: 'Sunscreen SPF 30+', description: 'Sun protection for outdoor work' },
  { id: 'water-bottle', name: 'Water Bottle', description: 'Hydration for hot weather work' }
];

const PPE_TASK_SPECIFIC = [
  { id: 'respirator', name: 'Respirator', description: 'AS/NZS 1716 compliant respiratory protection' },
  { id: 'face-shield', name: 'Face Shield', description: 'AS/NZS 1337.1 compliant face protection' },
  { id: 'cut-resistant-gloves', name: 'Cut Resistant Gloves', description: 'AS/NZS 2161.3 cut resistant gloves' },
  { id: 'chemical-resistant-gloves', name: 'Chemical Resistant Gloves', description: 'Chemical resistant protective gloves' },
  { id: 'fall-arrest-harness', name: 'Fall Arrest Harness', description: 'AS/NZS 1891 compliant fall protection' },
  { id: 'welding-helmet', name: 'Welding Helmet', description: 'AS/NZS 1338.1 compliant welding protection' },
  { id: 'knee-pads', name: 'Knee Pads', description: 'Protective knee pads for kneeling work' },
  { id: 'dust-mask', name: 'Dust Mask', description: 'P2 dust mask for dusty conditions' },
  { id: 'non-slip-footwear', name: 'Non-Slip Footwear', description: 'Enhanced grip safety footwear' },
  { id: 'chemical-resistant-apron', name: 'Chemical Resistant Apron', description: 'Chemical splash protection' },
  { id: 'impact-goggles', name: 'Impact Goggles', description: 'Enhanced impact protection eyewear' },
  { id: 'ear-canal-protectors', name: 'Ear Canal Protectors', description: 'Foam or silicone ear protection' },
  { id: 'confined-space-breathing-apparatus', name: 'Confined Space Breathing Apparatus', description: 'Self-contained breathing apparatus' },
  { id: 'flame-resistant-clothing', name: 'Flame Resistant Clothing', description: 'FR clothing for hot work' },
  { id: 'arc-flash-suit', name: 'Arc Flash Suit', description: 'Electrical arc protection suit' }
];

export default function SwmsForm({ 
  step, 
  data, 
  onDataChange, 
  onNext, 
  userData, 
  isLoadingCredits, 
  creditsError, 
  setIsProcessingCredit 
}: SwmsFormProps) {
  
  const updateData = (newData: any) => {
    onDataChange({ ...data, ...newData });
  };

  // Handle step 9 specifically with the new FinalStepComponent
  if (step === 9) {
    return (
      <FinalStepComponent 
        formData={data} 
        onDataChange={onDataChange} 
        onNext={onNext}
      />
    );
  }

  // Step 1: Project & Contractor Details
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <ClipboardList className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Project & Contractor Details</h3>
          <p className="text-gray-600">Enter project information and contractor details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobName">Job Name *</Label>
                <Input
                  id="jobName"
                  value={data.jobName || ''}
                  onChange={(e) => updateData({ jobName: e.target.value })}
                  placeholder="Enter job name"
                />
              </div>
              <div>
                <Label htmlFor="jobNumber">Job Number</Label>
                <Input
                  id="jobNumber"
                  value={data.jobNumber || ''}
                  onChange={(e) => updateData({ jobNumber: e.target.value })}
                  placeholder="Enter job number"
                />
              </div>
              <div>
                <Label htmlFor="projectAddress">Project Address *</Label>
                <Input
                  id="projectAddress"
                  value={data.projectAddress || ''}
                  onChange={(e) => updateData({ projectAddress: e.target.value })}
                  placeholder="Enter project address"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={data.startDate || ''}
                  onChange={(e) => updateData({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={data.duration || ''}
                  onChange={(e) => updateData({ duration: e.target.value })}
                  placeholder="e.g., 2 weeks"
                />
              </div>
              <div>
                <Label htmlFor="tradeType">Trade Type *</Label>
                <Select value={data.tradeType || ''} onValueChange={(value) => updateData({ tradeType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_TYPES.map(trade => (
                      <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workDescription">Work Description *</Label>
                <Textarea
                  id="workDescription"
                  value={data.workDescription || ''}
                  onChange={(e) => updateData({ workDescription: e.target.value })}
                  placeholder="Describe the work to be performed"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Personnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="principalContractor">Principal Contractor *</Label>
                <Input
                  id="principalContractor"
                  value={data.principalContractor || ''}
                  onChange={(e) => updateData({ principalContractor: e.target.value })}
                  placeholder="Enter principal contractor name"
                />
              </div>
              <div>
                <Label htmlFor="projectManager">Project Manager *</Label>
                <Input
                  id="projectManager"
                  value={data.projectManager || ''}
                  onChange={(e) => updateData({ projectManager: e.target.value })}
                  placeholder="Enter project manager name"
                />
              </div>
              <div>
                <Label htmlFor="siteSupervisor">Site Supervisor *</Label>
                <Input
                  id="siteSupervisor"
                  value={data.siteSupervisor || ''}
                  onChange={(e) => updateData({ siteSupervisor: e.target.value })}
                  placeholder="Enter site supervisor name"
                />
              </div>
              <div>
                <Label htmlFor="swmsCreatorName">SWMS Creator Name</Label>
                <Input
                  id="swmsCreatorName"
                  value={data.swmsCreatorName || ''}
                  onChange={(e) => updateData({ swmsCreatorName: e.target.value })}
                  placeholder="Enter SWMS creator name"
                />
              </div>
              <div>
                <Label htmlFor="swmsCreatorPosition">SWMS Creator Position</Label>
                <Input
                  id="swmsCreatorPosition"
                  value={data.swmsCreatorPosition || ''}
                  onChange={(e) => updateData({ swmsCreatorPosition: e.target.value })}
                  placeholder="Enter SWMS creator position"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Work Activities & Risk Assessment
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Shield className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Work Activities & Risk Assessment</h3>
          <p className="text-gray-600">Generate tasks with high-risk work selection and manage comprehensive risk assessments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-600">
              <p>Work activities will be generated here. This includes AI-powered task generation and risk assessment.</p>
              <p className="mt-2">Current activities: {Array.isArray(data.activities) ? data.activities.length : (typeof data.activities === 'number' ? data.activities : 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: High-Risk Construction Work
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">High-Risk Construction Work</h3>
          <p className="text-gray-600">Select applicable high-risk construction work categories</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>HRCW Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HRCW_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    id={`hrcw-${category.id}`}
                    checked={data.hrcwCategories?.includes(category.id) || false}
                    onCheckedChange={(checked) => {
                      const current = data.hrcwCategories || [];
                      if (checked) {
                        updateData({ hrcwCategories: [...current, category.id] });
                      } else {
                        updateData({ hrcwCategories: current.filter(id => id !== category.id) });
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`hrcw-${category.id}`} className="font-medium text-sm">
                      {category.title}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Personal Protective Equipment
  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Shield className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Personal Protective Equipment</h3>
          <p className="text-gray-600">Select required PPE for this work</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standard PPE Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PPE_STANDARD.map(item => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-green-50">
                    <Checkbox 
                      id={`ppe-${item.id}`}
                      checked={data.ppeRequirements?.includes(item.id) || false}
                      onCheckedChange={(checked) => {
                        const current = data.ppeRequirements || [];
                        if (checked) {
                          updateData({ ppeRequirements: [...current, item.id] });
                        } else {
                          updateData({ ppeRequirements: current.filter(id => id !== item.id) });
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`ppe-${item.id}`} className="font-medium text-sm">
                        {item.name}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task-Specific PPE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PPE_TASK_SPECIFIC.map(item => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-yellow-50">
                    <Checkbox 
                      id={`ppe-task-${item.id}`}
                      checked={data.ppeRequirements?.includes(item.id) || false}
                      onCheckedChange={(checked) => {
                        const current = data.ppeRequirements || [];
                        if (checked) {
                          updateData({ ppeRequirements: [...current, item.id] });
                        } else {
                          updateData({ ppeRequirements: current.filter(id => id !== item.id) });
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`ppe-task-${item.id}`} className="font-medium text-sm">
                        {item.name}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 5: Plant & Equipment Register
  if (step === 5) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Wrench className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Plant & Equipment Register</h3>
          <p className="text-gray-600">Register all plant and equipment to be used</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plant & Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-600">
              <p>Plant and equipment registration will be implemented here.</p>
              <p className="mt-2">This includes tools, machinery, and equipment required for the work.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 6: Emergency Procedures & Monitoring
  if (step === 6) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Emergency Procedures & Monitoring</h3>
          <p className="text-gray-600">Define emergency procedures and monitoring requirements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Procedures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emergencyProcedures">Emergency Procedures</Label>
              <Textarea
                id="emergencyProcedures"
                value={data.emergencyProcedures || ''}
                onChange={(e) => updateData({ emergencyProcedures: e.target.value })}
                placeholder="Describe emergency procedures"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="monitoringRequirements">Monitoring Requirements</Label>
              <Textarea
                id="monitoringRequirements"
                value={data.monitoringRequirements || ''}
                onChange={(e) => updateData({ monitoringRequirements: e.target.value })}
                placeholder="Describe monitoring requirements"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 7: Signatures
  if (step === 7) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <PenTool className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Signatures</h3>
          <p className="text-gray-600">Add authorizing signatures for document validation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Digital Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-600">
              <p>Digital signature functionality will be implemented here.</p>
              <p className="mt-2">This includes signature capture and validation.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 8: Legal Disclaimer & Payment
  if (step === 8) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Scale className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Legal Disclaimer & Payment</h3>
          <p className="text-gray-600">Review legal terms and process payment</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment & Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-600">
              <p>Payment processing and legal disclaimer will be implemented here.</p>
              <p className="mt-2">This includes credit usage and payment options.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Step {step}</h3>
        <p className="text-gray-600">Step {step} content will be implemented here</p>
      </div>
      
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">
            Step {step} content is being developed. 
            This is a placeholder that will be replaced with the actual step content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
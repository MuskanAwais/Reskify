import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SwmsForm from "@/components/swms/swms-form";
import DocumentPreview from "@/components/swms/document-preview";
import { SimplifiedTableEditor } from "@/components/swms/simplified-table-editor";
import EmbeddedPDFEditor from "@/components/swms/embedded-pdf-editor";
import CreditCounter from "@/components/ui/credit-counter";

import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, Save, X, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { translate } from "@/lib/language-direct";

// 18 Categories of High-Risk Construction Work (HRCW) - WHS Regulations 2011 (Regulation 291)
const HRCW_CATEGORIES = [
  { 
    id: 1, 
    title: "Risk of a person falling more than 2 metres",
    description: "Work on ladders, scaffolding, roofs, elevated platforms",
    keywords: ["ladder", "scaffolding", "roof", "height", "elevated", "fall", "working at height", "platform", "tower"]
  },
  { 
    id: 2, 
    title: "Work on a telecommunication tower",
    description: "Telecommunication infrastructure work",
    keywords: ["telecommunication", "tower", "antenna", "communication", "mobile tower", "radio"]
  },
  { 
    id: 3, 
    title: "Demolition of load-bearing elements",
    description: "Demolition affecting structural integrity",
    keywords: ["demolition", "load-bearing", "structural", "wall", "beam", "column", "foundation"]
  },
  { 
    id: 4, 
    title: "Work involving disturbance of asbestos",
    description: "Asbestos removal or disturbance work",
    keywords: ["asbestos", "fibro", "removal", "disturbance", "hazardous material"]
  },
  { 
    id: 5, 
    title: "Structural alterations requiring temporary support",
    description: "Alterations needing temporary structural support",
    keywords: ["structural", "alteration", "temporary support", "propping", "shoring", "underpinning"]
  },
  { 
    id: 6, 
    title: "Work in or near confined spaces",
    description: "Confined space entry or work nearby",
    keywords: ["confined space", "tank", "vessel", "pit", "sewer", "tunnel", "enclosed"]
  },
  { 
    id: 7, 
    title: "Work in shafts, trenches or tunnels",
    description: "Excavation deeper than 1.5m or tunnel work",
    keywords: ["shaft", "trench", "tunnel", "excavation", "deep", "underground", "boring"]
  },
  { 
    id: 8, 
    title: "Work involving explosives",
    description: "Use of explosives for construction",
    keywords: ["explosive", "blasting", "detonation", "quarry", "mining"]
  },
  { 
    id: 9, 
    title: "Work on pressurised gas systems",
    description: "Gas distribution mains or piping work",
    keywords: ["gas", "pressurised", "pipeline", "distribution", "main", "natural gas"]
  },
  { 
    id: 10, 
    title: "Work on chemical, fuel or refrigerant lines",
    description: "Hazardous substance piping work",
    keywords: ["chemical", "fuel", "refrigerant", "pipeline", "hazardous", "toxic"]
  },
  { 
    id: 11, 
    title: "Work on energised electrical installations",
    description: "Live electrical work and installations",
    keywords: ["electrical", "energised", "live", "power", "installation", "switchboard", "high voltage"]
  },
  { 
    id: 12, 
    title: "Work in contaminated or flammable atmospheres",
    description: "Areas with contaminated or explosive atmospheres",
    keywords: ["contaminated", "flammable", "atmosphere", "explosive", "toxic", "hazardous air"]
  },
  { 
    id: 13, 
    title: "Tilt-up or precast concrete work",
    description: "Tilt-up or precast concrete element work",
    keywords: ["tilt-up", "precast", "concrete", "panel", "lifting", "crane"]
  },
  { 
    id: 14, 
    title: "Work adjacent to active traffic corridors",
    description: "Work near roads, railways in use",
    keywords: ["road", "railway", "traffic", "corridor", "highway", "active", "live traffic"]
  },
  { 
    id: 15, 
    title: "Work with powered mobile plant",
    description: "Areas with forklifts, excavators, cranes",
    keywords: ["mobile plant", "forklift", "excavator", "crane", "machinery", "powered equipment"]
  },
  { 
    id: 16, 
    title: "Work in extreme temperature areas",
    description: "Cold rooms, furnace areas, extreme temperatures",
    keywords: ["extreme temperature", "cold room", "furnace", "hot", "cold", "temperature"]
  },
  { 
    id: 17, 
    title: "Work near water with drowning risk",
    description: "Water or liquid work with drowning risk",
    keywords: ["water", "liquid", "drowning", "river", "dam", "pool", "flood"]
  },
  { 
    id: 18, 
    title: "Work on live electrical conductors",
    description: "Live electrical conductor work",
    keywords: ["live electrical", "conductor", "overhead", "powerline", "high voltage"]
  }
];

const getSteps = () => [
  { id: 1, title: "Project & Contractor Details", description: "Project information, contractor details, and high-risk work identification" },
  { id: 2, title: "Work Activities & Risk Assessment", description: "Generate tasks with HRCW selection and manage comprehensive risk assessments" },
  { id: 3, title: "Personal Protective Equipment", description: "Select required PPE based on work activities and risks" },
  { id: 4, title: "Plant, Equipment & Training", description: "Equipment specifications, training requirements, and permits" },
  { id: 5, title: "Emergency & Monitoring", description: "Emergency procedures and review/monitoring processes" },
  { id: 6, title: "Payment & Access", description: "Select payment option to complete SWMS generation" },
  { id: 7, title: "Legal Disclaimer", description: "Accept terms and liability disclaimer" },
  { id: 8, title: "PDF Template Editor", description: "Review and edit your SWMS document template before final generation" },
  { id: 9, title: "Digital Signatures & PDF", description: "Generate complete SWMS document with optional signatures" }
];

export default function SwmsBuilder() {
  const STEPS = getSteps();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    jobName: "",
    jobNumber: "",
    projectAddress: "",
    projectLocation: "",
    startDate: "",
    tradeType: "",
    swmsCreatorName: "", // Person creating and authorising SWMS
    swmsCreatorPosition: "", // Position of person creating SWMS
    principalContractor: "", // Principal contractor field
    projectManager: "", // Project manager field
    siteSupervisor: "", // Site supervisor field
    activities: [],
    hazards: [],
    riskAssessments: [],
    paidAccess: false, // Track if payment completed
    safetyMeasures: [],
    complianceCodes: [],
    acceptedDisclaimer: false,
    selectedTasks: [],
    workDescription: "",
    plantEquipment: [],
    signatures: [],
    emergencyProcedures: [],
    generalRequirements: [],
    hrcwCategories: [], // Auto-detected High-Risk Construction Work categories
    ppeRequirements: [] // Auto-detected PPE requirements
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const isAdminMode = urlParams.get('admin') === 'true';
    
    if (editId) {
      // Load draft from database for editing (admin can edit completed documents)
      loadDraftMutation.mutate(parseInt(editId));
      
      // Store admin mode for later use
      if (isAdminMode) {
        localStorage.setItem('swms-admin-mode', 'true');
      }
    } else {
      // Starting new SWMS - clear everything and start fresh
      setDraftId(null);
      setIsDraft(false);
      setCurrentStep(1);
      // Clear localStorage for fresh start
      localStorage.removeItem('swms-form-data');
      localStorage.removeItem('swms-admin-mode');
      // Keep initial empty form data
    }
    
    // Parse step from URL
    const step = parseInt(urlParams.get('step') || '1');
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  // Auto-detect HRCW categories based on activities
  const detectHRCWCategories = (activities: any[]) => {
    const detectedCategories = new Set<number>();
    
    activities.forEach(activity => {
      const activityText = `${activity.task || ''} ${activity.hazards?.join(' ') || ''} ${activity.controlMeasures?.join(' ') || ''}`.toLowerCase();
      
      HRCW_CATEGORIES.forEach(category => {
        const hasMatch = category.keywords.some(keyword => 
          activityText.includes(keyword.toLowerCase())
        );
        
        if (hasMatch) {
          detectedCategories.add(category.id);
        }
      });
    });
    
    return Array.from(detectedCategories);
  };

  // Auto-detect PPE requirements based on activities and HRCW
  const detectPPERequirements = (activities: any[], hrcwCategories: number[] = []) => {
    const detectedPPE = new Set<string>();
    
    // Always include standard PPE
    const standardPPE = [
      'hard-hat', 'hi-vis-vest', 'steel-cap-boots', 'safety-glasses', 
      'gloves', 'hearing-protection', 'long-pants', 'long-sleeve-shirt'
    ];
    standardPPE.forEach(ppe => detectedPPE.add(ppe));
    
    // Activity-based detection
    activities.forEach(activity => {
      // Handle different activity object structures
      const activityText = `
        ${activity.task || activity.name || activity.description || ''} 
        ${activity.hazards?.map(h => h.description || h).join(' ') || ''} 
        ${activity.controlMeasures?.join(' ') || ''} 
        ${activity.ppe?.join(' ') || ''}
        ${activity.tools?.join(' ') || ''}
        ${JSON.stringify(activity).toLowerCase()}
      `.toLowerCase();
      
      // Height work - Only for actual elevated work above 2m, not bathroom tiling
      if ((activityText.includes('height') || activityText.includes('ladder') || activityText.includes('scaffold') || activityText.includes('roof')) &&
          !activityText.includes('bathroom') && !activityText.includes('ground level') &&
          (activityText.includes('>2m') || activityText.includes('storey') || activityText.includes('elevated platform'))) {
        detectedPPE.add('fall-arrest-harness');
        detectedPPE.add('safety-harness-lanyard');
      }
      
      // Welding - Only for actual welding/torching, not tile cutting
      if ((activityText.includes('weld') || activityText.includes('torch')) && 
          !activityText.includes('tile') && !activityText.includes('grinder') && !activityText.includes('cutter')) {
        detectedPPE.add('welding-helmet-gloves');
        detectedPPE.add('fire-retardant-clothing');
      }
      
      // Electrical - Only for actual electrical work, not power tools
      if ((activityText.includes('electrical') || activityText.includes('wiring')) && 
          !activityText.includes('tool') && !activityText.includes('grinder') && !activityText.includes('cutter')) {
        detectedPPE.add('insulated-gloves');
        detectedPPE.add('anti-static-clothing');
      }
      
      // Chemical/dust
      if (activityText.includes('dust') || activityText.includes('chemical') || activityText.includes('fume')) {
        detectedPPE.add('dust-mask');
        detectedPPE.add('respirator');
      }
      
      // Confined space
      if (activityText.includes('confined') || activityText.includes('tank') || activityText.includes('vessel')) {
        detectedPPE.add('confined-space-breathing-apparatus');
      }
      
      // Cutting/glass
      if (activityText.includes('cut') || activityText.includes('glass') || activityText.includes('sharp')) {
        detectedPPE.add('cut-resistant-gloves');
        detectedPPE.add('face-shield');
      }
      
      // Demolition/grinding
      if (activityText.includes('demolit') || activityText.includes('grind') || activityText.includes('hammer')) {
        detectedPPE.add('impact-goggles');
        detectedPPE.add('ear-canal-protectors');
      }
      
      // Wet conditions
      if (activityText.includes('wet') || activityText.includes('water') || activityText.includes('rain')) {
        detectedPPE.add('non-slip-footwear');
      }
      
      // Tiling work - More selective for commercial bathroom work
      if ((activityText.includes('tile') || activityText.includes('tiling') || 
          activityText.includes('kneel') || activityText.includes('grouting')) &&
          // Exclude if it's height work or industrial
          !activityText.includes('height') && !activityText.includes('scaffold') && 
          !activityText.includes('industrial') && !activityText.includes('fall')) {
        detectedPPE.add('knee-pads');
      }
      
      // Chemical protection - Only for intensive chemical work
      if ((activityText.includes('waterproof') || activityText.includes('membrane') || 
          activityText.includes('solvent') || activityText.includes('acid')) &&
          !activityText.includes('basic') && !activityText.includes('minor')) {
        detectedPPE.add('chemical-resistant-apron');
      }
    });
    
    // HRCW-based detection - Only add if actually relevant to the work activities
    const jobDescription = formData.plainTextDescription?.toLowerCase() || '';
    const isActualHeightWork = activities.some(activity => {
      const text = `${activity.name} ${activity.description}`.toLowerCase();
      return (text.includes('>2m') || text.includes('storey') || text.includes('elevated platform') || 
              text.includes('scaffold')) && !text.includes('bathroom') && !text.includes('ground level');
    });
    
    if (hrcwCategories.includes(1) && isActualHeightWork) detectedPPE.add('fall-arrest-harness'); // Fall risk - only if actual height work
    if (hrcwCategories.includes(4)) detectedPPE.add('respirator'); // Asbestos
    if (hrcwCategories.includes(6) && !jobDescription.includes('bathroom') && !jobDescription.includes('commercial bathroom')) detectedPPE.add('confined-space-breathing-apparatus'); // Confined space - not bathrooms
    if (hrcwCategories.includes(11) || hrcwCategories.includes(18)) {
      const hasElectricalWork = activities.some(activity => {
        const text = `${activity.name} ${activity.description}`.toLowerCase();
        return (text.includes('electrical') || text.includes('wiring')) && !text.includes('tool') && !text.includes('grinder');
      });
      if (hasElectricalWork) {
        detectedPPE.add('insulated-gloves'); // Electrical - only if actual electrical work
        detectedPPE.add('anti-static-clothing');
      }
    }
    if (hrcwCategories.includes(12)) detectedPPE.add('respirator'); // Contaminated atmosphere
    
    return Array.from(detectedPPE);
  };

  // Auto-detect HRCW when activities change
  useEffect(() => {
    if (formData.activities.length > 0) {
      const detectedCategories = detectHRCWCategories(formData.activities);
      if (detectedCategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          hrcwCategories: detectedCategories
        }));
      }
    }
  }, [formData.activities]);

  // Auto-detect PPE when activities or HRCW change
  useEffect(() => {
    if (formData.activities.length > 0 || (formData.hrcwCategories && formData.hrcwCategories.length > 0)) {
      const detectedPPE = detectPPERequirements(formData.activities, formData.hrcwCategories || []);
      console.log('PPE Detection - Activities:', formData.activities.length);
      console.log('PPE Detection - Detected:', detectedPPE);
      setFormData(prev => ({
        ...prev,
        ppeRequirements: Array.from(detectedPPE)
      }));
    }
  }, [formData.activities, formData.hrcwCategories]);

  // Load draft mutation
  const loadDraftMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("GET", `/api/swms/draft/${id}`);
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data) {
        console.log('Draft data loaded for editing:', data);
        
        // Check admin mode from localStorage
        const isAdminMode = localStorage.getItem('swms-admin-mode') === 'true';
        
        // Check if this document has already been paid for
        const hasPaidAccess = data.paidAccess === true || data.status === 'completed';
        
        // Admin can edit completed documents
        const canEdit = !hasPaidAccess || isAdminMode;
        
        if (hasPaidAccess && !isAdminMode) {
          toast({
            title: "Access Denied",
            description: "This SWMS document has been completed and cannot be edited. Only administrators can edit completed documents.",
            variant: "destructive",
          });
          window.location.href = '/my-swms';
          return;
        }
        
        // Map database fields to form structure, preserving all saved data
        const mappedData = {
          ...formData, // Keep existing form structure
          id: data.id,
          // Keep all Step 1 fields from saved draft
          title: data.title || data.jobName || '',
          jobName: data.jobName || '',
          jobNumber: data.jobNumber || '',
          projectAddress: data.projectAddress || '',
          projectLocation: data.projectLocation || '',
          startDate: data.startDate || '',
          principalContractor: data.principalContractor || '',
          projectManager: data.projectManager || '',
          siteSupervisor: data.siteSupervisor || '',
          swmsCreatorName: data.swmsCreatorName || '',
          swmsCreatorPosition: data.swmsCreatorPosition || '',
          workDescription: data.projectDescription || '',
          // Keep other data from the saved draft
          tradeType: data.tradeType || '',
          customTradeType: data.customTradeType || '',
          responsiblePersons: data.responsiblePersons || [],
          activities: data.activities || data.workActivities || [],
          selectedTasks: data.activities || data.workActivities || [],
          riskAssessments: data.riskAssessments || [],
          safetyMeasures: data.safetyMeasures || [],
          emergencyProcedures: data.emergencyProcedures || [],
          complianceCodes: data.complianceCodes || [],
          plantEquipment: data.plantEquipment || [],
          monitoringRequirements: data.monitoringRequirements || [],
          generalRequirements: data.generalRequirements || [],
          acceptedDisclaimer: data.acceptedDisclaimer || false,
          signatures: data.signatures || [],
          draftId: data.id,
          paidAccess: hasPaidAccess,
          hrcwCategories: data.hrcwCategories || [],
          ppeRequirements: data.ppeRequirements || []
        };
        
        console.log('Mapped form data for editing (all data preserved):', mappedData);
        setFormData(mappedData);
        setDraftId(data.id);
        setIsDraft(true);
        
        // Set current step - start at step 1 to re-enter project details
        setCurrentStep(1);
        
        toast({
          title: isAdminMode ? "Admin Edit Mode" : "Draft Loaded for Editing",
          description: isAdminMode 
            ? `Admin editing "${data.title || 'SWMS Document'}" - Full edit access granted.`
            : hasPaidAccess 
              ? `Editing "${data.title || 'SWMS Document'}" - Payment step will be skipped.`
              : `Editing "${data.title || 'SWMS Document'}" - Please re-enter project details.`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to load draft:', error);
      toast({
        title: "Error",
        description: "Failed to load draft SWMS document.",
        variant: "destructive",
      });
    },
  });

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('swms-form-data', JSON.stringify(formData));
  }, [formData]);

  // Check user subscription for feature access
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  // Get current user data for real-time credit balance
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user']
  });

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Silent auto-save mutation (no notifications)
  const autoSaveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Prevent concurrent saves
      if (isSaving) {
        console.log('Auto-save skipped - already saving');
        return { id: draftId, message: 'Save already in progress' };
      }
      
      setIsSaving(true);
      try {
        const requestData = {
          ...data,
          userId: 999, // Demo user ID
          status: "draft",
          currentStep,
          projectName: data.jobName || data.title || "Untitled SWMS",
          title: data.jobName || data.title || "Untitled SWMS",
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        
        // Only include draftId if it exists (for updates)
        if (draftId) {
          requestData.draftId = draftId;
          console.log('Auto-save using existing draftId:', draftId);
        } else {
          console.log('Auto-save creating new document (no draftId)');
        }
        
        const response = await apiRequest("POST", "/api/swms/draft", requestData);
        if (!response.ok) {
          throw new Error('Failed to auto-save draft');
        }
        return response.json();
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: (data: any) => {
      // Set draftId on first save to update same document during session
      if (data?.id && !draftId) {
        setDraftId(data.id);
        setIsDraft(true);
      }
      // Invalidate both possible query keys to ensure refresh
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-swms"] });
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
  });

  // Manual save mutation (with notifications)
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      // Prevent concurrent saves
      if (isSaving) {
        throw new Error('Save already in progress');
      }
      
      setIsSaving(true);
      try {
        const requestData = {
          ...data,
          userId: 999, // Demo user ID
          status: "draft",
          currentStep,
          projectName: data.jobName || data.title || "Untitled SWMS",
          title: data.jobName || data.title || "Untitled SWMS",
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        
        // Include draftId if it exists
        if (draftId) {
          requestData.draftId = draftId;
        }
        
        const response = await apiRequest("POST", "/api/swms/draft", requestData);
        if (!response.ok) {
          throw new Error('Failed to save draft');
        }
        return response.json();
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: (data: any) => {
      // Set draftId on first save to update same document during session
      if (data?.id && !draftId) {
        setDraftId(data.id);
        setIsDraft(true);
      }
      toast({
        title: "Draft Saved",
        description: "Your SWMS has been saved as a draft.",
      });
      // Invalidate both possible query keys to ensure refresh
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-swms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-documents"] });
    },
    onError: (error) => {
      console.error('Draft save error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Debounced auto-save to prevent excessive API calls
  const debouncedAutoSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // More inclusive condition for Step 1 fields to ensure auto-save triggers
          const hasSignificantData = data.title || data.jobName || data.tradeType || 
                                    data.projectAddress || data.jobNumber || data.startDate ||
                                    data.swmsCreatorName || data.principalContractor ||
                                    data.projectManager || data.siteSupervisor;
          
          if (hasSignificantData) {
            console.log('Auto-saving with data:', Object.keys(data).filter(key => data[key]));
            autoSaveMutation.mutate(data);
          }
        }, 1000); // Save after 1 second of inactivity
      };
    })(),
    [autoSaveMutation]
  );

  // Auto-save when moving between steps
  const autoSave = () => {
    const hasSignificantData = formData.title || formData.jobName || formData.tradeType || 
                              formData.projectAddress || formData.jobNumber || formData.startDate ||
                              formData.swmsCreatorName || formData.principalContractor ||
                              formData.projectManager || formData.siteSupervisor;
                              
    if (hasSignificantData) {
      console.log('Auto-saving draft with form data:', formData);
      debouncedAutoSave(formData);
    } else {
      console.log('Skipping auto-save - insufficient data');
    }
  };

  // Auto-save when form data changes (debounced to prevent excessive API calls)
  useEffect(() => {
    // Skip auto-save on initial mount or if no significant data exists
    // Include more Step 1 fields to ensure proper auto-save triggers
    const hasSignificantData = formData.jobName || formData.title || formData.tradeType || 
                              formData.projectAddress || formData.jobNumber || formData.startDate ||
                              formData.swmsCreatorName || formData.principalContractor ||
                              formData.projectManager || formData.siteSupervisor;
    
    if (!hasSignificantData) {
      return;
    }
    
    // Trigger debounced auto-save whenever form data changes
    console.log('Form data changed, triggering auto-save...');
    debouncedAutoSave(formData);
  }, [formData, debouncedAutoSave]);

  // Validation function for step 1
  const validateStep1 = () => {
    const errors: string[] = [];
    
    if (!formData.jobName?.trim()) {
      errors.push("Job Name is required");
    }
    if (!formData.jobNumber?.trim()) {
      errors.push("Job Number is required");
    }
    if (!formData.projectAddress?.trim()) {
      errors.push("Project Address is required");
    }
    if (!formData.tradeType?.trim()) {
      errors.push("Trade Type is required");
    }
    if (!formData.swmsCreatorName?.trim()) {
      errors.push("SWMS Creator Name is required");
    }
    if (!formData.swmsCreatorPosition?.trim()) {
      errors.push("SWMS Creator Position is required");
    }
    if (!formData.principalContractor?.trim()) {
      errors.push("Principal Contractor is required");
    }
    if (!formData.projectManager?.trim()) {
      errors.push("Project Manager is required");
    }
    if (!formData.siteSupervisor?.trim()) {
      errors.push("Site Supervisor is required");
    }
    
    return errors;
  };

  // Enhanced validation functions for each step
  const validateStep2 = () => {
    const errors: string[] = [];
    // Check for either selectedTasks (new documents) or activities (existing documents)
    const hasTasks = (formData.selectedTasks && formData.selectedTasks.length > 0) || 
                     (formData.activities && formData.activities.length > 0);
    
    if (!hasTasks) {
      errors.push("At least one work activity must be selected");
    }
    return errors;
  };

  const validateStep3 = () => {
    const errors: string[] = [];
    // HRCW step validation - optional as it's auto-detected
    return errors;
  };

  const validateStep4 = () => {
    const errors: string[] = [];
    // PPE step validation - optional as it's auto-detected
    return errors;
  };

  const validateStep5 = () => {
    const errors: string[] = [];
    if (!formData.plantEquipment || formData.plantEquipment.length === 0) {
      errors.push("Plant and equipment information is required");
    }
    return errors;
  };

  const validateStep6 = () => {
    const errors: string[] = [];
    if (!formData.emergencyProcedures || formData.emergencyProcedures.length === 0) {
      errors.push("Emergency procedures must be defined");
    }
    return errors;
  };

  const validateStep8 = () => {
    const errors: string[] = [];
    if (!formData.acceptedDisclaimer) {
      errors.push("Legal disclaimer must be accepted");
    }
    return errors;
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    let errors: string[] = [];
    
    if (currentStep === 1) {
      errors = validateStep1();
    } else if (currentStep === 2) {
      errors = validateStep2();
    } else if (currentStep === 3) {
      errors = validateStep3();
    } else if (currentStep === 5) {
      errors = validateStep5();
    } else if (currentStep === 6) {
      errors = validateStep6();
    } else if (currentStep === 8) {
      errors = validateStep8();
    }

    if (errors.length > 0) {
      toast({
        title: "Missing Required Information",
        description: "Please complete all required fields: " + errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    // Handle emergency step (step 5) - no special validation required
    if (currentStep === 5) {
      // Emergency procedures are optional - proceed normally
    }
    
    // Handle proceeding from payment step (step 6) - STRICT VALIDATION
    if (currentStep === 6) {
      // If this document already has paid access, skip payment step entirely
      if (formData.paidAccess === true) {
        console.log('Payment step skipped - document already has paid access');
        // Skip to step 7 (Legal Disclaimer)
        setCurrentStep(7);
        return;
      }
      
      // Use current user data for real-time credit balance  
      const creditsRemaining = currentUser ? (currentUser as any).swmsCredits || 0 : 0;
      const hasProPlan = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";
      const isAdminDemo = localStorage.getItem('adminDemoMode') === 'true';
      const isAppAdmin = localStorage.getItem('isAppAdmin') === 'true';
      
      // STRICT: Only allow if user has credits, pro plan, or admin demo mode
      if (!((isAppAdmin && isAdminDemo) || creditsRemaining > 0 || hasProPlan)) {
        toast({
          title: "Payment Required",
          description: "Please complete payment or use available credits to proceed.",
          variant: "destructive",
        });
        return;
      }
      
      // Allow admin to bypass payment in demo mode OR if user has credits
      if ((isAppAdmin && isAdminDemo) || creditsRemaining > 0 || hasProPlan) {
        // Admin demo mode or user has credits - skip payment validation
        console.log('Payment validation bypassed - demo mode or credits available');
      } else {
        // Redirect to payment page if no credits and not in admin demo mode
        setLocation("/payment");
        return;
      }
    }
    
    // Validate legal disclaimer acceptance before proceeding from step 7 (legal disclaimer step)
    if (currentStep === 7 && !formData.acceptedDisclaimer) {
      toast({
        title: "Legal Disclaimer Required",
        description: "You must accept the legal disclaimer to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Auto-save before moving to next step
    if (formData.title || formData.jobName || formData.tradeType) {
      try {
        await autoSaveMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }
    
    if (currentStep < STEPS.length) {
      const nextStep = currentStep + 1;
      
      // Skip payment step (step 6) if document already has paid access
      if (nextStep === 6 && formData.paidAccess === true) {
        console.log('Skipping payment step - document already has paid access');
        setCurrentStep(7); // Go directly to Legal Disclaimer
      } else {
        setCurrentStep(nextStep);
      }
    }
  };

  const handleSaveAndClose = () => {
    saveDraftMutation.mutate(formData);
    setTimeout(() => {
      setLocation("/my-swms");
    }, 1000);
  };

  // Function to start a new SWMS (clear existing draft)
  const handleCreateNew = () => {
    setDraftId(null);
    setIsDraft(false);
    setCurrentStep(1);
    setFormData({
      title: "",
      jobName: "",
      jobNumber: "",
      projectAddress: "",
      projectLocation: "",
      startDate: "",
      tradeType: "",
      swmsCreatorName: "",
      swmsCreatorPosition: "",
      activities: [],
      hazards: [],
      riskAssessments: [],
      paidAccess: false,
      safetyMeasures: [],
      complianceCodes: [],
      acceptedDisclaimer: false,
      selectedTasks: [],
      workDescription: "",
      plantEquipment: [],
      signatures: [],
      emergencyProcedures: [],
      generalRequirements: [],
      hrcwCategories: [],
      ppeRequirements: []
    });
    
    // Clear localStorage
    localStorage.removeItem('swms-form-data');
    
    // Clear URL parameters
    setLocation("/swms-builder");
    
    toast({
      title: "New SWMS Started",
      description: "Starting fresh SWMS document.",
    });
  };

  // Check if user has access to AI generation (Pro+ only)
  const hasAIAccess = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";
  
  // Check if user has access to custom branding (Pro+ only)
  const hasCustomBranding = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";

  // Handle AI-generated SWMS data on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAiGenerated = urlParams.get('ai') === 'true';
    const startStep = parseInt(urlParams.get('step') || '1');
    
    if (isAiGenerated) {
      const aiData = sessionStorage.getItem('aiGeneratedSwmsData');
      if (aiData) {
        try {
          const parsedData = JSON.parse(aiData);
          setFormData(parsedData);
          setCurrentStep(startStep);
          sessionStorage.removeItem('aiGeneratedSwmsData');
        } catch (error) {
          console.error('Failed to parse AI-generated SWMS data:', error);
        }
      }
    } else {
      // Clear form data when starting fresh to prevent carrying over project details
      setFormData({
        title: "",
        jobName: "",
        jobNumber: "",
        projectAddress: "",
        projectLocation: "",
        tradeType: "",
        startDate: "",
        swmsCreatorName: "",
        swmsCreatorPosition: "",
        workDescription: "",
        activities: [],
        hazards: [],
        riskAssessments: [],
        safetyMeasures: [],
        complianceCodes: [],
        plantEquipment: [],
        signatures: [],
        emergencyProcedures: [],
        generalRequirements: [],
        acceptedDisclaimer: false,
        selectedTasks: []
      });
    }
  }, []);

  const handlePrevious = async () => {
    // Auto-save before moving to previous step
    if (formData.title || formData.jobName || formData.tradeType) {
      try {
        await autoSaveMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }
    
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setLocation(`/swms-builder?step=${newStep}`);
    }
  };

  const handleStepClick = async (stepId: number) => {
    // Allow backward navigation to any completed step
    if (stepId <= currentStep) {
      // Auto-save before step change
      if (formData.title || formData.jobName || formData.tradeType) {
        try {
          await autoSaveMutation.mutateAsync(formData);
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }
      
      setCurrentStep(stepId);
      setLocation(`/swms-builder?step=${stepId}`);
      // Scroll to top when navigating to any step
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Prevent jumping ahead - show helpful message
    if (stepId > currentStep) {
      const stepNames = ['Project Details', 'Work Activities', 'Plant & Equipment', 'Emergency & Monitoring', 'Payment', 'Legal Disclaimer', 'Digital Signatures'];
      toast({
        title: "Complete Current Step First",
        description: `Please complete "${stepNames[currentStep - 1]}" before proceeding to "${stepNames[stepId - 1]}".`,
        variant: "destructive",
      });
      return;
    }
  };

  const handleFormDataChange = (data: any) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    
    // Silent auto-save with debouncing
    debouncedAutoSave(newFormData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{translate("swms.builder")}</h2>
          <p className="text-gray-600">{translate("swms.create.comprehensive")}</p>
          {isDraft && (
            <p className="text-sm text-amber-600 font-medium">Draft saved automatically</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveAndClose}
            disabled={saveDraftMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saveDraftMutation.isPending ? "Saving..." : translate("swms.save.close")}
          </Button>
          <Badge variant="outline" className="bg-green-50 text-primary border-primary/20">
            {translate("swms.step")} {currentStep} {translate("swms.of")} {STEPS.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{translate("swms.progress")}</span>
              <span>{Math.round(progress)}% {translate("swms.complete")}</span>
            </div>
            <Progress value={progress} className="w-full h-3" />
            
            {/* Clickable Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step.id === currentStep 
                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 hover:scale-110' 
                        : step.id < currentStep
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:scale-110 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                    disabled={step.id > currentStep}
                    title={step.id > currentStep ? 'Complete current step to unlock' : step.id < currentStep ? 'Click to return to this step' : 'Current step'}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </button>
                  <div className="text-center hidden md:block px-2">
                    <p className={`text-xs font-medium text-center ${
                      step.id === currentStep 
                        ? 'text-primary' 
                        : step.id < currentStep
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>{step.title}</p>
                    <p className={`text-xs text-center leading-tight ${
                      step.id <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {STEPS[currentStep - 1].title}
              </div>
              {localStorage.getItem('swms-admin-mode') === 'true' && (
                <Badge variant="destructive" className="ml-2">
                  <Shield className="mr-1 h-3 w-3" />
                  ADMIN MODE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step Content */}
            {currentStep === 8 ? (
              <EmbeddedPDFEditor
                formData={formData}
                onDataChange={handleFormDataChange}
                onNext={handleNext}
                onBack={handlePrevious}
              />
            ) : (
              <>
                <SwmsForm 
                  step={currentStep}
                  data={formData}
                  onDataChange={handleFormDataChange}
                  onNext={handleNext}
                />
                
                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  {currentStep < STEPS.length ? (
                    <Button 
                      onClick={handleNext} 
                      className="bg-primary hover:bg-primary/90"
                      disabled={saveDraftMutation.isPending || (currentStep === 2 && (!formData.selectedTasks || formData.selectedTasks.length === 0))}
                    >
                      {saveDraftMutation.isPending ? "Saving..." : "Continue"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <DocumentPreview formData={formData} />
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
}

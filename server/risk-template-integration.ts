// Integration with RiskTemplateBuilder Replit App - Complete Field Mapping

// Helper functions for complete data transformation
function getRiskScore(riskLevel: string | undefined): number {
  const level = (riskLevel || '').toLowerCase();
  switch (level) {
    case 'extreme': return 20;
    case 'high': return 15;
    case 'medium': return 10;
    case 'low': return 5;
    default: return 10;
  }
}

function calculateEndDate(startDate: string | undefined, duration: string | undefined): string {
  if (!startDate) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const start = new Date(startDate);
  const days = duration ? parseInt(duration.match(/\d+/)?.[0] || '30') : 30;
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return end.toISOString().split('T')[0];
}

function calculateDuration(startDate: string | undefined, endDate: string | undefined): string {
  if (!startDate || !endDate) return '4 weeks';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  
  if (days <= 7) return `${days} days`;
  const weeks = Math.ceil(days / 7);
  return `${weeks} weeks`;
}

function getNextInspectionDate(riskLevel: string | undefined): string {
  const today = new Date();
  const level = (riskLevel || '').toLowerCase();
  
  let daysToAdd = 30; // Default
  switch (level) {
    case 'high': daysToAdd = 7; break;
    case 'medium': daysToAdd = 14; break;
    case 'low': daysToAdd = 30; break;
  }
  
  const nextInspection = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return nextInspection.toISOString().split('T')[0];
}

function getHRCWCategoryName(categoryId: number): string {
  const categories: { [key: number]: string } = {
    1: 'Risk of person falling more than 2 metres',
    2: 'Work on telecommunication tower',
    3: 'Demolition of load-bearing elements',
    4: 'Work involving disturbance of asbestos',
    5: 'Structural alterations requiring temporary support',
    6: 'Work in confined spaces',
    7: 'Work on or near chemical, fuel or refrigerant lines',
    8: 'Work on energised electrical installations',
    9: 'Work in areas where atmosphere may be contaminated',
    10: 'Work involving tilt-up or precast concrete',
    11: 'Work in tunnels',
    12: 'Work involving use of explosives',
    13: 'Work on roads with traffic management',
    14: 'Work involving diving',
    15: 'Work in areas of extreme weather',
    16: 'Work involving movement of powered mobile plant',
    17: 'Work involving penetration of artificial ground',
    18: 'Work involving excavation'
  };
  
  return categories[categoryId] || `HRCW Category ${categoryId}`;
}

function generateTrainingRequirements(swmsData: any): Array<{training: string; level: string; expiryDate?: string; provider?: string}> {
  const requirements = [];
  
  // Base training requirements
  requirements.push({
    training: 'White Card - General Construction',
    level: 'CPCWHS1001',
    expiryDate: 'No expiry',
    provider: 'RTO Provider'
  });
  
  // Trade-specific training
  if (swmsData.tradeType?.toLowerCase().includes('electrical')) {
    requirements.push({
      training: 'Electrical Work License',
      level: 'Licensed Electrician',
      expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      provider: 'Electrical Licensing Authority'
    });
  }
  
  if (swmsData.hrcwCategories?.includes(1)) {
    requirements.push({
      training: 'Working at Heights',
      level: 'RIIWHS204D',
      expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      provider: 'RTO Provider'
    });
  }
  
  return requirements;
}

function generateEnvironmentalFactors(swmsData: any): Array<{factor: string; impact: string; controlMeasure: string}> {
  return [
    {
      factor: 'Weather Conditions',
      impact: 'Work may be affected by rain, wind, or extreme temperatures',
      controlMeasure: 'Monitor weather conditions and suspend work during adverse weather'
    },
    {
      factor: 'Noise Levels',
      impact: 'Construction activities may generate excessive noise',
      controlMeasure: 'Use silenced equipment where possible and restrict working hours'
    },
    {
      factor: 'Dust Generation',
      impact: 'Dust may affect workers and surrounding areas',
      controlMeasure: 'Use water suppression and appropriate PPE'
    }
  ];
}
export interface SWMSDataForTemplate {
  // Project Information - Complete field mapping
  projectName: string;
  jobNumber: string;
  projectAddress: string;
  projectLocation: string;
  swmsCreatorName: string;
  swmsCreatorPosition: string;
  signatureMethod?: string;
  signatureImage?: string;
  signatureText?: string;
  principalContractor: string;
  projectManager: string;
  siteSupervisor: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  tradeType: string;
  companyName?: string;
  companyLogo?: string;
  
  // Additional project details for complete form filling
  clientName?: string;
  contractNumber?: string;
  permitNumber?: string;
  weatherConditions?: string;
  siteAccess?: string;
  workingHours?: string;
  
  // Activities and Risk Assessments - Comprehensive mapping
  activities: Array<{
    activityNumber?: number;
    activity: string;
    hazards: string[];
    initialRisk: string;
    initialRiskScore?: number;
    controlMeasures: string[];
    residualRisk: string;
    residualRiskScore?: number;
    legislation: string;
    responsiblePerson?: string;
    monitoringRequirements?: string;
  }>;
  
  // Equipment and PPE - Complete details
  plantEquipment: Array<{
    equipmentNumber?: number;
    equipment: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    riskLevel: string;
    nextInspection: string;
    certificationRequired: string;
    operatorRequirements?: string;
    maintenanceSchedule?: string;
  }>;
  
  // PPE Requirements - Detailed mapping
  ppeRequirements: Array<{
    ppeType: string;
    standard?: string;
    inspectionRequired?: boolean;
    replacementSchedule?: string;
  }>;
  
  // High-Risk Construction Work
  hrcwCategories: Array<{
    categoryId: number;
    categoryName: string;
    applicable: boolean;
    controlMeasures?: string[];
  }>;
  
  // Emergency Procedures - Complete details
  emergencyProcedures: Array<{
    procedureType: string;
    procedure: string;
    details: string;
    contactPerson?: string;
    phoneNumber?: string;
    location?: string;
  }>;
  
  // Training and Competency
  trainingRequirements?: Array<{
    training: string;
    level: string;
    expiryDate?: string;
    provider?: string;
  }>;
  
  // Environmental conditions
  environmentalFactors?: Array<{
    factor: string;
    impact: string;
    controlMeasure: string;
  }>;
  
  // Sign-off details
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  version?: string;
  revisionDate?: string;
}

export async function generatePDFWithRiskTemplate(swmsData: any): Promise<Buffer> {
  try {
    console.log('Connecting to RiskTemplateBuilder for PDF generation...');
    
    // Transform SWMS data to complete RiskTemplate format - fill ALL editable fields
    const templateData: SWMSDataForTemplate = {
      // Core Project Information
      projectName: swmsData.jobName || swmsData.title || 'Project Name Required',
      jobNumber: swmsData.jobNumber || 'Job Number Required',
      projectAddress: swmsData.projectAddress || 'Project Address Required',
      projectLocation: swmsData.projectLocation || swmsData.projectAddress || 'Project Location Required',
      swmsCreatorName: swmsData.swmsCreatorName || 'SWMS Creator Name Required',
      swmsCreatorPosition: swmsData.swmsCreatorPosition || 'SWMS Creator Position Required',
      signatureMethod: swmsData.signatureMethod || null,
      signatureImage: swmsData.signatureImage || null,
      signatureText: swmsData.signatureText || null,
      principalContractor: swmsData.principalContractor || 'Principal Contractor Required',
      projectManager: swmsData.projectManager || 'Project Manager Required',
      siteSupervisor: swmsData.siteSupervisor || 'Site Supervisor Required',
      startDate: swmsData.startDate || new Date().toISOString().split('T')[0],
      endDate: swmsData.endDate || calculateEndDate(swmsData.startDate, swmsData.duration),
      duration: swmsData.duration || calculateDuration(swmsData.startDate, swmsData.endDate),
      tradeType: swmsData.tradeType || 'General Construction',
      companyName: swmsData.companyName || swmsData.principalContractor || 'Company Name',
      companyLogo: swmsData.companyLogo || null,
      
      // Extended project details
      clientName: swmsData.clientName || 'Client Name',
      contractNumber: swmsData.contractNumber || swmsData.jobNumber || 'Contract Number',
      permitNumber: swmsData.permitNumber || 'Permit Number',
      weatherConditions: swmsData.weatherConditions || 'Weather conditions to be monitored',
      siteAccess: swmsData.siteAccess || 'Site access via main entrance',
      workingHours: swmsData.workingHours || '7:00 AM to 5:00 PM Monday to Friday',
      
      // Complete Activities mapping with enhanced details
      activities: (swmsData.riskAssessments || []).map((risk: any, index: number) => ({
        activityNumber: index + 1,
        activity: risk.activity || `Work Activity ${index + 1}`,
        hazards: Array.isArray(risk.hazards) ? risk.hazards : 
                typeof risk.hazards === 'string' ? [risk.hazards] : 
                ['Hazard identification required'],
        initialRisk: risk.initialRisk || risk.initial_risk || 'Medium',
        initialRiskScore: getRiskScore(risk.initialRisk || risk.initial_risk),
        controlMeasures: Array.isArray(risk.controlMeasures) ? risk.controlMeasures :
                        typeof risk.controlMeasures === 'string' ? [risk.controlMeasures] :
                        ['Control measures required'],
        residualRisk: risk.residualRisk || risk.residual_risk || 'Low',
        residualRiskScore: getRiskScore(risk.residualRisk || risk.residual_risk),
        legislation: risk.legislation || 'WHS Act 2011 - Duty of Care',
        responsiblePerson: risk.responsiblePerson || swmsData.siteSupervisor || 'Site Supervisor',
        monitoringRequirements: risk.monitoringRequirements || 'Daily visual inspection and monitoring'
      })),
      
      // Complete Plant Equipment mapping
      plantEquipment: (swmsData.plantEquipment || []).map((equipment: any, index: number) => ({
        equipmentNumber: index + 1,
        equipment: equipment.equipment || equipment.name || `Equipment ${index + 1}`,
        manufacturer: equipment.manufacturer || 'Manufacturer TBC',
        model: equipment.model || 'Model TBC',
        serialNumber: equipment.serialNumber || 'Serial Number TBC',
        riskLevel: equipment.riskLevel || equipment.risk_level || 'Low',
        nextInspection: equipment.nextInspection || equipment.next_inspection || 
                       getNextInspectionDate(equipment.riskLevel),
        certificationRequired: equipment.certificationRequired || equipment.certification_required || 'Not Required',
        operatorRequirements: equipment.operatorRequirements || 'Competent operator required',
        maintenanceSchedule: equipment.maintenanceSchedule || 'As per manufacturer guidelines'
      })),
      
      // Enhanced PPE Requirements
      ppeRequirements: (swmsData.ppeRequirements || []).map((ppe: any) => ({
        ppeType: typeof ppe === 'string' ? ppe : ppe.type || 'PPE Required',
        standard: typeof ppe === 'object' ? ppe.standard || 'AS/NZS Standard' : 'AS/NZS Standard',
        inspectionRequired: true,
        replacementSchedule: typeof ppe === 'object' ? ppe.replacementSchedule || 'As required' : 'As required'
      })),
      
      // Enhanced HRCW Categories
      hrcwCategories: (swmsData.hrcwCategories || []).map((category: any) => ({
        categoryId: typeof category === 'number' ? category : category.id || 0,
        categoryName: getHRCWCategoryName(typeof category === 'number' ? category : category.id),
        applicable: true,
        controlMeasures: typeof category === 'object' ? category.controlMeasures || [] : []
      })),
      
      // Complete Emergency Procedures
      emergencyProcedures: (swmsData.emergencyProcedures || []).map((proc: any) => ({
        procedureType: proc.procedureType || proc.type || 'Emergency Response',
        procedure: proc.procedure || 'Emergency Procedure',
        details: proc.details || proc.description || 'Emergency response details',
        contactPerson: proc.contactPerson || 'Emergency Coordinator',
        phoneNumber: proc.phoneNumber || '000',
        location: proc.location || 'Assembly point at main entrance'
      })),
      
      // Training Requirements
      trainingRequirements: generateTrainingRequirements(swmsData),
      
      // Environmental Factors
      environmentalFactors: generateEnvironmentalFactors(swmsData),
      
      // Sign-off Details
      preparedBy: swmsData.swmsCreatorName || 'Document Preparer',
      reviewedBy: swmsData.projectManager || 'Project Manager',
      approvedBy: swmsData.siteSupervisor || 'Site Supervisor',
      version: swmsData.version || '1.0',
      revisionDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('Sending data to RiskTemplateBuilder:', {
      projectName: templateData.projectName,
      activitiesCount: templateData.activities.length,
      equipmentCount: templateData.plantEquipment.length
    });
    
    // Connect to SWMSprint app with comprehensive data mapping
    const swmsPrintUrl = 'https://risktemplatebuilder.replit.app';
    
    // Use correct API endpoints for SWMSprint/RiskTemplateBuilder app
    const endpoints = [
      `${swmsPrintUrl}/api/generate-pdf`,
      `${swmsPrintUrl}/api/create-template`,
      `${swmsPrintUrl}/create-template`,
      `${swmsPrintUrl}/template`,
      `${swmsPrintUrl}/api/template`,
      `${swmsPrintUrl}/pdf`
    ];
    
    let response: Response | null = null;
    let lastError: string = '';
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying RiskTemplateBuilder endpoint: ${endpoint}`);
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf',
            'User-Agent': 'Riskify-SWMS-Builder/1.0',
          },
          body: JSON.stringify(templateData)
        });
        
        if (response.ok) {
          console.log(`Successfully connected to RiskTemplateBuilder at: ${endpoint}`);
          break;
        } else {
          lastError = `${response.status} ${response.statusText}`;
          console.log(`Endpoint ${endpoint} failed: ${lastError}`);
        }
      } catch (error) {
        lastError = (error as Error).message;
        console.log(`Endpoint ${endpoint} error: ${lastError}`);
        continue;
      }
    }
    
    if (!response || !response.ok) {
      console.error('RiskTemplateBuilder connection failed:', {
        lastError,
        triedEndpoints: endpoints,
        responseStatus: response?.status,
        responseText: response ? await response.text() : 'No response'
      });
      throw new Error(`RiskTemplateBuilder PDF Generation FAILED: Cannot generate PDF without RiskTemplateBuilder app. Status: ${response?.status || 'No connection'}. Error: ${lastError}`);
    }
    
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log('PDF generated successfully by SWMSprint:', pdfBuffer.length, 'bytes');
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error connecting to SWMSprint:', error);
    throw new Error(`Failed to generate PDF with SWMSprint: ${(error as Error).message}`);
  }
}

// Alternative endpoint for direct template communication
export async function sendToRiskTemplate(swmsData: any): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
  try {
    const templateData: SWMSDataForTemplate = {
      projectName: swmsData.jobName || 'Untitled Project',
      jobNumber: swmsData.jobNumber || 'JOB-001',
      projectAddress: swmsData.projectAddress || 'Project Location',
      projectLocation: swmsData.projectLocation || swmsData.projectAddress || 'Project Location',
      swmsCreatorName: swmsData.swmsCreatorName || 'SWMS Creator',
      swmsCreatorPosition: swmsData.swmsCreatorPosition || 'Position',
      principalContractor: swmsData.principalContractor || 'Principal Contractor',
      projectManager: swmsData.projectManager || 'Project Manager',
      siteSupervisor: swmsData.siteSupervisor || 'Site Supervisor',
      startDate: swmsData.startDate || new Date().toISOString().split('T')[0],
      tradeType: swmsData.tradeType || 'General Construction',
      companyName: swmsData.companyName || swmsData.principalContractor || 'Company Name',
      companyLogo: swmsData.companyLogo || null,
      
      activities: (swmsData.riskAssessments || []).map((risk: any) => ({
        activity: risk.activity || 'Work Activity',
        hazards: Array.isArray(risk.hazards) ? risk.hazards : [risk.hazards].filter(Boolean),
        initialRisk: risk.initialRisk || 'Medium',
        controlMeasures: Array.isArray(risk.controlMeasures) ? risk.controlMeasures : [risk.controlMeasures].filter(Boolean),
        residualRisk: risk.residualRisk || 'Low',
        legislation: risk.legislation || 'WHS Act 2011'
      })),
      
      plantEquipment: (swmsData.plantEquipment || []).map((equipment: any) => ({
        equipment: equipment.equipment || 'Equipment',
        riskLevel: equipment.riskLevel || 'Low',
        nextInspection: equipment.nextInspection || 'TBD',
        certificationRequired: equipment.certificationRequired || 'Not Required'
      })),
      
      ppeRequirements: swmsData.ppeRequirements || [],
      hrcwCategories: swmsData.hrcwCategories || [],
      
      emergencyProcedures: (swmsData.emergencyProcedures || []).map((proc: any) => ({
        procedure: proc.procedure || 'Emergency Procedure',
        details: proc.details || 'Emergency details'
      }))
    };
    
    // Try multiple possible endpoints for template creation
    const endpoints = [
      'https://risktemplatebuilder.replit.app/api/create-template',
      'https://risktemplatebuilder.replit.app/create-template',
      'https://risktemplatebuilder.replit.app/template',
      'https://risktemplatebuilder.replit.app/api/template'
    ];
    
    let response: Response | null = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
          timeout: 10000
        });
        
        if (response.ok) break;
      } catch (error) {
        continue;
      }
    }
    
    if (!response.ok) {
      return { success: false, error: `RiskTemplateBuilder error: ${response.status}` };
    }
    
    const result = await response.json();
    return { success: true, pdfUrl: result.pdfUrl };
    
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
// Integration with RiskTemplateBuilder Replit App
export interface SWMSDataForTemplate {
  // Project Information
  projectName: string;
  jobNumber: string;
  projectAddress: string;
  swmsCreatorName: string;
  swmsCreatorPosition: string;
  principalContractor: string;
  projectManager: string;
  siteSupervisor: string;
  startDate: string;
  tradeType: string;
  
  // Activities and Risk Assessments
  activities: Array<{
    activity: string;
    hazards: string[];
    initialRisk: string;
    controlMeasures: string[];
    residualRisk: string;
    legislation: string;
  }>;
  
  // Equipment and PPE
  plantEquipment: Array<{
    equipment: string;
    riskLevel: string;
    nextInspection: string;
    certificationRequired: string;
  }>;
  
  ppeRequirements: string[];
  hrcwCategories: number[];
  
  // Emergency Procedures
  emergencyProcedures: Array<{
    procedure: string;
    details: string;
  }>;
}

export async function generatePDFWithRiskTemplate(swmsData: any): Promise<Buffer> {
  try {
    console.log('Connecting to RiskTemplateBuilder for PDF generation...');
    
    // Transform SWMS data to RiskTemplate format
    const templateData: SWMSDataForTemplate = {
      projectName: swmsData.jobName || swmsData.title || 'Untitled Project',
      jobNumber: swmsData.jobNumber || 'JOB-001',
      projectAddress: swmsData.projectAddress || 'Project Location',
      swmsCreatorName: swmsData.swmsCreatorName || 'SWMS Creator',
      swmsCreatorPosition: swmsData.swmsCreatorPosition || 'Position',
      principalContractor: swmsData.principalContractor || 'Principal Contractor',
      projectManager: swmsData.projectManager || 'Project Manager',
      siteSupervisor: swmsData.siteSupervisor || 'Site Supervisor',
      startDate: swmsData.startDate || new Date().toISOString().split('T')[0],
      tradeType: swmsData.tradeType || 'General Construction',
      
      activities: (swmsData.riskAssessments || []).map((risk: any) => ({
        activity: risk.activity || 'Work Activity',
        hazards: Array.isArray(risk.hazards) ? risk.hazards : [risk.hazards].filter(Boolean),
        initialRisk: risk.initialRisk || risk.initial_risk || 'Medium',
        controlMeasures: Array.isArray(risk.controlMeasures) ? risk.controlMeasures : [risk.controlMeasures].filter(Boolean),
        residualRisk: risk.residualRisk || risk.residual_risk || 'Low',
        legislation: risk.legislation || 'WHS Act 2011'
      })),
      
      plantEquipment: (swmsData.plantEquipment || []).map((equipment: any) => ({
        equipment: equipment.equipment || equipment.name || 'Equipment',
        riskLevel: equipment.riskLevel || equipment.risk_level || 'Low',
        nextInspection: equipment.nextInspection || equipment.next_inspection || 'TBD',
        certificationRequired: equipment.certificationRequired || equipment.certification_required || 'Not Required'
      })),
      
      ppeRequirements: swmsData.ppeRequirements || [],
      hrcwCategories: swmsData.hrcwCategories || [],
      
      emergencyProcedures: (swmsData.emergencyProcedures || []).map((proc: any) => ({
        procedure: proc.procedure || proc.type || 'Emergency Procedure',
        details: proc.details || proc.description || 'Emergency details'
      }))
    };
    
    console.log('Sending data to RiskTemplateBuilder:', {
      projectName: templateData.projectName,
      activitiesCount: templateData.activities.length,
      equipmentCount: templateData.plantEquipment.length
    });
    
    // Send request to RiskTemplateBuilder
    const response = await fetch('https://risktemplatebuilder.replit.app/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      },
      body: JSON.stringify(templateData)
    });
    
    if (!response.ok) {
      console.error('RiskTemplateBuilder response error:', response.status, response.statusText);
      
      // Fallback to local PDF generation if external service fails
      console.log('Falling back to local PDF generation...');
      const { generatePuppeteerPDF } = await import('./pdf-generator-puppeteer.js');
      return await generatePuppeteerPDF(swmsData);
    }
    
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log('PDF generated successfully by RiskTemplateBuilder:', pdfBuffer.length, 'bytes');
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error connecting to RiskTemplateBuilder:', error);
    
    // Fallback to local PDF generation
    console.log('Falling back to local PDF generation due to error...');
    const { generatePuppeteerPDF } = await import('./pdf-generator-puppeteer.js');
    return await generatePuppeteerPDF(swmsData);
  }
}

// Alternative endpoint for direct template communication
export async function sendToRiskTemplate(swmsData: any): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
  try {
    const templateData: SWMSDataForTemplate = {
      projectName: swmsData.jobName || 'Untitled Project',
      jobNumber: swmsData.jobNumber || 'JOB-001',
      projectAddress: swmsData.projectAddress || 'Project Location',
      swmsCreatorName: swmsData.swmsCreatorName || 'SWMS Creator',
      swmsCreatorPosition: swmsData.swmsCreatorPosition || 'Position',
      principalContractor: swmsData.principalContractor || 'Principal Contractor',
      projectManager: swmsData.projectManager || 'Project Manager',
      siteSupervisor: swmsData.siteSupervisor || 'Site Supervisor',
      startDate: swmsData.startDate || new Date().toISOString().split('T')[0],
      tradeType: swmsData.tradeType || 'General Construction',
      
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
    
    const response = await fetch('https://risktemplatebuilder.replit.app/api/create-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData)
    });
    
    if (!response.ok) {
      return { success: false, error: `RiskTemplateBuilder error: ${response.status}` };
    }
    
    const result = await response.json();
    return { success: true, pdfUrl: result.pdfUrl };
    
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
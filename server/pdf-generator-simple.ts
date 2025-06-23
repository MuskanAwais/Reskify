import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Register Handlebars helpers
handlebars.registerHelper('toLowerCase', function(str: string) {
  return str ? str.toLowerCase() : '';
});

handlebars.registerHelper('times', function(n: number, block: any) {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += block.fn(i);
  }
  return result;
});

interface SWMSData {
  projectName?: string;
  jobName?: string;
  jobNumber?: string;
  projectAddress?: string;
  companyName?: string;
  projectManager?: string;
  siteSupervisor?: string;
  principalContractor?: string;
  startDate?: string;
  duration?: string;
  emergencyProcedures?: {
    contacts?: Array<{ name: string; phone: string }>;
  };
  workActivities?: Array<{
    task: string;
    hazards: string[];
    initialRiskLevel: string;
    initialRiskScore: number;
    controlMeasures: string[];
    residualRiskLevel: string;
    residualRiskScore: number;
    legislation: string[];
  }>;
  ppeRequirements?: string[];
  plantEquipment?: Array<{
    name: string;
    model: string;
    serial: string;
    riskLevel: string;
    nextInspection: string;
    certificationRequired: string;
  }>;
}

const PPE_ITEMS = {
  'hard-hat': { name: 'Hard Hat', description: 'Impact protection for head' },
  'hi-vis-vest': { name: 'Hi-Vis Vest', description: 'High visibility clothing' },
  'steel-cap-boots': { name: 'Steel Cap Boots', description: 'Foot protection' },
  'safety-glasses': { name: 'Safety Glasses', description: 'Eye protection' },
  'gloves': { name: 'Work Gloves', description: 'Hand protection' },
  'hearing-protection': { name: 'Hearing Protection', description: 'Noise reduction' },
  'dust-mask': { name: 'Dust Mask', description: 'Respiratory protection' },
  'cut-resistant-gloves': { name: 'Cut Resistant Gloves', description: 'Cut protection' },
  'fall-arrest-harness': { name: 'Fall Arrest Harness', description: 'Fall protection' },
  'safety-harness-lanyard': { name: 'Safety Lanyard', description: 'Fall restraint' },
  'welding-helmet-gloves': { name: 'Welding Protection', description: 'Arc flash protection' },
  'fire-retardant-clothing': { name: 'Fire Retardant Clothing', description: 'Heat protection' }
};

export async function generateSimplePDF(swmsData: SWMSData): Promise<string> {
  try {
    // Read the Handlebars template
    const templatePath = path.join(process.cwd(), 'templates', 'swms-template.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    
    // Prepare data for template
    const templateData = {
      // Header information
      projectName: swmsData.projectName || swmsData.jobName || 'Untitled Project',
      projectAddress: swmsData.projectAddress || 'Project Location',
      documentId: `NEW-${Date.now().toString().slice(-5)}`,
      currentDate: new Date().toLocaleDateString('en-AU'),
      
      // Project information card
      jobName: swmsData.jobName || 'Project Name',
      jobNumber: swmsData.jobNumber || 'Job Number',
      companyName: swmsData.companyName || 'Company Name',
      projectManager: swmsData.projectManager || 'Project Manager',
      siteSupervisor: swmsData.siteSupervisor || 'Site Supervisor',
      startDate: swmsData.startDate || new Date().toLocaleDateString('en-AU'),
      duration: swmsData.duration || 'TBD',
      principalContractor: swmsData.principalContractor || 'Principal Contractor',
      
      // Emergency information
      emergencyContacts: swmsData.emergencyProcedures?.contacts || [
        { name: 'Site Coordinator', phone: '0412 345 678' },
        { name: 'Building Management', phone: '0398 765 432' },
        { name: 'First Aid Officer', phone: '0456 789 123' }
      ],
      assemblyPoint: 'Main Entrance',
      nearestHospital: 'Local Hospital',
      
      // Work activities
      activities: swmsData.workActivities || [],
      
      // PPE items with required status
      ppeItems: Object.entries(PPE_ITEMS).map(([key, item]) => ({
        ...item,
        required: swmsData.ppeRequirements?.includes(key) || false
      })),
      
      // Equipment
      equipment: swmsData.plantEquipment || []
    };
    
    // Generate HTML from template
    const html = template(templateData);
    return html;
    
  } catch (error) {
    console.error('HTML generation error:', error);
    throw error;
  }
}
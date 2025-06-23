import puppeteer from 'puppeteer';
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
  // Project Information
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
  
  // Emergency Information
  emergencyContacts?: Array<{
    name: string;
    phone: string;
  }>;
  assemblyPoint?: string;
  nearestHospital?: string;
  
  // Work Activities
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
  
  // PPE Requirements
  ppeRequirements?: string[];
  
  // Plant & Equipment
  plantEquipment?: Array<{
    name: string;
    model: string;
    serial: string;
    riskLevel: string;
    nextInspection: string;
    certificationRequired: string;
  }>;
}

// PPE mapping with descriptions
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

export async function generatePuppeteerPDF(swmsData: SWMSData): Promise<Buffer> {
  let browser;
  
  try {
    // Check if we can use Puppeteer, otherwise fallback to original generator
    let usePuppeteer = true;
    try {
      // Test if Chrome/Chromium is available
      browser = await puppeteer.launch({ headless: true });
      await browser.close();
    } catch (error) {
      console.log('Puppeteer not available, falling back to PDFKit generator');
      usePuppeteer = false;
    }
    
    if (!usePuppeteer) {
      // Fallback to original PDF generator
      const { generateExactPDF } = await import('./pdf-generator-figma-exact.js');
      return await generateExactPDF(swmsData);
    }
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
      emergencyContacts: swmsData.emergencyContacts || [
        { name: 'Site Coordinator', phone: '0412 345 678' },
        { name: 'First Aid Officer', phone: '0456 789 123' }
      ],
      assemblyPoint: swmsData.assemblyPoint || 'Main Entrance',
      nearestHospital: swmsData.nearestHospital || 'Local Hospital',
      
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
    
    // Launch Puppeteer with Replit-compatible settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium-browser'
    });
    
    const page = await browser.newPage();
    
    // Set page content
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with exact A4 settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });
    
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
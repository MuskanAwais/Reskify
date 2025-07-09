import { z } from "zod";

export const riskLevelSchema = z.object({
  level: z.enum(['extreme', 'high', 'medium', 'low']),
  score: z.number()
});

export const emergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

export const highRiskActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  selected: z.boolean(),
  riskLevel: z.enum(['extreme', 'high', 'medium', 'low']).optional(),
});

export const ppeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  selected: z.boolean(),
  category: z.string().optional(),
  required: z.boolean().optional(),
});

export const workActivitySchema = z.object({
  id: z.string(),
  activity: z.string(),
  hazards: z.array(z.string()),
  initialRisk: z.union([
    z.string(),
    riskLevelSchema
  ]),
  controlMeasures: z.array(z.string()),
  residualRisk: z.union([
    z.string(),
    riskLevelSchema
  ]),
  legislation: z.array(z.string()),
});

export const plantEquipmentSchema = z.object({
  id: z.string(),
  equipment: z.string(),
  model: z.string(),
  serialNumber: z.string(),
  riskLevel: z.enum(['extreme', 'high', 'medium', 'low']),
  nextInspection: z.string(),
  certificationRequired: z.boolean(),
  hazards: z.array(z.string()).optional(),
  initialRisk: riskLevelSchema.optional(),
  controlMeasures: z.array(z.string()).optional(),
  residualRisk: riskLevelSchema.optional(),
  legislation: z.array(z.string()).optional(),
});

export const signInEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  position: z.string(),
  date: z.string(),
  timeIn: z.string(),
  timeOut: z.string(),
  signature: z.string(),
  inductionComplete: z.boolean(),
  number: z.string().optional(),
});

export const msdsDocumentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  customTitle: z.string(),
  fileData: z.string(), // base64 encoded
  uploadDate: z.string(),
  selected: z.boolean(),
});

export const swmsFormDataSchema = z.object({
  // Project Information
  companyName: z.string(),
  projectName: z.string(),
  projectNumber: z.string(),
  projectAddress: z.string(),
  jobName: z.string(),
  jobNumber: z.string(),
  startDate: z.string(),
  duration: z.string(),
  dateCreated: z.string(),
  principalContractor: z.string(),
  projectManager: z.string(),
  siteSupervisor: z.string(),
  authorisingPerson: z.string(),
  authorisingPosition: z.string(),
  authorisingSignature: z.string(),
  scopeOfWorks: z.string(),
  companyLogo: z.string().nullable(),

  // Emergency Information
  emergencyContacts: z.array(emergencyContactSchema),
  nearestHospital: z.string().optional(),
  hospitalPhone: z.string().optional(),
  emergencyProcedures: z.string(),
  emergencyMonitoring: z.string(),

  // High Risk Activities
  highRiskActivities: z.array(highRiskActivitySchema),

  // Work Activities
  workActivities: z.array(workActivitySchema),

  // PPE Items
  ppeItems: z.array(ppeItemSchema),

  // Plant Equipment
  plantEquipment: z.array(plantEquipmentSchema),

  // Sign In Entries
  signInEntries: z.array(signInEntrySchema),

  // MSDS Documents
  msdsDocuments: z.array(msdsDocumentSchema),
});

// Type exports
export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type HighRiskActivity = z.infer<typeof highRiskActivitySchema>;
export type PPEItem = z.infer<typeof ppeItemSchema>;
export type WorkActivity = z.infer<typeof workActivitySchema>;
export type PlantEquipment = z.infer<typeof plantEquipmentSchema>;
export type SignInEntry = z.infer<typeof signInEntrySchema>;
export type MSdsDocument = z.infer<typeof msdsDocumentSchema>;
export type SwmsFormData = z.infer<typeof swmsFormDataSchema>;

// Risk level constants
export const RISK_LEVELS = {
  EXTREME: 'extreme',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export const RISK_COLORS = {
  extreme: '#dc2626', // Red
  high: '#ea580c',    // Orange  
  medium: '#eab308',  // Yellow
  low: '#22c55e'      // Green
} as const;

// PPE Categories
export const PPE_CATEGORIES = {
  HEAD: 'head',
  EYE: 'eye',
  RESPIRATORY: 'respiratory',
  HAND: 'hand',
  FOOT: 'foot',
  BODY: 'body',
  FALL_PROTECTION: 'fall_protection',
  HEARING: 'hearing'
} as const;

// High Risk Activity Categories
export const HIGH_RISK_CATEGORIES = {
  WORKING_AT_HEIGHTS: 'working_at_heights',
  EXCAVATION: 'excavation',
  CONFINED_SPACES: 'confined_spaces',
  HOT_WORK: 'hot_work',
  ELECTRICAL: 'electrical',
  CRANE_OPERATIONS: 'crane_operations',
  DEMOLITION: 'demolition',
  HAZARDOUS_SUBSTANCES: 'hazardous_substances'
} as const;

// Equipment Categories
export const EQUIPMENT_CATEGORIES = {
  EARTHMOVING: 'earthmoving',
  LIFTING: 'lifting',
  POWER_TOOLS: 'power_tools',
  VEHICLES: 'vehicles',
  SCAFFOLDING: 'scaffolding',
  ELECTRICAL: 'electrical'
} as const;

// Default form data helper
export const getDefaultFormData = (): SwmsFormData => ({
  // Project Information
  companyName: 'Riskify Construction',
  projectName: 'Test Project Name',
  projectNumber: 'PRJ-2025-001',
  projectAddress: '123 Construction Site, Sydney NSW 2000',
  jobName: 'Commercial Building Construction',
  jobNumber: 'JOB-2025-001',
  startDate: new Date().toISOString().split('T')[0],
  duration: '6 months',
  dateCreated: new Date().toISOString().split('T')[0],
  principalContractor: 'Riskify Construction Pty Ltd',
  projectManager: 'John Smith',
  siteSupervisor: 'Mike Johnson',
  authorisingPerson: 'Sarah Williams',
  authorisingPosition: 'Project Manager',
  authorisingSignature: 'Sarah Williams',
  scopeOfWorks: 'Construction of a 5-story commercial building including excavation, foundation work, structural steel erection, concrete work, and building envelope installation.',
  companyLogo: null,

  // Emergency Information
  emergencyContacts: [
    { name: 'Emergency Services', phone: '000' },
    { name: 'Site Supervisor', phone: '0412 345 678' },
    { name: 'Project Manager', phone: '0423 456 789' }
  ],
  nearestHospital: 'Sydney Hospital',
  hospitalPhone: '(02) 9382 7111',
  emergencyProcedures: 'In case of emergency, immediately call 000 and notify site supervisor. Evacuate personnel to designated assembly point. Provide first aid if qualified. Do not move seriously injured persons unless in immediate danger.',
  emergencyMonitoring: 'Regular safety meetings will be held weekly. Emergency procedures will be reviewed monthly. All personnel must be inducted and familiar with emergency procedures.',

  // High Risk Activities
  highRiskActivities: [
    { id: '1', title: 'Working at Heights', description: 'Any work performed at height above 2 meters', selected: true, riskLevel: 'high' },
    { id: '2', title: 'Excavation Work', description: 'Excavation deeper than 1.5 meters', selected: true, riskLevel: 'high' },
    { id: '3', title: 'Crane Operations', description: 'Operation of mobile or tower cranes', selected: true, riskLevel: 'medium' },
    { id: '4', title: 'Hot Work', description: 'Welding, cutting, grinding operations', selected: true, riskLevel: 'medium' },
    { id: '5', title: 'Confined Space Entry', description: 'Entry into confined spaces', selected: false, riskLevel: 'extreme' },
    { id: '6', title: 'Electrical Work', description: 'Electrical installation and maintenance', selected: true, riskLevel: 'medium' }
  ],

  // Work Activities
  workActivities: [
    {
      id: '1',
      activity: 'Site Preparation and Excavation',
      hazards: ['Underground services', 'Unstable ground', 'Heavy machinery'],
      initialRisk: { level: 'high', score: 12 },
      controlMeasures: ['Dial before you dig', 'Soil testing', 'Proper excavation techniques', 'Exclusion zones'],
      residualRisk: { level: 'medium', score: 6 },
      legislation: ['WHS Act 2011', 'Construction Code']
    },
    {
      id: '2',
      activity: 'Foundation and Concrete Work',
      hazards: ['Chemical burns from concrete', 'Manual handling', 'Reinforcement hazards'],
      initialRisk: { level: 'medium', score: 8 },
      controlMeasures: ['PPE requirements', 'Mechanical lifting aids', 'Safe work procedures'],
      residualRisk: { level: 'low', score: 4 },
      legislation: ['WHS Act 2011', 'Australian Standards']
    },
    {
      id: '3',
      activity: 'Structural Steel Erection',
      hazards: ['Working at height', 'Falling objects', 'Crane operations'],
      initialRisk: { level: 'high', score: 15 },
      controlMeasures: ['Fall protection systems', 'Exclusion zones', 'Certified crane operators'],
      residualRisk: { level: 'medium', score: 6 },
      legislation: ['WHS Act 2011', 'AS 4100']
    }
  ],

  // PPE Items
  ppeItems: [
    { id: '1', name: 'Safety Helmet', description: 'Hard hat compliant with AS/NZS 1801', selected: true, required: true },
    { id: '2', name: 'Safety Boots', description: 'Steel-capped boots AS/NZS 2210', selected: true, required: true },
    { id: '3', name: 'Hi-Vis Vest', description: 'High visibility vest AS/NZS 4602', selected: true, required: true },
    { id: '4', name: 'Safety Glasses', description: 'Impact-resistant eye protection', selected: true, required: true },
    { id: '5', name: 'Work Gloves', description: 'Cut-resistant gloves AS/NZS 2161', selected: true, required: false },
    { id: '6', name: 'Hearing Protection', description: 'Earplugs or earmuffs AS/NZS 1270', selected: true, required: false },
    { id: '7', name: 'Respiratory Protection', description: 'Dust masks or respirators', selected: false, required: false },
    { id: '8', name: 'Fall Protection Harness', description: 'Full body harness AS/NZS 1891', selected: true, required: false }
  ],

  // Plant Equipment
  plantEquipment: [
    {
      id: '1',
      equipment: 'Excavator',
      model: 'CAT 320D',
      serialNumber: 'EXC001',
      riskLevel: 'high',
      nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      certificationRequired: true,
      hazards: ['Crush injuries', 'Tip over', 'Underground services'],
      initialRisk: { level: 'high', score: 12 },
      controlMeasures: ['Certified operators only', 'Daily inspections', 'Exclusion zones'],
      residualRisk: { level: 'medium', score: 6 },
      legislation: ['WHS Act 2011', 'AS 2550']
    },
    {
      id: '2',
      equipment: 'Tower Crane',
      model: 'Liebherr 380 EC-B',
      serialNumber: 'TC001',
      riskLevel: 'extreme',
      nextInspection: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      certificationRequired: true,
      hazards: ['Falling objects', 'Structural failure', 'Electrical hazards'],
      initialRisk: { level: 'extreme', score: 20 },
      controlMeasures: ['Licensed operators', 'Regular inspections', 'Load charts', 'Exclusion zones'],
      residualRisk: { level: 'medium', score: 8 },
      legislation: ['WHS Act 2011', 'AS 2550.1']
    }
  ],

  // Sign In Entries
  signInEntries: [],

  // MSDS Documents
  msdsDocuments: []
});

// Validation helpers
export const validateRiskScore = (score: number): boolean => {
  return score >= 1 && score <= 25;
};

export const getRiskLevel = (score: number): 'extreme' | 'high' | 'medium' | 'low' => {
  if (score >= 15) return 'extreme';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
};

export const calculateRiskScore = (likelihood: number, consequence: number): number => {
  return likelihood * consequence;
};

// Form field validation schemas
export const projectInfoSchema = swmsFormDataSchema.pick({
  companyName: true,
  projectName: true,
  projectNumber: true,
  projectAddress: true,
  jobName: true,
  jobNumber: true,
  startDate: true,
  duration: true,
  principalContractor: true,
  projectManager: true,
  siteSupervisor: true,
  authorisingPerson: true,
  authorisingPosition: true,
  scopeOfWorks: true
});

export const emergencyInfoSchema = swmsFormDataSchema.pick({
  emergencyContacts: true,
  emergencyProcedures: true,
  emergencyMonitoring: true
});

// Export all schemas for form validation
export const formSchemas = {
  projectInfo: projectInfoSchema,
  emergencyInfo: emergencyInfoSchema,
  highRiskActivities: z.object({ highRiskActivities: z.array(highRiskActivitySchema) }),
  workActivities: z.object({ workActivities: z.array(workActivitySchema) }),
  ppeItems: z.object({ ppeItems: z.array(ppeItemSchema) }),
  plantEquipment: z.object({ plantEquipment: z.array(plantEquipmentSchema) }),
  signInEntries: z.object({ signInEntries: z.array(signInEntrySchema) }),
  msdsDocuments: z.object({ msdsDocuments: z.array(msdsDocumentSchema) })
};
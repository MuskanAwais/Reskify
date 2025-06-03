// Australian Construction SWMS Database - Based on Newcastle Airport ACE Terminal Expansion Training Data
// Comprehensive risk assessments, standards, and control measures for Australian construction projects

export interface AustralianConstructionTask {
  taskId: string;
  activity: string;
  category: string;
  subcategory: string;
  trade: string;
  
  // Risk Assessment Data
  hazards: string[];
  initialRiskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Extreme";
  controlMeasures: string[];
  
  // Australian Standards & Legislation
  legislation: string[];
  australianStandards: string[];
  codesOfPractice: string[];
  
  // Residual Risk After Controls
  residualRiskScore: number;
  residualRiskLevel: "Low" | "Medium" | "High" | "Extreme";
  responsible: string;
  
  // Safety Requirements
  ppe: string[];
  trainingRequired: string[];
  permitRequired: string[];
  inspectionFrequency: string;
  
  // Emergency & Environmental
  emergencyProcedures: string[];
  environmentalControls: string[];
  
  // Project Specifications
  applicableProjects: string[];
  airportSpecific?: boolean;
  highRiskWork: boolean;
}

function getRiskLevel(score: number): "Low" | "Medium" | "High" | "Extreme" {
  if (score >= 14) return "Extreme";
  if (score >= 11) return "High";
  if (score >= 7) return "Medium";
  return "Low";
}

// Australian Construction Tasks Database based on Newcastle Airport training data
export const AUSTRALIAN_CONSTRUCTION_DATABASE: Record<string, AustralianConstructionTask> = {
  
  // 1. PROJECT ESTABLISHMENT & PLANNING
  "PROJ_001": {
    taskId: "PROJ_001",
    activity: "Project Design Management",
    category: "Project Management",
    subcategory: "Design Control",
    trade: "All Trades",
    hazards: [
      "Planning and Design errors",
      "Changes to Client Requirements",
      "Lack of Documented Information Control",
      "Inadequate Process Control"
    ],
    initialRiskScore: 12,
    riskLevel: "High",
    controlMeasures: [
      "Implement Design Management procedure 9.01 Design Management - L3",
      "Complete Q090102 Design Management Plan - L3",
      "Conduct thorough design reviews and validations - L3",
      "Document register for all design documents - L3",
      "Establish clear communication channels with client as per contractual requirements - L3",
      "Register client requests and action status via an appropriate process - L3"
    ],
    legislation: [
      "Design and Building Practitioners Act 2020 (NSW)",
      "Design and Building Practitioners Regulation 2021 (NSW)"
    ],
    australianStandards: [
      "ISO 9001:2018 Quality Management Systems",
      "ISO 19011:2018 Auditing Management Systems"
    ],
    codesOfPractice: [
      "Design Code of Practice",
      "Australian Construction Industry Code of Practice"
    ],
    residualRiskScore: 4,
    residualRiskLevel: "Low",
    responsible: "Project Manager / Design Manager",
    ppe: ["Standard office PPE"],
    trainingRequired: [
      "Design Management Training",
      "Document Control Training",
      "Quality Management Systems"
    ],
    permitRequired: [],
    inspectionFrequency: "Monthly PCG Meetings",
    emergencyProcedures: [
      "Escalation to Senior Management",
      "Client notification procedures"
    ],
    environmentalControls: [
      "Digital document management to reduce paper waste"
    ],
    applicableProjects: ["All construction projects"],
    highRiskWork: false
  },

  // 2. AIRSIDE CONSTRUCTION WORKS
  "AIRPORT_001": {
    taskId: "AIRPORT_001",
    activity: "Airside Construction Works",
    category: "Specialized Construction",
    subcategory: "Airport Operations",
    trade: "All Trades",
    hazards: [
      "Aircraft movement hazards",
      "Aviation security breaches",
      "Restricted area access violations",
      "Foreign Object Debris (FOD)"
    ],
    initialRiskScore: 16,
    riskLevel: "Extreme",
    controlMeasures: [
      "All personnel must hold valid ASIC (Aviation Security Identification Card)",
      "Complete mandatory ASIC Induction training",
      "Works Safety Officers must be NAPL approved",
      "Comply with Transport Security Program (TSP) requirements",
      "FOD management procedures implementation",
      "Coordination with airport operations control"
    ],
    legislation: [
      "Aviation Transport Security Act 2004 (Cth)",
      "Aviation Transport Security Regulations 2005 (Cth)",
      "Civil Aviation Safety Regulations 1998 (CASR)"
    ],
    australianStandards: [
      "AS 3500 Airport Design Standards",
      "ICAO Annex 14 - Aerodromes"
    ],
    codesOfPractice: [
      "CASA Airport Construction Safety Guidelines",
      "Airservices Australia Construction Guidelines"
    ],
    residualRiskScore: 8,
    residualRiskLevel: "Medium",
    responsible: "Works Safety Officer / NAPL Representative",
    ppe: [
      "High visibility clothing",
      "Safety helmet",
      "Safety footwear",
      "ASIC identification"
    ],
    trainingRequired: [
      "ASIC Induction",
      "Airport Familiarization",
      "FOD Awareness Training",
      "Emergency Response Procedures"
    ],
    permitRequired: ["Airside Work Permit"],
    inspectionFrequency: "Daily before work commencement",
    emergencyProcedures: [
      "Immediate notification to airport operations",
      "Emergency assembly point procedures",
      "Aircraft emergency protocols"
    ],
    environmentalControls: [
      "Noise management during restricted hours",
      "Dust suppression measures",
      "Stormwater management"
    ],
    applicableProjects: ["Airport construction projects"],
    airportSpecific: true,
    highRiskWork: true
  },

  // 3. HIGH RISK WORK - FALL PREVENTION
  "HRCW_001": {
    taskId: "HRCW_001",
    activity: "Work involving risk of person falling 2m or more",
    category: "High Risk Construction Work",
    subcategory: "Fall Prevention",
    trade: "All Trades",
    hazards: [
      "Falls from height greater than 2 metres",
      "Object falling and striking persons below",
      "Inadequate edge protection",
      "Unsafe access/egress"
    ],
    initialRiskScore: 16,
    riskLevel: "Extreme",
    controlMeasures: [
      "Install compliant edge protection systems",
      "Use appropriate fall arrest systems where edge protection not feasible",
      "Ensure all personnel have current Working at Height training",
      "Complete S030407 Harness Use Permit when required",
      "Establish exclusion zones below work areas",
      "Regular inspection of fall protection equipment",
      "Implement safe access and egress procedures"
    ],
    legislation: [
      "Work Health and Safety Act 2011 (NSW)",
      "Work Health and Safety Regulation 2017 (NSW) Part 4.4",
      "Construction Work Code of Practice 2021"
    ],
    australianStandards: [
      "AS/NZS 1891 Industrial fall-arrest systems and devices",
      "AS/NZS 4994.1 Temporary edge protection",
      "AS 1657 Fixed platforms, walkways, stairways and ladders"
    ],
    codesOfPractice: [
      "Managing the risk of falls at workplaces Code of Practice",
      "Construction work Code of Practice"
    ],
    residualRiskScore: 6,
    residualRiskLevel: "Medium",
    responsible: "Site Supervisor / Safety Officer",
    ppe: [
      "Full body harness (when required)",
      "Safety helmet with chin strap",
      "Non-slip safety footwear",
      "High visibility clothing"
    ],
    trainingRequired: [
      "Working at Height Training",
      "Fall Arrest System Training",
      "Scaffold User Training",
      "HRWL (High Risk Work Licence) if applicable"
    ],
    permitRequired: [
      "S030407 Harness Use Permit",
      "Height Work Permit"
    ],
    inspectionFrequency: "Daily before use, weekly formal inspection",
    emergencyProcedures: [
      "Fall rescue procedures",
      "Emergency medical response",
      "Incident notification protocols"
    ],
    environmentalControls: [
      "Weather monitoring and work restrictions",
      "Wind speed limitations"
    ],
    applicableProjects: ["Multi-storey construction", "Roof work", "Steel erection"],
    highRiskWork: true
  },

  // 4. STRUCTURAL ALTERATIONS
  "HRCW_002": {
    taskId: "HRCW_002",
    activity: "Structural alterations requiring temporary support",
    category: "High Risk Construction Work",
    subcategory: "Structural Work",
    trade: "Structural / Civil",
    hazards: [
      "Structural collapse during alterations",
      "Inadequate temporary support systems",
      "Load redistribution failures",
      "Progressive collapse"
    ],
    initialRiskScore: 16,
    riskLevel: "Extreme",
    controlMeasures: [
      "Engage qualified structural engineer for temporary works design",
      "Implement approved temporary support systems before alteration",
      "Complete structural assessment before commencement",
      "Monitor structural integrity throughout works",
      "Implement S110810 Suspended Deck Sequence procedures",
      "Regular inspection of temporary supports",
      "Controlled demolition/alteration sequence"
    ],
    legislation: [
      "Work Health and Safety Act 2011 (NSW)",
      "Work Health and Safety Regulation 2017 (NSW) Part 4.8",
      "Building Code of Australia (BCA)"
    ],
    australianStandards: [
      "AS 3610 Formwork for concrete",
      "AS/NZS 1170 Structural design actions",
      "AS 4100 Steel structures"
    ],
    codesOfPractice: [
      "Demolition work Code of Practice",
      "Construction work Code of Practice"
    ],
    residualRiskScore: 6,
    residualRiskLevel: "Medium",
    responsible: "Structural Engineer / Site Engineer",
    ppe: [
      "Safety helmet",
      "High visibility clothing",
      "Safety footwear",
      "Eye protection"
    ],
    trainingRequired: [
      "Structural Engineering competency",
      "Temporary Works design",
      "Demolition procedures"
    ],
    permitRequired: [
      "Structural Alteration Permit",
      "Engineering review sign-off"
    ],
    inspectionFrequency: "Daily during critical phases",
    emergencyProcedures: [
      "Structural emergency evacuation",
      "Emergency shoring procedures",
      "Structural collapse response"
    ],
    environmentalControls: [
      "Dust suppression during cutting",
      "Noise management",
      "Vibration monitoring"
    ],
    applicableProjects: ["Building alterations", "Renovation work", "Structural modifications"],
    highRiskWork: true
  },

  // 5. EXCAVATION WORK
  "HRCW_003": {
    taskId: "HRCW_003",
    activity: "Excavation to depth greater than 1.5m",
    category: "High Risk Construction Work",
    subcategory: "Excavation",
    trade: "Civil / Earthworks",
    hazards: [
      "Cave-in or collapse of excavation walls",
      "Contact with underground services",
      "Persons falling into excavation",
      "Plant and equipment falling into excavation",
      "Hazardous atmosphere in deep excavations"
    ],
    initialRiskScore: 15,
    riskLevel: "High",
    controlMeasures: [
      "Complete S030425 Excavation Permit before commencement",
      "Conduct Dial Before You Dig service location",
      "Install appropriate battering or shoring systems",
      "Implement exclusion zones around excavation perimeter",
      "Provide safe access and egress (maximum 25m apart)",
      "Regular inspection by competent person",
      "Atmospheric monitoring in deep excavations",
      "Implement emergency rescue procedures"
    ],
    legislation: [
      "Work Health and Safety Act 2011 (NSW)",
      "Work Health and Safety Regulation 2017 (NSW) Part 4.7",
      "Utilities Services Regulation"
    ],
    australianStandards: [
      "AS 2885 Pipelines - Gas and liquid petroleum",
      "AS/NZS 1680 Interior and workplace lighting",
      "AS 2187 Explosives - Storage and transport"
    ],
    codesOfPractice: [
      "Excavation work Code of Practice",
      "Managing risks of plant in the workplace Code of Practice"
    ],
    residualRiskScore: 6,
    residualRiskLevel: "Medium",
    responsible: "Excavation Supervisor / Civil Engineer",
    ppe: [
      "Safety helmet",
      "High visibility clothing",
      "Safety footwear",
      "Respiratory protection (if required)"
    ],
    trainingRequired: [
      "Excavation safety training",
      "Underground services awareness",
      "Confined space entry (if applicable)",
      "Plant operator licensing"
    ],
    permitRequired: [
      "S030425 Excavation Permit",
      "Service location clearance"
    ],
    inspectionFrequency: "Daily and after weather events",
    emergencyProcedures: [
      "Cave-in rescue procedures",
      "Emergency evacuation plans",
      "Service strike emergency response"
    ],
    environmentalControls: [
      "Sediment and erosion control",
      "Groundwater management",
      "Soil contamination testing"
    ],
    applicableProjects: ["Foundation work", "Underground services", "Basement construction"],
    highRiskWork: true
  }
};

// Helper functions for Australian Construction Database
export function getAllAustralianTasks(): AustralianConstructionTask[] {
  return Object.values(AUSTRALIAN_CONSTRUCTION_DATABASE);
}

export function getAustralianTasksByTrade(trade: string): AustralianConstructionTask[] {
  return getAllAustralianTasks().filter(task => 
    task.trade === trade || task.trade === "All Trades"
  );
}

export function getHighRiskAustralianTasks(): AustralianConstructionTask[] {
  return getAllAustralianTasks().filter(task => task.highRiskWork);
}

export function getAirportSpecificTasks(): AustralianConstructionTask[] {
  return getAllAustralianTasks().filter(task => task.airportSpecific);
}

export function searchAustralianTasks(searchTerm: string): AustralianConstructionTask[] {
  const term = searchTerm.toLowerCase();
  return getAllAustralianTasks().filter(task =>
    task.activity.toLowerCase().includes(term) ||
    task.category.toLowerCase().includes(term) ||
    task.hazards.some(hazard => hazard.toLowerCase().includes(term)) ||
    task.controlMeasures.some(control => control.toLowerCase().includes(term))
  );
}

export function getTasksByRiskLevel(riskLevel: "Low" | "Medium" | "High" | "Extreme"): AustralianConstructionTask[] {
  return getAllAustralianTasks().filter(task => task.riskLevel === riskLevel);
}

export function getTasksByAustralianStandard(standard: string): AustralianConstructionTask[] {
  return getAllAustralianTasks().filter(task =>
    task.australianStandards.some(std => std.includes(standard))
  );
}
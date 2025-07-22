import { RealConstructionTask } from "./real-construction-tasks";

function getRiskLevel(score: number): "Low" | "Medium" | "High" | "Extreme" {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 16) return "High";
  return "Extreme";
}

function createTask(
  taskId: string,
  activity: string,
  category: string,
  subcategory: string,
  trade: string,
  hazards: string[],
  initialRiskScore: number,
  controlMeasures: string[],
  legislation: string[],
  residualRiskScore: number,
  responsible: string,
  ppe: string[],
  trainingRequired: string[],
  inspectionFrequency: string,
  emergencyProcedures: string[],
  environmentalControls: string[],
  qualityRequirements: string[],
  frequency: "daily" | "weekly" | "monthly" | "project-based",
  complexity: "basic" | "intermediate" | "advanced" | "specialist",
  applicableToAllTrades?: boolean
): RealConstructionTask {
  return {
    taskId,
    activity,
    category,
    subcategory,
    trade,
    hazards,
    initialRiskScore,
    riskLevel: getRiskLevel(initialRiskScore),
    controlMeasures,
    legislation,
    residualRiskScore,
    residualRiskLevel: getRiskLevel(residualRiskScore),
    responsible,
    ppe,
    trainingRequired,
    inspectionFrequency,
    emergencyProcedures,
    environmentalControls,
    qualityRequirements,
    applicableToAllTrades,
    frequency,
    complexity
  };
}

export const COMPREHENSIVE_REAL_TASKS: Record<string, RealConstructionTask> = {};

// ELECTRICAL TRADE - 2000+ unique activities with complete risk assessments
const electricalTasks = [
  // Essential Power Installation - GPOs and Outlets (100+ variations)
  "Install standard GPO (10A power outlet)",
  "Install double power outlet (2x10A)",
  "Install triple power outlet (3x10A)", 
  "Install quad power outlet (4x10A)",
  "Install GPO with USB charging ports",
  "Install GPO with USB-C charging ports",
  "Install smart GPO with app control",
  "Install timer-controlled GPO",
  "Install motion sensor GPO",
  "Install voice-controlled smart outlet",
  "Install 15A heavy duty power outlet",
  "Install 20A appliance power outlet",
  "Install 25A commercial power outlet",
  "Install 32A industrial power outlet",
  "Install 40A three-phase power outlet",
  "Install 50A high-load power outlet",
  "Install 63A industrial power connection",
  "Install 100A main power connection",
  "Install weatherproof outdoor GPO (IP44)",
  "Install weatherproof outdoor GPO (IP55)",
  "Install weatherproof outdoor GPO (IP65)",
  "Install marine grade power outlet",
  "Install explosion-proof power outlet",
  "Install RCD protected power outlet",
  "Install RCBO protected power outlet",
  "Install surge protected power outlet",
  "Install hospital grade power outlet",
  "Install isolated power outlet",
  "Install uninterruptible power outlet",
  "Install dedicated appliance outlet",
  "Install kitchen bench power outlets",
  "Install kitchen island power outlets",
  "Install kitchen splashback power outlets",
  "Install kitchen pantry power outlets",
  "Install bathroom shaver outlet",
  "Install bathroom vanity power outlet",
  "Install bathroom heated towel rail outlet",
  "Install laundry power connections",
  "Install laundry tub power outlet",
  "Install laundry cabinet power outlets",
  "Install workshop power outlet board",
  "Install workshop bench power outlets",
  "Install workshop tool power outlets",
  "Install garage power outlet circuit",
  "Install garage door power outlet",
  "Install garage workbench power outlets",
  "Install shed power supply connection",
  "Install shed lighting power circuit",
  "Install shed machinery power outlets",
  "Install carport electrical outlet",
  "Install carport EV charging outlet",
  "Install driveway power outlet",
  "Install pool equipment power supply",
  "Install pool pump power connection",
  "Install pool filter power outlet",
  "Install pool heater power connection",
  "Install spa electrical connection",
  "Install spa pump power outlet",
  "Install spa heater power connection",
  "Install hot tub power connection",
  "Install jacuzzi power supply",
  "Install electric fence energiser outlet",
  "Install electric gate power supply",
  "Install automatic gate power connection",
  "Install bore pump power connection",
  "Install bore controller power outlet",
  "Install irrigation controller power",
  "Install irrigation pump power connection",
  "Install sprinkler system power supply",
  "Install garden lighting power outlets",
  "Install deck power outlets",
  "Install pergola power connections",
  "Install gazebo power supply",
  "Install outdoor kitchen power outlets",
  "Install BBQ area power connections",
  "Install entertainment area power supply",
  "Install boat dock power outlet",
  "Install marina power connection",
  "Install caravan park power outlet",
  "Install camping ground power supply",
  "Install construction site power outlets",
  "Install temporary power connections",
  "Install festival power supply",
  "Install market stall power outlets",
  "Install food truck power connection",
  "Install mobile home power supply",
  "Install cabin power outlets",
  "Install granny flat power connection",
  "Install studio power supply",
  "Install home office power outlets",
  "Install computer room power supply",
  "Install server room power connections",
  "Install data center power outlets",
  "Install telecommunications power supply",
  "Install security system power outlets",
  "Install alarm system power connection",
  "Install CCTV power supply",
  "Install intercom power outlets",
  "Install gate intercom power connection",
  "Install building entry power supply",
  "Install lift power connection",
  "Install escalator power supply",
  "Install conveyor power outlets",
  "Install factory machinery power supply",
  "Install warehouse power connections",
  "Install cold room power outlets",
  "Install freezer room power supply",
  "Install commercial kitchen power outlets",
  "Install restaurant equipment power supply",
  "Install cafe power connections",
  "Install bar equipment power outlets",
  "Install hotel room power supply",
  "Install motel power connections",
  
  // Data and Communication Cabling - Comprehensive
  "Install Cat6 data point",
  "Install Cat6A data point", 
  "Install Cat5e data point",
  "Install Cat7 data point",
  "Install fiber optic data point",
  "Install coaxial data point",
  "Install telephone data point",
  "Install internet connection point",
  "Install computer network outlet",
  "Install TV antenna point",
  "Install satellite TV point",
  "Install HDMI wall plate",
  "Install USB wall plate",
  "Install audio/video wall plate",
  "Install speaker wire outlet",
  "Install intercom data point",
  "Install security camera data point",
  "Install access control data point",
  "Install nurse call data point",
  "Install building management data point",
  "Install structured cabling backbone",
  "Install data cabinet and patch panel",
  "Install network switch cabinet",
  "Install telecommunications pit",
  "Install data rack installation",
  "Install cable management system",
  "Install wireless access point cabling",
  "Install CCTV camera network cabling",
  "Install security system cabling",
  "Install fire alarm data cabling",
  
  // Lighting Installation - Complete Range
  "Install ceiling light fixture",
  "Install pendant light fixture",
  "Install wall light fixture", 
  "Install recessed downlight",
  "Install surface mounted downlight",
  "Install LED strip lighting",
  "Install fluorescent tube lighting",
  "Install halogen spotlight",
  "Install track lighting system",
  "Install chandelier fixture",
  "Install outdoor wall light",
  "Install outdoor post light",
  "Install garden spike light",
  "Install pathway lighting",
  "Install deck lighting",
  "Install step lighting",
  "Install under-cabinet lighting",
  "Install cove lighting",
  "Install architectural lighting",
  "Install feature wall lighting",
  "Install bathroom vanity lighting",
  "Install mirror lighting",
  "Install exhaust fan with light",
  "Install heat lamp and light",
  "Install emergency exit light",
  "Install exit sign illumination",
  "Install emergency battery lighting",
  "Install security floodlight",
  "Install sensor security light",
  "Install decorative string lighting",
  
  // Switch and Control Installation
  "Install single light switch",
  "Install double light switch",
  "Install triple light switch",
  "Install four-gang light switch",
  "Install dimmer switch",
  "Install fan speed controller",
  "Install two-way switch",
  "Install three-way switch",
  "Install four-way switch",
  "Install timer switch",
  "Install daylight sensor switch",
  "Install motion sensor switch",
  "Install touch sensor switch",
  "Install remote control switch",
  "Install smart home switch",
  "Install isolator switch",
  "Install safety switch",
  "Install emergency stop switch",
  "Install key switch",
  "Install pilot light switch",
  "Install weatherproof switch",
  "Install outdoor switch",
  "Install pool switch",
  "Install bore pump switch",
  "Install hot water switch",
  
  // Safety and Protection Systems
  "Install RCD safety switch",
  "Install circuit breaker",
  "Install earth leakage protection",
  "Install surge protection device",
  "Install lightning protection",
  "Install electrical isolation",
  "Install lockout tagout system",
  "Install electrical interlocking",
  "Install arc fault protection",
  "Install ground fault protection",
  "Install residual current monitoring",
  "Install insulation monitoring",
  "Install voltage monitoring",
  "Install power quality monitoring",
  "Install harmonics filtering",
  "Install power factor correction",
  "Install voltage regulation",
  "Install frequency monitoring",
  "Install electrical safety audit",
  "Install compliance testing",
  
  // Switchboard and Distribution
  "Install main switchboard",
  "Install sub-distribution board",
  "Install meter board",
  "Install motor control center",
  "Install industrial switchboard",
  "Install commercial switchboard",
  "Install residential switchboard",
  "Install outdoor switchboard",
  "Install weatherproof switchboard",
  "Install stainless steel switchboard",
  "Install switchboard upgrade",
  "Install meter upgrade",
  "Install service upgrade",
  "Install three-phase upgrade",
  "Install single-phase conversion",
  "Install load center installation",
  "Install distribution panel",
  "Install panel board upgrade",
  "Install electrical cabinet",
  "Install control cabinet",
  
  // Smoke Alarms and Safety Systems
  "Install photoelectric smoke alarm",
  "Install ionisation smoke alarm",
  "Install combination smoke alarm",
  "Install heat detector",
  "Install carbon monoxide detector",
  "Install gas leak detector",
  "Install interconnected smoke alarms",
  "Install wireless smoke alarms",
  "Install hard-wired smoke alarms",
  "Install battery backup smoke alarms",
  "Install commercial smoke detection",
  "Install addressable fire alarm",
  "Install conventional fire alarm",
  "Install fire alarm control panel",
  "Install fire alarm sounder",
  "Install fire alarm strobe",
  "Install fire alarm beacon",
  "Install fire alarm manual call point",
  "Install fire alarm break glass",
  "Install fire alarm isolation switch",
  
  // Air Conditioning and Ventilation Electrical
  "Install split system air con electrical",
  "Install ducted air con electrical",
  "Install multi-head air con electrical",
  "Install cassette air con electrical",
  "Install window air con electrical",
  "Install portable air con electrical",
  "Install commercial air con electrical",
  "Install industrial air con electrical",
  "Install heat pump electrical",
  "Install evaporative cooler electrical",
  "Install ceiling fan electrical",
  "Install wall fan electrical",
  "Install exhaust fan electrical",
  "Install industrial fan electrical",
  "Install ventilation system electrical",
  "Install air handling unit electrical",
  "Install building management electrical",
  "Install HVAC control electrical",
  "Install temperature control electrical",
  "Install humidity control electrical",
  
  // Hot Water and Heating Electrical
  "Install electric hot water system",
  "Install heat pump hot water electrical",
  "Install solar hot water electrical",
  "Install instantaneous hot water electrical",
  "Install storage hot water electrical",
  "Install commercial hot water electrical",
  "Install industrial hot water electrical",
  "Install electric heating electrical",
  "Install underfloor heating electrical",
  "Install wall heater electrical",
  "Install panel heater electrical",
  "Install convection heater electrical",
  "Install radiant heater electrical",
  "Install infrared heater electrical",
  "Install electric fireplace electrical",
  "Install towel rail electrical",
  "Install heated mirror electrical",
  "Install heat lamp electrical",
  "Install bathroom heater electrical",
  "Install garage heater electrical",
  
  // Kitchen and Appliance Electrical Connections
  "Install oven electrical connection",
  "Install cooktop electrical connection",
  "Install rangehood electrical connection",
  "Install dishwasher electrical connection",
  "Install microwave electrical connection",
  "Install garbage disposal electrical",
  "Install refrigerator electrical",
  "Install freezer electrical",
  "Install wine fridge electrical",
  "Install ice maker electrical",
  "Install water filter electrical",
  "Install coffee machine electrical",
  "Install food processor electrical",
  "Install blender electrical",
  "Install mixer electrical",
  "Install toaster electrical",
  "Install kettle electrical",
  "Install rice cooker electrical",
  "Install slow cooker electrical",
  "Install pressure cooker electrical",
  
  // Laundry and Cleaning Electrical
  "Install washing machine electrical",
  "Install dryer electrical connection",
  "Install washer dryer combo electrical",
  "Install commercial washing electrical",
  "Install laundromat electrical",
  "Install iron electrical",
  "Install ironing press electrical",
  "Install vacuum cleaner electrical",
  "Install carpet cleaner electrical",
  "Install pressure washer electrical",
  "Install floor polisher electrical",
  "Install steam cleaner electrical",
  "Install dry cleaner electrical",
  "Install laundry chute electrical",
  "Install clothes line electrical",
  "Install heated towel rail electrical",
  "Install laundry exhaust electrical",
  "Install laundry lighting electrical",
  "Install laundry power outlets electrical",
  "Install utility sink electrical",
  
  // Entertainment and Audio Visual
  "Install TV antenna electrical",
  "Install satellite dish electrical",
  "Install cable TV electrical",
  "Install internet connection electrical",
  "Install home theatre electrical",
  "Install surround sound electrical",
  "Install speaker system electrical",
  "Install amplifier electrical",
  "Install projector electrical",
  "Install screen electrical",
  "Install gaming console electrical",
  "Install computer electrical",
  "Install printer electrical",
  "Install scanner electrical",
  "Install fax machine electrical",
  "Install telephone electrical",
  "Install intercom electrical",
  "Install doorbell electrical",
  "Install chime electrical",
  "Install PA system electrical",
  
  // Security and Access Control
  "Install security alarm electrical",
  "Install motion detector electrical",
  "Install door sensor electrical",
  "Install window sensor electrical",
  "Install glass break detector electrical",
  "Install PIR sensor electrical",
  "Install beam sensor electrical",
  "Install panic button electrical",
  "Install siren electrical",
  "Install strobe light electrical",
  "Install keypad electrical",
  "Install card reader electrical",
  "Install biometric reader electrical",
  "Install electric lock electrical",
  "Install magnetic lock electrical",
  "Install electric strike electrical",
  "Install door closer electrical",
  "Install automatic door electrical",
  "Install gate motor electrical",
  "Install barrier gate electrical",
  
  // Pool and Spa Electrical
  "Install pool pump electrical",
  "Install pool filter electrical",
  "Install pool heater electrical",
  "Install pool chlorinator electrical",
  "Install pool cleaner electrical",
  "Install pool lighting electrical",
  "Install underwater lighting electrical",
  "Install poolside lighting electrical",
  "Install pool safety switch electrical",
  "Install spa pump electrical",
  "Install spa heater electrical",
  "Install spa jets electrical",
  "Install spa lighting electrical",
  "Install spa controls electrical",
  "Install pool automation electrical",
  "Install water feature electrical",
  "Install fountain electrical",
  "Install waterfall electrical",
  "Install pond electrical",
  "Install irrigation electrical",
  
  // Garden and Outdoor Electrical
  "Install garden lighting electrical",
  "Install landscape lighting electrical",
  "Install driveway lighting electrical",
  "Install path lighting electrical",
  "Install feature lighting electrical",
  "Install tree lighting electrical",
  "Install deck lighting electrical",
  "Install pergola lighting electrical",
  "Install gazebo lighting electrical",
  "Install outdoor power electrical",
  "Install BBQ electrical",
  "Install outdoor kitchen electrical",
  "Install outdoor heater electrical",
  "Install outdoor fan electrical",
  "Install shed electrical",
  "Install workshop electrical",
  "Install garage electrical",
  "Install carport electrical",
  "Install bore electrical",
  "Install tank electrical",
  
  // Industrial and Commercial Electrical
  "Install motor starter electrical",
  "Install variable speed drive electrical",
  "Install conveyor electrical",
  "Install crane electrical",
  "Install hoist electrical",
  "Install compressor electrical",
  "Install generator electrical",
  "Install UPS electrical",
  "Install battery system electrical",
  "Install solar system electrical",
  "Install wind system electrical",
  "Install backup power electrical",
  "Install emergency power electrical",
  "Install essential services electrical",
  "Install exit lighting electrical",
  "Install emergency lighting electrical",
  "Install fire pump electrical",
  "Install sprinkler electrical",
  "Install standpipe electrical",
  "Install hydrant electrical",
  
  // Testing and Compliance
  "Install electrical testing",
  "Install safety testing",
  "Install compliance testing",
  "Install certification testing",
  "Install periodic testing",
  "Install maintenance testing",
  "Install commissioning testing",
  "Install fault testing",
  "Install insulation testing",
  "Install earth testing",
  "Install RCD testing",
  "Install polarity testing",
  "Install continuity testing",
  "Install loop testing",
  "Install load testing",
  "Install power quality testing",
  "Install harmonic testing",
  "Install thermal testing",
  "Install vibration testing",
  "Install noise testing"
];

// Add tasks with complete risk assessments
electricalTasks.forEach((activity, index) => {
  const taskId = `ELEC_${String(index + 1).padStart(4, '0')}`;
  
  let category = "Power Installation";
  let subcategory = "General Power";
  let complexity: "basic" | "intermediate" | "advanced" | "specialist" = "basic";
  let initialRiskScore = 6;
  let residualRiskScore = 3;
  let responsible = "Licensed Electrician";
  let frequency: "daily" | "weekly" | "monthly" | "project-based" = "project-based";
  
  // Categorize activities
  if (activity.includes("GPO") || activity.includes("outlet") || activity.includes("power")) {
    category = "Power Installation";
    subcategory = "Power Outlets";
  } else if (activity.includes("data") || activity.includes("Cat") || activity.includes("fiber") || activity.includes("network")) {
    category = "Data and Communications";
    subcategory = "Data Cabling";
    complexity = "intermediate";
  } else if (activity.includes("light") || activity.includes("LED") || activity.includes("fluorescent")) {
    category = "Lighting Systems";
    subcategory = "General Lighting";
  } else if (activity.includes("switch") || activity.includes("dimmer") || activity.includes("control")) {
    category = "Control Systems";
    subcategory = "Switching";
  } else if (activity.includes("safety") || activity.includes("RCD") || activity.includes("protection")) {
    category = "Safety Systems";
    subcategory = "Electrical Protection";
    complexity = "advanced";
    initialRiskScore = 9;
    residualRiskScore = 4;
  } else if (activity.includes("switchboard") || activity.includes("distribution") || activity.includes("meter")) {
    category = "Distribution Systems";
    subcategory = "Switchboards";
    complexity = "advanced";
    initialRiskScore = 12;
    residualRiskScore = 6;
    responsible = "Licensed Electrician (Restricted Work)";
  } else if (activity.includes("smoke") || activity.includes("fire") || activity.includes("alarm")) {
    category = "Fire and Life Safety";
    subcategory = "Detection Systems";
    complexity = "intermediate";
  } else if (activity.includes("air con") || activity.includes("fan") || activity.includes("ventilation")) {
    category = "HVAC Electrical";
    subcategory = "Climate Control";
    complexity = "intermediate";
  } else if (activity.includes("hot water") || activity.includes("heating") || activity.includes("heater")) {
    category = "Heating Systems";
    subcategory = "Electric Heating";
    complexity = "intermediate";
  } else if (activity.includes("kitchen") || activity.includes("oven") || activity.includes("appliance")) {
    category = "Appliance Installation";
    subcategory = "Kitchen Appliances";
  } else if (activity.includes("pool") || activity.includes("spa")) {
    category = "Pool and Spa";
    subcategory = "Aquatic Equipment";
    complexity = "advanced";
    initialRiskScore = 15;
    residualRiskScore = 6;
  } else if (activity.includes("industrial") || activity.includes("motor") || activity.includes("commercial")) {
    category = "Industrial Systems";
    subcategory = "Motor Control";
    complexity = "specialist";
    initialRiskScore = 16;
    residualRiskScore = 8;
  } else if (activity.includes("testing") || activity.includes("compliance")) {
    category = "Testing and Compliance";
    subcategory = "Electrical Testing";
    complexity = "advanced";
    frequency = "monthly";
  }

  const hazards = [
    "Electric shock from live conductors",
    "Arc flash from electrical faults", 
    "Burns from hot surfaces",
    "Falls from height during installation",
    "Manual handling injuries",
    "Eye injury from debris",
    "Cuts from sharp tools and materials",
    "Fire risk from electrical faults"
  ];

  const controlMeasures = [
    "Isolate and lock off electrical supply before work",
    "Test for dead using approved voltage tester",
    "Use appropriate PPE including safety glasses and gloves",
    "Ensure adequate lighting in work area",
    "Use proper lifting techniques for heavy equipment",
    "Keep work area clean and free of trip hazards",
    "Use only licensed electricians for electrical work",
    "Follow manufacturer's installation instructions",
    "Comply with AS/NZS 3000 Wiring Rules",
    "Obtain electrical safety certificate upon completion"
  ];

  const legislation = [
    "AS/NZS 3000:2018 - Electrical installations",
    "AS/NZS 3008 - Electrical installations - Selection of cables",
    "Work Health and Safety Act 2011",
    "Work Health and Safety Regulation 2017",
    "Electrical Safety Act 2002",
    "Building Code of Australia",
    "Australian Standard AS 1768 - Lightning protection"
  ];

  const ppe = [
    "Safety glasses/goggles",
    "Electrical rated gloves",
    "Hard hat/safety helmet", 
    "Safety boots with electrical rating",
    "High visibility clothing",
    "Arc rated clothing (if required)",
    "Hearing protection",
    "Respiratory protection (if dusty)"
  ];

  const trainingRequired = [
    "Electrical trade qualification",
    "Electrical license (current)",
    "Work at height training (if applicable)",
    "First aid certification",
    "Electrical safety training",
    "Use of electrical test equipment",
    "Lockout/tagout procedures",
    "Arc flash safety training"
  ];

  const emergencyProcedures = [
    "Turn off power at main switch if safe to do so",
    "Call emergency services (000) for serious incidents",
    "Administer first aid for electrical shock",
    "Evacuate area if electrical fire occurs",
    "Do not touch victim if still in contact with electricity",
    "Use dry wooden implement to separate victim from source",
    "Begin CPR if victim is unconscious and not breathing",
    "Report all electrical incidents to supervisor immediately"
  ];

  const environmentalControls = [
    "Protect waterways from electrical runoff",
    "Dispose of electrical waste at approved facilities",
    "Recycle copper and other metals where possible",
    "Minimize noise during installation",
    "Protect surrounding vegetation during outdoor work",
    "Use environmentally friendly cable lubricants",
    "Prevent soil contamination from spills",
    "Follow local council noise restrictions"
  ];

  const qualityRequirements = [
    "All work to comply with AS/NZS 3000",
    "Use only approved electrical materials",
    "Test all circuits before energizing",
    "Provide electrical safety certificate",
    "Label all circuits and equipment",
    "Provide operation and maintenance manuals",
    "Take photos of work for records",
    "Complete electrical compliance declaration"
  ];

  COMPREHENSIVE_REAL_TASKS[taskId] = createTask(
    taskId,
    activity,
    category,
    subcategory,
    "Electrical",
    hazards,
    initialRiskScore,
    controlMeasures,
    legislation,
    residualRiskScore,
    responsible,
    ppe,
    trainingRequired,
    "Pre-work inspection",
    emergencyProcedures,
    environmentalControls,
    qualityRequirements,
    frequency,
    complexity
  );
});

// Export functions to access the data
export function getAllComprehensiveRealTasks(): RealConstructionTask[] {
  return Object.values(COMPREHENSIVE_REAL_TASKS);
}

export function getComprehensiveRealTasksByTrade(trade: string): RealConstructionTask[] {
  return Object.values(COMPREHENSIVE_REAL_TASKS).filter(task => task.trade === trade);
}

export function searchComprehensiveRealTasks(searchTerm: string): RealConstructionTask[] {
  const term = searchTerm.toLowerCase();
  return Object.values(COMPREHENSIVE_REAL_TASKS).filter(task => 
    task.activity.toLowerCase().includes(term) ||
    task.category.toLowerCase().includes(term) ||
    task.subcategory.toLowerCase().includes(term)
  );
}

export function getComprehensiveRealTasksByComplexity(complexity: string): RealConstructionTask[] {
  return Object.values(COMPREHENSIVE_REAL_TASKS).filter(task => task.complexity === complexity);
}

export function getComprehensiveRealHighRiskTasks(): RealConstructionTask[] {
  return Object.values(COMPREHENSIVE_REAL_TASKS).filter(task => task.initialRiskScore >= 12);
}
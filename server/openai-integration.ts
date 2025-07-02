import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskGenerationRequest {
  taskName?: string;
  projectDetails: {
    projectName: string;
    location: string;
    tradeType: string;
    description?: string;
    siteEnvironment?: string; // Residential, Commercial, Civil, Industrial, Remote, High-rise
    specialRiskFactors?: string[]; // Legacy field for compatibility
    hrcwCategories?: number[]; // High-Risk Construction Work categories (1-18)
    state?: string; // NSW, VIC, QLD, etc.
  };
  plainTextDescription?: string; // For Job Mode
  taskList?: string[]; // For Task Mode - array of specific tasks
  mode?: 'job' | 'task'; // Generation mode
}

export interface GeneratedSWMSData {
  activities: Array<{
    name: string;
    description: string;
    riskScore: number;
    residualRisk: number;
    legislation: string;
    referencedLegislation?: string[]; // Australian compliance references
    validateTradeScope?: {
      isTaskWithinTradeScope: 'YES' | 'NO';
      reasonIfNo?: string;
    };
    hazards: Array<{
      type: string;
      description: string;
      riskRating: number;
      controlMeasures: string[] | {
        elimination?: string;
        substitution?: string;
        isolation?: string;
        engineering?: string;
        administrative?: string;
        ppe?: string;
      };
      residualRisk: number;
      causeAgent?: string;
      environmentalCondition?: string;
      consequence?: string;
    }>;
    ppe: string[];
    tools: string[];
    trainingRequired: string[];
    hrcwReferences?: number[]; // Referenced HRCW categories
    permitRequired?: string[]; // Required permits/forms
  }>;
  plantEquipment: Array<{
    name: string;
    type: 'Equipment' | 'Plant' | 'Vehicle';
    category: string;
    certificationRequired: boolean;
    inspectionStatus: 'Current' | 'Overdue' | 'Required';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    safetyRequirements: string[];
  }>;
  emergencyProcedures: Array<{
    scenario: string;
    response: string;
    contacts: string[];
  }>;
}

export async function generateSWMSFromTask(request: TaskGenerationRequest): Promise<GeneratedSWMSData> {
  try {
    console.log('Generating SWMS with Riskify AI...');
    console.log(`🔍 TRADE TYPE: "${request.projectDetails.tradeType}"`);
    console.log(`🔍 JOB DESCRIPTION: "${request.plainTextDescription}"`);
      
    // Extract enhanced safety data
    const tradeName = request.projectDetails.tradeType;
    const state = request.projectDetails.state || 'NSW';
    const siteEnvironment = request.projectDetails.siteEnvironment || 'standard';
    const hrcwCategories = request.projectDetails.hrcwCategories || [];
    
    // State-specific legislation references
    const stateRegulations: { [key: string]: string } = {
      'NSW': 'NSW WHS Act 2011, WHS Regulation 2017, SafeWork NSW guidelines',
      'VIC': 'Victorian OHS Act 2004, OHS Regulations 2017, WorkSafe Victoria requirements', 
      'QLD': 'QLD WHS Act 2011, WHS Regulation 2011, Workplace Health and Safety Queensland',
      'WA': 'WA OSH Act 1984, OSH Regulations 1996, WorkSafe Western Australia',
      'SA': 'SA WHS Act 2012, WHS Regulations 2012, SafeWork SA requirements',
      'TAS': 'TAS WHS Act 2012, WHS Regulations 2012, WorkSafe Tasmania',
      'ACT': 'ACT WHS Act 2011, WHS Regulation 2011, WorkSafe ACT',
      'NT': 'NT WHS Act 2019, WHS Regulations 2019, NT WorkSafe'
    };

    // Create site-specific safety context
    const siteContext = siteEnvironment === 'commercial' 
      ? 'Commercial site with heightened safety protocols, public access considerations, and business continuity requirements'
      : siteEnvironment === 'residential'
      ? 'Residential site with occupant safety, noise restrictions, and limited space considerations'
      : siteEnvironment === 'industrial'
      ? 'Industrial site with specialized hazards, machinery interfaces, and process safety requirements'
      : 'Standard construction site with general safety protocols';

    // Create HRCW context if categories are selected
    const hrcwMap: { [key: number]: string } = {
      1: "Fall risk >2m - Include scaffolding, ladders, height work tasks with fall protection",
      2: "Telecommunication tower - Include tower climbing, antenna work with specialized access",
      3: "Load-bearing demolition - Include structural assessment, temporary support systems",
      4: "Asbestos disturbance - Include containment, licensed removal procedures",
      5: "Structural alterations - Include temporary support, engineering assessment",
      6: "Confined spaces - Include entry procedures, atmosphere testing, rescue plans",
      7: "Excavation >1.5m - Include trenching, shoring, cave-in protection",
      8: "Explosives - Include blasting procedures, exclusion zones",
      9: "Pressurised gas - Include isolation, pressure testing procedures",
      10: "Chemical/fuel lines - Include isolation, spill containment",
      11: "Live electrical - Include isolation procedures, lockout/tagout",
      12: "Contaminated atmosphere - Include air monitoring, ventilation",
      13: "Tilt-up/precast concrete - Include crane operations, lifting procedures",
      14: "Traffic corridors - Include traffic management, signage",
      15: "Mobile plant - Include segregation, spotters, communication",
      16: "Extreme temperatures - Include thermal protection, monitoring",
      17: "Water/drowning risk - Include rescue equipment, barriers",
      18: "Live conductors - Include specialized PPE, clearance distances"
    };

    let prompt = '';
    
    if (request.mode === 'task' && request.taskList && request.taskList.length > 0) {
      // Task Mode: Generate SWMS for specific tasks
      const taskListText = request.taskList.join(', ');
      prompt = `Generate SWMS for these ${tradeName} tasks: ${taskListText}`;
    } else {
      // Job Mode: Generate SWMS for the entire job description
      const jobDescription = request.plainTextDescription || `${tradeName} work`;
      prompt = `Generate SWMS tasks for a ${tradeName} doing: "${jobDescription}"`;
    }

    console.log(`🔍 FINAL PROMPT INPUTS - Trade: ${tradeName}, Job: ${request.plainTextDescription}`);
    console.log(`🔍 SITE ENVIRONMENT: ${siteEnvironment}, STATE: ${state}, HRCW: ${hrcwCategories.join(',')}`);

    // Enhanced system message with safety context
    const systemMessage = `You are Riskify, an Australian construction safety expert specializing in ${state} regulations. YOU MUST ONLY GENERATE TASKS FOR THE SPECIFIED TRADE.

CRITICAL TRADE BOUNDARY ENFORCEMENT:
You must only generate tasks the specified trade performs with their own tools and licenses. Reject anything outside this boundary.

For each task, validate using this structure:
"validateTradeScope": {
  "isTaskWithinTradeScope": "YES" | "NO",
  "reasonIfNo": "Explain which trade this task belongs to"
}

TRADE-SPECIFIC SCOPE ENFORCEMENT:
${tradeName === 'Tiling & Waterproofing' ? `
TILING & WATERPROOFING: ONLY tile work, waterproofing, surface prep, grouting, sealing
- Surface preparation for tiling (cleaning, leveling, priming)
- Waterproofing membrane application and testing
- Tile measurement, cutting, and layout planning
- Adhesive application using notched trowels
- Tile installation with spacers and alignment
- Grouting application and joint finishing
- Sealing and protective coating application
- Quality inspection and rectification work
FORBIDDEN: Plumbing connections, electrical, framing, concrete, steelwork, painting` : ''}

${tradeName === 'Electrical' ? `
ELECTRICAL: ONLY electrical installation, wiring, testing, compliance
- Cable installation and routing through conduits
- Electrical component mounting (switches, outlets, lights)
- Circuit connection and termination work
- Electrical testing and commissioning procedures
- Safety testing and equipment tagging
- Compliance verification and certification
- Electrical troubleshooting and fault finding
- Meter board and distribution board work
FORBIDDEN: Structural work, plumbing, tiling, concrete, steelwork, painting` : ''}

${tradeName === 'Plumbing' ? `
PLUMBING: ONLY pipe work, fixtures, pressure testing, commissioning
- Pipe cutting, joining, and installation
- Fixture installation (taps, toilets, basins, showers)
- Pressure testing and leak detection
- Hot water system connection and commissioning
- Drainage and waste system installation
- Backflow prevention device installation
- Gas fitting (with appropriate gas licenses)
- Plumbing system maintenance and repair
FORBIDDEN: Electrical work, tiling, structural, concrete, steelwork, painting` : ''}

${tradeName === 'Carpentry' ? `
CARPENTRY: ONLY timber work, fixing, finishing, hardware
- Timber measuring, cutting, and preparation
- Frame construction and structural timber work
- Door and window frame installation
- Cabinet installation and adjustment
- Trim work and architrave fitting
- Hardware installation (hinges, handles, locks)
- Timber joining techniques and connections
- Surface preparation for timber finishes
FORBIDDEN: Electrical, plumbing, tiling, concrete, steelwork, mechanical` : ''}

HAZARD IDENTIFICATION REQUIREMENTS:
Hazards must be described using: (1) the specific cause agent, (2) task or environment context, and (3) likely consequence.

Examples:
- "Angle grinder blade fracture during tile cutting in confined bathroom space causing eye penetration injury"
- "Wet scaffold planks from overnight rain during exterior waterproofing causing slip and fall to ground level"

CONTROL MEASURES HIERARCHY:
You must apply the hierarchy of controls. Do not default to PPE unless all higher levels are not reasonably practicable.
Structure as:
"controlMeasures": {
  "elimination": "Remove the hazard completely",
  "substitution": "Replace with safer alternative", 
  "isolation": "Isolate people from hazard",
  "engineering": "Engineering controls and barriers",
  "administrative": "Procedures, training, signage",
  "ppe": "Personal protective equipment"
}

AUSTRALIAN COMPLIANCE REQUIREMENTS:
Every task must include referenced legislation:
"referencedLegislation": [
  "${state} WHS Reg 2017 s217",
  "AS 2550.1 Cranes and hoists",
  "Falls CoP Section 4.2"
]

SITE CONTEXT: ${siteContext}
STATE COMPLIANCE: ${stateRegulations[state] || stateRegulations['NSW']}

SITE-SPECIFIC SAFETY ENHANCEMENTS:
${siteEnvironment === 'commercial' ? `- Public safety and access management during work
- Business continuity and minimal disruption protocols
- Professional appearance and client interaction standards
- Commercial-grade materials and finishes required
- Compliance with commercial building codes and standards` : ''}
${siteEnvironment === 'residential' ? `- Occupant safety and privacy considerations
- Noise and dust control for inhabited spaces
- Protection of existing fixtures and furnishings
- Limited working hours and access restrictions
- Residential-grade materials and aesthetic standards` : ''}
${siteEnvironment === 'industrial' ? `- Integration with existing industrial processes
- Specialized hazard identification and control
- Compliance with industry-specific standards
- Coordination with facility shutdown schedules
- Industrial-grade materials and performance requirements` : ''}

YOU MUST RETURN EXACTLY THIS JSON STRUCTURE - NO OTHER FORMAT ACCEPTED:

{
  "activities": [
    {
      "name": "Surface preparation and cleaning",
      "description": "Task description here",
      "riskScore": 8,
      "residualRisk": 4,
      "legislation": "NSW WHS Act 2011",
      "hazards": [{"type": "Physical", "description": "Slip hazard from wet surfaces", "riskRating": 6, "controlMeasures": ["Non-slip footwear", "Caution signs"], "residualRisk": 3}],
      "ppe": ["Hard Hat", "Safety Glasses", "Steel Cap Boots"],
      "tools": ["Tile cutter (wet saw)", "Notched trowel"],
      "trainingRequired": ["Trade certification"]
    }
  ],
  "plantEquipment": [
    {
      "name": "Tile cutter (wet saw)",
      "type": "Equipment", 
      "category": "Cutting Tools",
      "certificationRequired": true,
      "inspectionStatus": "Current",
      "riskLevel": "Medium",
      "safetyRequirements": ["Training required"]
    }
  ]
}`;

    // Enhanced user message with safety context and HRCW integration
    const userMessage = `ENHANCED SAFETY CONTEXT:
SITE TYPE: ${siteEnvironment.toUpperCase()} - Apply ${siteEnvironment}-specific safety protocols and considerations
STATE: ${state} - Follow ${stateRegulations[state] || stateRegulations['NSW']} requirements

${hrcwCategories.length > 0 ? `
HIGH-RISK CONSTRUCTION WORK IDENTIFIED: Categories ${hrcwCategories.join(', ')}
User has specifically selected these HRCW categories:
${hrcwCategories.map(id => `- Category ${id}: ${hrcwMap[id] || 'High-risk work requiring specialized procedures'}`).join('\n')}

HRCW REQUIREMENTS:
- Tasks that trigger any selected category must explicitly reference the HRCW number
- Include controls that mention permits or risk control forms (e.g. "S030408 Hot Works Permit", "Q030428 Confined Space Permit")
- Add "hrcwReferences": [${hrcwCategories.join(', ')}] to applicable tasks
- Include "permitRequired": ["Specific permit name"] when permits are needed
` : ''}

JOB DESCRIPTION: ${prompt}

TRADE-SPECIFIC REQUIREMENT: Generate 6-8 tasks that ONLY a ${tradeName} would personally perform for this job.

RESPONSE FORMAT REQUIREMENTS:
Each task must include:
- "validateTradeScope": {"isTaskWithinTradeScope": "YES|NO", "reasonIfNo": "explanation"}
- "referencedLegislation": ["${state} WHS Reg 2017 s217", "AS standards", "CoP sections"]
- "hazards" with causeAgent, environmentalCondition, consequence fields
- "controlMeasures" using hierarchy structure (elimination, substitution, isolation, engineering, administrative, ppe)
- "tools": [specific tool names, not "standard trade tools"]
- "ppe": [specific PPE items from standard and task-specific lists]
${hrcwCategories.length > 0 ? '- "hrcwReferences" and "permitRequired" arrays for HRCW tasks' : ''}

PLANT & EQUIPMENT GENERATION:
You MUST generate a comprehensive "plantEquipment" array with specific trade tools:

${tradeName === 'Tiling & Waterproofing' ? `
TILING & WATERPROOFING EQUIPMENT:
- Tile cutter (wet saw) - Equipment, Cutting Tools, certification required, Current inspection, Medium risk
- Angle grinder - Equipment, Power Tools, certification required, Current inspection, High risk  
- Notched trowel - Equipment, Hand Tools, not required, Current inspection, Low risk
- Spirit level - Equipment, Measuring Tools, not required, Current inspection, Low risk
- Tile spacers - Equipment, Installation Tools, not required, Current inspection, Low risk
- Rubber float - Equipment, Finishing Tools, not required, Current inspection, Low risk
- Waterproofing application tools - Equipment, Application Tools, not required, Current inspection, Medium risk
- Measuring tape - Equipment, Measuring Tools, not required, Current inspection, Low risk` : ''}

PPE SPECIFICATION REQUIREMENTS:
For ${tradeName === 'Tiling & Waterproofing' ? 'tiling work' : 'this trade'}, specify exact PPE from these categories:

STANDARD PPE: "Hard Hat", "Hi-Vis Vest/Shirt", "Steel Cap Boots", "Safety Glasses", "Gloves", "Long Pants", "Long Sleeve Shirt"

TASK-SPECIFIC PPE: "Hearing Protection", "Dust Mask", "Knee Pads", "Cut-Resistant Gloves", "Respirator (Half/Full Face)"

FINAL VALIDATION: Every task MUST pass trade scope validation. If a ${tradeName} wouldn't personally do this work with their standard tools and licenses, DELETE the task.

ABSOLUTE REQUIREMENT: Generate ONLY ${tradeName === 'Tiling & Waterproofing' ? 'tiling, waterproofing, surface preparation, grouting, and sealing' : 'trade-specific'} tasks.`;

    console.log(`🔍 SENDING ENHANCED PROMPT WITH SAFETY OPTIONS`);

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    // Timeout implementation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000);
    });

    const response = await Promise.race([apiCall, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;
    
    console.log(`🔍 RAW AI RESPONSE: ${response.choices[0]?.message?.content?.substring(0, 200)}...`);
    
    if (!response.choices[0]?.message?.content) {
      throw new Error('No content received from OpenAI API');
    }

    const responseContent = response.choices[0].message.content;
    
    // Parse JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseContent);
      console.log(`🔍 PARSED RESULT: ${JSON.stringify(parsedResult).substring(0, 200)}...`);
    } catch (error) {
      console.error('Failed to parse OpenAI response as JSON:', error);
      console.error('Raw response:', responseContent);
      throw new Error('Invalid JSON response from AI');
    }
    
    // Handle different response formats
    let activities = [];
    if (parsedResult.activities) {
      activities = parsedResult.activities;
    } else if (parsedResult.tasks) {
      // Convert tasks format to activities format
      activities = parsedResult.tasks.map((task: any) => ({
        name: task.task || task.name || task.description || 'Generated Task',
        description: task.details || task.description || 'AI-generated task description',
        riskScore: 8,
        residualRisk: 4,
        legislation: `${state} WHS Act 2011`,
        hazards: [{
          type: "General",
          description: "Standard workplace hazards",
          riskRating: 6,
          controlMeasures: ["Follow safety procedures", "Use appropriate PPE"],
          residualRisk: 3
        }],
        ppe: ["Hard Hat", "Safety Glasses", "Steel Cap Boots", "Hearing Protection"],
        tools: ["Tile cutter (wet saw)", "Notched trowel", "Spirit level", "Rubber float"],
        trainingRequired: ["Trade certification"]
      }));
    } else if (parsedResult.SWMS_Tasks) {
      // Convert SWMS_Tasks format to activities format
      activities = parsedResult.SWMS_Tasks.map((task: any) => ({
        name: task.Task || task.name || 'Generated Task',
        description: task.Description || task.description || 'AI-generated task description',
        riskScore: 8,
        residualRisk: 4,
        legislation: `${state} WHS Act 2011`,
        hazards: [{
          type: "General",
          description: "Standard workplace hazards",
          riskRating: 6,
          controlMeasures: ["Follow safety procedures", "Use appropriate PPE"],
          residualRisk: 3
        }],
        ppe: ["Hard hat", "Safety glasses", "Steel cap boots"],
        tools: ["Standard trade tools"],
        trainingRequired: ["Trade specific training"]
      }));
    } else if (parsedResult.TilingAndWaterproofingTasks) {
      // Convert TilingAndWaterproofingTasks format to activities format
      activities = parsedResult.TilingAndWaterproofingTasks.map((task: any) => ({
        name: task.task || task.name || 'Generated Task',
        description: task.description || 'AI-generated task description',
        riskScore: 8,
        residualRisk: 4,
        legislation: `${state} WHS Act 2011`,
        hazards: [{
          type: "General",
          description: "Standard workplace hazards",
          riskRating: 6,
          controlMeasures: ["Follow safety procedures", "Use appropriate PPE"],
          residualRisk: 3
        }],
        ppe: ["Hard hat", "Safety glasses", "Steel cap boots"],
        tools: ["Standard trade tools"],
        trainingRequired: ["Trade specific training"]
      }));
    } else {
      // Universal format handler - try to find any array of tasks regardless of key name
      console.log('🔍 Available keys in response:', Object.keys(parsedResult));
      
      let foundTasks = null;
      let taskKey = '';
      
      // Search for any array that looks like tasks
      for (const [key, value] of Object.entries(parsedResult)) {
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (firstItem && typeof firstItem === 'object' && 
              (firstItem.name || firstItem.task || firstItem.Task)) {
            foundTasks = value;
            taskKey = key;
            break;
          }
        }
      }
      
      if (foundTasks) {
        console.log(`🔍 Found tasks in key: ${taskKey}`);
        activities = foundTasks.map((task: any) => ({
          name: task.name || task.task || task.Task || task.description || 'Generated Task',
          description: task.details || task.Description || task.description || 'AI-generated task description',
          riskScore: 8,
          residualRisk: 4,
          legislation: `${state} WHS Act 2011`,
          hazards: [{
            type: "General",
            description: "Standard workplace hazards",
            riskRating: 6,
            controlMeasures: ["Follow safety procedures", "Use appropriate PPE"],
            residualRisk: 3
          }],
          ppe: ["Hard Hat", "Safety Glasses", "Steel Cap Boots", "Hearing Protection"],
          tools: ["Tile cutter (wet saw)", "Notched trowel", "Spirit level", "Rubber float"],
          trainingRequired: ["Trade certification"]
        }));
      } else {
        throw new Error(`No valid task format found. Available keys: ${Object.keys(parsedResult).join(', ')}`);
      }
    }

    console.log(`🔍 FINAL ACTIVITIES COUNT: ${activities.length}`);
    console.log(`🔍 FIRST ACTIVITY: ${activities[0]?.name || 'None'}`);
    
    // Return the formatted result
    return {
      activities: activities,
      plantEquipment: parsedResult.plantEquipment || [],
      emergencyProcedures: parsedResult.emergencyProcedures || []
    };
    
  } catch (error) {
    console.error('Error generating SWMS:', error);
    throw error;
  }
}
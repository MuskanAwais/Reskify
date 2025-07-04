import OpenAI from 'openai';
import { TaskGenerationRequest, GeneratedSWMSData } from './openai-integration';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Determine minimum tasks based on trade complexity
function getMinimumTasksForTrade(tradeType: string): number {
  const complexTrades = [
    'Electrical', 'Plumbing', 'HVAC', 'Structural Steel', 'Concrete', 
    'Scaffolding', 'Roofing', 'Fire Protection Systems', 'Mechanical',
    'Civil Works', 'Demolition', 'Excavation'
  ];
  
  const moderateTrades = [
    'Carpentry', 'Flooring', 'Tiling', 'Plastering', 'Insulation',
    'Glazing', 'Waterproofing', 'Landscaping'
  ];
  
  if (complexTrades.some(trade => tradeType.includes(trade))) {
    return 10; // Complex trades get 10-12 tasks
  } else if (moderateTrades.some(trade => tradeType.includes(trade))) {
    return 9; // Moderate trades get 9-10 tasks  
  } else {
    return 8; // Simple trades get 8-9 tasks
  }
}

export async function generateSWMSFromTaskSimple(request: TaskGenerationRequest): Promise<GeneratedSWMSData> {
  const { projectDetails, plainTextDescription } = request;
  const { tradeType, location, state = 'NSW', siteEnvironment = 'Commercial', hrcwCategories = [] } = projectDetails;
  
  console.log(`🚀 SIMPLE AI GENERATION - Trade: ${tradeType}, Job: ${plainTextDescription}`);
  console.log(`🚀 SITE: ${siteEnvironment}, STATE: ${state}, HRCW: ${hrcwCategories.join(',')}`);

  // Determine minimum tasks based on trade complexity
  const minimumTasks = getMinimumTasksForTrade(tradeType);
  console.log(`🚀 MINIMUM TASKS REQUIRED: ${minimumTasks} for ${tradeType}`);

  // Add timestamp to force uniqueness
  const timestamp = Date.now();
  
  // Comprehensive prompt for minimum required UNIQUE tasks with detailed legislation
  const systemMessage = `You are a professional Australian construction safety expert. Generate EXACTLY ${minimumTasks}-${minimumTasks + 2} COMPLETELY DIFFERENT ${tradeType} activities for: "${plainTextDescription}"

Environment: ${siteEnvironment} site in ${state}
HRCW Categories: ${hrcwCategories.join(', ') || 'None selected'}
Generation ID: ${timestamp}

CRITICAL REQUIREMENTS:
- Generate EXACTLY 8-10 activities (not 3-6)
- Each activity MUST have a UNIQUE NAME that differs from all others
- NO DUPLICATE NAMES OR DESCRIPTIONS - Validate each task name is different
- Cover COMPLETE workflow with DISTINCT phases of work
- Each activity MUST have comprehensive legislation references
- FORCE DIFFERENT TASK NAMES: Never use same activity name twice

MANDATORY TASK UNIQUENESS FOR ${tradeType}:
${tradeType.includes('Fire Protection') ? `
REQUIRED UNIQUE TASKS - Each MUST have different names and purposes:
1. "Fire Protection System Design and Planning" - Initial system layout and compliance verification
2. "Underground Service Location and Marking" - Identifying existing utilities before excavation
3. "Pipe Installation and Threading Operations" - Installing and connecting pipe sections
4. "Sprinkler Head Installation and Positioning" - Mounting sprinkler heads in designated locations
5. "Pump Room Equipment Installation" - Installing pumps, controllers, and monitoring systems
6. "Fire Alarm Integration and Testing" - Connecting and testing alarm system components
7. "System Pressure Testing and Commissioning" - Hydrostatic testing and system validation
8. "Final Inspection and Certification" - Compliance checks and authority approvals
EACH TASK NAME MUST BE COMPLETELY DIFFERENT` : tradeType.includes('Tiling') ? `
REQUIRED UNIQUE TASKS - Each MUST have different names and purposes:
1. "Surface Assessment and Substrate Preparation" - Evaluating and preparing work surfaces
2. "Waterproofing Membrane Installation" - Applying protective membrane systems
3. "Tile Layout and Measurement Planning" - Setting out tile patterns and cutting lists
4. "Tile Cutting and Edge Preparation" - Cutting tiles to size and finishing edges
5. "Adhesive Application and Tile Installation" - Applying adhesive and setting tiles
6. "Grouting and Joint Sealing Operations" - Filling joints and applying sealers
7. "Surface Cleaning and Protection" - Final cleaning and protective treatments
8. "Quality Control and Final Inspection" - Checking work quality and compliance
EACH TASK NAME MUST BE COMPLETELY DIFFERENT` : `
Generate 8-10 UNIQUE tasks for ${tradeType} with DIFFERENT NAMES covering complete workflow.
VALIDATE: No two tasks can have same or similar names - each must be distinct work phase`}

Return JSON with this exact structure:
{
  "activities": [
    {
      "name": "Specific task name for ${tradeType}",
      "description": "Detailed 25+ word description of the activity",
      "riskScore": 6,
      "residualRisk": 3,
      "legislation": [
        "${state} WHS Regulation 2017 - Section XXX",
        "AS/NZS XXXX:YYYY - Relevant standard",
        "Code of Practice - Specific document name",
        "Additional trade-specific regulation"
      ],
      "hazards": [
        {
          "type": "Physical/Chemical/Biological/Ergonomic",
          "description": "Detailed 20+ word hazard description with specific cause and consequence",
          "riskRating": 6,
          "controlMeasures": [
            "Elimination control measure",
            "Substitution control measure", 
            "Engineering control measure",
            "Administrative control measure",
            "PPE control measure"
          ],
          "residualRisk": 3,
          "causeAgent": "Specific equipment/material causing hazard",
          "environmentalCondition": "${siteEnvironment} environment with specific conditions",
          "consequence": "Specific injury type and severity"
        }
      ],
      "ppe": ["Trade-specific PPE item 1", "Trade-specific PPE item 2", "Trade-specific PPE item 3"],
      "tools": ["Specific tool/equipment name"],
      "trainingRequired": ["Trade-specific training requirement"],
      "hrcwReferences": [${hrcwCategories.join(', ') || 'null'}],
      "permitRequired": ["Specific permit type if applicable"]
    }
  ]
}

CRITICAL REQUIREMENTS:
- MINIMUM ${minimumTasks} activities required (never less than ${minimumTasks})
- Each activity must have unique name and distinct work phase
- Cover complete workflow from start to finish
- Comprehensive legislation arrays required for each activity
GENERATE AT LEAST ${minimumTasks} ACTIVITIES - NO EXCEPTIONS.`;

  try {
    console.log(`🚀 SENDING SIMPLE REQUEST WITH TIMEOUT...`);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI request timed out after 30 seconds')), 30000);
    });
    
    console.log('🚀 SENDING REQUEST TO OPENAI:');
    console.log('System Message Length:', systemMessage.length);
    console.log('User Message:', `Generate tasks for ${tradeType} work: ${plainTextDescription}`);
    
    // Race between OpenAI request and timeout
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `Generate tasks for ${tradeType} work: ${plainTextDescription}` }
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
      timeoutPromise
    ]) as any;

    console.log(`🚀 RECEIVED RESPONSE`);
    
    const responseContent = response.choices[0].message.content;
    console.log('🚀 FULL AI RESPONSE:');
    console.log('='.repeat(50));
    console.log(responseContent);
    console.log('='.repeat(50));
    let parsedResult;
    
    try {
      // Clean up markdown code blocks if present
      const cleanedContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
      parsedResult = JSON.parse(cleanedContent);
      console.log(`🚀 PARSED SUCCESSFULLY - Activities: ${parsedResult.activities?.length || 0}`);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.log('Raw response:', responseContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Check if we have enough activities - if not, use fallback generation
    let finalActivities = parsedResult.activities || [];
    
    // Check for task uniqueness - ensure no duplicates or very similar tasks
    let uniqueActivities = ensureTaskUniqueness(finalActivities, tradeType);
    
    // Additional check for exact duplicates that bypass normalization
    const exactDuplicateCheck = uniqueActivities.filter((activity, index, arr) => {
      const exactMatches = arr.filter(a => a.name === activity.name);
      if (exactMatches.length > 1) {
        console.log(`🚨 EXACT DUPLICATE FOUND: "${activity.name}" appears ${exactMatches.length} times`);
        return index === arr.findIndex(a => a.name === activity.name); // Keep only first occurrence
      }
      return true;
    });
    
    uniqueActivities = exactDuplicateCheck;
    console.log(`🚀 AFTER EXACT DUPLICATE CHECK: ${exactDuplicateCheck.length} unique activities`);
    
    if (uniqueActivities.length < minimumTasks) {
      console.log(`🚀 Only ${uniqueActivities.length} unique activities generated, adding diverse fallback activities to reach ${minimumTasks}`);
      const additionalActivities = generateDiverseFallbackActivities(tradeType, plainTextDescription || '', state, siteEnvironment, hrcwCategories, minimumTasks - uniqueActivities.length);
      finalActivities = [...uniqueActivities, ...additionalActivities];
    } else {
      finalActivities = uniqueActivities;
    }

    // Enhanced activities with comprehensive legislation
    const enhancedActivities = finalActivities.map((activity: any) => ({
      ...activity,
      // Ensure legislation is always an array with comprehensive references
      legislation: Array.isArray(activity.legislation) 
        ? activity.legislation 
        : getTradeSpecificLegislation(tradeType, state, activity.name),
      hrcwReferences: hrcwCategories.length > 0 ? hrcwCategories : [],
      hazards: activity.hazards.map((hazard: any) => ({
        ...hazard,
        environmentalCondition: hazard.environmentalCondition || `${siteEnvironment} site environment with specific workplace conditions`,
        causeAgent: hazard.causeAgent || getTradeSpecificCause(activity.name, tradeType),
        consequence: hazard.consequence || getTradeSpecificConsequence(activity.name, tradeType)
      }))
    }));

    return {
      activities: enhancedActivities,
      plantEquipment: getTradeSpecificEquipment(tradeType),
      emergencyProcedures: getBasicEmergencyProcedures()
    };

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

// Function to ensure task uniqueness by removing duplicates and similar tasks
function ensureTaskUniqueness(activities: any[], tradeType: string): any[] {
  if (!activities || activities.length === 0) return [];
  
  const uniqueActivities: any[] = [];
  const seenTasks = new Set<string>();
  
  for (const activity of activities) {
    const taskKey = normalizeTaskName(activity.name || '');
    
    // Skip if we've seen this task or a very similar one
    if (seenTasks.has(taskKey)) {
      console.log(`🚀 DUPLICATE TASK DETECTED: "${activity.name}" (normalized: "${taskKey}")`);
      continue;
    }
    
    seenTasks.add(taskKey);
    uniqueActivities.push(activity);
  }
  
  console.log(`🚀 TASK UNIQUENESS CHECK: ${activities.length} → ${uniqueActivities.length} unique tasks`);
  return uniqueActivities;
}

// Enhanced normalize task names to detect duplicates
function normalizeTaskName(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/\b(and|the|of|for|with|using|apply|application|install|installation|site|setup|tool|preparation|fire|protection|system)\b/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
  
  console.log(`🚀 NORMALIZED TASK: "${name}" → "${normalized}"`);
  return normalized;
}

// Generate diverse fallback activities specific to the trade
function generateDiverseFallbackActivities(
  tradeType: string, 
  jobDescription: string, 
  state: string, 
  siteEnvironment: string, 
  hrcwCategories: number[], 
  count: number
): any[] {
  console.log(`🚀 GENERATING ${count} DIVERSE FALLBACK ACTIVITIES FOR ${tradeType}`);
  
  const tradeActivities: { [key: string]: any[] } = {
    'Fire Protection Systems': [
      {
        name: "Fire Protection System Design Review and Planning",
        description: "Review architectural plans and conduct site assessment to determine optimal sprinkler system layout, water supply requirements, and compliance with AS 2118 standards",
        riskScore: 4,
        residualRisk: 2,
        legislation: [`${state} WHS Regulation 2017 - Section 291`, "AS 2118.1 Fire sprinkler systems", "Building Code of Australia - Fire safety provisions"],
        hazards: [{
          type: "Physical",
          description: "Eye strain and neck injury from prolonged review of technical drawings and ceiling inspections",
          riskRating: 4,
          controlMeasures: ["Use proper lighting", "Take regular breaks", "Use adjustable work surfaces"],
          residualRisk: 2,
          causeAgent: "Extended technical document review",
          environmentalCondition: `${siteEnvironment} site office environment`,
          consequence: "Repetitive strain injury and eye fatigue"
        }],
        ppe: ["Safety Glasses", "Hard Hat"],
        tools: ["Plans", "Measuring tape", "Laser measure", "Calculator"],
        trainingRequired: ["Plan reading", "AS 2118 standards"]
      },
      {
        name: "Underground Service Location and Dial Before You Dig",
        description: "Locate and mark existing underground utilities using electromagnetic detection equipment before any excavation for fire system main connections",
        riskScore: 7,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 306`, "AS 5488 Classification of subsurface utility information", "Dial Before You Dig protocols"],
        hazards: [{
          type: "Physical",
          description: "Strike existing gas, electrical or water services during excavation causing explosion, electrocution or flooding",
          riskRating: 9,
          controlMeasures: ["Use cable/pipe locator", "Hand dig within 300mm of located services", "Obtain clearances from authorities"],
          residualRisk: 3,
          causeAgent: "Excavation near unidentified underground services",
          environmentalCondition: "Underground utility corridor areas",
          consequence: "Explosion, electrocution or major service damage"
        }],
        ppe: ["Hard Hat", "Hi-Vis Vest", "Steel Cap Boots", "Gloves"],
        tools: ["Cable locator", "Spade", "Marking spray", "Detection flags"],
        trainingRequired: ["Service location", "Excavation safety"]
      },
      {
        name: "Fire Main Pipe Installation and Threading",
        description: "Install and connect fire main pipes using mechanical joints and threading equipment, ensuring proper grade and support according to hydraulic calculations",
        riskScore: 6,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 213`, "AS 2118.1 Fire sprinkler systems", "AS 1074 Steel tubes and tubulars"],
        hazards: [{
          type: "Physical",
          description: "Crushing injury from heavy pipe handling and cuts from sharp threading operations",
          riskRating: 7,
          controlMeasures: ["Use mechanical lifting aids", "Wear cut-resistant gloves", "Ensure proper pipe support"],
          residualRisk: 3,
          causeAgent: "Heavy pipe sections and threading equipment",
          environmentalCondition: "Confined ceiling space installation",
          consequence: "Crushing injuries and lacerations"
        }],
        ppe: ["Hard Hat", "Cut-resistant Gloves", "Steel Cap Boots", "Eye Protection"],
        tools: ["Pipe threader", "Pipe cutter", "Chain hoist", "Pipe wrench"],
        trainingRequired: ["Pipe threading", "Manual handling"]
      },
      {
        name: "Sprinkler Head Installation and Heat Response Testing",
        description: "Install sprinkler heads at calculated spacings and conduct heat response testing to verify activation temperatures and spray patterns comply with design specifications",
        riskScore: 5,
        residualRisk: 2,
        legislation: [`${state} WHS Regulation 2017 - Section 39`, "AS 2118.4 Sprinkler installation", "AS 2118.6 Combined sprinkler and hydrant systems"],
        hazards: [{
          type: "Physical",
          description: "Falls from height during ceiling-mounted sprinkler head installation in elevated areas",
          riskRating: 8,
          controlMeasures: ["Use scaffolding or EWP", "Install fall arrest systems", "Maintain three points of contact"],
          residualRisk: 3,
          causeAgent: "Working at height on ladders or platforms",
          environmentalCondition: "Elevated ceiling installation areas",
          consequence: "Fall injuries and fractures"
        }],
        ppe: ["Hard Hat", "Safety Harness", "Steel Cap Boots", "Gloves"],
        tools: ["Sprinkler wrench", "Torque wrench", "Heat gun", "Test gauges"],
        trainingRequired: ["Height work", "Sprinkler installation"]
      },
      {
        name: "Fire Pump and Controller Installation",
        description: "Install fire pumps, jockey pumps, and electronic controllers in designated pump room, ensuring proper electrical connections and flow testing procedures",
        riskScore: 7,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 164`, "AS 2941 Fixed fire protection installations", "AS 3000 Electrical installations"],
        hazards: [{
          type: "Electrical",
          description: "Electrical shock from high voltage pump motor connections and control panel wiring",
          riskRating: 8,
          controlMeasures: ["Licensed electrician for connections", "Lockout/tagout procedures", "Use insulated tools"],
          residualRisk: 2,
          causeAgent: "High voltage electrical equipment",
          environmentalCondition: "Pump room with electrical hazards",
          consequence: "Electrical shock and burns"
        }],
        ppe: ["Insulated Gloves", "Arc Flash Protection", "Safety Glasses", "Hard Hat"],
        tools: ["Multimeter", "Insulated tools", "Lifting equipment", "Torque wrench"],
        trainingRequired: ["Electrical safety", "Pump installation"]
      },
      {
        name: "Fire Alarm Integration and Communication Testing",
        description: "Connect fire sprinkler system to building fire alarm panel and conduct communication testing to ensure proper alarm activation and emergency response coordination",
        riskScore: 4,
        residualRisk: 2,
        legislation: [`${state} WHS Regulation 2017 - Section 43`, "AS 1670.1 Fire detection and alarm systems", "AS 2118.5 Sprinkler system commissioning"],
        hazards: [{
          type: "Electrical",
          description: "Low voltage electrical shock during alarm panel connections and signal testing",
          riskRating: 5,
          controlMeasures: ["Turn off power during connections", "Use proper test equipment", "Follow manufacturer procedures"],
          residualRisk: 2,
          causeAgent: "Low voltage alarm system wiring",
          environmentalCondition: "Electrical control room environment",
          consequence: "Minor electrical shock"
        }],
        ppe: ["Safety Glasses", "Insulated Gloves"],
        tools: ["Multimeter", "Wire strippers", "Terminal screwdriver", "Test equipment"],
        trainingRequired: ["Fire alarm systems", "Electrical testing"]
      },
      {
        name: "System Pressure Testing and Flow Validation",
        description: "Conduct hydrostatic pressure testing of complete sprinkler system and validate flow rates at design pressure to ensure system performance meets AS 2118 requirements",
        riskScore: 6,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 39`, "AS 2118.5 System commissioning", "AS 2419.1 Water supply for fire fighting"],
        hazards: [{
          type: "Physical",
          description: "High pressure water release causing injury from failed joints or fittings during pressure testing",
          riskRating: 7,
          controlMeasures: ["Gradual pressure increase", "Clear test area of personnel", "Use pressure relief valves"],
          residualRisk: 3,
          causeAgent: "High pressure water in test system",
          environmentalCondition: "Pressurized pipe system testing",
          consequence: "Impact injuries and water damage"
        }],
        ppe: ["Safety Glasses", "Waterproof Clothing", "Steel Cap Boots"],
        tools: ["Pressure gauges", "Flow meters", "Test pump", "Pressure relief valves"],
        trainingRequired: ["Pressure testing", "Flow measurement"]
      },
      {
        name: "Authority Inspection and System Certification",
        description: "Coordinate with fire authority inspectors and obtain final certification for completed fire protection system installation according to building approval requirements",
        riskScore: 3,
        residualRisk: 1,
        legislation: [`${state} WHS Regulation 2017 - Section 291`, "AS 2118.6 System acceptance", "Building Code of Australia compliance"],
        hazards: [{
          type: "Administrative",
          description: "Non-compliance penalties and project delays from inadequate documentation or system deficiencies",
          riskRating: 4,
          controlMeasures: ["Complete all test documentation", "Address deficiencies promptly", "Maintain compliance records"],
          residualRisk: 1,
          causeAgent: "Incomplete compliance documentation",
          environmentalCondition: "Regulatory inspection process",
          consequence: "Project delays and penalties"
        }],
        ppe: ["Hi-Vis Vest", "Hard Hat"],
        tools: ["Documentation", "Test results", "Compliance certificates", "Camera"],
        trainingRequired: ["Compliance procedures", "Documentation"]
      }
    ],
    'Tiling & Waterproofing': [
      {
        name: "Site measurement and layout planning",
        description: "Conduct detailed measurements of installation areas and create comprehensive tile layout plans to optimize material usage and visual appeal",
        riskScore: 4,
        residualRisk: 2,
        legislation: [`${state} WHS Regulation 2017 - Section 213`, "AS 3958.1-1991 Guide to installation of ceramic tiles", "Building Code of Australia - Waterproofing requirements"],
        hazards: [{
          type: "Physical",
          description: "Strain injury from awkward positioning during measurement in confined spaces",
          riskRating: 5,
          controlMeasures: ["Use ergonomic measuring tools", "Take regular breaks", "Use knee pads when working at floor level"],
          residualRisk: 3,
          causeAgent: "Prolonged kneeling and reaching in bathroom spaces",
          environmentalCondition: `${siteEnvironment} site with limited workspace`,
          consequence: "Musculoskeletal strain and joint injury"
        }],
        ppe: ["Knee Pads", "Safety Glasses", "Steel Cap Boots"],
        tools: ["Measuring tape", "Laser level", "Chalk line", "Square"],
        trainingRequired: ["Measurement techniques", "Layout planning"]
      },
      {
        name: "Substrate moisture testing and assessment",
        description: "Perform comprehensive moisture content testing of substrates using electronic moisture meters to ensure suitable conditions for tiling and waterproofing",
        riskScore: 3,
        residualRisk: 2,
        legislation: [`${state} WHS Regulation 2017 - Section 38`, "AS 3740-2021 Waterproofing of wet areas", "TCNA Handbook installation guidelines"],
        hazards: [{
          type: "Electrical",
          description: "Electric shock risk from moisture meter use in wet environments",
          riskRating: 6,
          controlMeasures: ["Use battery-operated meters only", "Ensure hands are dry", "Check equipment before use"],
          residualRisk: 2,
          causeAgent: "Electronic moisture meter in damp conditions",
          environmentalCondition: "Wet area testing with residual moisture",
          consequence: "Electric shock and burns"
        }],
        ppe: ["Insulated Gloves", "Safety Glasses", "Dry Footwear"],
        tools: ["Moisture meter", "Hygrothermal meter", "Test probes"],
        trainingRequired: ["Moisture testing procedures", "Equipment calibration"]
      },
      {
        name: "Adhesive mixing and application preparation",
        description: "Prepare tile adhesives according to manufacturer specifications using appropriate mixing ratios and techniques for specific substrate and tile combinations",
        riskScore: 5,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 347`, "AS 4992.1 Ceramic tiles installation", "ACCC consumer product safety standards"],
        hazards: [{
          type: "Chemical",
          description: "Dermatitis and respiratory irritation from adhesive powder and fumes during mixing",
          riskRating: 7,
          controlMeasures: ["Use mechanical mixing", "Ensure adequate ventilation", "Wear appropriate respirator"],
          residualRisk: 3,
          causeAgent: "Cement-based adhesive powder becoming airborne",
          environmentalCondition: "Enclosed mixing area with poor ventilation",
          consequence: "Skin sensitization and respiratory problems"
        }],
        ppe: ["P2 Respirator", "Chemical Gloves", "Safety Glasses", "Apron"],
        tools: ["Mixing paddle", "Drill mixer", "Clean bucket", "Measuring cup"],
        trainingRequired: ["Chemical handling", "Mixing procedures", "SDS interpretation"]
      },
      {
        name: "Tile cutting and edge finishing operations",
        description: "Execute precise tile cutting using wet saws and manual tools to achieve accurate fits around fixtures, corners, and irregular spaces",
        riskScore: 8,
        residualRisk: 4,
        legislation: [`${state} WHS Regulation 2017 - Section 213`, "AS 2550.10 Safety of machinery", "Silica exposure prevention guidelines"],
        hazards: [{
          type: "Physical",
          description: "Laceration injuries from tile shards and saw blade contact during cutting operations",
          riskRating: 9,
          controlMeasures: ["Use proper blade guards", "Maintain stable work surface", "Use push sticks for small pieces"],
          residualRisk: 4,
          causeAgent: "Wet saw blade and sharp ceramic tile edges",
          environmentalCondition: "Wet cutting station with ceramic debris",
          consequence: "Deep lacerations requiring medical treatment"
        }],
        ppe: ["Cut-resistant Gloves", "Safety Glasses", "Face Shield", "Apron"],
        tools: ["Wet tile saw", "Tile nippers", "Diamond blade", "Measuring tools"],
        trainingRequired: ["Power tool operation", "Cutting techniques", "First aid"]
      },
      {
        name: "Quality control and final inspection procedures",
        description: "Conduct comprehensive quality inspections of completed tiling work including adhesion testing, level checks, and waterproofing integrity verification",
        riskScore: 3,
        residualRisk: 1,
        legislation: [`${state} WHS Regulation 2017 - Section 38`, "AS 3740-2021 Performance requirements", "Australian Building Codes Board standards"],
        hazards: [{
          type: "Physical",
          description: "Slip hazard from water and testing materials on newly completed surfaces",
          riskRating: 5,
          controlMeasures: ["Use non-slip footwear", "Clean spills immediately", "Use warning signs"],
          residualRisk: 2,
          causeAgent: "Water spray testing on smooth tile surfaces",
          environmentalCondition: "Newly completed wet area with test water",
          consequence: "Slip and fall causing injury"
        }],
        ppe: ["Non-slip Boots", "Safety Glasses", "Hi-vis Vest"],
        tools: ["Water spray bottle", "Level", "Measuring tape", "Camera"],
        trainingRequired: ["Quality standards", "Testing procedures", "Documentation"]
      }
    ],
    'Electrical': [
      {
        name: "Electrical isolation and lockout procedures",
        description: "Implement comprehensive electrical isolation procedures including circuit identification, isolation verification, and lockout/tagout protocols",
        riskScore: 9,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 140`, "AS/NZS 4836 Safe working on or near low voltage electrical installations"],
        hazards: [{
          type: "Electrical",
          description: "Electric shock from inadequate isolation of live electrical circuits",
          riskRating: 15,
          controlMeasures: ["Test circuits with approved tester", "Apply personal locks", "Verify zero energy state"],
          residualRisk: 3
        }],
        ppe: ["Insulated Gloves", "Safety Glasses", "Arc Flash Suit"],
        tools: ["Voltage tester", "Lockout devices", "Circuit tracer"],
        trainingRequired: ["Electrical safety", "Lockout procedures"]
      },
      {
        name: "Cable installation through conduits and cable trays",
        description: "Install electrical cables through protective conduits and cable management systems ensuring proper routing and protection",
        riskScore: 6,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 213`, "AS/NZS 3000 Electrical installations"],
        hazards: [{
          type: "Physical",
          description: "Back strain from pulling heavy cables through long conduit runs",
          riskRating: 7,
          controlMeasures: ["Use cable pulling equipment", "Team lifting", "Take regular breaks"],
          residualRisk: 3
        }],
        ppe: ["Back Support", "Cut-resistant Gloves", "Safety Glasses"],
        tools: ["Cable puller", "Fish tape", "Lubricant"],
        trainingRequired: ["Cable installation techniques", "Manual handling"]
      }
    ],
    'Plumbing': [
      {
        name: "Pipe cutting and joining operations",
        description: "Execute precise pipe cutting and joining using appropriate techniques for different pipe materials including copper, PVC, and PEX",
        riskScore: 6,
        residualRisk: 3,
        legislation: [`${state} WHS Regulation 2017 - Section 213`, "AS/NZS 3500 Plumbing and drainage"],
        hazards: [{
          type: "Physical",
          description: "Burns from soldering operations and cuts from pipe cutting tools",
          riskRating: 8,
          controlMeasures: ["Use proper torch technique", "Maintain sharp cutting tools", "Use heat-resistant gloves"],
          residualRisk: 3
        }],
        ppe: ["Heat-resistant Gloves", "Safety Glasses", "Apron"],
        tools: ["Pipe cutter", "Soldering torch", "Flux", "Fittings"],
        trainingRequired: ["Pipe joining techniques", "Soldering safety"]
      },
      {
        name: "Pressure testing and leak detection",
        description: "Conduct comprehensive pressure testing of plumbing systems to verify integrity and identify potential leak points",
        riskScore: 7,
        residualRisk: 2,
        legislation: [`${state} WHS Regulation 2017 - Section 38`, "AS/NZS 3500.2 Sanitary plumbing and drainage"],
        hazards: [{
          type: "Physical",
          description: "High pressure water burst causing injury from failed connections during testing",
          riskRating: 9,
          controlMeasures: ["Use appropriate test pressures", "Check all connections", "Stand clear during pressurization"],
          residualRisk: 2
        }],
        ppe: ["Safety Glasses", "Gloves", "Hi-vis Vest"],
        tools: ["Pressure gauge", "Test pump", "Leak detection equipment"],
        trainingRequired: ["Pressure testing procedures", "System commissioning"]
      }
    ]
  };
  
  const activities = tradeActivities[tradeType] || [];
  return activities.slice(0, count);
}

// Helper functions from the main integration file
function getTradeSpecificLegislation(tradeType: string, state: string, activityName: string): string[] {
  return [
    `${state} WHS Regulation 2017 - Section 213`,
    "AS/NZS 3000 Electrical installations", 
    "Code of Practice - Managing risks in construction work"
  ];
}

function getTradeSpecificCause(activityName: string, tradeType: string): string {
  return `${tradeType.toLowerCase()} equipment failure during ${activityName.toLowerCase()}`;
}

function getTradeSpecificConsequence(activityName: string, tradeType: string): string {
  return `Injury requiring first aid treatment from ${activityName.toLowerCase()} operations`;
}

function getTradeSpecificEquipment(tradeType: string): any[] {
  const equipment: { [key: string]: any[] } = {
    'Tiling & Waterproofing': [
      { name: 'Wet tile saw', type: 'Power tool', riskLevel: 'High', certification: 'Required' },
      { name: 'Mixer drill', type: 'Power tool', riskLevel: 'Medium', certification: 'Not Required' }
    ],
    'Electrical': [
      { name: 'Voltage tester', type: 'Testing equipment', riskLevel: 'Medium', certification: 'Required' },
      { name: 'Cable puller', type: 'Manual tool', riskLevel: 'Low', certification: 'Not Required' }
    ]
  };
  return equipment[tradeType] || [];
}

function getBasicEmergencyProcedures(): any[] {
  return [
    {
      type: 'Medical Emergency',
      procedure: 'Call 000, provide first aid, evacuate if necessary',
      contactNumber: '000'
    },
    {
      type: 'Fire Emergency', 
      procedure: 'Activate alarm, evacuate, call fire brigade',
      contactNumber: '000'
    }
  ];
}

function generateFallbackActivities(tradeType: string, jobDescription: string, state: string, siteEnvironment: string, hrcwCategories: number[], count: number): any[] {
  const activities = [];
  const baseActivities = getTradeSpecificBaseActivities(tradeType);
  
  for (let i = 0; i < count && i < baseActivities.length; i++) {
    const baseActivity = baseActivities[i];
    activities.push({
      name: baseActivity.name,
      description: `${baseActivity.description} for ${jobDescription} in ${siteEnvironment} environment`,
      riskScore: baseActivity.riskScore,
      residualRisk: baseActivity.residualRisk,
      legislation: getTradeSpecificLegislation(tradeType, state, baseActivity.name),
      hazards: [
        {
          type: baseActivity.hazardType,
          description: `${baseActivity.hazardDescription} during ${baseActivity.name.toLowerCase()} in ${siteEnvironment} environment`,
          riskRating: baseActivity.riskScore,
          controlMeasures: baseActivity.controlMeasures,
          residualRisk: baseActivity.residualRisk,
          causeAgent: getTradeSpecificCause(baseActivity.name, tradeType),
          environmentalCondition: `${siteEnvironment} site environment with specific workplace conditions`,
          consequence: getTradeSpecificConsequence(baseActivity.name, tradeType)
        }
      ],
      ppe: baseActivity.ppe,
      tools: baseActivity.tools,
      trainingRequired: baseActivity.training,
      hrcwReferences: hrcwCategories,
      permitRequired: baseActivity.permits
    });
  }
  
  return activities;
}

function getTradeSpecificBaseActivities(tradeType: string): any[] {
  if (tradeType.includes('Tiling')) {
    return [
      {
        name: 'Surface Preparation and Substrate Assessment',
        description: 'Inspect and prepare surfaces for tile installation including cleaning, leveling, and moisture testing',
        riskScore: 4,
        residualRisk: 2,
        hazardType: 'Physical',
        hazardDescription: 'Slip hazards from wet surfaces and dust inhalation from surface preparation',
        controlMeasures: ['Ensure proper surface drainage', 'Use wet cutting methods', 'Wear respiratory protection', 'Maintain clean work areas'],
        ppe: ['Safety Glasses', 'Dust Mask P2', 'Non-Slip Safety Boots', 'Knee Pads'],
        tools: ['Moisture Meter', 'Surface Cleaner', 'Scraper', 'Level'],
        training: ['Surface preparation techniques', 'Moisture testing procedures'],
        permits: []
      },
      {
        name: 'Tile Cutting and Shaping Operations',
        description: 'Cut tiles to required dimensions using wet saws, angle grinders, and manual cutting tools',
        riskScore: 6,
        residualRisk: 3,
        hazardType: 'Physical',
        hazardDescription: 'Laceration from cutting tools and projectile injuries from tile fragments',
        controlMeasures: ['Use blade guards', 'Employ water cooling systems', 'Secure tile pieces', 'Clear cutting area'],
        ppe: ['Safety Glasses', 'Cut-Resistant Gloves', 'Hearing Protection', 'Dust Mask'],
        tools: ['Wet Tile Saw', 'Angle Grinder', 'Tile Nippers', 'Diamond Blades'],
        training: ['Power tool operation', 'Cutting safety procedures'],
        permits: []
      },
      {
        name: 'Adhesive Application and Tile Installation',
        description: 'Apply tile adhesive and install tiles according to specified layout and spacing requirements',
        riskScore: 4,
        residualRisk: 2,
        hazardType: 'Chemical',
        hazardDescription: 'Chemical exposure from adhesives and ergonomic strain from repetitive motions',
        controlMeasures: ['Use VOC-compliant adhesives', 'Ensure adequate ventilation', 'Take regular breaks', 'Use ergonomic tools'],
        ppe: ['Chemical-Resistant Gloves', 'Knee Pads', 'Safety Glasses', 'Respirator'],
        tools: ['Notched Trowel', 'Tile Spacers', 'Rubber Mallet', 'Level'],
        training: ['Chemical handling procedures', 'Ergonomic work practices'],
        permits: []
      },
      {
        name: 'Grouting and Sealing Operations',
        description: 'Apply grout between tiles and apply sealers to protect installed tilework',
        riskScore: 4,
        residualRisk: 2,
        hazardType: 'Chemical',
        hazardDescription: 'Chemical burns from grout and sealer compounds affecting skin and respiratory system',
        controlMeasures: ['Use appropriate grout types', 'Maintain ventilation', 'Clean excess material promptly', 'Store chemicals safely'],
        ppe: ['Chemical-Resistant Gloves', 'Safety Glasses', 'Respirator', 'Protective Clothing'],
        tools: ['Grout Float', 'Grout Sponge', 'Sealer Applicator', 'Buckets'],
        training: ['Chemical safety procedures', 'Grout mixing and application'],
        permits: []
      }
    ];
  }
  
  // Default activities for other trades
  return [
    {
      name: 'Work Area Setup and Safety Inspection',
      description: 'Establish work area boundaries and conduct safety inspections before commencing work',
      riskScore: 3,
      residualRisk: 1,
      hazardType: 'Physical',
      hazardDescription: 'Trip hazards and inadequate work area preparation',
      controlMeasures: ['Mark work boundaries', 'Inspect for hazards', 'Ensure adequate lighting', 'Clear access routes'],
      ppe: ['Hard Hat', 'Safety Glasses', 'High-Vis Vest', 'Safety Boots'],
      tools: ['Barrier Tape', 'Inspection Checklist', 'Measuring Tools'],
      training: ['Safety inspection procedures', 'Work area establishment'],
      permits: []
    },
    {
      name: 'Material Handling and Storage',
      description: 'Transport, handle, and store materials safely according to manufacturer specifications',
      riskScore: 4,
      residualRisk: 2,
      hazardType: 'Physical',
      hazardDescription: 'Manual handling injuries and material storage hazards',
      controlMeasures: ['Use mechanical aids', 'Follow lifting procedures', 'Secure storage areas', 'Check weight limits'],
      ppe: ['Hard Hat', 'Safety Gloves', 'Steel-Toe Boots', 'Back Support'],
      tools: ['Hand Truck', 'Lifting Equipment', 'Storage Racks'],
      training: ['Manual handling techniques', 'Material storage procedures'],
      permits: []
    }
  ];
}
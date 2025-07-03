import OpenAI from 'openai';
import { TaskGenerationRequest, GeneratedSWMSData } from './openai-integration';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSWMSFromTaskSimple(request: TaskGenerationRequest): Promise<GeneratedSWMSData> {
  const { projectDetails, plainTextDescription } = request;
  const { tradeType, location, state = 'NSW', siteEnvironment = 'Commercial', hrcwCategories = [] } = projectDetails;
  
  console.log(`🚀 SIMPLE AI GENERATION - Trade: ${tradeType}, Job: ${plainTextDescription}`);
  console.log(`🚀 SITE: ${siteEnvironment}, STATE: ${state}, HRCW: ${hrcwCategories.join(',')}`);

  // Comprehensive prompt for 8-10 UNIQUE tasks with detailed legislation
  const systemMessage = `You are a professional Australian construction safety expert. Generate EXACTLY 8-10 COMPLETELY DIFFERENT ${tradeType} activities for: "${plainTextDescription}"

Environment: ${siteEnvironment} site in ${state}
HRCW Categories: ${hrcwCategories.join(', ') || 'None selected'}

CRITICAL REQUIREMENTS:
- Generate EXACTLY 8-10 activities (not 3-6)
- Each activity MUST be COMPLETELY DIFFERENT from all others
- NO DUPLICATE or SIMILAR tasks - each must be a unique work phase/process
- Cover the FULL workflow from start to finish with diverse tasks
- Each activity MUST have comprehensive legislation references including:
  * ${state} WHS Regulation 2017 (specific sections)
  * Relevant Australian Standards (AS/NZS codes)
  * Applicable Codes of Practice documents
  * Trade-specific regulatory requirements

TASK DIVERSITY REQUIREMENT FOR ${tradeType}:
${tradeType === 'Tiling & Waterproofing' ? `
1. Site preparation and surface assessment
2. Substrate preparation and cleaning
3. Waterproofing membrane application
4. Waterproofing testing and validation
5. Tile layout and measurement planning
6. Tile cutting and preparation
7. Adhesive application and tile installation
8. Grouting and joint finishing
9. Sealing and protective coating application
10. Quality inspection and final cleanup
EACH TASK MUST BE DIFFERENT - NO DUPLICATES` : `
Generate 8-10 different phases of ${tradeType} work covering preparation, installation, testing, and completion phases.
EACH TASK MUST BE A UNIQUE WORK PROCESS - NO REPETITIVE TASKS`}

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

MANDATORY: Generate EXACTLY 8-10 activities with comprehensive legislation arrays for each activity.`;

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
    const uniqueActivities = ensureTaskUniqueness(finalActivities, tradeType);
    
    if (uniqueActivities.length < 8) {
      console.log(`🚀 Only ${uniqueActivities.length} unique activities generated, adding diverse fallback activities to reach 8-10`);
      const additionalActivities = generateDiverseFallbackActivities(tradeType, plainTextDescription || '', state, siteEnvironment, hrcwCategories, 10 - uniqueActivities.length);
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

// Normalize task names to detect duplicates (remove common words, lowercase, etc.)
function normalizeTaskName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(and|the|of|for|with|using|apply|application|install|installation)\b/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
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
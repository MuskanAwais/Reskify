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

  // Comprehensive prompt for 8-10 tasks with detailed legislation
  const systemMessage = `Generate 8-10 comprehensive ${tradeType} activities for: "${plainTextDescription}"

Environment: ${siteEnvironment} site in ${state}
HRCW Categories: ${hrcwCategories.join(', ') || 'None selected'}

CRITICAL REQUIREMENTS:
- Generate EXACTLY 8-10 activities (not 3-6)
- Each activity MUST have comprehensive legislation references including:
  * ${state} WHS Regulation 2017 (specific sections)
  * Relevant Australian Standards (AS/NZS codes)
  * Applicable Codes of Practice documents
  * Trade-specific regulatory requirements

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
    ]);

    console.log(`🚀 RECEIVED RESPONSE`);
    
    const responseContent = response.choices[0].message.content;
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
    
    if (finalActivities.length < 8) {
      console.log(`🚀 Only ${finalActivities.length} activities generated, adding fallback activities to reach 8-10`);
      const additionalActivities = generateFallbackActivities(tradeType, plainTextDescription, state, siteEnvironment, hrcwCategories, 10 - finalActivities.length);
      finalActivities = [...finalActivities, ...additionalActivities];
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

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
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

function getTradeSpecificLegislation(tradeType: string, state: string, activityName: string): string[] {
  const baseLegislation = [
    `${state} WHS Regulation 2017 - Section 291 (Construction Work)`,
    `${state} WHS Act 2011 - Section 19 (Primary Duty of Care)`
  ];
  
  if (tradeType.includes('Tiling')) {
    return [
      ...baseLegislation,
      `AS/NZS 4586:2013 - Slip resistance classification of new pedestrian surface materials`,
      `AS 3958.1:2007 - Guide to the installation of ceramic tiles`,
      `${state} Code of Practice - Construction Work`,
      `${state} Code of Practice - Managing the risk of falls at workplaces`,
      `AS/NZS 3972:2010 - Portland and blended cements`,
      `AS 2357:2015 - Ceramic tiles - Selection and installation`
    ];
  }
  
  if (tradeType.includes('Electrical')) {
    return [
      ...baseLegislation,
      `AS/NZS 3000:2018 - Electrical installations (Wiring Rules)`,
      `${state} Electrical Safety Regulation 2013`,
      `AS/NZS 4836:2011 - Safe working on low voltage electrical installations`,
      `${state} Code of Practice - Electrical work`,
      `AS/NZS 1768:2007 - Lightning protection`,
      `${state} WHS Regulation 2017 - Section 164 (Electrical safety)`
    ];
  }
  
  if (tradeType.includes('Plumbing')) {
    return [
      ...baseLegislation,
      `AS/NZS 3500:2018 - Plumbing and drainage`,
      `${state} Plumbing and Drainage Regulation 2019`,
      `AS/NZS 2566:1998 - Buried flexible pipelines`,
      `${state} Code of Practice - Construction work involving asbestos`,
      `AS 1428:2009 - Design for access and mobility`,
      `${state} Water Supply Code`
    ];
  }
  
  if (tradeType.includes('Carpentry') || tradeType.includes('Construction')) {
    return [
      ...baseLegislation,
      `AS 1684:2010 - Residential timber-framed construction`,
      `AS/NZS 1720:2010 - Timber structures`,
      `${state} Code of Practice - Managing the risk of falls at workplaces`,
      `AS/NZS 4357:2005 - Structural laminated veneer lumber`,
      `${state} Building Code - Structural requirements`,
      `AS/NZS 1170:2011 - Structural design actions`
    ];
  }
  
  return [
    ...baseLegislation,
    `${state} Code of Practice - Construction Work`,
    `AS/NZS 1891:2007 - Industrial fall-arrest systems`,
    `${state} Code of Practice - Managing the risk of falls at workplaces`
  ];
}

function getTradeSpecificCause(taskName: string, tradeType: string): string {
  if (tradeType.includes('Tiling')) {
    return taskName.toLowerCase().includes('cutting') ? 'tile cutter blade contact' :
           taskName.toLowerCase().includes('grout') ? 'chemical adhesive exposure' :
           'tile installation tool slippage';
  }
  if (tradeType.includes('Electrical')) {
    return 'electrical contact with live conductors';
  }
  if (tradeType.includes('Plumbing')) {
    return 'pressurized pipe system failure';
  }
  return 'tool or equipment malfunction';
}

function getTradeSpecificConsequence(taskName: string, tradeType: string): string {
  if (tradeType.includes('Tiling')) {
    return taskName.toLowerCase().includes('cutting') ? 'laceration to hands/fingers' :
           taskName.toLowerCase().includes('grout') ? 'chemical burns to skin' :
           'musculoskeletal strain';
  }
  if (tradeType.includes('Electrical')) {
    return 'electric shock or electrocution';
  }
  if (tradeType.includes('Plumbing')) {
    return 'scalding or drowning';
  }
  return 'physical injury';
}

function getTradeSpecificEquipment(tradeType: string): any[] {
  if (tradeType.includes('Tiling')) {
    return [
      {
        name: 'Tile Cutting Saw',
        type: 'Equipment',
        category: 'Cutting Tools',
        certificationRequired: false,
        inspectionStatus: 'Current',
        riskLevel: 'Medium',
        safetyRequirements: ['Blade guard', 'Water cooling system', 'Emergency stop']
      },
      {
        name: 'Angle Grinder',
        type: 'Equipment', 
        category: 'Power Tools',
        certificationRequired: false,
        inspectionStatus: 'Current',
        riskLevel: 'Medium',
        safetyRequirements: ['Guard protection', 'Two-handed operation', 'Eye protection']
      }
    ];
  }
  return [
    {
      name: 'Hand Tools',
      type: 'Equipment',
      category: 'General Tools',
      certificationRequired: false,
      inspectionStatus: 'Current',
      riskLevel: 'Low',
      safetyRequirements: ['Good condition', 'Proper storage']
    }
  ];
}

function getBasicEmergencyProcedures(): any[] {
  return [
    {
      scenario: 'Personal Injury',
      response: 'Stop work immediately, provide first aid, call emergency services if required (000)',
      contacts: ['Site Supervisor', 'Emergency Services: 000', 'Company Safety Officer']
    },
    {
      scenario: 'Equipment Failure',
      response: 'Isolate equipment, secure area, notify supervisor, arrange inspection',
      contacts: ['Site Supervisor', 'Equipment Supplier', 'Safety Officer']
    }
  ];
}
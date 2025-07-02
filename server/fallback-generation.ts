import { TaskGenerationRequest, GeneratedSWMSData } from './openai-integration';

export function generateFallbackSWMS(request: TaskGenerationRequest): GeneratedSWMSData {
  const { projectDetails, plainTextDescription } = request;
  const { tradeType, siteEnvironment, state, hrcwCategories } = projectDetails;
  
  console.log(`🎯 FALLBACK GENERATION - Preserving Enhanced Safety Options`);
  console.log(`🎯 Trade: ${tradeType}, Site: ${siteEnvironment}, State: ${state}`);
  console.log(`🎯 HRCW Categories: ${hrcwCategories?.join(', ') || 'None'}`);
  
  // Generate activities based on trade type and enhanced safety options
  const activities = generateTradeActivities(tradeType, plainTextDescription, siteEnvironment, state, hrcwCategories);
  
  return {
    activities: activities,
    plantEquipment: generatePlantEquipment(tradeType, siteEnvironment),
    emergencyProcedures: generateEmergencyProcedures(siteEnvironment, state)
  };
}

function generateTradeActivities(tradeType: string, description: string, siteEnvironment: string, state: string, hrcwCategories: number[] = []): any[] {
  const isTiling = tradeType.toLowerCase().includes('tiling') || tradeType.toLowerCase().includes('tile');
  const isWaterproofing = tradeType.toLowerCase().includes('waterproof');
  const isBathroom = description.toLowerCase().includes('bathroom');
  
  let activities = [];
  
  if (isTiling) {
    activities.push(
      {
        name: "Surface Preparation and Cleaning",
        description: `Prepare ${siteEnvironment.toLowerCase()} surfaces for tile installation including cleaning, leveling, and priming`,
        riskScore: 4,
        residualRisk: 2,
        legislation: `${state} WHS Regulation 2017 - Construction Work`,
        hazards: [
          {
            type: "Chemical",
            description: "Chemical exposure from cleaning solvents and primers causing skin irritation or respiratory issues",
            riskRating: 4,
            controlMeasures: [
              "Use only approved construction-grade cleaning products",
              "Ensure adequate ventilation in work area",
              "Wear chemical-resistant gloves and eye protection",
              "Store chemicals in designated secure areas"
            ],
            residualRisk: 2,
            causeAgent: "Cleaning solvent vapors and direct skin contact",
            environmentalCondition: `${siteEnvironment} indoor environment with limited ventilation`,
            consequence: "Chemical burns, respiratory irritation, dermatitis"
          }
        ],
        ppe: ["Safety Glasses", "Chemical-Resistant Gloves", "Dust Mask P2", "Non-Slip Safety Boots"],
        tools: ["Surface Cleaner", "Scraper", "Level", "Primer Applicator"],
        trainingRequired: ["Chemical Handling", "Surface Preparation Techniques"],
        hrcwReferences: hrcwCategories,
        permitRequired: hrcwCategories.includes(16) ? ["Chemical Risk Assessment"] : []
      },
      {
        name: "Tile Cutting and Shaping",
        description: "Cut tiles to required dimensions using wet saws and angle grinders for precise fitting",
        riskScore: 8,
        residualRisk: 4,
        legislation: `${state} WHS Regulation 2017 - Plant and Equipment`,
        hazards: [
          {
            type: "Physical",
            description: "Laceration injuries from tile cutting equipment blades and flying tile fragments",
            riskRating: 8,
            controlMeasures: [
              "Maintain blade guards on all cutting equipment",
              "Use water cooling systems to reduce dust and heat",
              "Secure workpieces properly before cutting",
              "Inspect cutting equipment before each use"
            ],
            residualRisk: 4,
            causeAgent: "Angle grinder blade contact or tile fragment projection",
            environmentalCondition: `${siteEnvironment} work area with limited space for equipment operation`,
            consequence: "Severe lacerations to hands, arms, or face requiring emergency treatment"
          }
        ],
        ppe: ["Safety Glasses", "Cut-Resistant Gloves", "Hearing Protection", "Dust Mask P2"],
        tools: ["Wet Tile Saw", "Angle Grinder", "Diamond Cutting Blades", "Measuring Tools"],
        trainingRequired: ["Power Tool Operation", "Cutting Equipment Safety"],
        hrcwReferences: hrcwCategories,
        permitRequired: []
      }
    );
  }
  
  if (isWaterproofing) {
    activities.push(
      {
        name: "Waterproof Membrane Application",
        description: "Apply liquid waterproofing membrane to prepared surfaces ensuring complete coverage and proper curing",
        riskScore: 6,
        residualRisk: 3,
        legislation: `${state} WHS Regulation 2017 - Hazardous Chemicals`,
        hazards: [
          {
            type: "Chemical",
            description: "Chemical exposure to waterproofing compounds causing skin sensitization and respiratory irritation",
            riskRating: 6,
            controlMeasures: [
              "Use approved waterproofing products with safety data sheets",
              "Apply membrane in thin, even coats as per manufacturer specifications",
              "Ensure cross-ventilation during application and curing",
              "Clean up spills immediately with appropriate materials"
            ],
            residualRisk: 3,
            causeAgent: "Waterproofing membrane vapors and skin contact with wet product",
            environmentalCondition: `Confined ${siteEnvironment.toLowerCase()} space with restricted airflow`,
            consequence: "Chemical sensitization, respiratory irritation, skin dermatitis"
          }
        ],
        ppe: ["Respirator P2", "Chemical-Resistant Gloves", "Coveralls", "Safety Glasses"],
        tools: ["Roller", "Brush", "Membrane", "Application Tools"],
        trainingRequired: ["Waterproofing Standards", "Chemical Handling Procedures"],
        hrcwReferences: hrcwCategories,
        permitRequired: hrcwCategories.includes(16) ? ["Chemical Risk Assessment"] : []
      }
    );
  }
  
  // Add more activities based on description keywords
  if (isBathroom) {
    activities.push(
      {
        name: "Bathroom Fixture Installation",
        description: "Install bathroom fixtures and fittings ensuring proper sealing and water resistance",
        riskScore: 5,
        residualRisk: 2,
        legislation: `${state} WHS Regulation 2017 - Manual Handling`,
        hazards: [
          {
            type: "Ergonomic",
            description: "Musculoskeletal injuries from manual handling of heavy bathroom fixtures in confined spaces",
            riskRating: 5,
            controlMeasures: [
              "Use mechanical lifting aids where possible",
              "Work in pairs for heavy fixture installation",
              "Plan lifting routes to minimize carrying distances",
              "Take regular breaks to prevent fatigue"
            ],
            residualRisk: 2,
            causeAgent: "Heavy fixture lifting and awkward positioning in bathroom space",
            environmentalCondition: `Confined ${siteEnvironment.toLowerCase()} bathroom with limited maneuvering space`,
            consequence: "Back strain, shoulder injury, or muscle sprain requiring medical attention"
          }
        ],
        ppe: ["Back Support Belt", "Non-Slip Gloves", "Knee Pads", "Safety Boots"],
        tools: ["Lifting Equipment", "Installation Tools", "Sealants", "Fasteners"],
        trainingRequired: ["Manual Handling Techniques", "Fixture Installation Procedures"],
        hrcwReferences: hrcwCategories,
        permitRequired: []
      }
    );
  }
  
  // Ensure we have at least 4-6 activities
  while (activities.length < 4) {
    activities.push({
      name: "Site Setup and Tool Preparation",
      description: "Establish safe work area and prepare all tools and materials for efficient work completion",
      riskScore: 3,
      residualRisk: 1,
      legislation: `${state} WHS Regulation 2017 - Workplace Management`,
      hazards: [
        {
          type: "Physical",
          description: "Slips, trips, and falls from unorganized work area and tool placement",
          riskRating: 3,
          controlMeasures: [
            "Establish designated tool storage areas",
            "Keep walkways clear of materials and equipment",
            "Use non-slip mats in wet areas",
            "Implement housekeeping procedures throughout work"
          ],
          residualRisk: 1,
          causeAgent: "Scattered tools and materials in work area",
          environmentalCondition: `${siteEnvironment} work environment with pedestrian traffic`,
          consequence: "Minor injuries from trips or falls"
        }
      ],
      ppe: ["Hard Hat", "Safety Glasses", "Hi-Vis Vest", "Safety Boots"],
      tools: ["Tool Box", "Storage Containers", "Warning Signs", "Barricades"],
      trainingRequired: ["Site Safety Procedures", "Housekeeping Standards"],
      hrcwReferences: hrcwCategories,
      permitRequired: []
    });
  }
  
  return activities;
}

function generatePlantEquipment(tradeType: string, siteEnvironment: string): any[] {
  const equipment = [];
  
  if (tradeType.toLowerCase().includes('tiling')) {
    equipment.push(
      {
        name: "Wet Tile Cutting Saw",
        type: "Equipment",
        category: "Cutting Tools",
        certificationRequired: false,
        inspectionStatus: "Current",
        riskLevel: "Medium",
        safetyRequirements: [
          "Water reservoir maintained at proper level",
          "Blade guard securely installed",
          "Emergency stop button functional",
          "RCBO/RCD electrical protection"
        ]
      },
      {
        name: "Angle Grinder",
        type: "Equipment",
        category: "Power Tools", 
        certificationRequired: false,
        inspectionStatus: "Current",
        riskLevel: "High",
        safetyRequirements: [
          "Blade guard properly adjusted",
          "Two-handed operation required",
          "Regular blade inspection for damage",
          "Appropriate blade for material being cut"
        ]
      }
    );
  }
  
  equipment.push({
    name: "Mobile Scaffold/Platform",
    type: "Plant",
    category: "Access Equipment",
    certificationRequired: true,
    inspectionStatus: "Current", 
    riskLevel: "Medium",
    safetyRequirements: [
      "Pre-use inspection checklist completed",
      "Erected by competent person only",
      "Load limits clearly marked and observed",
      "Fall protection measures in place"
    ]
  });
  
  return equipment;
}

function generateEmergencyProcedures(siteEnvironment: string, state: string): any[] {
  return [
    {
      scenario: "Personal Injury",
      response: "STOP work immediately. Provide first aid if trained. Call 000 for serious injuries. Notify site supervisor and complete incident report.",
      contacts: [
        "Emergency Services: 000",
        "Site Supervisor",
        "Company Safety Officer",
        `${state} WorkSafe Authority`
      ]
    },
    {
      scenario: "Chemical Spill/Exposure", 
      response: "Evacuate area immediately. Remove contaminated clothing. Flush affected areas with clean water for 15+ minutes. Seek medical attention.",
      contacts: [
        "Poison Information Centre: 13 11 26",
        "Emergency Services: 000",
        "Site Environmental Officer"
      ]
    },
    {
      scenario: "Equipment Failure",
      response: "Isolate equipment from power source. Secure area to prevent access. Tag equipment as 'Out of Service'. Arrange inspection before use.",
      contacts: [
        "Site Supervisor",
        "Equipment Supplier/Maintenance",
        "Workplace Health & Safety Representative"
      ]
    }
  ];
}
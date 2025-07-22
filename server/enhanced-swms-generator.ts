// Enhanced SWMS Generator based on ACE Terminal Professional Standards
// This system generates comprehensive risk assessments following Australian construction safety requirements

export interface DetailedRiskAssessment {
  activity: string;
  hazards: string[];
  initialRiskScore: number;
  controlMeasures: string[];
  legislation: string[];
  residualRiskScore: number;
  responsible: string;
}

// Comprehensive risk database following ACE Terminal format
export const PROFESSIONAL_RISK_DATABASE = {
  // ELECTRICAL WORK
  "Power outlet installation": [
    {
      activity: "Power outlet installation",
      hazards: ["Electrical shock / electrocution", "Contact with live conductors"],
      initialRiskScore: 16,
      controlMeasures: [
        "Ensure all electrical work is carried out by licensed electricians only – L3",
        "Power to be isolated at the main switchboard with lockout/tagout procedures implemented – L2",
        "Test all circuits with approved electrical testing equipment before commencing work – L2",
        "Use only insulated tools rated for electrical work – L2",
        "Wear Class 0 insulated gloves and safety glasses as minimum PPE – L2",
        "Maintain minimum approach distances to live electrical equipment as per AS/NZS 4836 – L2",
        "Emergency procedures to be in place including CPR trained personnel on site – L3"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s140-145",
        "AS/NZS 3000:2018 Wiring Rules",
        "AS/NZS 4836:2011 Safe working on low voltage electrical installations",
        "Electrical Safety Code of Practice 2019"
      ],
      residualRiskScore: 4,
      responsible: "Licensed Electrician A Grade"
    },
    {
      activity: "Power outlet installation",
      hazards: ["Arc flash / electrical burns", "Equipment failure"],
      initialRiskScore: 12,
      controlMeasures: [
        "Conduct arc flash risk assessment prior to work on energised equipment – L3",
        "Use appropriate arc rated PPE when working on live electrical equipment – L2",
        "Maintain safe approach boundaries as defined in AS/NZS 4836 – L2",
        "Only authorised electrical workers to work on live electrical installations – L3",
        "Ensure adequate fire suppression equipment available – L2",
        "Regular inspection and testing of electrical equipment before use – L2"
      ],
      legislation: [
        "AS/NZS 4836:2011",
        "NSW WH&S Regulation 2017, s145",
        "Electrical Safety Code of Practice 2019",
        "AS/NZS 3760:2010 In-service safety inspection"
      ],
      residualRiskScore: 4,
      responsible: "Licensed Electrician A Grade"
    }
  ],

  "Circuit breaker installation": [
    {
      activity: "Circuit breaker installation",
      hazards: ["Electrical shock", "Short circuit", "Equipment damage"],
      initialRiskScore: 16,
      controlMeasures: [
        "Work to be performed by licensed electricians with appropriate endorsements – L3",
        "Complete isolation of electrical supply with verification testing – L2",
        "Use appropriate lockout/tagout procedures with multiple locks where required – L2",
        "Verify circuit breaker ratings match electrical load requirements – L3",
        "Test installation with appropriate testing equipment before energising – L2",
        "Ensure adequate working space clearances as per AS/NZS 3000 – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s140-145",
        "AS/NZS 3000:2018 Section 1.4",
        "AS/NZS 61439.1:2016 Low-voltage switchgear",
        "Electrical Safety Code of Practice 2019"
      ],
      residualRiskScore: 4,
      responsible: "Licensed Electrician A Grade"
    }
  ],

  // PLUMBING WORK
  "Water pipe installation": [
    {
      activity: "Water pipe installation",
      hazards: ["Manual handling injuries", "Cuts from tools/materials", "Confined space work"],
      initialRiskScore: 12,
      controlMeasures: [
        "Conduct manual handling risk assessment before lifting pipes over 20kg – L3",
        "Use mechanical lifting aids for heavy pipes and fittings – L2",
        "Maintain proper lifting techniques - bend knees, straight back – L2",
        "Wear cut-resistant gloves when handling sharp materials – L2",
        "Use appropriate PPE including safety glasses and steel-capped boots – L2",
        "Ensure adequate ventilation in confined spaces – L2",
        "Test atmosphere in confined spaces before entry – L3"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s39-41",
        "Manual Handling Code of Practice 2018",
        "Confined Spaces Code of Practice 2019",
        "AS 2865:2009 Confined spaces"
      ],
      residualRiskScore: 4,
      responsible: "Licensed Plumber"
    },
    {
      activity: "Water pipe installation",
      hazards: ["Water damage", "Contamination of water supply", "Pressure testing failures"],
      initialRiskScore: 8,
      controlMeasures: [
        "Conduct pressure testing as per AS/NZS 3500.1 requirements – L3",
        "Use appropriate jointing compounds and materials – L2",
        "Protect water supply from contamination during installation – L2",
        "Install appropriate isolation valves for maintenance access – L2",
        "Document all pressure test results and certifications – L3",
        "Ensure backflow prevention devices installed where required – L2"
      ],
      legislation: [
        "AS/NZS 3500.1:2018 Plumbing and drainage Part 1",
        "NSW Plumbing Code of Practice",
        "Water Supply Regulation 2017",
        "AS/NZS 2845.1:2010 Water supply - Backflow prevention"
      ],
      residualRiskScore: 3,
      responsible: "Licensed Plumber"
    }
  ],

  // CARPENTRY WORK
  "Wall framing": [
    {
      activity: "Wall framing construction",
      hazards: ["Falls from height", "Struck by falling objects", "Manual handling injuries"],
      initialRiskScore: 16,
      controlMeasures: [
        "Use scaffolding or elevated work platforms for work above 2 metres – L2",
        "Ensure all workers using scaffolding have appropriate training – L3",
        "Install safety mesh or toe boards to prevent falling objects – L2",
        "Wear safety harnesses when working at height without adequate fall protection – L2",
        "Use mechanical lifting equipment for heavy timber elements – L2",
        "Maintain three points of contact when climbing – L2",
        "Establish exclusion zones below work areas – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s79-85",
        "Work at Height Code of Practice 2019",
        "AS/NZS 1576:2010 Scaffolding",
        "AS/NZS 4994.1:2009 Temporary edge protection"
      ],
      residualRiskScore: 4,
      responsible: "Construction Supervisor"
    },
    {
      activity: "Wall framing construction",
      hazards: ["Power tool injuries", "Cuts and lacerations", "Noise exposure"],
      initialRiskScore: 12,
      controlMeasures: [
        "Ensure all power tools are tagged and tested as per AS/NZS 3760 – L3",
        "Use appropriate guards on all cutting equipment – L2",
        "Wear hearing protection when using power tools – L2",
        "Maintain sharp cutting tools to reduce force required – L2",
        "Use push sticks and guides when operating power saws – L2",
        "Conduct noise monitoring where required and provide hearing protection – L3",
        "Ensure adequate lighting in work areas – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s56-58",
        "Noise Management Code of Practice",
        "AS/NZS 3760:2010 In-service safety inspection",
        "AS/NZS 1269:2005 Occupational noise management"
      ],
      residualRiskScore: 4,
      responsible: "Trade Supervisor"
    }
  ],

  // ROOFING WORK
  "Roof sheeting installation": [
    {
      activity: "Roof sheeting installation",
      hazards: ["Falls through roof", "Falls from roof edge", "Material handling"],
      initialRiskScore: 16,
      controlMeasures: [
        "Install safety mesh under roof sheeting work areas – L2",
        "Use safety harnesses connected to appropriate anchor points – L2",
        "Ensure workers have Working at Height training and competency – L3",
        "Install perimeter edge protection before commencing work – L2",
        "Use mechanical lifting for roof sheets to minimise manual handling – L2",
        "Conduct daily pre-start safety briefings for roof work – L3",
        "Maintain minimum 3:1 safety factor for all anchor points – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s79-85",
        "Work at Height Code of Practice 2019",
        "AS/NZS 4994.1:2009 Temporary edge protection",
        "AS/NZS 1891:2007 Industrial fall-arrest systems"
      ],
      residualRiskScore: 4,
      responsible: "Roofing Supervisor"
    }
  ],

  // CONCRETE WORK
  "Concrete pouring": [
    {
      activity: "Concrete pouring operations",
      hazards: ["Chemical burns from concrete", "Manual handling", "Plant and equipment operation"],
      initialRiskScore: 12,
      controlMeasures: [
        "Wear chemical resistant gloves and eye protection when handling concrete – L2",
        "Provide emergency eyewash facilities on site – L2",
        "Use concrete pumps to reduce manual handling requirements – L2",
        "Ensure concrete pump operators hold appropriate licences – L3",
        "Conduct pre-operational checks on all plant and equipment – L2",
        "Maintain safe distances from concrete pumping operations – L2",
        "Provide barrier cream for exposed skin – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s39-41",
        "Plant Code of Practice 2019",
        "Hazardous Chemicals Code of Practice",
        "AS 1379:2007 Specification and supply of concrete"
      ],
      residualRiskScore: 4,
      responsible: "Concrete Supervisor"
    }
  ],

  // EXCAVATION WORK
  "Trenching and excavation": [
    {
      activity: "Trenching and excavation works",
      hazards: ["Cave-in/collapse", "Underground services", "Plant rollover"],
      initialRiskScore: 16,
      controlMeasures: [
        "Conduct Dial Before You Dig search and obtain service location drawings – L3",
        "Use appropriate shoring or battering for excavations over 1.5m deep – L2",
        "Engage qualified geotechnical engineer for soil assessment – L3",
        "Use appropriate excavator operator with high risk work licence – L3",
        "Install barrier protection around excavation perimeter – L2",
        "Conduct daily inspections of excavation stability – L3",
        "Maintain spoil heaps minimum 600mm from excavation edge – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s164-175",
        "Excavation Work Code of Practice 2018",
        "AS 2870:2011 Residential slabs and footings",
        "Utilities Protection Guidelines"
      ],
      residualRiskScore: 4,
      responsible: "Excavation Supervisor"
    }
  ],

  // DEMOLITION WORK
  "Structural demolition": [
    {
      activity: "Structural demolition works",
      hazards: ["Structural collapse", "Asbestos exposure", "Falling debris"],
      initialRiskScore: 16,
      controlMeasures: [
        "Engage structural engineer to assess demolition sequence – L3",
        "Conduct asbestos survey before demolition commences – L3",
        "Use licensed asbestos removalist where asbestos identified – L3",
        "Install protective screens to contain falling debris – L2",
        "Establish exclusion zones with appropriate barriers – L2",
        "Use water suppression for dust control during demolition – L2",
        "Conduct regular air monitoring for asbestos and silica – L3"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s419-443",
        "Demolition Work Code of Practice 2019",
        "Asbestos Code of Practice 2019",
        "AS 2601:2001 Demolition of structures"
      ],
      residualRiskScore: 4,
      responsible: "Demolition Supervisor"
    }
  ],

  // PAINTING WORK
  "Interior painting": [
    {
      activity: "Interior painting operations",
      hazards: ["Chemical exposure", "Falls from height", "Respiratory hazards"],
      initialRiskScore: 12,
      controlMeasures: [
        "Use water-based paints where possible to reduce VOC exposure – L1",
        "Ensure adequate ventilation during painting operations – L2",
        "Wear appropriate respiratory protection when using solvent-based products – L2",
        "Use scaffolding or platforms for work above 2 metres – L2",
        "Provide SDS for all chemical products on site – L3",
        "Conduct air monitoring for VOC levels where required – L3",
        "Store chemicals in appropriate bunded areas – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s347-361",
        "Hazardous Chemicals Code of Practice",
        "Work at Height Code of Practice 2019",
        "AS/NZS 60079:2014 Explosive atmospheres"
      ],
      residualRiskScore: 4,
      responsible: "Painting Supervisor"
    }
  ]
};

export function generateProfessionalSwms(activities: string[], tradeType: string, projectDetails: any) {
  const riskAssessments: DetailedRiskAssessment[] = [];

  // Generate risk assessments for each selected activity
  activities.forEach(activity => {
    const activityRisks = PROFESSIONAL_RISK_DATABASE[activity as keyof typeof PROFESSIONAL_RISK_DATABASE];
    
    if (activityRisks) {
      activityRisks.forEach(risk => {
        riskAssessments.push({
          ...risk,
          id: `${activity}-${risk.hazards[0].replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
        });
      });
    } else {
      // Generate generic risk assessment for activities not in database
      const genericRisk = generateGenericRiskAssessment(activity, tradeType);
      if (genericRisk) {
        riskAssessments.push(genericRisk);
      }
    }
  });

  // Add trade-specific general risks
  const tradeGeneralRisks = getTradeGeneralRisks(tradeType);
  riskAssessments.push(...tradeGeneralRisks);

  return {
    riskAssessments,
    safetyMeasures: generateTradeSafetyMeasures(tradeType),
    complianceCodes: getTradeComplianceCodes(tradeType),
    emergencyProcedures: getEmergencyProcedures(),
    projectSpecificRequirements: generateProjectRequirements(projectDetails)
  };
}

function generateGenericRiskAssessment(activity: string, tradeType: string): DetailedRiskAssessment | null {
  const genericRisks = {
    "Electrical": {
      hazards: ["Electrical shock", "Arc flash"],
      controlMeasures: [
        "Ensure licensed electrician performs all electrical work – L3",
        "Implement lockout/tagout procedures – L2",
        "Use appropriate PPE including insulated gloves – L2",
        "Test circuits before work commences – L2"
      ],
      legislation: ["NSW WH&S Regulation 2017, s140-145", "AS/NZS 3000:2018"],
      responsible: "Licensed Electrician"
    },
    "Plumbing": {
      hazards: ["Manual handling injuries", "Water damage"],
      controlMeasures: [
        "Use mechanical lifting aids for heavy components – L2",
        "Conduct pressure testing as per AS/NZS 3500 – L3",
        "Wear appropriate PPE – L2",
        "Ensure proper ventilation in confined spaces – L2"
      ],
      legislation: ["NSW WH&S Regulation 2017, s39-41", "AS/NZS 3500.1:2018"],
      responsible: "Licensed Plumber"
    }
  };

  const tradeRisk = genericRisks[tradeType as keyof typeof genericRisks];
  if (!tradeRisk) return null;

  return {
    activity,
    hazards: tradeRisk.hazards,
    initialRiskScore: 12,
    controlMeasures: tradeRisk.controlMeasures,
    legislation: tradeRisk.legislation,
    residualRiskScore: 4,
    responsible: tradeRisk.responsible
  };
}

function getTradeGeneralRisks(tradeType: string): DetailedRiskAssessment[] {
  const generalRisks = [
    {
      activity: "General site work",
      hazards: ["Slips, trips and falls", "Manual handling"],
      initialRiskScore: 8,
      controlMeasures: [
        "Maintain good housekeeping standards at all times – L2",
        "Ensure adequate lighting in all work areas – L2",
        "Use non-slip footwear – L2",
        "Conduct manual handling training for all workers – L3",
        "Use mechanical aids where possible – L2"
      ],
      legislation: [
        "NSW WH&S Regulation 2017, s39-41",
        "Manual Handling Code of Practice 2018"
      ],
      residualRiskScore: 3,
      responsible: "Site Supervisor"
    }
  ];

  return generalRisks;
}

function generateTradeSafetyMeasures(tradeType: string) {
  return [
    {
      category: "Personal Protective Equipment",
      measures: [
        "Hard hats to AS/NZS 1801 in all construction areas",
        "Safety glasses to AS/NZS 1337 for all work activities",
        "Steel-capped boots to AS/NZS 2210 on construction sites",
        "High visibility clothing to AS/NZS 4602 in vehicle operating areas"
      ],
      equipment: ["Hard hats", "Safety glasses", "Steel-capped boots", "Hi-vis clothing"],
      procedures: ["Daily PPE inspection", "Replace damaged PPE immediately"]
    }
  ];
}

function getTradeComplianceCodes(tradeType: string): string[] {
  const baseCodes = [
    "Work Health and Safety Act 2011",
    "NSW WH&S Regulation 2017",
    "AS/NZS 4801:2001 Occupational health and safety management systems"
  ];

  const tradeCodes = {
    "Electrical": [
      "AS/NZS 3000:2018 Electrical installations",
      "AS/NZS 4836:2011 Safe working on low voltage electrical installations",
      "Electrical Safety Code of Practice 2019"
    ],
    "Plumbing": [
      "AS/NZS 3500:2018 Plumbing and drainage",
      "NSW Plumbing Code of Practice",
      "Water Supply Regulation 2017"
    ]
  };

  return [...baseCodes, ...(tradeCodes[tradeType as keyof typeof tradeCodes] || [])];
}

function getEmergencyProcedures() {
  return [
    "Emergency contact numbers displayed prominently on site",
    "First aid trained personnel available during all work hours",
    "Emergency evacuation procedures established and communicated",
    "Fire extinguishers and emergency equipment inspected and accessible"
  ];
}

function generateProjectRequirements(projectDetails: any) {
  return [
    "Site-specific induction required for all personnel",
    "Daily toolbox talks to be conducted",
    "Weekly safety inspections to be documented",
    "Incident reporting procedures to be followed"
  ];
}
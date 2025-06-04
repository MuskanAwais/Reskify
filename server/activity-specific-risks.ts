// Activity-specific risk assessments with unique hazards and controls for each activity
export interface ActivityRiskData {
  activity: string;
  description: string;
  complexity: "low" | "medium" | "high";
  hazards: string[];
  controlMeasures: string[];
  ppe: string[];
  training: string[];
  legislation: string[];
  initialRiskScore: number;
  residualRiskScore: number;
}

export const ACTIVITY_SPECIFIC_RISKS: Record<string, ActivityRiskData> = {
  // ELECTRICAL ACTIVITIES
  "Power point installation": {
    activity: "Power point installation",
    description: "Installation of electrical outlets and power points including running cables, connecting circuits, and testing electrical connections in residential and commercial buildings.",
    complexity: "high",
    hazards: [
      "Electrocution from live electrical circuits",
      "Arc flash burns from electrical faults",
      "Falls from ladders during ceiling work",
      "Cuts from cable stripping tools",
      "Fire risk from faulty connections"
    ],
    controlMeasures: [
      "Isolate power at main switchboard and test circuits dead",
      "Use insulated tools rated for electrical work",
      "Install RCD protection on all circuits",
      "Test all connections with appropriate meters",
      "Follow AS/NZS 3000 wiring standards strictly",
      "Use stable work platforms instead of ladders",
      "Implement lockout/tagout procedures"
    ],
    ppe: ["Insulated gloves", "Safety glasses", "Electrical rated boots", "Arc flash clothing"],
    training: ["Electrical license certification", "Safe electrical work practices", "Testing procedures"],
    legislation: ["AS/NZS 3000 Electrical Installations", "Electrical Safety Act", "Work Health and Safety Regulation"],
    initialRiskScore: 5,
    residualRiskScore: 2
  },

  "Light fitting installation": {
    activity: "Light fitting installation",
    description: "Installation of ceiling and wall-mounted light fixtures including mounting brackets, connecting electrical circuits, and ensuring proper earthing and insulation.",
    complexity: "medium",
    hazards: [
      "Electrocution from live electrical circuits",
      "Falls from working at height on ladders or scaffolds",
      "Manual handling injuries from heavy light fittings",
      "Eye strain from working in poorly lit areas"
    ],
    controlMeasures: [
      "Switch off circuit breaker and lock out electrical supply",
      "Use stable work platforms or scaffolding for ceiling work",
      "Test circuits with voltage tester before commencing work",
      "Use appropriate lifting aids for heavy commercial fittings"
    ],
    ppe: ["Insulated gloves", "Non-slip boots", "Safety glasses", "Hard hat for ceiling work"],
    training: ["Electrical installation license", "Working at height", "Electrical testing procedures"],
    legislation: ["AS/NZS 3000 Electrical Installations", "AS/NZS 1680 Interior Lighting"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  "Switchboard upgrade": {
    activity: "Switchboard upgrade",
    description: "Replacement of electrical switchboards including disconnecting old equipment, installing new distribution boards, circuit breakers, and RCD protection devices.",
    complexity: "high",
    hazards: [
      "Electrocution from high voltage electrical supply",
      "Arc flash explosion from electrical faults",
      "Manual handling injuries from heavy switchboard equipment",
      "Asbestos exposure from old electrical equipment",
      "Fire risk from improper connections",
      "Toxic fume exposure from burning electrical components"
    ],
    controlMeasures: [
      "Coordinate power isolation with electricity distributor",
      "Use arc flash rated PPE and maintain safe approach distances",
      "Test for asbestos in pre-1990 electrical equipment",
      "Use mechanical lifting aids for heavy switchboards",
      "Conduct thorough testing of all circuits before energizing",
      "Implement proper ventilation during work",
      "Use qualified high voltage electricians only"
    ],
    ppe: ["Arc flash suit", "Insulated gloves", "Face shield", "Electrical rated boots", "Hard hat", "Respiratory protection"],
    training: ["High voltage electrical license", "Arc flash safety", "Asbestos awareness"],
    legislation: ["AS/NZS 3000 Electrical Installations", "Electricity Safety Act", "Asbestos Regulations"],
    initialRiskScore: 5,
    residualRiskScore: 3
  },

  // PLUMBING ACTIVITIES  
  "Pipe installation": {
    activity: "Pipe installation",
    description: "Installation of water supply and drainage pipes including cutting, joining, and pressure testing of copper, PVC, and polyethylene piping systems.",
    complexity: "medium",
    hazards: [
      "Cuts from pipe cutting tools and sharp pipe edges",
      "Chemical burns from pipe joining compounds and solvents",
      "Manual handling injuries from heavy pipe sections",
      "Confined space risks in trenches and under floors"
    ],
    controlMeasures: [
      "Use proper pipe cutting tools with guards and sharp blades",
      "Ensure adequate ventilation when using solvent-based adhesives",
      "Use mechanical lifting aids for pipes over 20kg",
      "Implement trench safety procedures and shoring"
    ],
    ppe: ["Cut-resistant gloves", "Safety glasses", "Respiratory protection", "Steel-capped boots"],
    training: ["Plumbing license certification", "Confined space entry", "Pressure testing procedures"],
    legislation: ["AS/NZS 3500 Plumbing and Drainage", "Plumbing Code of Australia", "Confined Space Regulations"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  "Hot water system installation": {
    activity: "Hot water system installation",
    description: "Installation of electric, gas, or solar hot water systems including connecting water supply, drainage, electrical or gas connections, and commissioning.",
    complexity: "high",
    hazards: [
      "Electrocution from electrical connections to hot water units",
      "Gas leaks and explosion risks from gas connections",
      "Manual handling injuries from heavy hot water tanks",
      "Scalding from hot water during testing",
      "Falls from roof work for solar hot water systems"
    ],
    controlMeasures: [
      "Ensure electrical work performed by licensed electrician",
      "Use gas leak detection equipment and test all connections",
      "Use crane or mechanical lifting for tanks over 50kg",
      "Install tempering valves to prevent scalding",
      "Use safety harnesses and anchor points for roof work"
    ],
    ppe: ["Insulated gloves", "Gas detection meter", "Safety harness", "Heat-resistant gloves"],
    training: ["Plumbing license", "Gas fitting license", "Working at height certification"],
    legislation: ["AS/NZS 3500 Plumbing", "Gas Installation Code", "AS/NZS 1891 Fall Protection"],
    initialRiskScore: 5,
    residualRiskScore: 2
  },

  // CARPENTRY ACTIVITIES
  "Wall framing": {
    activity: "Wall framing",
    description: "Construction of timber wall frames including measuring, cutting, and assembling timber studs, plates, and noggins to form structural wall frameworks.",
    complexity: "medium",
    hazards: [
      "Manual handling injuries from lifting heavy timber frames",
      "Cuts and lacerations from power saws and hand tools",
      "Eye injuries from flying debris during cutting operations",
      "Noise-induced hearing loss from power tools"
    ],
    controlMeasures: [
      "Use mechanical lifting aids for frames over 20kg",
      "Ensure all cutting tools have proper guards and are well-maintained",
      "Implement two-person lift procedures for large frames",
      "Use engineered temporary bracing during frame assembly"
    ],
    ppe: ["Safety glasses", "Hearing protection", "Work gloves", "Steel-capped boots", "Hard hat"],
    training: ["Manual handling techniques", "Power tool operation", "Frame construction methods"],
    legislation: ["AS 1684 Residential Timber Framing", "AS/NZS 1170 Structural Design Actions"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  "Roof framing": {
    activity: "Roof framing",
    description: "Installation of roof trusses, rafters, and structural roof components at height, including cutting, positioning, and securing roof framing members.",
    complexity: "high",
    hazards: [
      "Falls from height during roof installation",
      "Structural collapse of inadequately braced roof systems",
      "Manual handling injuries from lifting roof trusses",
      "Weather exposure risks including UV and heat stress",
      "Cuts from sharp metal connectors and timber edges",
      "Crushing injuries from falling materials"
    ],
    controlMeasures: [
      "Install safety mesh or catch platforms below work area",
      "Use crane or mechanical lifting for truss installation",
      "Implement progressive bracing system during installation",
      "Schedule work during favorable weather conditions",
      "Provide fall arrest harnesses and anchor points",
      "Establish exclusion zones below work areas"
    ],
    ppe: ["Fall arrest harness", "Hard hat", "Non-slip boots", "Sun protection", "Cut-resistant gloves"],
    training: ["Working at height certification", "Crane signaling", "Roof framing techniques"],
    legislation: ["AS/NZS 1891 Fall Arrest Systems", "AS 1684 Timber Framing", "Work Health and Safety Regulation"],
    initialRiskScore: 5,
    residualRiskScore: 3
  }
};

// Determine task complexity based on activity name and trade
export function getTaskComplexity(activity: string, tradeType: string): "low" | "medium" | "high" {
  const riskData = ACTIVITY_SPECIFIC_RISKS[activity];
  if (riskData) {
    return riskData.complexity;
  }
  
  // High-risk activities
  const highRiskActivities = [
    "switchboard", "high voltage", "roof", "excavation", "crane", "asbestos", 
    "hot water", "gas", "confined space", "welding", "demolition"
  ];
  
  // Medium complexity activities
  const mediumComplexityActivities = [
    "framing", "installation", "wiring", "piping", "tiling", "concreting"
  ];
  
  const activityLower = activity.toLowerCase();
  
  if (highRiskActivities.some(keyword => activityLower.includes(keyword))) {
    return "high";
  } else if (mediumComplexityActivities.some(keyword => activityLower.includes(keyword))) {
    return "medium";
  } else {
    return "low";
  }
}

// Get minimum required risks and controls based on complexity
export function getMinimumRequirements(complexity: "low" | "medium" | "high") {
  switch (complexity) {
    case "low":
      return { minRisks: 1, maxRisks: 2, minControls: 2, maxControls: 3 };
    case "medium":
      return { minRisks: 3, maxRisks: 5, minControls: 3, maxControls: 6 };
    case "high":
      return { minRisks: 5, maxRisks: 8, minControls: 5, maxControls: 10 };
  }
}

export function getActivityRisk(activity: string): ActivityRiskData | null {
  return ACTIVITY_SPECIFIC_RISKS[activity] || null;
}

export function generateGenericRisk(activity: string, trade: string): ActivityRiskData {
  const complexity = getTaskComplexity(activity, trade);
  const requirements = getMinimumRequirements(complexity);
  
  // Generate task-specific description
  const description = `${activity} work involving ${trade.toLowerCase()} trade activities including planning, preparation, execution, and completion with appropriate safety measures.`;
  
  // Generate trade-specific hazards
  const tradeHazards: Record<string, string[]> = {
    Electrical: [
      "Electrocution from live circuits",
      "Arc flash burns from electrical faults",
      "Fire risk from faulty connections"
    ],
    Plumbing: [
      "Water damage from pipe failures",
      "Chemical exposure from pipe compounds",
      "Confined space risks in trenches"
    ],
    Carpentry: [
      "Cuts from power tools and hand tools",
      "Manual handling injuries from heavy materials",
      "Eye injuries from flying debris"
    ],
    Concrete: [
      "Chemical burns from wet concrete",
      "Manual handling injuries from heavy materials",
      "Respiratory issues from concrete dust"
    ],
    Painting: [
      "Chemical exposure from paint fumes",
      "Respiratory issues from spray painting",
      "Falls from working at height"
    ],
    Tiling: [
      "Cuts from tile cutting tools",
      "Chemical exposure from adhesives",
      "Repetitive strain injuries"
    ]
  };

  // Generate trade-specific controls  
  const tradeControls: Record<string, string[]> = {
    Electrical: [
      "Isolate power and test circuits dead",
      "Use insulated tools and PPE",
      "Follow electrical safety standards"
    ],
    Plumbing: [
      "Use proper pipe cutting tools",
      "Ensure adequate ventilation", 
      "Implement trench safety procedures"
    ],
    Carpentry: [
      "Use guards on all cutting tools",
      "Implement mechanical lifting aids",
      "Establish exclusion zones"
    ],
    Concrete: [
      "Use appropriate PPE for concrete work",
      "Implement dust control measures",
      "Use mechanical mixing equipment"
    ],
    Painting: [
      "Ensure adequate ventilation",
      "Use respiratory protection",
      "Implement safe work platforms"
    ],
    Tiling: [
      "Use proper cutting tools with guards",
      "Ensure adequate ventilation",
      "Take regular breaks to prevent strain"
    ]
  };

  const hazards = tradeHazards[trade as keyof typeof tradeHazards] || ["General workplace hazards"];
  const controls = tradeControls[trade as keyof typeof tradeControls] || ["Implement standard safety procedures"];
  
  // Adjust number of hazards and controls based on complexity
  const selectedHazards = hazards.slice(0, Math.min(requirements.maxRisks, hazards.length));
  const selectedControls = controls.slice(0, Math.min(requirements.maxControls, controls.length));
  
  return {
    activity,
    description,
    complexity,
    hazards: selectedHazards,
    controlMeasures: selectedControls,
    ppe: ["Safety glasses", "Work gloves", "Steel-capped boots"],
    training: ["General safety awareness", `${trade} trade certification`],
    legislation: ["Work Health and Safety Act", "Building Code of Australia"],
    initialRiskScore: complexity === "high" ? 4 : complexity === "medium" ? 3 : 2,
    residualRiskScore: 2
  };
}
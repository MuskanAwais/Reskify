// Activity-specific risk assessments with unique hazards and controls for each activity
export interface ActivityRiskData {
  activity: string;
  description: string;
  hazards: string[];
  controlMeasures: string[];
  ppe: string[];
  training: string[];
  legislation: string[];
  initialRiskScore: number;
  residualRiskScore: number;
}

export const ACTIVITY_SPECIFIC_RISKS: Record<string, ActivityRiskData> = {
  // CARPENTRY ACTIVITIES
  "Wall framing": {
    activity: "Wall framing",
    description: "Construction of timber wall frames including measuring, cutting, and assembling timber studs, plates, and noggins to form structural wall frameworks.",
    hazards: [
      "Manual handling injuries from lifting heavy timber frames",
      "Cuts and lacerations from power saws and hand tools",
      "Eye injuries from flying debris during cutting operations",
      "Noise-induced hearing loss from power tools",
      "Crushing injuries from falling timber or frame collapse"
    ],
    controlMeasures: [
      "Use mechanical lifting aids for frames over 20kg",
      "Ensure all cutting tools have proper guards and are well-maintained",
      "Implement two-person lift procedures for large frames",
      "Use engineered temporary bracing during frame assembly",
      "Establish exclusion zones around cutting operations"
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
    hazards: [
      "Falls from height during roof installation",
      "Structural collapse of inadequately braced roof systems",
      "Manual handling injuries from lifting roof trusses",
      "Weather exposure risks including UV and heat stress",
      "Cuts from sharp metal connectors and timber edges"
    ],
    controlMeasures: [
      "Install safety mesh or catch platforms below work area",
      "Use crane or mechanical lifting for truss installation",
      "Implement progressive bracing system during installation",
      "Schedule work during favorable weather conditions",
      "Provide fall arrest harnesses and anchor points"
    ],
    ppe: ["Fall arrest harness", "Hard hat", "Non-slip boots", "Sun protection", "Cut-resistant gloves"],
    training: ["Working at height certification", "Crane signaling", "Roof framing techniques"],
    legislation: ["AS/NZS 1891 Fall Arrest Systems", "AS 1684 Timber Framing", "Work Health and Safety Regulation"],
    initialRiskScore: 5,
    residualRiskScore: 3
  },

  "Door installation": {
    activity: "Door installation",
    description: "Installation of internal and external doors including hanging, fitting hardware, adjusting clearances, and ensuring proper operation and weatherproofing.",
    hazards: [
      "Manual handling injuries from lifting heavy doors",
      "Cuts from door hardware and sharp edges",
      "Pinch injuries from door closing mechanisms",
      "Eye injuries from drilling operations",
      "Repetitive strain from fine adjustment work"
    ],
    controlMeasures: [
      "Use door hanging aids and two-person lift procedures",
      "Pre-fit all hardware before final installation",
      "Use proper drilling techniques with appropriate bits",
      "Take regular breaks during detailed adjustment work",
      "Ensure proper work height to reduce bending"
    ],
    ppe: ["Safety glasses", "Work gloves", "Knee pads", "Back support belt"],
    training: ["Door hanging techniques", "Hardware installation", "Manual handling"],
    legislation: ["Building Code of Australia", "AS 1288 Glass in Buildings"],
    initialRiskScore: 3,
    residualRiskScore: 2
  },

  "Cabinet installation": {
    activity: "Cabinet installation",
    description: "Installation of kitchen and bathroom cabinets including positioning, leveling, securing to walls, and connecting plumbing and electrical services.",
    hazards: [
      "Manual handling injuries from heavy cabinet units",
      "Cuts from sharp cabinet edges and hardware",
      "Electrical shock from connecting appliances",
      "Falls from using ladders for upper cabinet installation",
      "Dust exposure from cutting and drilling operations"
    ],
    controlMeasures: [
      "Use cabinet lifting devices and team lifting procedures",
      "Ensure electrical work is performed by licensed electrician",
      "Use appropriate stepladders with three-point contact",
      "Implement dust extraction during cutting operations",
      "Check wall structure adequacy before mounting"
    ],
    ppe: ["Safety glasses", "Dust mask", "Work gloves", "Non-slip shoes"],
    training: ["Cabinet installation methods", "Electrical safety awareness", "Ladder safety"],
    legislation: ["AS/NZS 3000 Electrical Wiring Rules", "Building Code of Australia"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  // ELECTRICAL ACTIVITIES
  "Electrical wiring": {
    activity: "Electrical wiring",
    description: "Installation of electrical cables, conduits, and wiring systems including pulling cables through walls, connecting circuits, and testing installations.",
    hazards: [
      "Electrical shock and electrocution from live circuits",
      "Burns from electrical arcing and short circuits",
      "Falls from ladders when installing ceiling circuits",
      "Manual handling injuries from heavy cable drums",
      "Cuts from cable stripping and termination work"
    ],
    controlMeasures: [
      "Implement lockout/tagout procedures for all circuits",
      "Use insulated tools and test before work procedures",
      "Install appropriate scaffolding for overhead work",
      "Use mechanical cable pulling equipment",
      "Test all circuits with approved testing equipment"
    ],
    ppe: ["Insulated gloves", "Arc-rated clothing", "Safety glasses", "Electrical safety boots"],
    training: ["Electrical license", "Arc flash awareness", "Lockout/tagout procedures"],
    legislation: ["AS/NZS 3000 Wiring Rules", "Work Health and Safety Regulation"],
    initialRiskScore: 5,
    residualRiskScore: 2
  },

  "Power point installation": {
    activity: "Power point installation",
    description: "Installation of electrical outlets and switches including cutting wall openings, running cables, and connecting devices to circuits.",
    hazards: [
      "Electrical shock from existing circuits",
      "Cuts from power tools during wall cutting",
      "Dust exposure from cutting plasterboard",
      "Eye injuries from debris during drilling",
      "Incorrect wiring leading to electrical faults"
    ],
    controlMeasures: [
      "Turn off power at main switchboard and verify isolation",
      "Use RCD protection on all power tools",
      "Implement dust extraction during cutting",
      "Follow wiring diagrams and color coding standards",
      "Test all connections before energizing"
    ],
    ppe: ["Safety glasses", "Dust mask", "Insulated gloves", "Work boots"],
    training: ["Electrical installation license", "Power tool operation", "Circuit testing"],
    legislation: ["AS/NZS 3000 Wiring Rules", "AS/NZS 3012 Electrical Installations"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  // PLUMBING ACTIVITIES
  "Pipe installation": {
    activity: "Pipe installation",
    description: "Installation of water supply and drainage pipes including cutting, joining, and pressure testing of plumbing systems in walls and under floors.",
    hazards: [
      "Manual handling injuries from heavy pipe sections",
      "Cuts from pipe cutting tools and sharp pipe edges",
      "Burns from hot work and soldering operations",
      "Confined space risks when working under floors",
      "Chemical exposure from pipe primers and solvents"
    ],
    controlMeasures: [
      "Use pipe lifting equipment for large diameter pipes",
      "Ensure adequate ventilation when using chemicals",
      "Implement confined space entry procedures",
      "Use proper cutting techniques and sharp tools",
      "Provide emergency procedures for confined spaces"
    ],
    ppe: ["Chemical-resistant gloves", "Respiratory protection", "Safety glasses", "Knee pads"],
    training: ["Plumbing license", "Confined space entry", "Chemical handling"],
    legislation: ["AS/NZS 3500 Plumbing Code", "Work Health and Safety Regulation"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  "Fixture installation": {
    activity: "Fixture installation",
    description: "Installation of bathroom and kitchen fixtures including toilets, basins, taps, and connecting to water supply and drainage systems.",
    hazards: [
      "Manual handling injuries from heavy ceramic fixtures",
      "Cuts from broken ceramics during installation",
      "Water damage from incorrect connections",
      "Back strain from working in confined spaces",
      "Chemical exposure from sealants and adhesives"
    ],
    controlMeasures: [
      "Use appropriate lifting aids for heavy fixtures",
      "Handle ceramics carefully and inspect for damage",
      "Test all connections before final installation",
      "Use proper work positioning and supports",
      "Ensure adequate ventilation when using sealants"
    ],
    ppe: ["Work gloves", "Knee pads", "Safety glasses", "Chemical-resistant gloves for sealants"],
    training: ["Plumbing installation techniques", "Manual handling", "Chemical safety"],
    legislation: ["AS/NZS 3500 Plumbing Code", "Building Code of Australia"],
    initialRiskScore: 3,
    residualRiskScore: 2
  },

  // CONCRETE ACTIVITIES
  "Concrete pouring": {
    activity: "Concrete pouring",
    description: "Placement and finishing of concrete for slabs, footings, and structural elements including pumping, leveling, and surface finishing operations.",
    hazards: [
      "Chemical burns from cement contact with skin",
      "Manual handling injuries from heavy equipment",
      "Slips and falls on wet concrete surfaces",
      "Equipment entanglement from concrete pumps",
      "Heat stress during extended pouring operations"
    ],
    controlMeasures: [
      "Provide chemical-resistant gloves and eye protection",
      "Use mechanical aids for heavy concrete equipment",
      "Install non-slip walkways and barriers",
      "Implement lockout procedures for pump equipment",
      "Schedule work during cooler parts of day"
    ],
    ppe: ["Chemical-resistant gloves", "Waterproof boots", "Eye protection", "Long-sleeved shirts"],
    training: ["Concrete handling techniques", "Pump operation safety", "Chemical safety"],
    legislation: ["AS 1379 Concrete Structures", "Work Health and Safety Regulation"],
    initialRiskScore: 4,
    residualRiskScore: 2
  },

  // PAINTING ACTIVITIES
  "Interior painting": {
    activity: "Interior painting",
    description: "Application of paint and finishes to interior walls and ceilings including surface preparation, priming, and finish coat application.",
    hazards: [
      "Chemical exposure from paint fumes and solvents",
      "Falls from ladders and scaffolding",
      "Eye and skin irritation from paint splashes",
      "Repetitive strain injuries from painting motions",
      "Fire risk from flammable paint products"
    ],
    controlMeasures: [
      "Ensure adequate ventilation and use low-VOC paints",
      "Use appropriate access equipment with fall protection",
      "Provide emergency eyewash facilities",
      "Take regular breaks and vary work positions",
      "Store paints away from ignition sources"
    ],
    ppe: ["Respiratory protection", "Safety glasses", "Chemical-resistant gloves", "Coveralls"],
    training: ["Chemical safety", "Access equipment use", "Paint application techniques"],
    legislation: ["AS/NZS 1715 Respiratory Protection", "Work Health and Safety Regulation"],
    initialRiskScore: 3,
    residualRiskScore: 2
  },

  // TILING ACTIVITIES
  "Tile installation": {
    activity: "Tile installation",
    description: "Installation of ceramic, porcelain, or natural stone tiles including surface preparation, adhesive application, tile placement, and grouting.",
    hazards: [
      "Cuts from tile cutting equipment and sharp tile edges",
      "Silica dust exposure from cutting operations",
      "Chemical exposure from adhesives and grouts",
      "Knee injuries from prolonged kneeling",
      "Manual handling injuries from heavy tile boxes"
    ],
    controlMeasures: [
      "Use wet cutting methods to control silica dust",
      "Provide respiratory protection during cutting",
      "Ensure adequate ventilation when using chemicals",
      "Use knee pads and take regular position breaks",
      "Use mechanical aids for heavy tile deliveries"
    ],
    ppe: ["P2 respirator", "Safety glasses", "Knee pads", "Cut-resistant gloves"],
    training: ["Tile cutting safety", "Silica awareness", "Chemical handling"],
    legislation: ["Work Health and Safety Regulation", "AS/NZS 1715 Respiratory Protection"],
    initialRiskScore: 4,
    residualRiskScore: 2
  }
};

export function getActivityRisk(activity: string): ActivityRiskData | null {
  // Direct match first
  if (ACTIVITY_SPECIFIC_RISKS[activity]) {
    return ACTIVITY_SPECIFIC_RISKS[activity];
  }

  // Fuzzy matching for similar activities
  const activityLower = activity.toLowerCase();
  for (const [key, data] of Object.entries(ACTIVITY_SPECIFIC_RISKS)) {
    if (key.toLowerCase().includes(activityLower) || activityLower.includes(key.toLowerCase())) {
      return { ...data, activity }; // Return with the requested activity name
    }
  }

  return null;
}

export function generateGenericRisk(activity: string, trade: string): ActivityRiskData {
  const tradeSpecificHazards = {
    "Carpentry": [
      "Manual handling injuries from lifting materials",
      "Cuts and lacerations from hand and power tools",
      "Eye injuries from flying debris",
      "Noise exposure from power tools"
    ],
    "Electrical": [
      "Electrical shock and electrocution",
      "Burns from electrical arcing",
      "Falls from height during installation",
      "Manual handling of heavy equipment"
    ],
    "Plumbing": [
      "Manual handling of pipes and fixtures",
      "Cuts from pipe cutting tools",
      "Chemical exposure from solvents",
      "Confined space entry risks"
    ],
    "Concrete": [
      "Chemical burns from cement contact",
      "Manual handling of heavy equipment",
      "Slips on wet surfaces",
      "Heat stress during operations"
    ],
    "Painting": [
      "Chemical exposure from paint fumes",
      "Falls from access equipment",
      "Eye and skin irritation",
      "Fire risk from flammable materials"
    ],
    "Tiling": [
      "Cuts from cutting tools and sharp edges",
      "Silica dust exposure",
      "Chemical exposure from adhesives",
      "Knee injuries from prolonged kneeling"
    ]
  };

  const tradeSpecificControls = {
    "Carpentry": [
      "Use appropriate manual handling techniques",
      "Ensure all tools are properly maintained",
      "Wear appropriate PPE including eye protection",
      "Implement noise control measures"
    ],
    "Electrical": [
      "Follow lockout/tagout procedures",
      "Use insulated tools and equipment",
      "Implement fall protection systems",
      "Use mechanical lifting aids"
    ],
    "Plumbing": [
      "Use pipe lifting equipment",
      "Maintain sharp cutting tools",
      "Ensure adequate ventilation",
      "Implement confined space procedures"
    ],
    "Concrete": [
      "Provide chemical-resistant PPE",
      "Use mechanical handling aids",
      "Install non-slip surfaces",
      "Implement heat stress prevention"
    ],
    "Painting": [
      "Ensure adequate ventilation",
      "Use appropriate access equipment",
      "Provide emergency facilities",
      "Store materials safely"
    ],
    "Tiling": [
      "Use wet cutting methods",
      "Provide respiratory protection",
      "Ensure adequate ventilation",
      "Use ergonomic work practices"
    ]
  };

  return {
    activity,
    description: `General ${trade.toLowerCase()} work involving ${activity.toLowerCase()} with standard trade practices and safety requirements.`,
    hazards: tradeSpecificHazards[trade] || [
      "Manual handling injuries",
      "Tool-related injuries",
      "Slips, trips and falls",
      "Environmental exposure"
    ],
    controlMeasures: tradeSpecificControls[trade] || [
      "Follow safe work procedures",
      "Use appropriate PPE",
      "Maintain equipment properly",
      "Implement environmental controls"
    ],
    ppe: ["Hard hat", "Safety glasses", "Work gloves", "Safety boots"],
    training: ["Site induction", "Trade-specific training", "Safety procedures"],
    legislation: ["Work Health and Safety Act 2011", "Work Health and Safety Regulation"],
    initialRiskScore: 3,
    residualRiskScore: 2
  };
}
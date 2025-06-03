// Australian Construction Safety Codes and Standards Database

export interface SafetyCode {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  authority: string;
  effectiveDate?: Date;
  url?: string;
  tags: string[];
  applicableTrades: string[];
  riskCategories: string[];
}

export interface TradeRequirement {
  trade: string;
  mandatoryCodes: string[];
  recommendedCodes: string[];
  commonHazards: string[];
  specificRequirements: string[];
}

// Core Australian Safety Standards
export const AUSTRALIAN_SAFETY_CODES: SafetyCode[] = [
  {
    id: "as-nzs-3000-2018",
    code: "AS/NZS 3000:2018",
    title: "Electrical installations (Australian/New Zealand Wiring Rules)",
    description: "This Standard applies to electrical installations in buildings, structures, and premises including domestic, commercial, and industrial installations.",
    category: "Electrical",
    authority: "Standards Australia",
    effectiveDate: new Date("2018-04-27"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/electrotechnology/te-001/as-slash-nzs-3000-colon-2018",
    tags: ["electrical", "wiring", "installation", "safety", "domestic", "commercial", "industrial"],
    applicableTrades: ["Electrical"],
    riskCategories: ["electrical_shock", "fire", "explosion"]
  },
  {
    id: "as-nzs-1891-1-2007",
    code: "AS/NZS 1891.1:2007",
    title: "Industrial fall-arrest systems and devices - Harnesses and ancillary equipment",
    description: "This Standard specifies requirements for full body harnesses and ancillary equipment for industrial fall-arrest systems.",
    category: "Height Safety",
    authority: "Standards Australia",
    effectiveDate: new Date("2007-12-07"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/other/sf-010/as-slash-nzs-1891-dot-1-colon-2007",
    tags: ["fall-arrest", "harness", "height", "safety", "equipment", "industrial"],
    applicableTrades: ["Roofing", "Carpentry", "Electrical", "Concrete Work"],
    riskCategories: ["falls", "height_work"]
  },
  {
    id: "as-2865-2009",
    code: "AS 2865:2009",
    title: "Confined spaces",
    description: "This Standard provides requirements for safe work in confined spaces including entry procedures, atmospheric monitoring, and emergency response.",
    category: "Confined Spaces",
    authority: "Standards Australia",
    effectiveDate: new Date("2009-09-04"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/other/sf-001/as-2865-colon-2009",
    tags: ["confined", "spaces", "entry", "safety", "atmosphere", "monitoring"],
    applicableTrades: ["Plumbing", "Electrical", "Concrete Work"],
    riskCategories: ["confined_space", "atmospheric_hazards", "engulfment"]
  },
  {
    id: "as-nzs-4801-2001",
    code: "AS/NZS 4801:2001",
    title: "Occupational health and safety management systems",
    description: "This Standard specifies requirements for an occupational health and safety management system to enable organizations to control risks and improve performance.",
    category: "Management Systems",
    authority: "Standards Australia",
    effectiveDate: new Date("2001-10-19"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/other/ob-007/as-slash-nzs-4801-colon-2001",
    tags: ["management", "system", "ohs", "workplace", "safety", "performance"],
    applicableTrades: ["All Trades"],
    riskCategories: ["management", "systemic_risks"]
  },
  {
    id: "as-3600-2018",
    code: "AS 3600:2018",
    title: "Concrete structures",
    description: "This Standard covers the design and construction of concrete structures including reinforced and prestressed concrete.",
    category: "Structural",
    authority: "Standards Australia",
    effectiveDate: new Date("2018-10-19"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-042/as-3600-colon-2018",
    tags: ["concrete", "structures", "reinforced", "prestressed", "construction"],
    applicableTrades: ["Concrete Work", "Carpentry"],
    riskCategories: ["structural_failure", "material_handling", "chemical_exposure"]
  },
  {
    id: "as-1684-2010",
    code: "AS 1684:2010",
    title: "Residential timber-framed construction",
    description: "This Standard covers the structural design and construction of timber-framed houses and other residential buildings.",
    category: "Structural",
    authority: "Standards Australia",
    effectiveDate: new Date("2010-02-12"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-003/as-1684-colon-2010",
    tags: ["timber", "framing", "residential", "construction", "structural"],
    applicableTrades: ["Carpentry"],
    riskCategories: ["structural_failure", "manual_handling", "tool_related"]
  },
  {
    id: "as-1562-2018",
    code: "AS 1562:2018",
    title: "Design and installation of sheet roof and wall cladding",
    description: "This Standard covers the design, installation, and fixing of sheet roof and wall cladding for buildings.",
    category: "Roofing",
    authority: "Standards Australia",
    effectiveDate: new Date("2018-08-17"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-004/as-1562-colon-2018",
    tags: ["roofing", "cladding", "installation", "design", "sheet_metal"],
    applicableTrades: ["Roofing"],
    riskCategories: ["falls", "weather_exposure", "manual_handling"]
  },
  {
    id: "as-2601-2001",
    code: "AS 2601:2001",
    title: "The demolition of structures",
    description: "This Standard provides requirements for the safe demolition of structures including planning, execution, and waste management.",
    category: "Demolition",
    authority: "Standards Australia",
    effectiveDate: new Date("2001-03-23"),
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-015/as-2601-colon-2001",
    tags: ["demolition", "structures", "planning", "safety", "waste"],
    applicableTrades: ["Demolition"],
    riskCategories: ["structural_collapse", "hazardous_materials", "noise_dust"]
  }
];

// Safe Work Australia Codes of Practice
export const SAFE_WORK_AUSTRALIA_CODES = [
  {
    id: "swa-managing-risks-plant",
    code: "SWA-COP-PLANT",
    title: "Managing risks of plant in the workplace",
    description: "This Code provides practical guidance on how to manage risks associated with plant in the workplace under the model WHS laws.",
    category: "General Safety",
    authority: "Safe Work Australia",
    effectiveDate: new Date("2021-06-01"),
    url: "https://www.safeworkaustralia.gov.au/resources-and-publications/guidance-materials/model-codes-practice",
    tags: ["plant", "machinery", "risk", "management", "workplace"],
    applicableTrades: ["All Trades"],
    riskCategories: ["machinery", "plant_related"]
  },
  {
    id: "swa-working-at-heights",
    code: "SWA-COP-HEIGHT",
    title: "Managing the risk of falls at workplaces",
    description: "This Code provides practical guidance for managing the risk of falls in workplaces.",
    category: "Height Safety",
    authority: "Safe Work Australia",
    effectiveDate: new Date("2021-06-01"),
    url: "https://www.safeworkaustralia.gov.au/resources-and-publications/guidance-materials/model-codes-practice",
    tags: ["falls", "height", "workplace", "risk", "management"],
    applicableTrades: ["Roofing", "Electrical", "Carpentry"],
    riskCategories: ["falls", "height_work"]
  },
  {
    id: "swa-hazardous-chemicals",
    code: "SWA-COP-CHEM",
    title: "Managing risks of hazardous chemicals in the workplace",
    description: "This Code provides practical guidance for managing risks associated with hazardous chemicals.",
    category: "Chemical Safety",
    authority: "Safe Work Australia",
    effectiveDate: new Date("2021-06-01"),
    url: "https://www.safeworkaustralia.gov.au/resources-and-publications/guidance-materials/model-codes-practice",
    tags: ["chemicals", "hazardous", "workplace", "risk", "sds"],
    applicableTrades: ["All Trades"],
    riskCategories: ["chemical_exposure", "toxic_substances"]
  }
];

// Trade-specific requirements mapping
export const TRADE_REQUIREMENTS: TradeRequirement[] = [
  {
    trade: "Electrical",
    mandatoryCodes: ["AS/NZS 3000:2018", "AS/NZS 1891.1:2007"],
    recommendedCodes: ["AS/NZS 4801:2001", "SWA-COP-PLANT"],
    commonHazards: [
      "Electrical shock and electrocution",
      "Arc flash and burns",
      "Falls from height",
      "Manual handling injuries",
      "Eye injuries from arc flash"
    ],
    specificRequirements: [
      "Licensed electrician supervision required",
      "Electrical isolation and lockout procedures",
      "Testing before work commences",
      "Appropriate PPE including arc flash protection",
      "Emergency response procedures for electrical incidents"
    ]
  },
  {
    trade: "Plumbing",
    mandatoryCodes: ["AS 2865:2009", "AS/NZS 1891.1:2007"],
    recommendedCodes: ["AS/NZS 4801:2001", "SWA-COP-CHEM"],
    commonHazards: [
      "Confined space entry",
      "Exposure to sewage and contaminated water",
      "Chemical exposure from cleaning agents",
      "Manual handling of pipes and fittings",
      "Hot water and steam burns"
    ],
    specificRequirements: [
      "Licensed plumber supervision",
      "Confined space entry procedures where applicable",
      "Water quality testing protocols",
      "Appropriate PPE for contamination protection",
      "Gas fitting certification for gas work"
    ]
  },
  {
    trade: "Carpentry",
    mandatoryCodes: ["AS 1684:2010", "AS/NZS 1891.1:2007"],
    recommendedCodes: ["AS/NZS 4801:2001", "SWA-COP-PLANT"],
    commonHazards: [
      "Cuts from power tools and hand tools",
      "Falls from height during construction",
      "Manual handling of timber and materials",
      "Dust exposure from cutting operations",
      "Noise exposure from power tools"
    ],
    specificRequirements: [
      "Qualified carpenter supervision",
      "Tool safety and maintenance procedures",
      "Fall protection when working at height",
      "Dust control and respiratory protection",
      "Hearing protection in high noise areas"
    ]
  },
  {
    trade: "Roofing",
    mandatoryCodes: ["AS/NZS 1891.1:2007", "AS 1562:2018"],
    recommendedCodes: ["AS/NZS 4801:2001", "SWA-COP-HEIGHT"],
    commonHazards: [
      "Falls from roofs and through roof materials",
      "Weather exposure and heat stress",
      "Manual handling of roofing materials",
      "Cuts from sharp metal edges",
      "Electrical hazards from power lines"
    ],
    specificRequirements: [
      "Fall protection systems mandatory",
      "Weather monitoring and work restrictions",
      "Safety mesh or platforms for fragile roofs",
      "Personal protective equipment for all workers",
      "Emergency rescue procedures for falls"
    ]
  },
  {
    trade: "Demolition",
    mandatoryCodes: ["AS 2601:2001", "AS/NZS 1891.1:2007"],
    recommendedCodes: ["AS/NZS 4801:2001", "SWA-COP-CHEM"],
    commonHazards: [
      "Structural collapse and instability",
      "Exposure to asbestos and hazardous materials",
      "Noise and dust exposure",
      "Manual handling and machinery operation",
      "Electrical hazards from existing services"
    ],
    specificRequirements: [
      "Structural engineer assessment required",
      "Hazardous material survey and removal",
      "Dust and noise control measures",
      "Service location and isolation",
      "Emergency response and evacuation procedures"
    ]
  },
  {
    trade: "Concrete Work",
    mandatoryCodes: ["AS 3600:2018", "AS/NZS 1891.1:2007"],
    recommendedCodes: ["AS/NZS 4801:2001", "SWA-COP-CHEM"],
    commonHazards: [
      "Chemical burns from cement and additives",
      "Manual handling of heavy materials",
      "Machinery and plant operation",
      "Falls into excavations or from height",
      "Noise and dust exposure"
    ],
    specificRequirements: [
      "Concrete pump and machinery safety",
      "Chemical handling and PPE requirements",
      "Excavation and shoring procedures",
      "Quality control and testing protocols",
      "Environmental protection measures"
    ]
  }
];

// Risk categories and their descriptions
export const RISK_CATEGORIES = {
  electrical_shock: {
    name: "Electrical Shock/Electrocution",
    description: "Risk of injury or death from electrical current",
    controlHierarchy: ["Isolation", "Lockout/Tagout", "PPE", "Training"]
  },
  falls: {
    name: "Falls from Height",
    description: "Risk of injury from falling from elevated positions",
    controlHierarchy: ["Elimination", "Guard rails", "Safety nets", "Harnesses"]
  },
  manual_handling: {
    name: "Manual Handling",
    description: "Risk of musculoskeletal injury from lifting, carrying, or repetitive motions",
    controlHierarchy: ["Mechanical aids", "Team lifting", "Training", "Job rotation"]
  },
  chemical_exposure: {
    name: "Chemical Exposure",
    description: "Risk of injury from exposure to hazardous chemicals",
    controlHierarchy: ["Substitution", "Ventilation", "PPE", "Training"]
  },
  confined_space: {
    name: "Confined Space",
    description: "Risk of injury in spaces with limited access and egress",
    controlHierarchy: ["Avoid entry", "Atmospheric testing", "Ventilation", "Emergency procedures"]
  },
  machinery: {
    name: "Machinery/Plant",
    description: "Risk of injury from moving machinery and plant equipment",
    controlHierarchy: ["Guards", "Isolation", "Training", "Maintenance"]
  }
};

// Helper functions
export function getCodesForTrade(tradeName: string): SafetyCode[] {
  const tradeReq = TRADE_REQUIREMENTS.find(req => req.trade === tradeName);
  if (!tradeReq) return [];

  const allCodes = [...AUSTRALIAN_SAFETY_CODES, ...SAFE_WORK_AUSTRALIA_CODES];
  const relevantCodes = allCodes.filter(code => 
    tradeReq.mandatoryCodes.includes(code.code) || 
    tradeReq.recommendedCodes.includes(code.code) ||
    code.applicableTrades.includes(tradeName) ||
    code.applicableTrades.includes("All Trades")
  );

  return relevantCodes;
}

export function getHazardsForTrade(tradeName: string): string[] {
  const tradeReq = TRADE_REQUIREMENTS.find(req => req.trade === tradeName);
  return tradeReq?.commonHazards || [];
}

export function getRequirementsForTrade(tradeName: string): string[] {
  const tradeReq = TRADE_REQUIREMENTS.find(req => req.trade === tradeName);
  return tradeReq?.specificRequirements || [];
}

export function searchSafetyCodes(query: string, category?: string): SafetyCode[] {
  const allCodes = [...AUSTRALIAN_SAFETY_CODES, ...SAFE_WORK_AUSTRALIA_CODES];
  const lowerQuery = query.toLowerCase();
  
  return allCodes.filter(code => {
    const matchesQuery = 
      code.title.toLowerCase().includes(lowerQuery) ||
      code.description.toLowerCase().includes(lowerQuery) ||
      code.code.toLowerCase().includes(lowerQuery) ||
      code.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    const matchesCategory = !category || category === "All Categories" || code.category === category;
    
    return matchesQuery && matchesCategory;
  });
}

export function validateCompliance(activities: string[], tradeName: string): {
  requiredCodes: string[];
  missingCodes: string[];
  recommendations: string[];
} {
  const tradeReq = TRADE_REQUIREMENTS.find(req => req.trade === tradeName);
  if (!tradeReq) {
    return { requiredCodes: [], missingCodes: [], recommendations: [] };
  }

  const requiredCodes = tradeReq.mandatoryCodes;
  const recommendations = [
    ...tradeReq.recommendedCodes,
    ...tradeReq.specificRequirements
  ];

  return {
    requiredCodes,
    missingCodes: requiredCodes, // In a real implementation, this would check against selected codes
    recommendations
  };
}

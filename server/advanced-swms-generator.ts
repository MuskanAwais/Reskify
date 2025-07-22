// Advanced SWMS Generator - Maps 10K+ Tasks to Comprehensive Risk Assessments
// Generates professional SWMS documents following ACE Terminal standards

import { getTasksByTrade, getUniversalTasks, searchMegaTasks, MEGA_CONSTRUCTION_DATABASE, MegaTaskAssessment } from './mega-construction-database';

export interface SwmsRiskAssessment {
  id: string;
  activity: string;
  hazards: string[];
  initialRiskScore: number;
  controlMeasures: string[];
  legislation: string[];
  residualRiskScore: number;
  responsible: string;
}

export interface GeneratedSwms {
  riskAssessments: SwmsRiskAssessment[];
  safetyMeasures: any[];
  complianceCodes: string[];
  emergencyProcedures: string[];
  generalRequirements: string[];
  projectSpecific: any;
}

export async function generateComprehensiveSwms(
  selectedActivities: string[], 
  tradeType: string, 
  projectDetails: any = {}
): Promise<GeneratedSwms> {
  
  const riskAssessments: SwmsRiskAssessment[] = [];
  const complianceCodes = new Set<string>();
  const safetyMeasures: any[] = [];

  // 1. Add Universal Access Tasks (Apply to ALL trades)
  const universalTasks = getUniversalTasks();
  universalTasks.forEach(task => {
    riskAssessments.push(convertTaskToRiskAssessment(task));
    task.legislation.forEach(law => complianceCodes.add(law));
  });

  // 2. Process each selected activity
  for (const activity of selectedActivities) {
    const relatedTasks = findRelatedTasks(activity, tradeType);
    
    relatedTasks.forEach(task => {
      riskAssessments.push(convertTaskToRiskAssessment(task));
      task.legislation.forEach(law => complianceCodes.add(law));
    });
  }

  // 3. Add trade-specific general requirements
  const tradeGeneralTasks = getTradeSpecificGeneralTasks(tradeType);
  tradeGeneralTasks.forEach(task => {
    riskAssessments.push(convertTaskToRiskAssessment(task));
    task.legislation.forEach(law => complianceCodes.add(law));
  });

  // 4. Generate safety measures
  const tradeSafetyMeasures = generateTradeSafetyMeasures(tradeType);
  safetyMeasures.push(...tradeSafetyMeasures);

  // 5. Generate emergency procedures
  const emergencyProcedures = generateEmergencyProcedures(tradeType);

  // 6. Generate general requirements
  const generalRequirements = generateGeneralRequirements();

  return {
    riskAssessments: removeDuplicateRisks(riskAssessments),
    safetyMeasures,
    complianceCodes: Array.from(complianceCodes).sort(),
    emergencyProcedures,
    generalRequirements,
    projectSpecific: generateProjectSpecificRequirements(projectDetails, tradeType)
  };
}

function findRelatedTasks(activity: string, tradeType: string): MegaTaskAssessment[] {
  const tasks: MegaTaskAssessment[] = [];
  
  // Primary search - exact activity match
  const exactMatches = searchMegaTasks(activity).filter(task => 
    task.trade === tradeType || task.applicableToAllTrades
  );
  
  if (exactMatches.length > 0) {
    tasks.push(...exactMatches);
  } else {
    // Secondary search - partial activity match
    const partialMatches = Object.values(MEGA_CONSTRUCTION_DATABASE).filter(task => {
      const activityWords = activity.toLowerCase().split(' ');
      const taskWords = task.activity.toLowerCase().split(' ');
      const matchCount = activityWords.filter(word => 
        taskWords.some(taskWord => taskWord.includes(word) || word.includes(taskWord))
      ).length;
      
      return matchCount >= 2 && (task.trade === tradeType || task.applicableToAllTrades);
    });
    
    tasks.push(...partialMatches.slice(0, 3)); // Limit to top 3 matches
  }

  // Add related sub-tasks and supporting activities
  tasks.forEach(task => {
    if (task.relatedTasks) {
      task.relatedTasks.forEach(relatedTaskId => {
        const relatedTask = MEGA_CONSTRUCTION_DATABASE[relatedTaskId];
        if (relatedTask && !tasks.find(t => t.taskId === relatedTask.taskId)) {
          tasks.push(relatedTask);
        }
      });
    }
  });

  return tasks;
}

function getTradeSpecificGeneralTasks(tradeType: string): MegaTaskAssessment[] {
  // Get general safety tasks specific to the trade
  const tradeTasks = getTasksByTrade(tradeType);
  
  return tradeTasks.filter(task => 
    task.category === "General Site Work" ||
    task.subcategory === "General Safety" ||
    task.activity.toLowerCase().includes('general') ||
    task.activity.toLowerCase().includes('daily') ||
    task.activity.toLowerCase().includes('inspection')
  ).slice(0, 8); // Limit to most relevant general tasks
}

function convertTaskToRiskAssessment(task: MegaTaskAssessment): SwmsRiskAssessment {
  return {
    id: `${task.taskId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    activity: task.activity,
    hazards: task.hazards,
    initialRiskScore: task.initialRiskScore,
    controlMeasures: task.controlMeasures,
    legislation: task.legislation,
    residualRiskScore: task.residualRiskScore,
    responsible: task.responsible
  };
}

function removeDuplicateRisks(risks: SwmsRiskAssessment[]): SwmsRiskAssessment[] {
  const seen = new Set();
  return risks.filter(risk => {
    const key = `${risk.activity}-${risk.hazards.join('-')}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function generateTradeSafetyMeasures(tradeType: string): any[] {
  const baseMeasures = [
    {
      category: "Personal Protective Equipment (PPE)",
      measures: [
        "Hard hats complying with AS/NZS 1801 must be worn in all construction areas",
        "Safety glasses to AS/NZS 1337 required for all work activities",
        "Steel-capped safety boots to AS/NZS 2210.3 on all construction sites",
        "High visibility clothing to AS/NZS 4602.1 in vehicle operating areas",
        "Hearing protection to AS/NZS 1270 in high noise environments"
      ],
      equipment: ["Hard hats", "Safety glasses", "Steel-capped boots", "Hi-vis clothing", "Hearing protection"],
      procedures: [
        "Daily PPE inspection before use",
        "Replace damaged PPE immediately",
        "Store PPE in clean, dry conditions"
      ]
    },
    {
      category: "Emergency Equipment",
      measures: [
        "First aid kits complying with AS/NZS 1337 available on site",
        "Emergency contact numbers prominently displayed",
        "Fire extinguishers appropriate for site hazards",
        "Emergency eyewash stations where chemical hazards present",
        "Emergency communication devices for isolated work"
      ],
      equipment: ["First aid kit", "Fire extinguishers", "Emergency phones", "Eyewash stations"],
      procedures: [
        "Monthly equipment inspections",
        "Emergency drill procedures",
        "Incident reporting protocols"
      ]
    }
  ];

  // Add trade-specific safety measures
  const tradeSpecificMeasures = getTradeSpecificSafetyMeasures(tradeType);
  return [...baseMeasures, ...tradeSpecificMeasures];
}

function getTradeSpecificSafetyMeasures(tradeType: string): any[] {
  const tradeMap: Record<string, any[]> = {
    "Electrical": [
      {
        category: "Electrical Safety Equipment",
        measures: [
          "Insulated tools rated to 1000V minimum for all electrical work",
          "Voltage testers and proving units for dead testing",
          "Class 0 insulated gloves for live electrical work",
          "Arc flash PPE for work on energized equipment",
          "Lockout/tagout devices for electrical isolation"
        ],
        equipment: ["Insulated tools", "Voltage testers", "Insulated gloves", "Arc flash suits", "LOTO devices"],
        procedures: [
          "Test before touch procedures",
          "Electrical isolation verification",
          "Arc flash risk assessment"
        ]
      }
    ],
    "Plumbing": [
      {
        category: "Plumbing Safety Equipment",
        measures: [
          "Pressure testing equipment for water and gas systems",
          "Gas detection equipment for confined spaces",
          "Chemical resistant gloves for drain cleaning",
          "Respiratory protection for sewer work",
          "Confined space entry equipment where required"
        ],
        equipment: ["Pressure gauges", "Gas detectors", "Chemical gloves", "Respirators", "Tripod rescue"],
        procedures: [
          "Pressure testing protocols",
          "Confined space entry procedures",
          "Gas testing before entry"
        ]
      }
    ]
  };

  return tradeMap[tradeType] || [];
}

function generateEmergencyProcedures(tradeType: string): string[] {
  return [
    "Emergency contact numbers (000) prominently displayed at site entrance and work areas",
    "Trained first aid officer available during all work hours with current certificates",
    "Emergency evacuation routes established and communicated to all personnel",
    "Fire extinguishers inspected monthly and appropriate for site fire risks",
    "Emergency assembly point designated and clearly marked",
    "Incident reporting procedures implemented with 24-hour notification requirements",
    "Emergency shutdown procedures for plant and equipment documented",
    "Site emergency coordinator appointed with emergency response training"
  ];
}

function generateGeneralRequirements(): string[] {
  return [
    "All personnel must complete site-specific induction before commencing work",
    "Daily toolbox talks conducted before work commences covering daily hazards",
    "Weekly safety inspections documented with corrective actions tracked",
    "Monthly safety meetings conducted with all site personnel",
    "Incident and near-miss reporting encouraged with no-blame culture",
    "Safety data sheets available for all hazardous chemicals on site",
    "Plant and equipment daily pre-start inspections completed and documented",
    "Competency verification for all high-risk work activities",
    "Consultation with workers on health and safety matters through safety committee",
    "Regular review and update of SWMS based on changing site conditions"
  ];
}

function generateProjectSpecificRequirements(projectDetails: any, tradeType: string): any {
  return {
    projectName: projectDetails.projectLocation || "Construction Project",
    clientRequirements: [
      "Comply with all client-specific safety requirements",
      "Attend client safety meetings as required",
      "Report incidents to client within specified timeframes"
    ],
    siteSpecificHazards: [
      "Weather conditions and seasonal variations",
      "Site access restrictions and traffic management",
      "Proximity to public areas and pedestrian traffic",
      "Underground services and utility locations",
      "Environmental constraints and protected areas"
    ],
    regulatoryRequirements: [
      "Obtain all required permits and licenses before work commencement",
      "Comply with local council requirements and building codes",
      "Adhere to environmental protection requirements",
      "Maintain insurance certificates and workers compensation"
    ]
  };
}
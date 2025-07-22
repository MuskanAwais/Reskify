import OpenAI from "openai";
import { getAllMegaTasks, getTasksByTrade } from "./mega-construction-database";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface JobInput {
  jobDescription: string;
  trade: string;
  projectType?: string;
  location?: string;
  duration?: string;
  requirements?: string;
}

interface AIGeneratedSWMS {
  projectDetails: {
    title: string;
    description: string;
    location: string;
    estimatedDuration: string;
  };
  suggestedTasks: Array<{
    activity: string;
    category: string;
    priority: "high" | "medium" | "low";
    reasoning: string;
  }>;
  riskAssessments: Array<{
    activity: string;
    hazards: string[];
    initialRiskScore: number;
    riskLevel: string;
    controlMeasures: string[];
    legislation: string[];
    residualRiskScore: number;
    residualRiskLevel: string;
    responsible: string;
    ppe: string[];
    trainingRequired: string[];
  }>;
  safetyMeasures: Array<{
    category: string;
    measures: string[];
    equipment: string[];
    procedures: string[];
  }>;
  complianceCodes: string[];
  emergencyProcedures: string[];
  generalRequirements: string[];
  additionalRecommendations: string[];
}

export async function generateComprehensiveAISwms(input: JobInput): Promise<AIGeneratedSWMS> {
  // Get relevant tasks from our comprehensive database
  const tradeTasks = getTasksByTrade(input.trade);
  const allTasks = getAllMegaTasks();
  
  // Create comprehensive prompt for AI
  const prompt = `
You are an expert Australian construction safety consultant. Generate a comprehensive SWMS (Safe Work Method Statement) based on the following job details:

JOB DESCRIPTION: ${input.jobDescription}
PRIMARY TRADE: ${input.trade}
PROJECT TYPE: ${input.projectType || 'Not specified'}
LOCATION: ${input.location || 'Not specified'}
DURATION: ${input.duration || 'Not specified'}
SPECIAL REQUIREMENTS: ${input.requirements || 'None specified'}

AVAILABLE TASKS FOR THIS TRADE (use as reference):
${tradeTasks.slice(0, 50).map(task => `- ${task.activity}: ${task.hazards.slice(0, 3).join(', ')}`).join('\n')}

REQUIREMENTS:
1. Suggest 15-25 specific construction tasks relevant to this job (be comprehensive)
2. Consider ALL phases: setup, preparation, execution, cleanup, and site management
3. Include general construction activities like site access, material handling, waste management
4. For each task, provide comprehensive risk assessment with Australian legislation references
5. Include detailed safety measures, PPE requirements, and training needs
6. Provide emergency procedures and compliance codes
7. Be extremely detailed and extensive for maximum safety coverage
8. Prioritize tasks by safety criticality and project phase

Respond with a JSON object matching this structure:
{
  "projectDetails": {
    "title": "Generated project title",
    "description": "Detailed project description",
    "location": "Project location details",
    "estimatedDuration": "Project duration"
  },
  "suggestedTasks": [
    {
      "activity": "Specific construction activity",
      "category": "Task category",
      "priority": "high|medium|low",
      "reasoning": "Why this task is needed for this job"
    }
  ],
  "riskAssessments": [
    {
      "activity": "Construction activity",
      "hazards": ["List of specific hazards"],
      "initialRiskScore": 15,
      "riskLevel": "High",
      "controlMeasures": ["Detailed control measures"],
      "legislation": ["AS/NZS standards and WHS regulations"],
      "residualRiskScore": 6,
      "residualRiskLevel": "Medium",
      "responsible": "Responsible person/role",
      "ppe": ["Required PPE items"],
      "trainingRequired": ["Required training/certifications"]
    }
  ],
  "safetyMeasures": [
    {
      "category": "Safety category",
      "measures": ["Specific safety measures"],
      "equipment": ["Required safety equipment"],
      "procedures": ["Safety procedures"]
    }
  ],
  "complianceCodes": ["Relevant Australian standards and codes"],
  "emergencyProcedures": ["Emergency response procedures"],
  "generalRequirements": ["General safety requirements"],
  "additionalRecommendations": ["Additional safety recommendations"]
}

Make this extremely comprehensive and detailed with extensive coverage of all safety aspects for Australian construction work.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = response.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    const parsedResponse = JSON.parse(aiResponse);
    
    // Enhance with our database knowledge
    const enhancedResponse = enhanceWithDatabaseKnowledge(parsedResponse, input.trade, tradeTasks);
    
    return enhancedResponse;
  } catch (error) {
    console.error("AI SWMS generation error:", error);
    
    // Fallback to database-driven generation if AI fails
    return generateFallbackSwms(input, tradeTasks);
  }
}

function enhanceWithDatabaseKnowledge(aiResponse: any, trade: string, tradeTasks: any[]): AIGeneratedSWMS {
  // Add additional tasks from our database that AI might have missed
  const additionalTasks = tradeTasks
    .filter(task => !aiResponse.suggestedTasks.some((t: any) => 
      t.activity.toLowerCase().includes(task.activity.toLowerCase().split(' ')[0])
    ))
    .slice(0, 5)
    .map(task => ({
      activity: task.activity,
      category: task.category,
      priority: task.riskLevel === "High" || task.riskLevel === "Extreme" ? "high" : 
                task.riskLevel === "Medium" ? "medium" : "low",
      reasoning: `Important ${trade} task with ${task.riskLevel.toLowerCase()} risk level`
    }));

  // Enhance risk assessments with database data
  const enhancedRiskAssessments = aiResponse.riskAssessments.map((assessment: any) => {
    const matchingTask = tradeTasks.find(task => 
      assessment.activity.toLowerCase().includes(task.activity.toLowerCase().split(' ')[0]) ||
      task.activity.toLowerCase().includes(assessment.activity.toLowerCase().split(' ')[0])
    );

    if (matchingTask) {
      return {
        ...assessment,
        hazards: [...new Set([...assessment.hazards, ...matchingTask.hazards])],
        controlMeasures: [...new Set([...assessment.controlMeasures, ...matchingTask.controlMeasures])],
        legislation: [...new Set([...assessment.legislation, ...matchingTask.legislation])],
        ppe: [...new Set([...assessment.ppe, ...(Array.isArray(matchingTask.ppe) ? matchingTask.ppe : [])])],
        trainingRequired: [...new Set([...assessment.trainingRequired, ...(Array.isArray(matchingTask.trainingRequired) ? matchingTask.trainingRequired : [])])]
      };
    }
    return assessment;
  });

  // Add comprehensive Australian compliance codes
  const australianCodes = [
    "Work Health and Safety Act 2011",
    "Work Health and Safety Regulation 2017",
    "AS/NZS 1801:1997 Occupational Protective Helmets",
    "AS/NZS 1715:2009 Selection, use and maintenance of respiratory protective equipment",
    "AS/NZS 1891.1:2007 Industrial fall-arrest systems and devices",
    "AS 1576 Scaffolding",
    "AS 2550 Cranes, hoists and winches",
    "AS/NZS 3000:2018 Electrical installations",
    "AS 1428.1 Design for access and mobility",
    "Safe Work Australia Codes of Practice"
  ];

  // Add universal tasks that should be in every SWMS
  const universalTasks = [
    { activity: "Site setup and preparation", category: "Preparation", priority: "high", reasoning: "Essential for safe site operations" },
    { activity: "Tool and equipment inspection", category: "Equipment", priority: "high", reasoning: "Critical safety requirement" },
    { activity: "Material handling and storage", category: "Logistics", priority: "medium", reasoning: "Required for project materials" },
    { activity: "Waste management and disposal", category: "Environmental", priority: "medium", reasoning: "Environmental compliance" },
    { activity: "Emergency evacuation procedures", category: "Safety", priority: "high", reasoning: "Critical safety requirement" },
    { activity: "Site cleanup and restoration", category: "Completion", priority: "medium", reasoning: "Project completion requirement" }
  ];
  
  // Filter out universal tasks that are already included
  const universalTasksToAdd = universalTasks.filter(newTask => 
    !aiResponse.suggestedTasks.some((existing: any) => 
      existing.activity.toLowerCase().includes(newTask.activity.toLowerCase().split(' ')[0]) ||
      newTask.activity.toLowerCase().includes(existing.activity.toLowerCase().split(' ')[0])
    )
  );

  return {
    projectDetails: aiResponse.projectDetails,
    suggestedTasks: [...aiResponse.suggestedTasks, ...additionalTasks, ...universalTasksToAdd],
    riskAssessments: enhancedRiskAssessments,
    safetyMeasures: aiResponse.safetyMeasures,
    complianceCodes: [...new Set([...aiResponse.complianceCodes, ...australianCodes])],
    emergencyProcedures: aiResponse.emergencyProcedures,
    generalRequirements: aiResponse.generalRequirements,
    additionalRecommendations: aiResponse.additionalRecommendations
  };
}

function generateFallbackSwms(input: JobInput, tradeTasks: any[]): AIGeneratedSWMS {
  // Database-driven fallback generation
  const relevantTasks = tradeTasks.slice(0, 10);
  
  return {
    projectDetails: {
      title: `${input.trade} Work - ${input.projectType || 'Construction Project'}`,
      description: input.jobDescription,
      location: input.location || "Construction site",
      estimatedDuration: input.duration || "To be determined"
    },
    suggestedTasks: relevantTasks.map(task => ({
      activity: task.activity,
      category: task.category,
      priority: task.riskLevel === "High" || task.riskLevel === "Extreme" ? "high" : 
                task.riskLevel === "Medium" ? "medium" : "low",
      reasoning: `Standard ${input.trade} activity requiring safety management`
    })),
    riskAssessments: relevantTasks.map(task => ({
      activity: task.activity,
      hazards: task.hazards,
      initialRiskScore: task.initialRiskScore,
      riskLevel: task.riskLevel,
      controlMeasures: task.controlMeasures,
      legislation: task.legislation,
      residualRiskScore: task.residualRiskScore,
      residualRiskLevel: task.residualRiskLevel,
      responsible: task.responsible,
      ppe: task.ppe,
      trainingRequired: task.trainingRequired
    })),
    safetyMeasures: [
      {
        category: "General Safety",
        measures: ["Site induction", "Safety briefings", "Hazard identification"],
        equipment: ["First aid kit", "Emergency contacts", "Safety signage"],
        procedures: ["Daily safety checks", "Incident reporting", "Emergency evacuation"]
      }
    ],
    complianceCodes: [
      "Work Health and Safety Act 2011",
      "Work Health and Safety Regulation 2017",
      "AS/NZS 1801:1997 Occupational Protective Helmets",
      "AS/NZS 1715:2009 Respiratory protective equipment"
    ],
    emergencyProcedures: [
      "Immediately stop work and secure the area",
      "Call emergency services: 000",
      "Notify site supervisor and safety officer",
      "Provide first aid if trained and safe to do so",
      "Complete incident report"
    ],
    generalRequirements: [
      "All workers must complete site induction",
      "Daily toolbox talks required",
      "PPE inspection before each shift",
      "Emergency evacuation plan displayed"
    ],
    additionalRecommendations: [
      "Regular safety audits recommended",
      "Consider additional training for high-risk activities",
      "Review and update SWMS as work progresses"
    ]
  };
}
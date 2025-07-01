import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskGenerationRequest {
  taskName?: string;
  projectDetails: {
    projectName: string;
    location: string;
    tradeType: string;
    description?: string;
    siteEnvironment?: string; // Residential, Commercial, Civil, Industrial, Remote, High-rise
    specialRiskFactors?: string[]; // Legacy field for compatibility
    hrcwCategories?: number[]; // High-Risk Construction Work categories (1-18)
    state?: string; // NSW, VIC, QLD, etc.
  };
  plainTextDescription?: string; // For Job Mode
  taskList?: string[]; // For Task Mode - array of specific tasks
  mode?: 'job' | 'task'; // Generation mode
}

export interface GeneratedSWMSData {
  activities: Array<{
    name: string;
    description: string;
    riskScore: number;
    residualRisk: number;
    legislation: string;
    hazards: Array<{
      type: string;
      description: string;
      riskRating: number;
      controlMeasures: string[];
      residualRisk: number;
    }>;
    ppe: string[];
    tools: string[];
    trainingRequired: string[];
  }>;
  plantEquipment: Array<{
    name: string;
    type: 'Equipment' | 'Plant' | 'Vehicle';
    category: string;
    certificationRequired: boolean;
    inspectionStatus: 'Current' | 'Overdue' | 'Required';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    safetyRequirements: string[];
  }>;
  emergencyProcedures: Array<{
    scenario: string;
    response: string;
    contacts: string[];
  }>;
}

export async function generateSWMSFromTask(request: TaskGenerationRequest): Promise<GeneratedSWMSData> {
  try {
    console.log('Generating SWMS with Riskify AI...');
      
    // Determine the mode and create appropriate prompt
    const tradeName = request.projectDetails.tradeType;
    const state = request.projectDetails.state || 'NSW';
    const siteEnvironment = request.projectDetails.siteEnvironment || '';
    const specialRiskFactors = request.projectDetails.specialRiskFactors || [];
    const hrcwCategories = request.projectDetails.hrcwCategories || [];
    
    let prompt = '';
    
    if (request.mode === 'task' && request.taskList && request.taskList.length > 0) {
      // Task Mode: Generate SWMS for specific tasks
      const taskListText = request.taskList.join(', ');
      prompt = `Generate SWMS rows in markdown table format for the following tasks performed by a ${tradeName}: ${taskListText}. Ensure each row is fully detailed and each field in a separate column. Include 8+ comprehensive hazards and control measures for each task with detailed risk assessments.`;
      
    } else {
      // Job Mode: Generate SWMS tasks from job description
      const jobDescription = request.plainTextDescription || request.projectDetails.description || request.taskName || 'General construction work';
      prompt = `Generate SWMS tasks ONLY for a ${tradeName} performing this specific job: "${jobDescription}". 

CRITICAL RESTRICTIONS - FOLLOW THESE RULES EXACTLY:
1. ONLY generate tasks that fall within the specific trade's licensed scope of practice
2. NEVER include tasks that would require different trade licenses or qualifications
3. NEVER include tasks that other trades would typically perform
4. NEVER include general construction activities outside the specific trade's expertise
5. Focus exclusively on tasks using the trade's specific tools, materials, and techniques

UNIVERSAL TRADE BOUNDARY RULES:
- Each trade has specific materials, tools, and techniques - stay within these boundaries
- If a task requires specialized equipment or licenses that the specified trade doesn't typically have, exclude it
- Focus on the trade's core competencies and standard work practices
- Include only preparation, installation, testing, and completion tasks specific to that trade

SCOPE VALIDATION TEST:
Ask yourself: "Would a ${tradeName} tradesperson with standard tools and training personally perform this task as part of their normal work?" If NO, exclude the task.

Generate 6-8 specific tasks that ONLY a ${tradeName} would perform for "${jobDescription}". Each task must be trade-specific work that falls within the tradesperson's scope of practice.`;
    }

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are Riskify, an expert Australian construction safety consultant specializing in trade-specific work. Generate ONLY tasks that fall within the specific tradesperson's licensed scope of practice and standard work boundaries.

ABSOLUTE RESTRICTIONS:
- NEVER generate tasks that require different trade licenses, qualifications, or specialized training
- NEVER include work that other trades would typically perform or be responsible for
- NEVER cross trade boundaries - each trade has specific materials, tools, techniques, and work scope
- ONLY include tasks that the specified tradesperson would personally perform with their standard trade tools and skills

Return structured JSON format:

{
  "activities": [
    {
      "name": "Task name",
      "description": "Brief description",
      "riskScore": 12,
      "residualRisk": 6,
      "legislation": "WHS Act 2011",
      "hazards": [
        {
          "type": "Trade-specific hazard type",
          "description": "Risk description",
          "riskRating": 15,
          "controlMeasures": ["Control 1", "Control 2", "Control 3"],
          "residualRisk": 5
        }
      ],
      "ppe": ["Trade-appropriate PPE"],
      "tools": ["Trade-specific tools"],
      "trainingRequired": ["Trade-specific training"]
    }
  ],
  "plantEquipment": [],
  "emergencyProcedures": []
}

MANDATORY: Generate 6-8 tasks that are EXCLUSIVELY within the specified trade's scope of work. Focus on trade-specific preparation, installation, testing, and completion tasks. Each task needs 4-5 hazards with controls. Risk scores: 1-5=Low, 6-10=Medium, 11-15=High, 16-20=Extreme. Australian WHS compliance. JSON only.`
        },
        {
          role: "user", 
          content: `${prompt}

${hrcwCategories.length > 0 ? `
CRITICAL: The user has identified High-Risk Construction Work (HRCW) categories: ${hrcwCategories.join(', ')}. 
Ensure your generated tasks include specific activities and enhanced safety measures for these HRCW categories:
${hrcwCategories.map(id => {
  const hrcwMap = {
    1: "Fall risk >2m - Include scaffolding, ladders, height work tasks",
    2: "Telecommunication tower - Include tower climbing, antenna work",
    3: "Load-bearing demolition - Include structural assessment, temporary support",
    4: "Asbestos disturbance - Include containment, licensed removal procedures",
    5: "Structural alterations - Include temporary support, engineering assessment",
    6: "Confined spaces - Include entry procedures, atmosphere testing",
    7: "Excavation >1.5m - Include trenching, shoring, cave-in protection",
    8: "Explosives - Include blasting procedures, exclusion zones",
    9: "Pressurised gas - Include isolation, pressure testing procedures",
    10: "Chemical/fuel lines - Include isolation, spill containment",
    11: "Live electrical - Include isolation procedures, lockout/tagout",
    12: "Contaminated atmosphere - Include air monitoring, ventilation",
    13: "Tilt-up/precast concrete - Include crane operations, lifting procedures",
    14: "Traffic corridors - Include traffic management, signage",
    15: "Mobile plant - Include segregation, spotters, communication",
    16: "Extreme temperatures - Include thermal protection, monitoring",
    17: "Water/drowning risk - Include rescue equipment, barriers",
    18: "Live conductors - Include specialized PPE, clearance distances"
  };
  return `- Category ${id}: ${hrcwMap[id] || 'High-risk work requiring specialized procedures'}`;
}).join('\n')}
` : ''}

FINAL REMINDER: Generate tasks that specifically address these high-risk elements with comprehensive control measures.

ABSOLUTE REQUIREMENT: Every single task must be something that ONLY a ${tradeName} tradesperson would perform within their licensed scope of practice. If you include ANY tasks that would require different trade qualifications, licenses, or that other trades would typically perform, you are failing this requirement. Focus exclusively on the specific trade's standard work scope and core competencies.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    // Add timeout to the API call (increased to 60 seconds)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 60000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    const rawContent = (response as any).choices[0].message.content || '{}';
    
    // Clean and validate JSON response
    let cleanContent = rawContent.trim();
    
    // Remove any trailing incomplete JSON fragments
    let lastBraceIndex = cleanContent.lastIndexOf('}');
    if (lastBraceIndex > 0 && lastBraceIndex < cleanContent.length - 1) {
      cleanContent = cleanContent.substring(0, lastBraceIndex + 1);
    }
    
    // Try to parse, with fallback handling
    let result;
    try {
      result = JSON.parse(cleanContent);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message);
      console.error('Raw content length:', rawContent.length);
      console.error('Clean content preview:', cleanContent.substring(0, 500));
      
      // Try to extract valid JSON from the response
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const extractedJson = cleanContent.substring(jsonStart, jsonEnd + 1);
        try {
          result = JSON.parse(extractedJson);
        } catch (secondParseError) {
          throw new Error('Failed to parse AI response as valid JSON');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }
    
    // Validate required structure
    if (!result.activities || !Array.isArray(result.activities)) {
      throw new Error('Invalid response structure: missing activities array');
    }
    
    // Accept the AI-generated trade-specific tasks without adding generic fallbacks
    if (result.activities.length < 6) {
      console.log(`Generated only ${result.activities.length} tasks - AI should generate more trade-specific tasks`);
    } else {
      console.log(`Generated ${result.activities.length} trade-specific tasks`);
    }
    
    // Remove the generic fallback system that was adding irrelevant construction tasks
    if (false) { // Disabled fallback system
      const disabledStandardTasks = [
        {
          id: `compliance-task-${result.activities.length + 1}`,
          name: "Site Setup and Access Control",
          description: "Establish secure site perimeter and control access points",
          hazards: [
            {
              type: "Unauthorized access",
              description: "Risk of unauthorized personnel entering work area",
              riskRating: "Medium",
              controlMeasures: ["Install barriers and signage", "Implement access log system"]
            },
            {
              type: "Traffic management",
              description: "Vehicle and pedestrian conflicts at site entry",
              riskRating: "High", 
              controlMeasures: ["Deploy traffic controllers", "Install warning signs"]
            }
          ],
          ppe: ["Hi-vis vest", "Safety helmet", "Steel-capped boots"],
          tools: ["Barriers", "Signage", "Radio communication"],
          trainingRequired: ["Traffic control", "Site security procedures"],
          riskScore: 12,
          legislation: "WHS Act 2011"
        },
        {
          id: `compliance-task-${result.activities.length + 2}`,
          name: "Emergency Response Procedures",
          description: "Establish and communicate emergency evacuation and response protocols",
          hazards: [
            {
              type: "Medical emergency",
              description: "Risk of workplace injury requiring immediate response",
              riskRating: "High",
              controlMeasures: ["Trained first aid officers on site", "Emergency contact procedures"]
            },
            {
              type: "Fire/evacuation",
              description: "Risk requiring immediate site evacuation",
              riskRating: "Medium",
              controlMeasures: ["Clear evacuation routes", "Assembly point identification"]
            }
          ],
          ppe: ["First aid kit", "Emergency communication device"],
          tools: ["Fire extinguisher", "Emergency contact list", "Evacuation map"],
          trainingRequired: ["First aid certification", "Emergency response procedures"],
          riskScore: 14,
          legislation: "WHS Act 2011"
        },
        {
          id: `compliance-task-${result.activities.length + 3}`,
          name: "Waste Management and Environmental Compliance",
          description: "Proper handling, segregation and disposal of construction waste",
          hazards: [
            {
              type: "Hazardous material exposure",
              description: "Risk from improper handling of construction waste",
              riskRating: "Medium",
              controlMeasures: ["Proper waste segregation", "Use appropriate containers"]
            },
            {
              type: "Environmental contamination",
              description: "Risk of soil or water contamination from waste",
              riskRating: "Medium",
              controlMeasures: ["Containment measures", "Approved disposal methods"]
            }
          ],
          ppe: ["Work gloves", "Safety glasses", "Respirator if required"],
          tools: ["Waste containers", "Spill kits", "Labeling materials"],
          trainingRequired: ["Waste handling procedures", "Environmental compliance"],
          riskScore: 10,
          legislation: "WHS Act 2011, EPA regulations"
        }
      ];
      
      // Disabled: No longer adding generic construction tasks
      // The disabledStandardTasks array above is not used anymore
    }
    
    console.log(`Riskify AI response received successfully with ${result.activities.length} tasks`);
    return result as GeneratedSWMSData;

  } catch (error: any) {
    console.error('SWMS generation error:', error.message);
    throw error;
  }
}
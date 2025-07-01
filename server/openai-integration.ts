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
      prompt = `YOU ARE GENERATING TASKS FOR A ${tradeName} TRADESPERSON ONLY. NO OTHER TRADES ALLOWED.

JOB: "${jobDescription}"

ABSOLUTE FORBIDDEN TASKS (NEVER INCLUDE THESE):
- Framing, structural work, or construction assembly
- Concrete mixing, pouring, or concrete work of any kind  
- Temporary fencing, barriers, or site setup
- Excavation, earthworks, or ground preparation
- Steel work, welding, or metal fabrication
- General construction or site preparation
- Heavy machinery operation
- Civil engineering tasks

FOR ${tradeName} TRADE ONLY - GENERATE THESE TYPES OF TASKS:
${tradeName === 'Tiling & Waterproofing' ? `
- Surface preparation (cleaning, priming existing surfaces)
- Waterproofing membrane application
- Tile measurement and cutting
- Tile adhesive application
- Tile installation and laying
- Grouting and sealing
- Quality checks and touch-ups
- Cleanup of tiling materials` : `
- Trade-specific preparation work
- Material installation using trade tools
- Testing and quality checks
- Trade-specific cleanup`}

VALIDATION: Every task must use ${tradeName} materials, tools, and techniques only. If a task requires different trade skills, DELETE IT.

Generate 6-8 tasks that ONLY a ${tradeName} would do for "${jobDescription}".`;
    }

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are Riskify, an Australian construction safety expert. YOU MUST ONLY GENERATE TASKS FOR THE SPECIFIED TRADE.

CRITICAL: If you generate ANY tasks outside the specified trade's scope, you are FAILING your job.

TRADE BOUNDARY ENFORCEMENT:
- Tiling & Waterproofing: ONLY tile work, waterproofing, surface prep, grouting, sealing
- Electrical: ONLY electrical installation, wiring, testing, compliance  
- Plumbing: ONLY pipe work, fixtures, pressure testing, commissioning
- Carpentry: ONLY timber work, fixing, finishing, hardware

ABSOLUTELY FORBIDDEN FOR ALL TRADES:
- Concrete work (unless you're a Concreter)
- Framing/structural work (unless you're a Carpenter doing timber framing)
- Site preparation (unless specifically part of the trade's prep work)
- Heavy machinery (unless the trade specifically operates it)
- Fencing installation (unless you're a Fencing contractor)

VALIDATION: Before including ANY task, ask "Does this specific trade personally do this work with their standard tools?" If NO, DELETE the task.

Return structured JSON format:`

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

FINAL VALIDATION CHECK: Before submitting your response, review EVERY SINGLE TASK and ask:
1. "Does a ${tradeName} personally do this with their standard tools?" 
2. "Would this task require a different trade license or skills?"
3. "Is this concrete, framing, fencing, or general construction work?"

If ANY task fails these checks, DELETE IT IMMEDIATELY. 

ABSOLUTE REQUIREMENT: Generate ONLY ${tradeName === 'Tiling & Waterproofing' ? 'tiling, waterproofing, surface preparation, grouting, and sealing' : 'trade-specific'} tasks. NO exceptions. NO general construction. NO other trades.`
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
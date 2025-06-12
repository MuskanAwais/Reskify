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
    specialRiskFactors?: string[]; // Confined space, live electrical, structural demolition, height >2m, airside works
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
    
    let prompt = '';
    
    if (request.mode === 'task' && request.taskList && request.taskList.length > 0) {
      // Task Mode: Generate SWMS for specific tasks
      const taskListText = request.taskList.join(', ');
      prompt = `Generate SWMS rows in markdown table format for the following tasks performed by a ${tradeName}: ${taskListText}. Ensure each row is fully detailed and each field in a separate column. Include 8+ comprehensive hazards and control measures for each task with detailed risk assessments.`;
      
    } else {
      // Job Mode: Generate SWMS tasks from job description
      const jobDescription = request.plainTextDescription || request.projectDetails.description || request.taskName || 'General construction work';
      prompt = `We are doing ${jobDescription} as a ${tradeName}. Generate at least 10 individual SWMS rows, one per task, with full markdown table format, each column properly delimited. Include 8+ comprehensive hazards and control measures for each task with detailed risk assessments.`;
    }

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are Riskify, an expert Australian construction safety consultant. The user will provide prompts requesting SWMS data in markdown table format. Convert this into structured JSON format with the following structure:

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
          "type": "Electrical",
          "description": "Risk description",
          "riskRating": 15,
          "controlMeasures": ["Control 1", "Control 2", "Control 3"],
          "residualRisk": 5
        }
      ],
      "ppe": ["Safety helmet", "Safety glasses"],
      "tools": ["Hand tools"],
      "trainingRequired": ["Safety training"]
    }
  ],
  "plantEquipment": [],
  "emergencyProcedures": []
}

CRITICAL: Each task must include 8+ comprehensive hazards with detailed control measures. Use risk scores: 1-5=Low, 6-10=Medium, 11-15=High, 16-20=Extreme. Generate comprehensive SWMS data following Australian WHS standards. Always respond with valid JSON only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
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
    
    console.log('Riskify AI response received successfully');
    return result as GeneratedSWMSData;

  } catch (error: any) {
    console.error('SWMS generation error:', error.message);
    throw error;
  }
}
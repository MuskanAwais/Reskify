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
      const taskListText = request.taskList.join('", "');
      prompt = `Generate SWMS entries for the following tasks as a ${tradeName}: ["${taskListText}"]. Include each task on a separate row with full hazard, control, and compliance details.`;
      
      if (siteEnvironment) {
        prompt += ` Site Environment: ${siteEnvironment}.`;
      }
      if (specialRiskFactors.length > 0) {
        prompt += ` Special Risk Factors: ${specialRiskFactors.join(', ')}.`;
      }
      prompt += ` State: ${state}.`;
      
    } else {
      // Job Mode: Generate 10+ SWMS tasks from job description
      const jobDescription = request.plainTextDescription || request.projectDetails.description || request.taskName || 'General construction work';
      prompt = `Generate at least 10 SWMS tasks for this project for a ${tradeName}: ${jobDescription}. Break it down into logical, industry-accurate tasks and generate full SWMS data for each.`;
      
      if (siteEnvironment) {
        prompt += ` Site Environment: ${siteEnvironment}.`;
      }
      if (specialRiskFactors.length > 0) {
        prompt += ` Special Risk Factors: ${specialRiskFactors.join(', ')}.`;
      }
      prompt += ` State: ${state}.`;
    }

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are Riskify, an expert Australian construction safety consultant. Generate comprehensive SWMS data in JSON format with the following structure:

{
  "activities": [
    {
      "name": "Task name",
      "description": "Detailed description",
      "riskScore": 12,
      "residualRisk": 6,
      "legislation": "WHS Act 2011, WHS Regulation 2017",
      "hazards": [
        {
          "type": "Electrical",
          "description": "Risk of electric shock from live electrical components",
          "riskRating": 15,
          "controlMeasures": ["Use insulated tools", "Test equipment before use"],
          "residualRisk": 5
        }
      ],
      "ppe": ["Safety helmet", "Safety glasses"],
      "tools": ["Insulated hand tools", "Digital multimeter"],
      "trainingRequired": ["Electrical safety training", "First aid"]
    }
  ],
  "plantEquipment": [],
  "emergencyProcedures": []
}

Use numeric risk scores 1-20 where: 1-2=Very Low, 3-5=Low, 6-10=Medium, 11-15=High, 16-20=Extreme. Include comprehensive hazard identification, detailed control measures, specific PPE requirements, required tools/equipment, and mandatory training. Follow Australian WHS legislation and industry best practices.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000
    });

    // Add timeout to the API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 30000)
    );

    try {
      const response = await Promise.race([apiCall, timeoutPromise]);
      const result = JSON.parse((response as any).choices[0].message.content || '{}');
      console.log('Riskify AI response received successfully');
      return result as GeneratedSWMSData;
    } catch (apiError: any) {
      console.error(`SWMS generation failed: ${apiError.message}`);
      throw new Error(`Failed to generate SWMS data from GPT: ${apiError.message}`);
    }

  } catch (error: any) {
    console.error('SWMS generation error:', error.message);
    throw error;
  }
}
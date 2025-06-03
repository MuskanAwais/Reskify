import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface SafetyEnhancement {
  riskAssessments: Array<{
    hazard: string;
    riskLevel: "low" | "medium" | "high" | "extreme";
    controlMeasures: string[];
    responsiblePerson: string;
    complianceCodes: string[];
  }>;
  safetyMeasures: Array<{
    category: string;
    measures: string[];
    equipment: string[];
    procedures: string[];
  }>;
  additionalHazards: string[];
  complianceRecommendations: string[];
}

export async function enhanceSwmsWithAI(
  tradeType: string,
  activities: string[],
  projectDetails?: any
): Promise<SafetyEnhancement> {
  try {
    const prompt = `You are an expert Australian construction safety consultant. Generate comprehensive safety documentation for a SWMS (Safe Work Method Statement) with the following details:

Trade Type: ${tradeType}
Activities: ${activities.join(', ')}
Project Details: ${JSON.stringify(projectDetails || {})}

Please provide a detailed safety analysis including:
1. Risk assessments for each activity with Australian safety standards compliance
2. Comprehensive safety measures and control procedures
3. Required safety equipment and PPE
4. Step-by-step safety procedures
5. Identification of additional hazards not obvious in the activities
6. Specific Australian safety codes and standards that apply
7. Responsible persons for each safety measure

Focus on Australian construction safety regulations, AS/NZS standards, and Safe Work Australia guidelines. Ensure all recommendations are specific, actionable, and compliant with current Australian workplace safety laws.

Respond with a JSON object containing the enhancement data in the following format:
{
  "riskAssessments": [
    {
      "hazard": "string",
      "riskLevel": "low|medium|high|extreme",
      "controlMeasures": ["string"],
      "responsiblePerson": "string",
      "complianceCodes": ["string"]
    }
  ],
  "safetyMeasures": [
    {
      "category": "string",
      "measures": ["string"],
      "equipment": ["string"],
      "procedures": ["string"]
    }
  ],
  "additionalHazards": ["string"],
  "complianceRecommendations": ["string"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Australian construction safety consultant specializing in SWMS documentation and compliance with Australian safety standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as SafetyEnhancement;
  } catch (error) {
    console.error("OpenAI enhancement error:", error);
    throw new Error(`AI enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateSafetyContent(
  query: string,
  tradeType?: string,
  context?: string
): Promise<string> {
  try {
    const prompt = `You are an AI safety assistant specializing in Australian construction safety. 
    
User Query: ${query}
Trade Type: ${tradeType || 'General'}
Context: ${context || 'General safety inquiry'}

Provide helpful, accurate information about Australian construction safety requirements, standards, and best practices. Reference specific AS/NZS standards, Safe Work Australia codes of practice, and state-specific regulations where applicable.

Keep responses practical, actionable, and focused on compliance with Australian workplace safety laws.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant specializing in Australian construction safety, workplace health and safety laws, and SWMS documentation. Provide accurate, actionable safety advice that complies with Australian standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error) {
    console.error("OpenAI content generation error:", error);
    throw new Error(`AI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeSafetyCompliance(
  swmsData: any
): Promise<{
  complianceScore: number;
  issues: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `Analyze this SWMS document for compliance with Australian safety standards:

${JSON.stringify(swmsData, null, 2)}

Evaluate the document against:
- Australian workplace safety laws
- Relevant AS/NZS standards
- Safe Work Australia codes of practice
- Industry-specific safety requirements

Provide a compliance score (0-100) and specific recommendations for improvement.

Respond with JSON in this format:
{
  "complianceScore": number,
  "issues": ["string"],
  "recommendations": ["string"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert safety compliance auditor specializing in Australian construction safety standards and SWMS documentation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      complianceScore: Math.max(0, Math.min(100, result.complianceScore || 0)),
      issues: result.issues || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("OpenAI compliance analysis error:", error);
    throw new Error(`Compliance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateRiskMatrix(
  activities: string[],
  tradeType: string
): Promise<Array<{
  activity: string;
  hazards: Array<{
    hazard: string;
    likelihood: number;
    consequence: number;
    riskRating: string;
    controlMeasures: string[];
  }>;
}>> {
  try {
    const prompt = `Generate a comprehensive risk matrix for the following construction activities:

Trade: ${tradeType}
Activities: ${activities.join(', ')}

For each activity, identify potential hazards and assess them using Australian risk assessment standards. Rate likelihood (1-5) and consequence (1-5), then determine overall risk rating (Low, Medium, High, Extreme).

Provide specific control measures for each hazard based on the hierarchy of controls and Australian safety standards.

Respond with JSON in this format:
{
  "riskMatrix": [
    {
      "activity": "string",
      "hazards": [
        {
          "hazard": "string",
          "likelihood": number,
          "consequence": number,
          "riskRating": "Low|Medium|High|Extreme",
          "controlMeasures": ["string"]
        }
      ]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert risk assessment specialist for Australian construction projects, with deep knowledge of AS/NZS 4360 risk management standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.riskMatrix || [];
  } catch (error) {
    console.error("OpenAI risk matrix generation error:", error);
    throw new Error(`Risk matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Dynamic Risk Scoring System for SWMS Tasks
// Generates realistic risk scores based on task complexity, trade type, and hazard analysis

export function generateDynamicRiskScore(taskName: string, tradeType: string, hazardType?: string): number {
  let baseScore = 4; // Start with low-medium risk
  
  // Trade-specific base risk levels
  const tradeRiskMultipliers: { [key: string]: number } = {
    'Electrical': 2.0,
    'Scaffolding': 1.8,
    'Demolition': 1.7,
    'Welding': 1.6,
    'Roofing': 1.5,
    'HVAC': 1.4,
    'Plumbing': 1.3,
    'Fire Protection Systems': 1.4,
    'Structural Steel': 1.6,
    'Excavation': 1.7,
    'Concrete': 1.3,
    'Carpentry': 1.2,
    'Tiling': 1.1,
    'Painting': 1.0,
    'Flooring': 1.0,
    'Landscaping': 1.0
  };
  
  // Task complexity keywords that increase risk
  const highRiskKeywords = [
    'high voltage', 'electrical', 'overhead', 'confined space', 'height', 'lifting',
    'cutting', 'welding', 'grinding', 'pressure', 'chemical', 'hot work',
    'excavation', 'demolition', 'crane', 'heavy machinery', 'toxic', 'hazardous'
  ];
  
  const mediumRiskKeywords = [
    'installation', 'assembly', 'connection', 'testing', 'inspection',
    'threading', 'jointing', 'mounting', 'commissioning', 'calibration'
  ];
  
  // Check task name for risk indicators
  const taskLower = taskName.toLowerCase();
  let riskMultiplier = 1.0;
  
  // High risk activities
  if (highRiskKeywords.some(keyword => taskLower.includes(keyword))) {
    riskMultiplier += 0.5;
  }
  
  // Medium risk activities  
  if (mediumRiskKeywords.some(keyword => taskLower.includes(keyword))) {
    riskMultiplier += 0.2;
  }
  
  // Hazard type specific adjustments
  if (hazardType) {
    const hazardRiskAdjustments: { [key: string]: number } = {
      'Electrical': 0.4,
      'Chemical': 0.3,
      'Physical': 0.2,
      'Biological': 0.1,
      'Ergonomic': 0.1,
      'Psychological': 0.0
    };
    
    riskMultiplier += hazardRiskAdjustments[hazardType] || 0.1;
  }
  
  // Apply trade multiplier
  const tradeMultiplier = tradeRiskMultipliers[tradeType] || 1.0;
  
  // Calculate final score
  let finalScore = Math.round(baseScore * tradeMultiplier * riskMultiplier);
  
  // Add random variation (±1) to prevent identical scores
  const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  finalScore += variation;
  
  // Ensure score stays within valid range (3-16 for Australian risk matrix)
  finalScore = Math.max(3, Math.min(16, finalScore));
  
  return finalScore;
}

export function generateResidualRiskScore(initialScore: number, controlMeasuresCount: number = 3): number {
  // Typically 40-60% reduction with proper controls
  const reductionFactor = 0.4 + (controlMeasuresCount * 0.05);
  let residualScore = Math.round(initialScore * (1 - reductionFactor));
  
  // Ensure minimum reduction of at least 1 point
  residualScore = Math.max(1, Math.min(residualScore, initialScore - 1));
  
  return residualScore;
}

export function getDynamicRiskDescription(score: number): string {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium"; 
  if (score <= 16) return "High";
  return "Extreme";
}
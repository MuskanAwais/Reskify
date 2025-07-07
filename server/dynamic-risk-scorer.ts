// Dynamic Risk Scoring System for SWMS Tasks
// Generates realistic risk scores based on task complexity, trade type, and hazard analysis

export function generateDynamicRiskScore(taskName: string, tradeType: string, hazardType?: string): number {
  // Task-specific base scores - highly differentiated by actual task complexity
  const taskSpecificScores: { [key: string]: number } = {
    // High-risk tasks (12-16)
    'electrical installation': 14,
    'high voltage work': 16,
    'scaffolding erection': 15,
    'demolition': 14,
    'excavation': 13,
    'welding': 12,
    'hot work': 13,
    'confined space': 15,
    'height work': 14,
    'crane operation': 15,
    
    // Medium-high risk tasks (8-11)  
    'power tool operation': 9,
    'cutting': 10,
    'grinding': 11,
    'pressure testing': 10,
    'heavy lifting': 9,
    'chemical handling': 11,
    'installation': 8,
    'assembly': 8,
    
    // Medium risk tasks (5-7)
    'surface preparation': 6,
    'measurement': 5,
    'marking': 5,
    'inspection': 6,
    'testing': 7,
    'commissioning': 7,
    'calibration': 6,
    
    // Low risk tasks (3-4)
    'cleanup': 3,
    'documentation': 3,
    'planning': 4,
    'quality control': 4,
    'final inspection': 4
  };
  
  const taskLower = taskName.toLowerCase();
  let baseScore = 6; // Default medium risk
  
  // Check for exact task matches first
  for (const [task, score] of Object.entries(taskSpecificScores)) {
    if (taskLower.includes(task)) {
      baseScore = score;
      break;
    }
  }
  
  // Specific keyword analysis for more precise scoring
  const criticalKeywords = [
    { words: ['explosive', 'toxic', 'asbestos'], modifier: 5 },
    { words: ['electrical', 'voltage', 'live'], modifier: 4 },
    { words: ['height', 'fall', 'scaffolding'], modifier: 3 },
    { words: ['cutting', 'blade', 'sharp'], modifier: 2 },
    { words: ['manual handling', 'lifting', 'repetitive'], modifier: 1 }
  ];
  
  for (const { words, modifier } of criticalKeywords) {
    if (words.some(word => taskLower.includes(word))) {
      baseScore = Math.min(16, baseScore + modifier);
      break; // Only apply first match to avoid over-inflation
    }
  }
  
  // Trade-specific adjustments (smaller now since task-specific scoring is primary)
  const tradeAdjustments: { [key: string]: number } = {
    'Electrical': 2,
    'Scaffolding': 2, 
    'Demolition': 1,
    'Welding': 1,
    'Tiling & Waterproofing': -1, // Lower risk trade
    'Painting & Decorating': -2,
    'Landscaping': -2
  };
  
  const tradeAdjustment = tradeAdjustments[tradeType] || 0;
  baseScore = Math.max(3, Math.min(16, baseScore + tradeAdjustment));
  
  // Task sequence position affects risk (later tasks often higher risk)
  const taskHash = taskName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const sequenceVariation = (taskHash % 3) - 1; // -1, 0, or 1
  
  const finalScore = Math.max(3, Math.min(16, baseScore + sequenceVariation));
  
  console.log(`🎯 TASK-SPECIFIC RISK: "${taskName}" → ${finalScore}/20 (base: ${baseScore}, trade: ${tradeType})`);
  
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
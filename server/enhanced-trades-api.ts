// Enhanced Trades API - Integrates 10,000+ Task Database with Primary Tasks and Search
import { getAllMegaTasks, getTasksByTrade, searchMegaTasks, MEGA_CONSTRUCTION_DATABASE } from './mega-construction-database';

export interface EnhancedTradeStructure {
  name: string;
  categories: {
    name: string;
    isPrimary: boolean;
    activities: string[];
    totalActivities: number;
  }[];
  totalTasks: number;
  primaryTasks: string[];
  allTasks: string[];
}

export function generateEnhancedTradesData(): EnhancedTradeStructure[] {
  const allTasks = getAllMegaTasks();
  
  // Primary tasks that appear first for each trade
  const primaryTasksByTrade = {
    "Electrical": [
      "Power outlet installation",
      "Light switch installation", 
      "Ceiling fan installation",
      "Circuit breaker installation",
      "Electrical meter installation",
      "Cable pulling and installation",
      "Conduit installation",
      "Junction box installation",
      "Emergency lighting installation",
      "Smoke alarm installation",
      "Data cable installation",
      "Switchboard installation",
      "Motor control installation",
      "Solar panel installation",
      "Security system installation"
    ],
    "Plumbing": [
      "Water pipe installation",
      "Toilet installation",
      "Tap and fixture installation",
      "Hot water system installation",
      "Drain pipe installation",
      "Gas pipe installation",
      "Bathroom renovation",
      "Kitchen plumbing",
      "Irrigation system installation",
      "Backflow prevention installation",
      "Water meter installation",
      "Septic system installation",
      "Grease trap installation",
      "Pressure testing",
      "Leak detection and repair"
    ],
    "Carpentry": [
      "Wall framing",
      "Roof framing", 
      "Floor framing",
      "Door installation",
      "Window installation",
      "Kitchen cabinet installation",
      "Built-in wardrobe construction",
      "Deck construction",
      "Staircase construction",
      "Timber flooring installation",
      "Skirting board installation",
      "Architrave installation",
      "Pergola construction",
      "Fence construction",
      "Formwork construction"
    ],
    "Roofing": [
      "Tile roof installation",
      "Metal roof installation",
      "Roof repair and maintenance",
      "Gutter installation",
      "Downpipe installation",
      "Roof insulation installation",
      "Roof ventilation installation",
      "Solar panel mounting",
      "Skylight installation",
      "Roof flashing installation",
      "Ridge capping installation",
      "Roof cleaning",
      "Roof painting",
      "Chimney construction",
      "Roof safety systems"
    ],
    "Concrete": [
      "Concrete slab pouring",
      "Footing excavation and pouring",
      "Driveway construction",
      "Pathway construction",
      "Retaining wall construction",
      "Concrete cutting",
      "Concrete repair",
      "Stamped concrete installation",
      "Polished concrete finishing",
      "Concrete sealing",
      "Reinforcement installation",
      "Formwork setup",
      "Concrete pumping",
      "Curing and finishing",
      "Joint sealing"
    ],
    "Demolition": [
      "Interior wall demolition",
      "Structural demolition",
      "Roof demolition",
      "Floor removal",
      "Bathroom demolition",
      "Kitchen demolition",
      "Asbestos removal",
      "Hazardous material removal",
      "Site clearing",
      "Concrete breaking",
      "Salvage and recycling",
      "Waste disposal",
      "Safety barriers installation",
      "Dust control measures",
      "Noise control measures"
    ],
    "Excavation": [
      "Site excavation",
      "Trenching",
      "Foundation excavation",
      "Utility trenching",
      "Drainage excavation",
      "Pool excavation",
      "Basement excavation",
      "Bulk earthworks",
      "Topsoil removal",
      "Rock breaking",
      "Backfilling",
      "Compaction",
      "Shoring installation",
      "Dewatering",
      "Site remediation"
    ],
    "Painting": [
      "Interior wall painting",
      "Exterior wall painting",
      "Ceiling painting",
      "Trim and door painting",
      "Fence painting",
      "Roof painting",
      "Floor painting",
      "Protective coating application",
      "Primer application",
      "Texture coating",
      "Spray painting",
      "Brush and roller painting",
      "Surface preparation",
      "Paint removal",
      "Color matching"
    ]
  };

  const trades = Object.keys(primaryTasksByTrade) as Array<keyof typeof primaryTasksByTrade>;
  
  return trades.map(tradeName => {
    const tradeTasks = getTasksByTrade(tradeName);
    const primaryTasks = primaryTasksByTrade[tradeName];
    
    // Get all unique activities for this trade
    const allTradeActivities = tradeTasks.map(task => task.activity);
    const uniqueActivities = [...new Set(allTradeActivities)];
    
    // Organize by categories
    const categoryMap = new Map<string, string[]>();
    
    tradeTasks.forEach(task => {
      if (!categoryMap.has(task.subcategory)) {
        categoryMap.set(task.subcategory, []);
      }
      if (!categoryMap.get(task.subcategory)!.includes(task.activity)) {
        categoryMap.get(task.subcategory)!.push(task.activity);
      }
    });

    // Create categories with primary flag
    const categories = Array.from(categoryMap.entries()).map(([categoryName, activities]) => {
      const isPrimary = activities.some(activity => primaryTasks.includes(activity));
      return {
        name: categoryName,
        isPrimary,
        activities: activities.sort(),
        totalActivities: activities.length
      };
    });

    // Sort categories - primary first
    categories.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      name: tradeName,
      categories,
      totalTasks: tradeTasks.length,
      primaryTasks: primaryTasks.filter(task => uniqueActivities.includes(task)),
      allTasks: uniqueActivities.sort()
    };
  });
}

export function searchAllTasks(searchTerm: string, tradeFilter?: string): any[] {
  const results = searchMegaTasks(searchTerm);
  
  let filteredResults = results;
  if (tradeFilter && tradeFilter !== "All Trades") {
    filteredResults = results.filter(task => 
      task.trade === tradeFilter || task.applicableToAllTrades
    );
  }

  return filteredResults.map(task => ({
    activity: task.activity,
    trade: task.trade,
    category: task.category,
    subcategory: task.subcategory,
    complexity: task.complexity,
    frequency: task.frequency,
    riskScore: task.initialRiskScore,
    hazards: task.hazards.slice(0, 3), // First 3 hazards for preview
    legislation: task.legislation.slice(0, 2) // First 2 legislation items for preview
  }));
}

export function getTaskDetails(taskActivity: string): any {
  const allTasks = getAllMegaTasks();
  const task = allTasks.find(t => t.activity === taskActivity);
  
  if (!task) return null;
  
  return {
    taskId: task.taskId,
    activity: task.activity,
    category: task.category,
    subcategory: task.subcategory,
    trade: task.trade,
    hazards: task.hazards,
    initialRiskScore: task.initialRiskScore,
    controlMeasures: task.controlMeasures,
    legislation: task.legislation,
    residualRiskScore: task.residualRiskScore,
    responsible: task.responsible,
    applicableToAllTrades: task.applicableToAllTrades,
    frequency: task.frequency,
    complexity: task.complexity
  };
}

export function getFrequentlyUsedTasks(): string[] {
  // Most commonly selected construction tasks across all trades
  return [
    "Site access and security check",
    "Daily housekeeping and waste management",
    "Emergency procedures and evacuation",
    "Power outlet installation",
    "Light switch installation",
    "Water pipe installation",
    "Toilet installation",
    "Wall framing",
    "Door installation",
    "Tile roof installation",
    "Metal roof installation",
    "Concrete slab pouring",
    "Site excavation",
    "Interior wall painting",
    "Structural demolition"
  ];
}
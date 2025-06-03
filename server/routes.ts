import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSwmsSchema, 
  insertAiInteractionSchema,
  riskAssessmentSchema,
  safetyMeasureSchema
} from "@shared/schema";
import { generateAutoSwms } from "./auto-swms-generator";
import { z } from "zod";
import { generateSafetyContent, enhanceSwmsWithAI } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User management
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        companyName: user.companyName,
        primaryTrade: user.primaryTrade
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        companyName: user.companyName,
        primaryTrade: user.primaryTrade
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Auto-generate SWMS based on selected activities
  app.post("/api/auto-generate-swms", async (req, res) => {
    try {
      const { activities, tradeType, projectLocation, title } = req.body;
      
      if (!activities || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ message: 'Activities array is required' });
      }

      // Use OpenAI to generate comprehensive risk assessments for each activity
      const { generateSafetyContent } = await import('./openai');
      
      const riskAssessments = [];
      const safetyMeasures = [];
      const complianceCodes = new Set();

      // Generate risk assessment for each activity using AI
      for (const activity of activities) {
        try {
          const safetyData = await generateSafetyContent(
            `Generate a comprehensive risk assessment for the construction activity: "${activity}" in the trade: "${tradeType}". Include specific hazards, control measures, Australian legislation references, PPE requirements, and responsible persons.`,
            {
              activity,
              trade: tradeType,
              location: projectLocation
            }
          );

          // Parse the AI response and create structured risk assessment
          const riskAssessment = {
            id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            activity: activity,
            hazards: safetyData.hazards || [
              "Manual handling injuries",
              "Electrical shock hazards",
              "Falls from height",
              "Tool and equipment injuries",
              "Environmental exposure"
            ],
            initialRiskScore: safetyData.initialRiskScore || 9,
            riskLevel: safetyData.riskLevel || "Medium",
            controlMeasures: safetyData.controlMeasures || [
              "Follow safe work procedures",
              "Use appropriate PPE",
              "Conduct pre-task safety briefing",
              "Ensure proper tool maintenance",
              "Implement environmental controls"
            ],
            residualRiskScore: safetyData.residualRiskScore || 3,
            residualRiskLevel: safetyData.residualRiskLevel || "Low",
            responsible: safetyData.responsible || "Site Supervisor",
            ppe: safetyData.ppe || ["Safety glasses", "Hard hat", "Safety boots", "High-vis clothing"],
            training: safetyData.training || ["Task-specific training", "Safety induction"],
            inspection: safetyData.inspection || "Pre-work inspection",
            emergencyProcedures: safetyData.emergencyProcedures || ["Call 000 for emergencies", "Follow site evacuation procedures"],
            environmental: safetyData.environmental || ["Protect waterways", "Minimize noise"],
            quality: safetyData.quality || ["Follow quality standards", "Complete documentation"],
            legislation: safetyData.legislation || [
              "Work Health and Safety Act 2011",
              "Work Health and Safety Regulation 2017",
              "Building Code of Australia"
            ],
            category: safetyData.category || "General Construction",
            trade: tradeType,
            complexity: safetyData.complexity || "intermediate",
            frequency: safetyData.frequency || "project-based",
            editable: true
          };

          riskAssessments.push(riskAssessment);

          // Add safety measures
          if (safetyData.safetyMeasures) {
            safetyMeasures.push(...safetyData.safetyMeasures);
          }

          // Add compliance codes
          if (safetyData.legislation) {
            safetyData.legislation.forEach((code: string) => complianceCodes.add(code));
          }

        } catch (aiError) {
          console.error(`Failed to generate AI content for activity: ${activity}`, aiError);
          
          // Fallback risk assessment if AI fails
          const fallbackRisk = {
            id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            activity: activity,
            hazards: ["General construction hazards", "Manual handling", "Tool injuries"],
            initialRiskScore: 9,
            riskLevel: "Medium",
            controlMeasures: ["Follow safe work procedures", "Use appropriate PPE", "Conduct safety briefing"],
            residualRiskScore: 3,
            residualRiskLevel: "Low",
            responsible: "Site Supervisor",
            ppe: ["Safety glasses", "Hard hat", "Safety boots", "High-vis clothing"],
            training: ["Safety induction", "Task-specific training"],
            inspection: "Pre-work inspection",
            emergencyProcedures: ["Call 000 for emergencies"],
            environmental: ["Standard environmental controls"],
            quality: ["Follow quality procedures"],
            legislation: ["Work Health and Safety Act 2011"],
            category: "General Construction",
            trade: tradeType,
            complexity: "basic",
            frequency: "project-based",
            editable: true
          };
          
          riskAssessments.push(fallbackRisk);
        }
      }

      res.json({
        title: title || `SWMS - ${tradeType} Work`,
        projectLocation,
        tradeType,
        activities,
        riskAssessments,
        safetyMeasures: Array.from(new Set(safetyMeasures)),
        complianceCodes: Array.from(complianceCodes),
        aiEnhanced: true,
        status: 'draft'
      });
    } catch (error: any) {
      console.error('Auto-generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to auto-generate SWMS' });
    }
  });

  // Generate detailed SWMS table data from selected tasks
  app.post("/api/generate-swms-table", async (req, res) => {
    try {
      const { activities, tradeType, projectDetails } = req.body;
      
      if (!activities || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ message: 'Activities array is required' });
      }

      const { getAllMegaTasks } = await import('./mega-construction-database');
      const allTasks = getAllMegaTasks();
      
      // Map selected activities to detailed SWMS table data
      const swmsTableData = activities.map((activity: string) => {
        // Find exact task match in comprehensive database
        const exactTask = allTasks.find(task => task.activity === activity);
        if (exactTask) {
          return {
            id: exactTask.taskId,
            activity: exactTask.activity,
            hazards: exactTask.hazards,
            riskLevel: exactTask.riskLevel,
            initialRisk: exactTask.initialRiskScore,
            controlMeasures: exactTask.controlMeasures,
            residualRisk: exactTask.residualRiskScore,
            residualRiskLevel: exactTask.residualRiskLevel,
            responsible: exactTask.responsible,
            ppe: exactTask.ppe || [],
            training: exactTask.trainingRequired || [],
            inspection: exactTask.inspectionFrequency,
            emergencyProcedures: exactTask.emergencyProcedures || [],
            environmental: exactTask.environmentalControls || [],
            quality: exactTask.qualityRequirements || [],
            legislation: exactTask.legislation,
            category: exactTask.category,
            trade: exactTask.trade,
            complexity: exactTask.complexity,
            frequency: exactTask.frequency,
            editable: true
          };
        }
        
        // Return structured entry for activities not in database
        return {
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          activity: activity,
          hazards: ["To be assessed"],
          riskLevel: "Medium",
          initialRisk: 9,
          controlMeasures: ["To be determined"],
          residualRisk: 3,
          residualRiskLevel: "Low",
          responsible: "Site Supervisor",
          ppe: ["Standard PPE required"],
          training: ["Task-specific training required"],
          inspection: "As required",
          emergencyProcedures: ["Follow site emergency procedures"],
          environmental: ["Standard environmental controls"],
          quality: ["Follow quality procedures"],
          legislation: ["Work Health and Safety Act 2011"],
          category: "General",
          trade: tradeType,
          complexity: "basic",
          frequency: "project-based",
          editable: true
        };
      });

      const response = {
        success: true,
        title: `SWMS - ${tradeType} Work`,
        projectLocation: projectDetails?.location || "Construction Site",
        selectedActivities: activities,
        swmsTableData: swmsTableData,
        projectDetails: projectDetails,
        tradeType: tradeType,
        complianceCodes: [
          "Work Health and Safety Act 2011 (Cth)",
          "Work Health and Safety Regulation 2017",
          "Construction Work Code of Practice 2013"
        ],
        summary: {
          totalTasks: swmsTableData.length,
          riskProfile: {
            extreme: swmsTableData.filter(item => item.riskLevel === "Extreme").length,
            high: swmsTableData.filter(item => item.riskLevel === "High").length,
            medium: swmsTableData.filter(item => item.riskLevel === "Medium").length,
            low: swmsTableData.filter(item => item.riskLevel === "Low").length
          },
          databaseMatches: swmsTableData.filter(item => !item.id.startsWith('custom-')).length,
          customEntries: swmsTableData.filter(item => item.id.startsWith('custom-')).length
        }
      };
      
      res.json(response);
    } catch (error: any) {
      console.error('SWMS table generation error:', error);
      res.status(500).json({ message: 'Failed to generate SWMS table data' });
    }
  });

  // AI Chat Assistant endpoint
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const { generateSafetyContent } = await import('./openai');
      const response = await generateSafetyContent(
        message,
        "safety_assistant",
        "Provide helpful safety advice and guidance for Australian construction sites."
      );

      res.json({ response });
    } catch (error: any) {
      console.error('AI chat error:', error);
      res.status(500).json({ message: 'Failed to get AI response' });
    }
  });

  // Search activities across all trades
  app.get("/api/search-activities", async (req, res) => {
    try {
      const { q: searchTerm, trade } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ message: 'Search term required' });
      }

      const { searchAllTasks } = await import('./enhanced-trades-api');
      const results = searchAllTasks(searchTerm, trade as string);
      res.json(results);
    } catch (error: any) {
      console.error('Search activities error:', error);
      res.status(500).json({ message: 'Failed to search activities' });
    }
  });

  // Get all activities for a specific trade
  app.get("/api/trades/:tradeName/activities", async (req, res) => {
    try {
      const { tradeName } = req.params;
      const { category } = req.query;
      
      const { getRealTasksByTrade } = await import('./real-construction-tasks');
      const allTasks = getRealTasksByTrade(tradeName);
      
      if (category) {
        const categoryTasks = allTasks.filter(task => task.category === category);
        res.json({ activities: categoryTasks.map(task => task.activity) });
      } else {
        // Return all activities for the trade
        res.json({ activities: allTasks.map(task => task.activity) });
      }
    } catch (error: any) {
      console.error('Trade activities error:', error);
      res.status(500).json({ message: 'Failed to fetch trade activities' });
    }
  });

  // Trade types and comprehensive activities
  app.get("/api/trades", async (req, res) => {
    try {
      // Use the real construction tasks database with unique tasks
      const { getAllRealTasks, getRealTasksByTrade } = await import('./real-construction-tasks');
      
      const allTasks = getAllRealTasks();
      const tradeNames = Array.from(new Set(allTasks.map(task => task.trade)));
      
      const trades = tradeNames.map(tradeName => {
        const tradeTasks = getRealTasksByTrade(tradeName);
        
        // Group tasks by category
        const categories = tradeTasks.reduce((acc, task) => {
          if (!acc[task.category]) {
            acc[task.category] = {
              name: task.category,
              isPrimary: task.complexity === 'basic' || task.frequency === 'daily',
              tasks: []
            };
          }
          acc[task.category].tasks.push(task.activity);
          return acc;
        }, {} as Record<string, any>);
        
        const categoryArray = Object.values(categories).map((cat: any) => {
          const uniqueTasks = Array.from(new Set(cat.tasks));
          return {
            name: cat.name,
            isPrimary: cat.isPrimary,
            activities: uniqueTasks,
            totalActivities: uniqueTasks.length,
            hasMore: false
          };
        });
        
        return {
          name: tradeName,
          categories: categoryArray,
          totalTasks: tradeTasks.length,
          primaryTasks: tradeTasks.filter(t => t.complexity === 'basic').map(t => t.activity),
          allTasks: tradeTasks.map(t => t.activity)
        };
      });
      
      res.json(trades);
    } catch (error: any) {
      console.error('Real construction tasks error:', error);
      
      // Fallback to basic structure
      const trades = [
        {
          name: "Electrical",
          categories: [
            {
              name: "Primary Tasks",
              isPrimary: true,
              activities: [
                "Power outlet installation",
                "Light switch installation",
                "Circuit breaker installation",
                "Ceiling fan installation",
                "Smoke alarm installation",
                "Switchboard installation",
                "Cable installation",
                "Conduit installation",
                "Emergency lighting installation",
                "Data point installation",
              "Antenna installation",
              "Solar panel installation",
              "Battery system installation",
              "Generator installation",
              "Transformer installation"
            ]
          },
          {
            name: "Maintenance & Repair",
            activities: [
              "Fault finding and diagnostics",
              "Circuit breaker maintenance",
              "Motor rewinding",
              "Cable fault location",
              "Transformer maintenance",
              "Emergency lighting testing",
              "PAT testing",
              "Electrical equipment calibration",
              "Power factor correction",
              "Switchboard upgrades"
            ]
          },
          {
            name: "Testing & Commissioning",
            activities: [
              "Electrical installation testing",
              "RCD testing",
              "Insulation resistance testing",
              "Earth loop impedance testing",
              "Thermal imaging inspection",
              "Load testing",
              "Commissioning procedures",
              "Safety switch testing"
            ]
          }
        ]
      },
      {
        name: "Plumbing",
        categories: [
          {
            name: "Water Systems",
            activities: [
              "Hot water system installation",
              "Cold water system installation",
              "Water tank installation",
              "Pump installation",
              "Pipe installation and repair",
              "Tap and fixture installation",
              "Water meter installation",
              "Backflow prevention device installation",
              "Water filtration system installation",
              "Irrigation system installation"
            ]
          },
          {
            name: "Drainage & Sewerage",
            activities: [
              "Sewer line installation",
              "Stormwater drainage",
              "Septic system installation",
              "Grease trap installation",
              "Floor waste installation",
              "Downpipe installation",
              "Gutter installation",
              "Roof drainage systems",
              "Detention tank installation",
              "Sewer camera inspection"
            ]
          },
          {
            name: "Gas Fitting",
            activities: [
              "Gas appliance installation",
              "Gas meter installation",
              "Gas line installation",
              "LPG system installation",
              "Gas leak detection and repair",
              "Pressure testing",
              "Gas regulator installation",
              "Commercial gas systems"
            ]
          }
        ]
      },
      {
        name: "Carpentry",
        categories: [
          {
            name: "Structural Work",
            activities: [
              "Wall framing",
              "Roof framing",
              "Floor framing",
              "Beam installation",
              "Stud wall construction",
              "Truss installation",
              "Structural bracing",
              "Load bearing modifications",
              "Foundation formwork",
              "Structural repairs"
            ]
          },
          {
            name: "Finishing Work",
            activities: [
              "Door installation",
              "Window installation",
              "Skirting board installation",
              "Architrave installation",
              "Built-in cupboard construction",
              "Staircase construction",
              "Deck construction",
              "Pergola construction",
              "Kitchen cabinet installation",
              "Bathroom vanity installation"
            ]
          }
        ]
      },
      {
        name: "Roofing",
        categories: [
          {
            name: "Roof Installation",
            activities: [
              "Tile roof installation",
              "Metal roof installation",
              "Slate roof installation",
              "Membrane roofing",
              "Shingle installation",
              "Roof sheeting installation",
              "Insulation installation",
              "Roof ventilation installation",
              "Solar panel mounting",
              "Skylight installation"
            ]
          },
          {
            name: "Roof Maintenance",
            activities: [
              "Roof cleaning",
              "Gutter cleaning",
              "Roof repair",
              "Tile replacement",
              "Leak repair",
              "Flashing repair",
              "Gutter repair",
              "Downpipe repair",
              "Ridge capping repair",
              "Roof painting"
            ]
          }
        ]
      },
      {
        name: "Demolition",
        categories: [
          {
            name: "Structural Demolition",
            activities: [
              "Building demolition",
              "Wall removal",
              "Roof demolition",
              "Floor removal",
              "Concrete breaking",
              "Brick wall demolition",
              "Steel structure demolition",
              "Foundation removal",
              "Partial demolition",
              "Strip out work"
            ]
          },
          {
            name: "Hazardous Material Removal",
            activities: [
              "Asbestos removal",
              "Lead paint removal",
              "Contaminated soil removal",
              "Chemical storage removal",
              "Underground tank removal",
              "PCB removal",
              "Mould remediation"
            ]
          }
        ]
      },
      {
        name: "Concrete Work",
        categories: [
          {
            name: "Concrete Placement",
            activities: [
              "Concrete pouring",
              "Slab construction",
              "Foundation pouring",
              "Footpath construction",
              "Driveway construction",
              "Retaining wall construction",
              "Precast concrete installation",
              "Concrete pumping",
              "Concrete finishing",
              "Curing procedures"
            ]
          },
          {
            name: "Reinforcement Work",
            activities: [
              "Rebar installation",
              "Mesh reinforcement",
              "Post-tensioning",
              "Structural steel placement",
              "Anchor bolt installation",
              "Dowel bar installation"
            ]
          }
        ]
      },
      {
        name: "Steelwork",
        categories: [
          {
            name: "Structural Steel",
            activities: [
              "Steel frame erection",
              "Beam installation",
              "Column installation",
              "Truss installation",
              "Welding operations",
              "Bolting operations",
              "Steel fabrication",
              "Crane operations",
              "Rigging operations",
              "Fall protection installation"
            ]
          }
        ]
      },
      {
        name: "Painting",
        categories: [
          {
            name: "Interior Painting",
            activities: [
              "Wall painting",
              "Ceiling painting",
              "Door painting",
              "Window frame painting",
              "Trim painting",
              "Cabinet painting",
              "Wallpaper installation",
              "Texture application"
            ]
          },
          {
            name: "Exterior Painting",
            activities: [
              "House exterior painting",
              "Roof painting",
              "Fence painting",
              "Deck staining",
              "Metal surface painting",
              "Render painting",
              "Line marking",
              "Graffiti removal"
            ]
          }
        ]
      }
    ];

      res.json(trades);
    }
  });

  // Get safety library
  app.get("/api/safety-library", async (req, res) => {
    try {
      const items = await storage.getSafetyLibraryItems();
      res.json(items);
    } catch (error: any) {
      console.error('Safety library error:', error);
      res.status(500).json({ message: 'Failed to fetch safety library' });
    }
  });

  // Search safety library
  app.get("/api/safety-library/search", async (req, res) => {
    try {
      const { q: query, category } = req.query;
      const items = await storage.searchSafetyLibrary(
        query as string, 
        category as string
      );
      res.json(items);
    } catch (error: any) {
      console.error('Safety library search error:', error);
      res.status(500).json({ message: 'Failed to search safety library' });
    }
  });

  // SWMS management routes
  app.get("/api/swms", async (req, res) => {
    try {
      const documents = await storage.getSwmsDocumentsByUser(1); // Default user for now
      res.json(documents);
    } catch (error: any) {
      console.error('Get SWMS error:', error);
      res.status(500).json({ message: 'Failed to fetch SWMS documents' });
    }
  });

  app.get("/api/swms/:id", async (req, res) => {
    try {
      const document = await storage.getSwmsDocument(parseInt(req.params.id));
      if (!document) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      res.json(document);
    } catch (error: any) {
      console.error('Get SWMS by ID error:', error);
      res.status(500).json({ message: 'Failed to fetch SWMS document' });
    }
  });

  app.post("/api/swms", async (req, res) => {
    try {
      const swmsData = insertSwmsSchema.parse({
        ...req.body,
        userId: 1, // Default user for now
        status: req.body.status || 'draft',
        aiEnhanced: req.body.aiEnhanced || false
      });

      const document = await storage.createSwmsDocument(swmsData);
      res.status(201).json(document);
    } catch (error: any) {
      console.error('Create SWMS error:', error);
      res.status(500).json({ message: 'Failed to create SWMS document' });
    }
  });

  app.patch("/api/swms/:id", async (req, res) => {
    try {
      const updates = req.body;
      const document = await storage.updateSwmsDocument(parseInt(req.params.id), updates);
      if (!document) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      res.json(document);
    } catch (error: any) {
      console.error('Update SWMS error:', error);
      res.status(500).json({ message: 'Failed to update SWMS document' });
    }
  });

  app.delete("/api/swms/:id", async (req, res) => {
    try {
      const success = await storage.deleteSwmsDocument(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete SWMS error:', error);
      res.status(500).json({ message: 'Failed to delete SWMS document' });
    }
  });

  // AI enhancement routes
  app.post("/api/ai/enhance-swms", async (req, res) => {
    try {
      const { activities, tradeType, projectLocation } = req.body;
      const enhancement = await enhanceSwmsWithAI(activities, tradeType, projectLocation);
      res.json(enhancement);
    } catch (error: any) {
      console.error('AI enhance SWMS error:', error);
      res.status(500).json({ message: 'Failed to enhance SWMS with AI' });
    }
  });

  app.post("/api/ai/safety-content", async (req, res) => {
    try {
      const { query, context } = req.body;
      const content = await generateSafetyContent(query, context);
      
      // Save AI interaction
      await storage.createAiInteraction({
        userId: 1, // Default user for now
        query,
        response: content,
        swmsId: context?.swmsId || null
      });

      res.json({ content });
    } catch (error: any) {
      console.error('AI safety content error:', error);
      res.status(500).json({ message: 'Failed to generate safety content' });
    }
  });

  // My SWMS Documents
  app.get("/api/swms/my-documents", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const documents = await storage.getSwmsDocumentsByUser(userId);
      res.json(documents || []);
    } catch (error: any) {
      console.error("Get user documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Analytics Data
  app.get("/api/analytics", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const documents = await storage.getSwmsDocumentsByUser(userId);
      
      const totalDocuments = documents.length;
      const activeDocuments = documents.filter(doc => doc.status === 'active').length;
      
      const avgCompliance = documents.length > 0 
        ? Math.round(documents.reduce((acc, doc) => acc + 85, 0) / documents.length)
        : 85;

      const documentsByTrade = documents.reduce((acc: any[], doc) => {
        const existing = acc.find(item => item.trade === doc.tradeType);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ trade: doc.tradeType, count: 1 });
        }
        return acc;
      }, []);

      const riskLevels = [
        { level: "Low", count: Math.floor(totalDocuments * 0.4), color: "#10b981" },
        { level: "Medium", count: Math.floor(totalDocuments * 0.4), color: "#f59e0b" },
        { level: "High", count: Math.floor(totalDocuments * 0.15), color: "#ef4444" },
        { level: "Extreme", count: Math.floor(totalDocuments * 0.05), color: "#8b5cf6" }
      ].filter(level => level.count > 0);

      const recentActivity = documents
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((doc, index) => ({
          id: index + 1,
          eventType: 'created',
          documentTitle: doc.title,
          timestamp: doc.createdAt
        }));

      const complianceScores = [
        { month: "Jan", score: 78 },
        { month: "Feb", score: 82 },
        { month: "Mar", score: 85 },
        { month: "Apr", score: 88 },
        { month: "May", score: avgCompliance }
      ];

      const topRisks = [
        { risk: "Working at Height", frequency: Math.max(1, Math.floor(totalDocuments * 0.6)) },
        { risk: "Electrical Hazards", frequency: Math.max(1, Math.floor(totalDocuments * 0.4)) },
        { risk: "Manual Handling", frequency: Math.max(1, Math.floor(totalDocuments * 0.8)) },
        { risk: "Chemical Exposure", frequency: Math.max(1, Math.floor(totalDocuments * 0.3)) },
        { risk: "Equipment Operation", frequency: Math.max(1, Math.floor(totalDocuments * 0.5)) }
      ].sort((a, b) => b.frequency - a.frequency).slice(0, 5);

      res.json({
        totalDocuments,
        activeDocuments,
        averageComplianceScore: avgCompliance,
        documentsByTrade,
        complianceScores,
        riskLevels,
        recentActivity,
        topRisks
      });
    } catch (error: any) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Task search API for comprehensive database
  app.get("/api/tasks/search", async (req, res) => {
    try {
      const { q: searchTerm, trade, category, complexity, riskLevel } = req.query;
      const { searchAllTasks } = await import('./enhanced-trades-api');
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ error: "Search term is required" });
      }
      
      const results = searchAllTasks(searchTerm, trade as string);
      
      // Apply additional filters
      let filteredResults = results;
      
      if (category && category !== "all") {
        filteredResults = filteredResults.filter(task => 
          task.category.toLowerCase() === (category as string).toLowerCase()
        );
      }
      
      if (complexity && complexity !== "all") {
        filteredResults = filteredResults.filter(task => 
          task.complexity === complexity
        );
      }
      
      if (riskLevel && riskLevel !== "all") {
        const minRisk = parseInt(riskLevel as string);
        filteredResults = filteredResults.filter(task => 
          task.riskScore >= minRisk
        );
      }
      
      res.json({
        results: filteredResults.slice(0, 100), // Limit to 100 results for performance
        total: filteredResults.length,
        searchTerm
      });
    } catch (error: any) {
      console.error('Task search error:', error);
      res.status(500).json({ error: "Failed to search tasks" });
    }
  });

  // Get task details
  app.get("/api/tasks/:activity", async (req, res) => {
    try {
      const { getTaskDetails } = await import('./enhanced-trades-api');
      const taskDetails = getTaskDetails(decodeURIComponent(req.params.activity));
      
      if (!taskDetails) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(taskDetails);
    } catch (error: any) {
      console.error('Task details error:', error);
      res.status(500).json({ error: "Failed to get task details" });
    }
  });

  // Get frequently used tasks
  app.get("/api/tasks/frequent", async (req, res) => {
    try {
      const { getFrequentlyUsedTasks } = await import('./enhanced-trades-api');
      const frequentTasks = getFrequentlyUsedTasks();
      res.json(frequentTasks);
    } catch (error: any) {
      console.error('Frequent tasks error:', error);
      res.status(500).json({ error: "Failed to get frequent tasks" });
    }
  });

  // Enhanced trades API with comprehensive tasks
  app.get("/api/trades/enhanced", async (req, res) => {
    try {
      const { generateEnhancedTradesData } = await import('./enhanced-trades-api');
      const enhancedTrades = generateEnhancedTradesData();
      res.json(enhancedTrades);
    } catch (error: any) {
      console.error('Enhanced trades error:', error);
      res.status(500).json({ error: "Failed to get enhanced trades data" });
    }
  });

  const server = createServer(app);
  return server;
}
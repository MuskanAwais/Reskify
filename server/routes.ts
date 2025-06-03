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
      
      // Get pre-built risk assessments and safety measures for selected activities
      const autoSwms = await generateAutoSwms(activities, tradeType);
      
      res.json({
        title: title || `SWMS - ${tradeType} Work`,
        projectLocation,
        tradeType,
        activities,
        riskAssessments: autoSwms.risks,
        safetyMeasures: autoSwms.safetyMeasures,
        complianceCodes: autoSwms.complianceCodes,
        aiEnhanced: false,
        status: 'draft'
      });
    } catch (error: any) {
      console.error('Auto-generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to auto-generate SWMS' });
    }
  });

  // Trade types and comprehensive activities
  app.get("/api/trades", async (req, res) => {
    const trades = [
      {
        name: "Electrical",
        categories: [
          {
            name: "Installation Work",
            activities: [
              "Power outlet installation",
              "Light fixture installation", 
              "Switchboard installation",
              "Cable tray installation",
              "Conduit installation",
              "Earthing system installation",
              "Motor control installation",
              "Distribution board installation",
              "Emergency lighting installation",
              "Exit sign installation",
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

  const server = createServer(app);
  return server;
}
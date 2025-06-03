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
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // SWMS document routes
  app.get("/api/swms", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const documents = await storage.getSwmsDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/swms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getSwmsDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/swms", async (req, res) => {
    try {
      const swmsData = insertSwmsSchema.parse(req.body);
      const document = await storage.createSwmsDocument(swmsData);
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/swms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertSwmsSchema.partial().parse(req.body);
      
      const document = await storage.updateSwmsDocument(id, updates);
      if (!document) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/swms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSwmsDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "SWMS document not found" });
      }
      
      res.json({ message: "SWMS document deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI enhancement routes
  app.post("/api/ai/enhance-swms", async (req, res) => {
    try {
      const { swmsId, tradeType, activities, projectDetails } = req.body;
      
      if (!tradeType || !activities || !Array.isArray(activities)) {
        return res.status(400).json({ message: "Trade type and activities are required" });
      }
      
      const enhancement = await enhanceSwmsWithAI(tradeType, activities, projectDetails);
      res.json(enhancement);
    } catch (error) {
      res.status(500).json({ message: `AI enhancement failed: ${error.message}` });
    }
  });

  app.post("/api/ai/safety-content", async (req, res) => {
    try {
      const { query, tradeType, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const content = await generateSafetyContent(query, tradeType, context);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: `AI content generation failed: ${error.message}` });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const interactionData = insertAiInteractionSchema.parse(req.body);
      
      // Generate AI response
      const aiResponse = await generateSafetyContent(
        interactionData.query,
        undefined,
        "SWMS building assistant"
      );
      
      // Save interaction with response
      const interaction = await storage.createAiInteraction({
        ...interactionData,
        response: aiResponse
      });
      
      res.json(interaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Safety library routes
  app.get("/api/safety-library", async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchSafetyLibrary(search as string, category as string);
      } else {
        items = await storage.getSafetyLibraryItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/safety-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getSafetyLibraryItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Safety library item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics and dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const documents = await storage.getSwmsDocumentsByUser(userId);
      const aiInteractions = await storage.getAiInteractionsByUser(userId);
      
      const stats = {
        activeSwms: documents.filter(doc => doc.status === "approved").length,
        totalSwms: documents.length,
        complianceScore: documents.length > 0 ? Math.round((documents.filter(doc => doc.status === "approved").length / documents.length) * 100) : 0,
        templatesUsed: new Set(documents.map(doc => doc.tradeType)).size,
        aiSuggestions: aiInteractions.length,
        recentDocuments: documents.slice(0, 5)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
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
    } catch (error) {
      console.error('Auto-generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to auto-generate SWMS' });
    }
  });

  // Trade types and activities with comprehensive database
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
          },
          {
            name: "External Work",
            activities: [
              "Fence construction",
              "Gazebo construction",
              "Carport construction",
              "Shed construction",
              "Retaining wall construction",
              "Outdoor furniture construction",
              "Garden bed construction"
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
          },
          {
            name: "Metal Fabrication",
            activities: [
              "Custom metalwork",
              "Handrail installation",
              "Staircase fabrication",
              "Platform construction",
              "Balustrade installation",
              "Security grille installation"
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
      },
      {
        name: "Landscaping",
        categories: [
          {
            name: "Garden Construction",
            activities: [
              "Garden bed preparation",
              "Retaining wall construction",
              "Pathway construction",
              "Patio construction",
              "Water feature installation",
              "Irrigation system installation",
              "Drainage installation",
              "Soil preparation",
              "Mulching",
              "Plant installation"
            ]
          },
          {
            name: "Hardscaping",
            activities: [
              "Paver installation",
              "Stone work",
              "Concrete work",
              "Timber structures",
              "Fencing installation",
              "Gate installation",
              "Outdoor lighting"
            ]
          }
        ]
      },
      {
        name: "Bricklaying",
        categories: [
          {
            name: "Masonry Work",
            activities: [
              "Brick wall construction",
              "Block wall construction",
              "Stone wall construction",
              "Chimney construction",
              "Fireplace construction",
              "Arch construction",
              "Retaining wall construction",
              "Pointing and repointing",
              "Brick repair",
              "Heritage restoration"
            ]
          }
        ]
      },
      {
        name: "Tiling",
        categories: [
          {
            name: "Interior Tiling",
            activities: [
              "Floor tiling",
              "Wall tiling",
              "Bathroom tiling",
              "Kitchen tiling",
              "Shower installation",
              "Mosaic installation",
              "Tile repair",
              "Grout repair",
              "Waterproofing",
              "Substrate preparation"
            ]
          },
          {
            name: "External Tiling",
            activities: [
              "Pool tiling",
              "External wall tiling",
              "Balcony tiling",
              "Courtyard tiling",
              "Steps tiling"
            ]
          }
        ]
      },
      {
        name: "HVAC",
        categories: [
          {
            name: "Air Conditioning",
            activities: [
              "Split system installation",
              "Ducted system installation",
              "Commercial HVAC installation",
              "Refrigeration installation",
              "Heat pump installation",
              "Ventilation system installation",
              "Ductwork installation",
              "Maintenance and servicing",
              "Gas heating installation",
              "Evaporative cooling installation"
            ]
          }
        ]
      },
      {
        name: "Glazing",
        categories: [
          {
            name: "Window Installation",
            activities: [
              "Window installation",
              "Door installation",
              "Shopfront installation",
              "Curtain wall installation",
              "Skylight installation",
              "Glass balustrade installation",
              "Mirror installation",
              "Glass repair",
              "Glazing compound application",
              "Sealed unit replacement"
            ]
          }
        ]
      },
      {
        name: "Flooring",
        categories: [
          {
            name: "Hard Flooring",
            activities: [
              "Timber flooring installation",
              "Laminate flooring installation",
              "Vinyl flooring installation",
              "Polished concrete",
              "Epoxy flooring",
              "Floor sanding",
              "Floor polishing",
              "Subfloor preparation"
            ]
          },
          {
            name: "Soft Flooring",
            activities: [
              "Carpet installation",
              "Carpet repair",
              "Underlay installation",
              "Rug installation"
            ]
          }
        ]
      },
      {
        name: "Insulation",
        categories: [
          {
            name: "Thermal Insulation",
            activities: [
              "Bulk insulation installation",
              "Reflective insulation installation",
              "Wall insulation",
              "Roof insulation",
              "Floor insulation",
              "Acoustic insulation",
              "Pipe insulation",
              "Duct insulation"
            ]
          }
        ]
      },
      {
        name: "Security Systems",
        categories: [
          {
            name: "Electronic Security",
            activities: [
              "Alarm system installation",
              "CCTV installation",
              "Access control installation",
              "Intercom installation",
              "Motion detector installation",
              "Security lighting installation",
              "Gate automation",
              "Monitoring system setup"
            ]
          }
        ]
      },
      {
        name: "Earthworks",
        categories: [
          {
            name: "Excavation",
            activities: [
              "Site excavation",
              "Trenching",
              "Foundation excavation",
              "Bulk earthworks",
              "Cut and fill",
              "Drainage excavation",
              "Utility trenching",
              "Site preparation",
              "Compaction",
              "Backfilling"
            ]
          }
        ]
      },
      {
        name: "Fire Protection",
        categories: [
          {
            name: "Fire Systems",
            activities: [
              "Sprinkler system installation",
              "Fire alarm installation",
              "Emergency lighting installation",
              "Exit sign installation",
              "Fire extinguisher installation",
              "Smoke detector installation",
              "Fire door installation",
              "Hydrant installation",
              "Fire pump installation",
              "System testing and commissioning"
            ]
          }
        ]
      },
      {
        name: "Scaffolding",
        categories: [
          {
            name: "Access Systems",
            activities: [
              "Scaffolding erection",
              "Scaffolding dismantling",
              "Mobile scaffold setup",
              "Suspended scaffold installation",
              "Formwork scaffolding",
              "Inspection and tagging",
              "Edge protection installation",
              "Temporary stairs installation"
            ]
          }
        ]
      },
      {
        name: "Communications",
        categories: [
          {
            name: "Data & Communications",
            activities: [
              "Data cabling installation",
              "Phone system installation",
              "Fibre optic installation",
              "Network equipment installation",
              "Antenna installation",
              "Satellite dish installation",
              "Audio visual installation",
              "Public address system installation"
            ]
          }
        ]
      },
      {
        name: "Pool Construction",
        categories: [
          {
            name: "Pool Installation",
            activities: [
              "Pool excavation",
              "Pool shell construction",
              "Pool equipment installation",
              "Pool plumbing",
              "Pool electrical work",
              "Pool tiling",
              "Pool fencing",
              "Pool heating installation",
              "Water feature installation",
              "Pool maintenance setup"
            ]
          }
        ]
      },
      {
        name: "Solar & Renewable",
        categories: [
          {
            name: "Solar Systems",
            activities: [
              "Solar panel installation",
              "Solar inverter installation",
              "Battery storage installation",
              "Solar hot water installation",
              "Grid connection",
              "Monitoring system setup",
              "Electrical upgrades",
              "System commissioning"
            ]
          }
        ]
      }
    ];

    res.json(trades);
  });

  // Get comprehensive safety library
  app.get("/api/safety-library", async (req, res) => {
    try {
      const items = await storage.getSafetyLibraryItems();
      res.json(items);
    } catch (error) {
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
    } catch (error) {
      console.error('Safety library search error:', error);
      res.status(500).json({ message: 'Failed to search safety library' });
    }
  });

  // SWMS management routes
  app.get("/api/swms", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const documents = await storage.getSwmsDocumentsByUser(req.user.id);
      res.json(documents);
    } catch (error) {
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
    } catch (error) {
      console.error('Get SWMS by ID error:', error);
      res.status(500).json({ message: 'Failed to fetch SWMS document' });
    }
  });

  app.post("/api/swms", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const swmsData = insertSwmsSchema.parse({
        ...req.body,
        userId: req.user.id,
        status: req.body.status || 'draft',
        aiEnhanced: req.body.aiEnhanced || false
      });

      const document = await storage.createSwmsDocument(swmsData);
      res.status(201).json(document);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error('AI enhance SWMS error:', error);
      res.status(500).json({ message: 'Failed to enhance SWMS with AI' });
    }
  });

  app.post("/api/ai/safety-content", async (req, res) => {
    try {
      const { query, context } = req.body;
      const content = await generateSafetyContent(query, context);
      
      // Save AI interaction if user is authenticated
      if (req.user) {
        await storage.createAiInteraction({
          userId: req.user.id,
          query,
          response: content,
          swmsId: context?.swmsId || null
        });
      }

      res.json({ content });
    } catch (error) {
      console.error('AI safety content error:', error);
      res.status(500).json({ message: 'Failed to generate safety content' });
    }
  });

  const server = createServer(app);
  return server;
}
      },
      {
        name: "Plumbing",
        categories: [
          {
            name: "Water Systems",
            activities: [
              "Hot water system installation",
              "Cold water pipe installation",
              "Water meter connection",
              "Pressure testing",
              "Backflow prevention",
              "Water filtration systems"
            ]
          },
          {
            name: "Drainage & Sewerage",
            activities: [
              "Stormwater drainage",
              "Sewer line installation", 
              "Grease trap installation",
              "Septic system work",
              "Drain cleaning",
              "CCTV drain inspection"
            ]
          },
          {
            name: "Gas Fitting",
            activities: [
              "Gas pipe installation",
              "Gas appliance connection",
              "Gas leak testing",
              "Meter installation",
              "Regulator installation",
              "Emergency gas repairs"
            ]
          },
          {
            name: "Fixtures & Fittings",
            activities: [
              "Toilet installation",
              "Basin and sink installation",
              "Shower installation",
              "Tap installation",
              "Bath installation",
              "Disabled access fixtures"
            ]
          }
        ],
        codes: ["AS/NZS 3500:2021", "AS 2885:2007"]
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
              "Stud wall construction",
              "Beam installation",
              "Structural repairs"
            ]
          },
          {
            name: "Formwork",
            activities: [
              "Concrete formwork",
              "Stair formwork",
              "Column formwork",
              "Slab formwork", 
              "Curved formwork",
              "Formwork stripping"
            ]
          },
          {
            name: "Finishing Work",
            activities: [
              "Door hanging",
              "Window installation",
              "Skirting installation",
              "Architrave installation",
              "Built-in cupboards",
              "Staircase construction"
            ]
          },
          {
            name: "External Work",
            activities: [
              "Deck construction",
              "Pergola construction",
              "Fencing",
              "External cladding",
              "Weatherboard installation",
              "Fascia and soffit"
            ]
          }
        ],
        codes: ["AS 1684:2010", "AS/NZS 1170:2002"]
      },
      {
        name: "Roofing",
        categories: [
          {
            name: "Roof Installation",
            activities: [
              "Tile roof installation",
              "Metal roof installation",
              "Membrane roofing",
              "Slate roof installation",
              "Shingle installation",
              "Green roof systems"
            ]
          },
          {
            name: "Roof Components",
            activities: [
              "Gutter installation",
              "Downpipe installation",
              "Ridge capping",
              "Flashing installation",
              "Roof ventilation",
              "Solar panel mounting"
            ]
          },
          {
            name: "Roof Repairs",
            activities: [
              "Leak repairs",
              "Tile replacement",
              "Gutter repairs",
              "Storm damage repairs",
              "Roof cleaning",
              "Preventive maintenance"
            ]
          },
          {
            name: "Specialized Work",
            activities: [
              "Skylight installation",
              "Chimney work",
              "Roof access systems",
              "Safety rail installation",
              "Roof anchors",
              "Fall protection systems"
            ]
          }
        ],
        codes: ["AS/NZS 1891.1:2007", "AS 1562:2018"]
      },
      {
        name: "Demolition",
        categories: [
          {
            name: "Structural Demolition",
            activities: [
              "Building demolition",
              "Wall removal",
              "Floor slab removal",
              "Foundation removal",
              "Chimney demolition",
              "Structural steel removal"
            ]
          },
          {
            name: "Selective Demolition",
            activities: [
              "Interior strip-out",
              "Ceiling removal",
              "Partition removal",
              "Kitchen removal",
              "Bathroom removal",
              "Flooring removal"
            ]
          },
          {
            name: "Hazardous Materials",
            activities: [
              "Asbestos removal",
              "Lead paint removal",
              "Contaminated soil removal",
              "Chemical tank removal",
              "Underground storage removal",
              "Mold remediation"
            ]
          },
          {
            name: "Site Works",
            activities: [
              "Site clearance",
              "Excavation",
              "Debris removal",
              "Waste sorting",
              "Site remediation",
              "Landscaping preparation"
            ]
          }
        ],
        codes: ["AS 2601:2001", "AS/NZS 1892.1:2013"]
      },
      {
        name: "Concrete Work",
        categories: [
          {
            name: "Concrete Placement",
            activities: [
              "Foundation pours",
              "Slab pours",
              "Column pours",
              "Beam pours",
              "Wall pours",
              "Stair pours"
            ]
          },
          {
            name: "Reinforcement",
            activities: [
              "Rebar placement",
              "Mesh installation",
              "Post-tensioning",
              "Fiber reinforcement",
              "Steel fixing",
              "Reinforcement inspection"
            ]
          },
          {
            name: "Finishing",
            activities: [
              "Surface finishing",
              "Float finishing",
              "Power trowel finishing",
              "Exposed aggregate",
              "Stamped concrete",
              "Polished concrete"
            ]
          },
          {
            name: "Specialized Work",
            activities: [
              "Precast installation",
              "Shotcrete application",
              "Core drilling",
              "Concrete cutting",
              "Crack injection",
              "Concrete repairs"
            ]
          }
        ],
        codes: ["AS 3600:2018", "AS 1379:2007"]
      },
      {
        name: "Steelwork",
        categories: [
          {
            name: "Structural Steel",
            activities: [
              "Steel beam installation",
              "Column erection",
              "Welding operations",
              "Bolting connections",
              "Steel frame assembly",
              "Crane operations"
            ]
          },
          {
            name: "Fabrication",
            activities: [
              "Steel cutting",
              "Steel bending",
              "Shop welding",
              "Surface preparation",
              "Quality inspection",
              "Material handling"
            ]
          },
          {
            name: "Installation",
            activities: [
              "Site welding",
              "Alignment checking",
              "Temporary supports",
              "Safety netting",
              "Fall protection setup",
              "Load testing"
            ]
          }
        ],
        codes: ["AS 4100:2020", "AS/NZS 1554:2014"]
      },
      {
        name: "Painting",
        categories: [
          {
            name: "Surface Preparation",
            activities: [
              "Pressure washing",
              "Sandblasting",
              "Scraping and sanding",
              "Chemical stripping",
              "Primer application",
              "Surface inspection"
            ]
          },
          {
            name: "Paint Application",
            activities: [
              "Spray painting",
              "Brush application",
              "Roller application",
              "Protective coating",
              "Line marking",
              "Touch-up work"
            ]
          },
          {
            name: "Specialized Coatings",
            activities: [
              "Anti-corrosion coating",
              "Fire retardant coating",
              "Epoxy floor coating",
              "Waterproof membrane",
              "Industrial coating",
              "Lead paint removal"
            ]
          }
        ],
        codes: ["AS/NZS 2311:2009", "AS 4548:2014"]
      },
      {
        name: "Landscaping",
        categories: [
          {
            name: "Site Preparation",
            activities: [
              "Site clearing",
              "Soil preparation",
              "Excavation work",
              "Drainage installation",
              "Irrigation setup",
              "Level surveying"
            ]
          },
          {
            name: "Planting",
            activities: [
              "Tree planting",
              "Shrub installation",
              "Lawn installation",
              "Garden bed preparation",
              "Mulching",
              "Plant maintenance"
            ]
          },
          {
            name: "Hardscaping",
            activities: [
              "Paving installation",
              "Retaining wall construction",
              "Pathway construction",
              "Garden edging",
              "Water feature installation",
              "Outdoor lighting"
            ]
          }
        ],
        codes: ["AS 4970:2009", "AS/NZS 3500.1:2021"]
      },
      {
        name: "Bricklaying",
        categories: [
          {
            name: "Foundation Work",
            activities: [
              "Foundation wall construction",
              "Footing brickwork",
              "Damp course installation",
              "Mortar preparation",
              "Level checking",
              "Reinforcement placement"
            ]
          },
          {
            name: "Wall Construction",
            activities: [
              "External wall construction",
              "Internal wall construction",
              "Cavity wall construction",
              "Veneer brickwork",
              "Feature wall construction",
              "Arch construction"
            ]
          },
          {
            name: "Specialized Work",
            activities: [
              "Chimney construction",
              "Garden wall construction",
              "Retaining wall construction",
              "Repair and restoration",
              "Pointing and repointing",
              "Heritage brickwork"
            ]
          }
        ],
        codes: ["AS 3700:2018", "AS/NZS 4455:2018"]
      },
      {
        name: "Tiling",
        categories: [
          {
            name: "Floor Tiling",
            activities: [
              "Ceramic floor tiling",
              "Porcelain floor tiling",
              "Natural stone tiling",
              "Vinyl floor installation",
              "Substrate preparation",
              "Underfloor heating installation"
            ]
          },
          {
            name: "Wall Tiling",
            activities: [
              "Bathroom wall tiling",
              "Kitchen backsplash",
              "Shower recess tiling",
              "External wall tiling",
              "Mosaic installation",
              "Feature wall tiling"
            ]
          },
          {
            name: "Waterproofing",
            activities: [
              "Wet area waterproofing",
              "Membrane installation",
              "Sealant application",
              "Drainage installation",
              "Leak testing",
              "Compliance certification"
            ]
          }
        ],
        codes: ["AS 3958.1:2007", "AS/NZS 3740:2021"]
      },
      {
        name: "HVAC",
        categories: [
          {
            name: "Installation",
            activities: [
              "Ductwork installation",
              "Air conditioning installation",
              "Heating system installation",
              "Ventilation system installation",
              "Refrigeration installation",
              "Control system installation"
            ]
          },
          {
            name: "Maintenance",
            activities: [
              "System commissioning",
              "Filter replacement",
              "Refrigerant handling",
              "Leak detection",
              "Performance testing",
              "Preventive maintenance"
            ]
          },
          {
            name: "Specialized Systems",
            activities: [
              "Clean room systems",
              "Industrial HVAC",
              "Commercial kitchen ventilation",
              "Smoke extraction systems",
              "Energy recovery systems",
              "BMS integration"
            ]
          }
        ],
        codes: ["AS 1668.2:2012", "AS/NZS 3000:2018"]
      },
      {
        name: "Glazing",
        categories: [
          {
            name: "Window Installation",
            activities: [
              "Aluminum window installation",
              "Timber window installation",
              "UPVC window installation",
              "Commercial glazing",
              "Curtain wall installation",
              "Window replacement"
            ]
          },
          {
            name: "Glass Installation",
            activities: [
              "Safety glass installation",
              "Laminated glass installation",
              "Tempered glass installation",
              "Insulated glass units",
              "Structural glazing",
              "Glass balustrades"
            ]
          },
          {
            name: "Specialized Work",
            activities: [
              "Shopfront glazing",
              "High-rise glazing",
              "Skylight installation",
              "Glass repair",
              "Thermal improvement",
              "Security glazing"
            ]
          }
        ],
        codes: ["AS 1288:2021", "AS 2047:2014"]
      },
      {
        name: "Flooring",
        categories: [
          {
            name: "Timber Flooring",
            activities: [
              "Hardwood floor installation",
              "Engineered floor installation",
              "Laminate floor installation",
              "Floor sanding",
              "Floor polishing",
              "Floor repairs"
            ]
          },
          {
            name: "Carpet & Soft Flooring",
            activities: [
              "Carpet installation",
              "Vinyl installation",
              "Linoleum installation",
              "Rubber flooring",
              "Underlay installation",
              "Floor preparation"
            ]
          },
          {
            name: "Specialized Flooring",
            activities: [
              "Epoxy floor coatings",
              "Industrial flooring",
              "Sports flooring",
              "Raised access flooring",
              "Anti-static flooring",
              "Heated floor systems"
            ]
          }
        ],
        codes: ["AS/NZS 1080:2012", "AS 1884:2012"]
      },
      {
        name: "Insulation",
        categories: [
          {
            name: "Thermal Insulation",
            activities: [
              "Bulk insulation installation",
              "Reflective insulation installation",
              "Ceiling insulation",
              "Wall insulation",
              "Floor insulation",
              "Roof insulation"
            ]
          },
          {
            name: "Acoustic Insulation",
            activities: [
              "Sound insulation installation",
              "Vibration isolation",
              "Acoustic wall treatment",
              "Ceiling sound treatment",
              "Floor impact insulation",
              "HVAC acoustic treatment"
            ]
          },
          {
            name: "Specialized Insulation",
            activities: [
              "Fire-rated insulation",
              "Industrial insulation",
              "Pipe insulation",
              "Duct insulation",
              "Cold storage insulation",
              "Marine insulation"
            ]
          }
        ],
        codes: ["AS/NZS 4859.1:2018", "AS 3999:2015"]
      },
      {
        name: "Security Systems",
        categories: [
          {
            name: "Access Control",
            activities: [
              "Card access installation",
              "Biometric system installation",
              "Intercom system installation",
              "Gate automation",
              "Barrier installation",
              "Access software setup"
            ]
          },
          {
            name: "CCTV & Surveillance",
            activities: [
              "CCTV camera installation",
              "DVR/NVR installation",
              "Video analytics setup",
              "Remote monitoring setup",
              "Cable installation",
              "System integration"
            ]
          },
          {
            name: "Alarm Systems",
            activities: [
              "Burglar alarm installation",
              "Fire alarm installation",
              "Monitoring system setup",
              "Sensor installation",
              "Control panel installation",
              "Emergency systems"
            ]
          }
        ],
        codes: ["AS 2201.1:2007", "AS 1670.1:2018"]
      },
      {
        name: "Earthworks",
        categories: [
          {
            name: "Excavation",
            activities: [
              "Site excavation",
              "Foundation excavation",
              "Trench excavation",
              "Bulk earthworks",
              "Rock excavation",
              "Underground service excavation"
            ]
          },
          {
            name: "Civil Works",
            activities: [
              "Road construction",
              "Drainage installation",
              "Culvert installation",
              "Retaining wall construction",
              "Kerb and gutter",
              "Pavement construction"
            ]
          },
          {
            name: "Site Services",
            activities: [
              "Sewer installation",
              "Water main installation",
              "Gas main installation",
              "Electrical conduit installation",
              "Telecommunications installation",
              "Storm water systems"
            ]
          }
        ],
        codes: ["AS 3798:2007", "AS/NZS 2566.1:2019"]
      },
      {
        name: "Fire Protection",
        categories: [
          {
            name: "Sprinkler Systems",
            activities: [
              "Sprinkler head installation",
              "Pipe installation",
              "Pump installation",
              "Control valve installation",
              "System testing",
              "Commissioning"
            ]
          },
          {
            name: "Detection Systems",
            activities: [
              "Smoke detector installation",
              "Heat detector installation",
              "Manual call point installation",
              "Control panel installation",
              "Sounder installation",
              "System programming"
            ]
          },
          {
            name: "Passive Fire Protection",
            activities: [
              "Fire damper installation",
              "Fire door installation",
              "Penetration sealing",
              "Fire barrier construction",
              "Emergency lighting",
              "Exit sign installation"
            ]
          }
        ],
        codes: ["AS 2118.1:2017", "AS 1851:2012"]
      },
      {
        name: "Scaffolding",
        categories: [
          {
            name: "Standard Scaffolding",
            activities: [
              "Tube and coupler scaffolding",
              "System scaffolding",
              "Mobile scaffolding",
              "Suspended scaffolding",
              "Mast climbing platforms",
              "Scaffold inspection"
            ]
          },
          {
            name: "Specialized Access",
            activities: [
              "Chimney scaffolding",
              "Bridge scaffolding",
              "Stairway scaffolding",
              "Cantilever scaffolding",
              "Birdcage scaffolding",
              "Loading platforms"
            ]
          },
          {
            name: "Safety Systems",
            activities: [
              "Fall protection systems",
              "Edge protection",
              "Safety netting",
              "Temporary roofing",
              "Weather protection",
              "Access control"
            ]
          }
        ],
        codes: ["AS/NZS 4576:1995", "AS/NZS 1891.4:2009"]
      },
      {
        name: "Communications",
        categories: [
          {
            name: "Data & Voice",
            activities: [
              "Structured cabling",
              "Fiber optic installation",
              "Network equipment installation",
              "Telephone system installation",
              "PBX installation",
              "Cable testing"
            ]
          },
          {
            name: "Audio Visual",
            activities: [
              "Sound system installation",
              "Video system installation",
              "Digital signage",
              "Conference room systems",
              "Public address systems",
              "Control system programming"
            ]
          },
          {
            name: "Wireless Systems",
            activities: [
              "WiFi installation",
              "Cellular enhancement",
              "Radio system installation",
              "Antenna installation",
              "Emergency communications",
              "DAS installation"
            ]
          }
        ],
        codes: ["AS/CA S009:2013", "AS/NZS 3080:2013"]
      },
      {
        name: "Pool Construction",
        categories: [
          {
            name: "Pool Construction",
            activities: [
              "Pool excavation",
              "Concrete pool construction",
              "Vinyl liner installation",
              "Fiberglass pool installation",
              "Pool equipment installation",
              "Pool commissioning"
            ]
          },
          {
            name: "Pool Equipment",
            activities: [
              "Pump installation",
              "Filter installation",
              "Heater installation",
              "Chemical dosing systems",
              "Pool lighting",
              "Automatic pool cleaners"
            ]
          },
          {
            name: "Pool Safety",
            activities: [
              "Pool fence installation",
              "Safety barrier installation",
              "Pool alarm installation",
              "Pool cover installation",
              "Emergency equipment",
              "Compliance inspection"
            ]
          }
        ],
        codes: ["AS 1926.1:2012", "AS 1926.2:2007"]
      },
      {
        name: "Solar & Renewable",
        categories: [
          {
            name: "Solar PV",
            activities: [
              "Solar panel installation",
              "Inverter installation",
              "DC cabling",
              "AC cabling",
              "Earthing systems",
              "System commissioning"
            ]
          },
          {
            name: "Solar Hot Water",
            activities: [
              "Solar collector installation",
              "Storage tank installation",
              "Pump station installation",
              "Control system installation",
              "Pipe insulation",
              "System testing"
            ]
          },
          {
            name: "Battery Systems",
            activities: [
              "Battery installation",
              "Battery management system",
              "Backup power systems",
              "Grid connection",
              "Monitoring systems",
              "Safety systems"
            ]
          }
        ],
        codes: ["AS/NZS 5033:2021", "AS/NZS 2712:2007"]
      }
    ];
    
    res.json(trades);
  });

  const httpServer = createServer(app);
  return httpServer;
}

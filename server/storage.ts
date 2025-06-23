import { users, swmsDocuments, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserCredits(userId: number, credits: number): Promise<void>;
  updateUserLastActive(userId: number): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<void>;
  logCreditUsage(userId: number, usage: any): Promise<void>;
  getUserSwms(userId: number): Promise<any[]>;
  getSwmsById(id: number): Promise<any | undefined>;
  createSwmsDraft(draft: any): Promise<any>;
  updateSwmsDraft(draftId: string | number, draft: any): Promise<any>;
  getUserSwmsDrafts(userId: number): Promise<any[]>;
  getUserSwmsDocuments(): Promise<any[]>;
  getAllSwmsDocuments(): Promise<any[]>;
  createSwmsDocument(data: any): Promise<any>;
  getSwmsDocumentById(id: number): Promise<any | undefined>;
  getSwmsDocumentsByUserId(userId: number): Promise<any[]>;
  updateSwmsDocument(id: number, data: any): Promise<any>;
  deleteSwmsDocument(id: number): Promise<void>;
  saveSWMSDraft(data: any): Promise<any>;
  getDraftCount(userId: number): Promise<number>;
  getCompletedCount(userId: number): Promise<number>;
  getUserSwms(userId: number): Promise<any[]>;
  getUserSWMS(userId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  private swmsDrafts: any[] = [];
  private swmsDocuments: any[] = [];

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async updateUserCredits(userId: number, credits: number): Promise<void> {
    await db
      .update(users)
      .set({ swmsCredits: credits })
      .where(eq(users.id, userId));
  }

  async updateUserLastActive(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  async updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId));
  }

  async logCreditUsage(userId: number, usage: any): Promise<void> {
    // For now, just log to console
    // In production, this would be stored in a credit_usage table
    console.log(`Credit usage for user ${userId}:`, usage);
  }

  async getSwmsById(id: number): Promise<any | undefined> {
    try {
      const [swms] = await db.select().from(swmsDocuments).where(eq(swmsDocuments.id, id));
      return swms || undefined;
    } catch (error) {
      console.error('Error fetching SWMS by ID:', error);
      return undefined;
    }
  }

  async createSwmsDraft(draft: any): Promise<any> {
    try {
      // Save draft to database as SWMS with draft status
      const draftData = {
        title: draft.title || draft.jobName || "Untitled SWMS",
        jobName: draft.jobName || draft.title || "Untitled SWMS",
        jobNumber: draft.jobNumber || `DRAFT-${Date.now()}`,
        projectAddress: draft.projectAddress || "",
        projectLocation: draft.projectAddress || "",
        tradeType: draft.tradeType || "",
        principalContractor: draft.principalContractor || "",
        responsiblePersons: draft.responsiblePersons || [],
        workActivities: Array.isArray(draft.activities) ? draft.activities : [],
        activities: Array.isArray(draft.activities) ? draft.activities : [],
        riskAssessments: Array.isArray(draft.riskAssessments) ? draft.riskAssessments : [],
        safetyMeasures: draft.safetyMeasures || [],
        emergencyProcedures: draft.emergencyProcedures || [],
        complianceCodes: draft.complianceCodes || [],
        userId: draft.userId || 1,
        status: "draft",
        aiEnhanced: draft.aiEnhanced || false
      };

      const [savedDraft] = await db
        .insert(swmsDocuments)
        .values(draftData)
        .returning();
      
      console.log('Draft saved to database:', savedDraft.id);
      return savedDraft;
    } catch (error) {
      console.error('Error creating SWMS draft:', error);
      // Fallback to memory storage
      const existingIndex = this.swmsDrafts.findIndex(d => d.id === draft.id);
      if (existingIndex >= 0) {
        this.swmsDrafts[existingIndex] = draft;
      } else {
        this.swmsDrafts.push(draft);
      }
      console.log('Draft saved to memory:', draft.id);
      return draft;
    }
  }

  async updateSwmsDraft(draftId: string | number, draft: any): Promise<any> {
    try {
      // Update existing draft in database
      const draftData = {
        title: draft.title || draft.jobName || "Untitled SWMS",
        jobName: draft.jobName || draft.title || "Untitled SWMS",
        jobNumber: draft.jobNumber || `DRAFT-${Date.now()}`,
        projectAddress: draft.projectAddress || "",
        projectLocation: draft.projectAddress || "",
        tradeType: draft.tradeType || "",
        principalContractor: draft.principalContractor || "",
        responsiblePersons: draft.responsiblePersons || [],
        workActivities: Array.isArray(draft.activities) ? draft.activities : [],
        activities: Array.isArray(draft.activities) ? draft.activities : [],
        riskAssessments: Array.isArray(draft.riskAssessments) ? draft.riskAssessments : [],
        safetyMeasures: draft.safetyMeasures || [],
        emergencyProcedures: draft.emergencyProcedures || [],
        complianceCodes: draft.complianceCodes || [],
        userId: draft.userId || 1,
        status: "draft",
        aiEnhanced: draft.aiEnhanced || false,
        updatedAt: new Date()
      };

      const [updatedDraft] = await db
        .update(swmsDocuments)
        .set(draftData)
        .where(eq(swmsDocuments.id, Number(draftId)))
        .returning();
      
      console.log('Draft updated in database:', updatedDraft.id);
      return updatedDraft;
    } catch (error) {
      console.error('Error updating SWMS draft:', error);
      // Fallback to memory storage
      const existingIndex = this.swmsDrafts.findIndex(d => d.id === draftId);
      if (existingIndex >= 0) {
        this.swmsDrafts[existingIndex] = { ...draft, id: draftId };
        return this.swmsDrafts[existingIndex];
      }
      throw error;
    }
  }

  async getUserSwmsDrafts(userId: number): Promise<any[]> {
    try {
      // Fetch from database first
      const drafts = await db
        .select()
        .from(swmsDocuments)
        .where(eq(swmsDocuments.userId, userId));
      
      // Filter drafts and add type field for frontend
      const draftDocuments = drafts
        .filter((draft: any) => draft.status === 'draft')
        .map((draft: any) => ({
          ...draft,
          type: 'draft'
        }));
      
      console.log(`Found ${draftDocuments.length} draft SWMS for user ${userId}`);
      return draftDocuments;
    } catch (error) {
      console.error('Error fetching user drafts:', error);
      // Fallback to memory storage
      return this.swmsDrafts
        .filter((draft: any) => draft.userId === userId)
        .map((draft: any) => ({
          ...draft,
          type: 'draft'
        }));
    }
  }

  async getUserSwmsDocuments(): Promise<any[]> {
    try {
      return this.swmsDocuments.map(doc => ({
        ...doc,
        type: 'completed'
      }));
    } catch (error) {
      console.error('Error fetching user documents:', error);
      return [];
    }
  }

  async getUserSwms(userId: number): Promise<any[]> {
    try {
      console.log(`Querying database for user ${userId} SWMS documents...`);
      // Fetch all SWMS documents for the user (both drafts and completed)
      const documents = await db
        .select()
        .from(swmsDocuments)
        .where(eq(swmsDocuments.userId, userId))
        .orderBy(desc(swmsDocuments.createdAt));
      
      console.log(`Database returned ${documents.length} SWMS documents for user ${userId}`);
      console.log('Sample document:', documents[0] ? { id: documents[0].id, title: documents[0].title } : 'none');
      return documents;
    } catch (error) {
      console.error('Error fetching user SWMS documents:', error);
      // Fallback to memory storage
      const allDocs = [
        ...this.swmsDrafts.filter(draft => draft.userId === userId),
        ...this.swmsDocuments.filter(doc => doc.userId === userId)
      ];
      return allDocs;
    }
  }

  async getAllSwmsDocuments(): Promise<any[]> {
    try {
      const allDocuments = await db.select().from(swmsDocuments);
      return allDocuments;
    } catch (error) {
      console.error('Error fetching all SWMS documents:', error);
      return [];
    }
  }

  async createSwmsDocument(data: any): Promise<any> {
    try {
      const [document] = await db
        .insert(swmsDocuments)
        .values(data)
        .returning();
      return document;
    } catch (error) {
      console.error('Error creating SWMS document:', error);
      throw error;
    }
  }

  async getSwmsDocumentById(id: number): Promise<any | undefined> {
    try {
      const [document] = await db.select().from(swmsDocuments).where(eq(swmsDocuments.id, id));
      return document || undefined;
    } catch (error) {
      console.error('Error fetching SWMS document by ID:', error);
      return undefined;
    }
  }

  async getSwmsDocumentsByUserId(userId: number): Promise<any[]> {
    try {
      const documents = await db
        .select()
        .from(swmsDocuments)
        .where(eq(swmsDocuments.userId, userId))
        .orderBy(desc(swmsDocuments.createdAt));
      return documents;
    } catch (error) {
      console.error('Error fetching SWMS documents by user ID:', error);
      return [];
    }
  }

  async updateSwmsDocument(id: number, data: any): Promise<any> {
    try {
      const [updatedDocument] = await db
        .update(swmsDocuments)
        .set(data)
        .where(eq(swmsDocuments.id, id))
        .returning();
      return updatedDocument;
    } catch (error) {
      console.error('Error updating SWMS document:', error);
      throw error;
    }
  }

  async deleteSwmsDocument(id: number): Promise<void> {
    try {
      await db.delete(swmsDocuments).where(eq(swmsDocuments.id, id));
    } catch (error) {
      console.error('Error deleting SWMS document:', error);
      throw error;
    }
  }

  async saveSWMSDraft(data: any): Promise<any> {
    try {
      const userId = data.userId || 999;
      const title = data.projectName || data.jobName || data.tradeType || 'Draft SWMS';
      
      // Check if we're updating an existing draft (based on userId and title)
      const existingDrafts = await db
        .select()
        .from(swmsDocuments)
        .where(eq(swmsDocuments.userId, userId));
      
      // Find matching draft by title or create new one
      const existingDraft = existingDrafts.find(draft => 
        draft.title === title || 
        (draft.status === 'draft' && !draft.title)
      );

      const swmsData = {
        userId,
        title,
        jobName: title,
        jobNumber: data.jobNumber || '',
        projectAddress: data.projectAddress || '',
        projectLocation: data.projectAddress || '',
        projectDescription: data.projectDescription || '',
        principalContractor: data.principalContractor || '',
        tradeType: data.tradeType || '',
        activities: [data.tradeType || 'General Construction'],
        workActivities: data.workActivities || [],
        riskAssessments: data.workActivities || [],
        safetyMeasures: data.workActivities || [],
        complianceCodes: ['WHS Act 2011', 'WHS Regulation 2017'],
        responsiblePersons: [{name: 'Site Supervisor', role: 'Supervisor'}],
        emergencyProcedures: {contacts: [], procedures: []},
        status: data.status || 'draft'
      };

      if (existingDraft) {
        // Update existing draft
        const [updatedDoc] = await db
          .update(swmsDocuments)
          .set(swmsData)
          .where(eq(swmsDocuments.id, existingDraft.id))
          .returning();
        console.log('SWMS draft updated:', updatedDoc.id);
        return updatedDoc;
      } else {
        // Create new draft
        const [savedDoc] = await db.insert(swmsDocuments).values(swmsData).returning();
        console.log('SWMS draft created:', savedDoc.id);
        return savedDoc;
      }
    } catch (error) {
      console.error('Error saving SWMS to database:', error);
      // Fallback to memory storage
      const newDoc = { ...data, id: Date.now() };
      this.swmsDrafts.push(newDoc);
      return newDoc;
    }
  }

  async getDraftCount(userId: number): Promise<number> {
    try {
      const drafts = await db
        .select()
        .from(swmsDocuments)
        .where(eq(swmsDocuments.userId, userId));
      
      return drafts.filter(doc => doc.status === 'draft').length;
    } catch (error) {
      console.error('Error getting draft count:', error);
      return this.swmsDrafts.filter(d => d.userId === userId).length;
    }
  }

  async getCompletedCount(userId: number): Promise<number> {
    try {
      const docs = await db
        .select()
        .from(swmsDocuments)
        .where(eq(swmsDocuments.userId, userId));
      
      return docs.filter(doc => doc.status === 'completed').length;
    } catch (error) {
      console.error('Error getting completed count:', error);
      return this.swmsDocuments.filter(d => d.userId === userId).length;
    }
  }

  async getUserSWMS(userId: number): Promise<any[]> {
    // Alias method for backward compatibility
    return this.getUserSwms(userId);
  }

}

export const storage = new DatabaseStorage();
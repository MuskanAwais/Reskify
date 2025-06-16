import { users, swmsDocuments, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserCredits(userId: number, credits: number): Promise<void>;
  updateUserLastActive(userId: number): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<void>;
  logCreditUsage(userId: number, usage: any): Promise<void>;
  getUserSwms(userId: number): Promise<any[]>;
  createSwmsDraft(draft: any): Promise<any>;
  getUserSwmsDrafts(): Promise<any[]>;
  getUserSwmsDocuments(): Promise<any[]>;
  getAllSwmsDocuments(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  private swmsDrafts: any[] = [];
  private swmsDocuments: any[] = [];

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
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

  async getUserSwms(userId: number): Promise<any[]> {
    try {
      const userSwms = await db.select().from(swmsDocuments).where(eq(swmsDocuments.userId, userId));
      return userSwms;
    } catch (error) {
      console.error('Error fetching user SWMS:', error);
      return [];
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

  async getUserSwmsDrafts(): Promise<any[]> {
    try {
      return this.swmsDrafts.map(draft => ({
        ...draft,
        type: 'draft'
      }));
    } catch (error) {
      console.error('Error fetching user drafts:', error);
      return [];
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

  async getAllSwmsDocuments(): Promise<any[]> {
    try {
      const allDocuments = await db.select().from(swmsDocuments);
      return allDocuments;
    } catch (error) {
      console.error('Error fetching all SWMS documents:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
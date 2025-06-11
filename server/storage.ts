import { users, type User, type InsertUser } from "@shared/schema";
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
}

export class DatabaseStorage implements IStorage {
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
}

export const storage = new DatabaseStorage();
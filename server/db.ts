import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

import dotenv from 'dotenv';
dotenv.config();

// Configure WebSocket with timeout settings and error handling
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with enhanced connection timeout and retry settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 60000,
  max: 5,
  maxUses: 5000,
  allowExitOnIdle: true
});

export const db = drizzle({ client: pool, schema });

// Test database connection on startup with timeout
export async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 8000)
    );
    
    // Race between the query and timeout
    const result = await Promise.race([
      pool.query('SELECT 1'),
      timeoutPromise
    ]);
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('Continuing without database verification...');
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});
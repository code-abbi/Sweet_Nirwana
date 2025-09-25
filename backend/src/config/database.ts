/**
 * Database Configuration
 * 
 * Handles database connection and configuration for different environments
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/schema';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or TEST_DATABASE_URL environment variable is required');
}

// Create PostgreSQL connection
const client = postgres(databaseUrl);

// Create Drizzle database instance
export const db = drizzle(client, { schema });

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Close database connection
export async function closeConnection(): Promise<void> {
  try {
    await client.end();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Failed to close database connection:', error);
  }
}

export { schema };
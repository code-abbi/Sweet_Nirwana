/**
 * Test Database Utilities
 * 
 * Provides database setup, cleanup, and testing utilities for the test environment.
 * Handles test data creation, transaction management, and database state management.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../../src/models/schema';
import { Sweet, User, Inventory, Transaction } from '../../src/models/schema';

// Test database connection string
const testConnectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!testConnectionString) {
  throw new Error('TEST_DATABASE_URL or DATABASE_URL environment variable is required');
}

// Create test database connection
const testClient = postgres(testConnectionString);
export const testDb = drizzle(testClient, { schema });

/**
 * Global setup function for Jest
 */
export default async function globalSetup() {
  try {
    console.log('🚀 Setting up test database...');
    
    // Test connection
    await testClient`SELECT 1`;
    console.log('✅ Test database connection successful');
    
    // Run migrations
    await migrate(testDb, { migrationsFolder: './drizzle' });
    console.log('✅ Test database migrations completed');
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
}

/**
 * Clean all test data from database
 */
export async function cleanDatabase() {
  try {
    // Clean in reverse order of dependencies
    await testDb.delete(schema.transactions);
    await testDb.delete(schema.inventory);
    await testDb.delete(schema.sweets);
    await testDb.delete(schema.users);
    
    console.log('🧹 Test database cleaned');
  } catch (error) {
    console.error('❌ Failed to clean test database:', error);
    throw error;
  }
}

/**
 * Create test user data
 */
export async function createTestUser(userData?: Partial<User>): Promise<User> {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
    ...userData
  };
  
  const [user] = await testDb.insert(schema.users).values(defaultUser).returning();
  if (!user) throw new Error('Failed to create test user');
  return user;
}

/**
 * Create test admin user
 */
export async function createTestAdmin(userData?: Partial<User>): Promise<User> {
  return createTestUser({
    email: `admin-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
    ...userData
  });
}

/**
 * Create test sweet data
 */
export async function createTestSweet(sweetData?: Partial<Sweet>): Promise<Sweet> {
  const defaultSweet = {
    name: `Test Sweet ${Date.now()}`,
    category: 'Test Category',
    price: '100.00',
    quantity: 10,
    description: 'Test sweet description',
    imageUrl: '/test-image.jpg',
    ...sweetData
  };
  
  const [sweet] = await testDb.insert(schema.sweets).values(defaultSweet).returning();
  if (!sweet) throw new Error('Failed to create test sweet');
  return sweet;
}

/**
 * Create test inventory record
 */
export async function createTestInventory(inventoryData: Partial<Inventory> & { sweetId: string }) {
  const defaultInventory = {
    quantity: 10,
    price: '100.00',
    lastRestocked: new Date(),
    lastUpdated: new Date(),
    ...inventoryData
  };
  
  const [inventory] = await testDb.insert(schema.inventory).values(defaultInventory).returning();
  return inventory;
}

/**
 * Create test transaction record
 */
export async function createTestTransaction(transactionData: Partial<Transaction> & { sweetId: string; userId: string }) {
  const defaultTransaction = {
    type: 'purchase' as const,
    quantity: 1,
    price: '100.00',
    timestamp: new Date(),
    ...transactionData
  };
  
  const [transaction] = await testDb.insert(schema.transactions).values(defaultTransaction).returning();
  return transaction;
}

/**
 * Create a complete test scenario with user, sweet, and inventory
 */
export async function createTestScenario() {
  const user = await createTestUser();
  const admin = await createTestAdmin();
  const sweet = await createTestSweet();
  const inventory = await createTestInventory({ 
    sweetId: sweet.id, 
    restockedBy: admin.id 
  });
  
  return { user, admin, sweet, inventory };
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await testClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    return false;
  }
}

/**
 * Close test database connections
 */
export async function closeTestDatabase() {
  try {
    await testClient.end();
    console.log('🔌 Test database connections closed');
  } catch (error) {
    console.error('❌ Failed to close test database connections:', error);
  }
}
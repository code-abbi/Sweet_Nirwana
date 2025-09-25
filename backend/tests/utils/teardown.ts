/**
 * Jest Global Teardown
 * 
 * Handles cleanup after all tests are completed.
 * Cleans database and closes connections.
 */

import { cleanDatabase, closeTestDatabase } from './database';

export default async function globalTeardown() {
  console.log('🧹 Running global test teardown...');
  
  try {
    // Clean up test data
    await cleanDatabase();
    
    // Close database connections
    await closeTestDatabase();
    
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw in teardown to allow process to exit cleanly
  }
}
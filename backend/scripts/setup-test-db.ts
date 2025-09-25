/**
 * Test Database Setup Script
 * 
 * This script sets up the test database with migrations and seed data
 */

import { seedTestData } from './seed-test';

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  try {
    // Seed the database with test data
    await seedTestData();
    
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupTestDatabase();
}

export { setupTestDatabase };
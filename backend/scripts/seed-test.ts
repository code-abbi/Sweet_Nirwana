/**
 * Test Database Seed Script
 * 
 * This script populates the test database with sample data for API testing
 */

import { db } from '../src/config/database';
import { users, sweets, transactions } from '../src/models/schema';
import bcrypt from 'bcryptjs';

async function seedTestData() {
  console.log('🌱 Seeding test database...');
  
  try {
    // Clear existing data
    await db.delete(transactions);
    await db.delete(sweets);
    await db.delete(users);
    
    console.log('🧹 Cleared existing data');
    
    // Seed Users
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    
    const [testUser, adminUser] = await db.insert(users).values([
      {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        role: 'user'
      },
      {
        email: 'admin@example.com', 
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'admin'
      }
    ]).returning();
    
    console.log('👥 Created test users');
    
    // Seed Sweets
    const [sweet1, sweet2, sweet3] = await db.insert(sweets).values([
      {
        name: 'Test Sweet',
        category: 'Traditional',
        price: '15.99',
        quantity: 50,
        description: 'A delicious test sweet for API testing',
        imageUrl: '/images/test-sweet.jpg'
      },
      {
        name: 'Gulab Jamun',
        category: 'Traditional',
        price: '12.99',
        quantity: 30,
        description: 'Soft and spongy milk-solid dumplings in sugar syrup',
        imageUrl: '/images/gulab-jamun.jpg'
      },
      {
        name: 'Rasgulla',
        category: 'Bengali',
        price: '10.99',
        quantity: 25,
        description: 'Spongy cottage cheese balls in light syrup',
        imageUrl: '/images/rasgulla.jpg'
      }
    ]).returning();
    
    console.log('🍬 Created test sweets');
    
    // Seed some transactions (orders)
    await db.insert(transactions).values([
      {
        sweetId: sweet1.id,
        userId: testUser.id,
        type: 'purchase',
        quantity: 2,
        price: '31.98' // 2 * 15.99
      },
      {
        sweetId: sweet2.id,
        userId: testUser.id,
        type: 'purchase',
        quantity: 1,
        price: '12.99'
      }
    ]);
    
    console.log('🛒 Created test transactions');
    
    console.log('✅ Test database seeded successfully');
    console.log(`   - Users: ${testUser.email} (user), ${adminUser.email} (admin)`);
    console.log(`   - Password for both: Password123!`);
    console.log(`   - Sweets: ${sweet1.name}, ${sweet2.name}, ${sweet3.name}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedTestData };
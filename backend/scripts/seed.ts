// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/models/db';
import { users, sweets, inventory, transactions } from '../src/models/schema';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminUsers = await db.insert(users).values({
      email: 'admin@sweetshop.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    }).returning();
    
    if (!adminUsers[0]) {
      throw new Error('Failed to create admin user');
    }
    const adminUser = adminUsers[0];

    // Create regular user  
    const regularUsers = await db.insert(users).values({
      email: 'user@sweetshop.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    }).returning();
    
    if (!regularUsers[0]) {
      throw new Error('Failed to create regular user');
    }
    const regularUser = regularUsers[0];

    console.log('✅ Users created');

    // Create sample Indian sweets
    const sweetsList = [
      {
        name: 'Gulab Jamun',
        category: 'Syrup-based',
        price: '120',
        quantity: 25,
        description: 'Soft, spongy milk-solid dumplings soaked in rose-flavored sugar syrup',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop'
      },
      {
        name: 'Rasgulla',
        category: 'Syrup-based',
        price: '100',
        quantity: 30,
        description: 'Spongy white cottage cheese balls cooked in light sugar syrup',
        imageUrl: 'https://images.unsplash.com/photo-1599569164668-52ddf5998223?w=400&h=300&fit=crop'
      },
      {
        name: 'Jalebi',
        category: 'Fried',
        price: '80',
        quantity: 40,
        description: 'Crispy spiral-shaped sweet soaked in saffron sugar syrup',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      },
      {
        name: 'Kaju Katli',
        category: 'Dry Fruits',
        price: '450',
        quantity: 15,
        description: 'Diamond-shaped cashew fudge with silver leaf garnishing',
        imageUrl: 'https://images.unsplash.com/photo-1606471127073-eb0ce6e17ea4?w=400&h=300&fit=crop'
      },
      {
        name: 'Rasmalai',
        category: 'Milk-based',
        price: '180',
        quantity: 20,
        description: 'Soft paneer patties in thickened, sweetened milk with cardamom and pistachios',
        imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop'
      },
      {
        name: 'Ladoo',
        category: 'Flour-based',
        price: '60',
        quantity: 50,
        description: 'Round gram flour balls with ghee, nuts and aromatic spices',
        imageUrl: 'https://images.unsplash.com/photo-1599569164317-be9d071eab78?w=400&h=300&fit=crop'
      },
      {
        name: 'Barfi',
        category: 'Milk-based',
        price: '200',
        quantity: 25,
        description: 'Dense milk-based sweet garnished with nuts and silver leaf',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      },
      {
        name: 'Sandesh',
        category: 'Bengali',
        price: '150',
        quantity: 18,
        description: 'Delicate Bengali sweet made from fresh cottage cheese and jaggery',
        imageUrl: 'https://images.unsplash.com/photo-1606471127073-eb0ce6e17ea4?w=400&h=300&fit=crop'
      },
      {
        name: 'Halwa',
        category: 'Flour-based',
        price: '120',
        quantity: 30,
        description: 'Rich semolina pudding cooked in ghee with nuts and cardamom',
        imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop'
      },
      {
        name: 'Malai Roll',
        category: 'Bengali',
        price: '160',
        quantity: 12,
        description: 'Cream-filled cottage cheese rolls dusted with pistachios',
        imageUrl: 'https://images.unsplash.com/photo-1599569164668-52ddf5998223?w=400&h=300&fit=crop'
      },
    ];

    const createdSweets = await db.insert(sweets).values(sweetsList).returning();
    console.log('✅ Sweets created');

    // Create inventory entries for each sweet
    const inventoryEntries = createdSweets.map(sweet => ({
      sweetId: sweet.id,
      quantity: sweet.quantity,
      price: sweet.price,
      restockedBy: adminUser.id,
    }));

    await db.insert(inventory).values(inventoryEntries);
    console.log('✅ Inventory entries created');

    // Create some sample transactions
    const transactionsList = [
      {
        sweetId: createdSweets[0]!.id, // Chocolate Chip Cookies
        userId: regularUser.id,
        type: 'purchase' as const,
        quantity: 2,
        price: '2.99',
      },
      {
        sweetId: createdSweets[1]!.id, // Strawberry Cupcakes
        userId: regularUser.id,
        type: 'purchase' as const,
        quantity: 1,
        price: '3.49',
      },
      {
        sweetId: createdSweets[2]!.id, // Gummy Bears
        userId: adminUser.id,
        type: 'restock' as const,
        quantity: 50,
        price: '1.99',
      },
      {
        sweetId: createdSweets[3]!.id, // Dark Chocolate Truffles
        userId: regularUser.id,
        type: 'purchase' as const,
        quantity: 3,
        price: '8.99',
      },
      {
        sweetId: createdSweets[4]!.id, // Lemon Bars
        userId: regularUser.id,
        type: 'purchase' as const,
        quantity: 2,
        price: '2.49',
      },
    ];

    await db.insert(transactions).values(transactionsList);
    console.log('✅ Transactions created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created:');
    console.log(`👥 Users: ${2} (1 admin, 1 regular)`);
    console.log(`🍭 Sweets: ${createdSweets.length}`);
    console.log(`📦 Inventory entries: ${inventoryEntries.length}`);
    console.log(`💰 Transactions: ${transactionsList.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@sweetshop.com / admin123');
    console.log('User: user@sweetshop.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
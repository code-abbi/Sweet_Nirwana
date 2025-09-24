import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../models/db';
import { testConnection } from '../models/db';

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}
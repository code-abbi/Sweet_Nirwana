// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/models/db';
import { sweets } from '../src/models/schema';
import { eq } from 'drizzle-orm';

async function migrateImages() {
  console.log('🔄 Migrating sweet images to local paths...');

  try {
    // Map of sweet names to their local image filenames
    const imageMapping = {
      'Gulab Jamun': 'gulab_jamun.jpeg',
      'Rasgulla': 'rasgulla.jpeg',
      'Jalebi': 'jalebi.jpeg',
      'Kaju Katli': 'kaju_katli.jpeg',
      'Rasmalai': 'rasmalai.jpeg',
      'Ladoo': 'ladoo.jpeg',
      'Barfi': 'barfi.jpeg',
      'Sandesh': 'sandesh.jpeg',
      'Halwa': 'halwa.jpeg',
      'Malai Roll': 'malai_roll.jpeg'
    };

    let updatedCount = 0;

    // Update each sweet's image URL
    for (const [sweetName, filename] of Object.entries(imageMapping)) {
      const localImageUrl = `/images/${filename}`;
      
      await db
        .update(sweets)
        .set({ imageUrl: localImageUrl })
        .where(eq(sweets.name, sweetName));
      
      console.log(`✅ Updated ${sweetName} → ${filename}`);
      updatedCount++;
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} sweet images to local paths.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating images:', error);
    process.exit(1);
  }
}

migrateImages();
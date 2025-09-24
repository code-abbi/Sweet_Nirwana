import { pgTable, uuid, varchar, text, decimal, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const roleEnum = pgEnum('role', ['admin', 'user']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: roleEnum('role').default('user').notNull(),
  clerkId: varchar('clerk_id', { length: 255 }).unique(), // For Clerk integration
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sweets table
export const sweets = pgTable('sweets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').default(0).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations (if needed for future features)
export const usersRelations = relations(users, ({ many }) => ({
  // Future: user purchase history
}));

export const sweetsRelations = relations(sweets, ({ many }) => ({
  // Future: reviews, favorites, etc.
}));

// Export types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Sweet = typeof sweets.$inferSelect;
export type NewSweet = typeof sweets.$inferInsert;
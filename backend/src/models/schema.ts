import { pgTable, uuid, varchar, text, decimal, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const transactionTypeEnum = pgEnum('transaction_type', ['purchase', 'restock']);

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

// Inventory table - separate from sweets for better inventory management
export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  sweetId: uuid('sweet_id').references(() => sweets.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(0).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  lastRestocked: timestamp('last_restocked').defaultNow(),
  restockedBy: uuid('restocked_by').references(() => users.id),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Transactions table - track all inventory movements
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sweetId: uuid('sweet_id').references(() => sweets.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: transactionTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  inventoryRestocks: many(inventory)
}));

export const sweetsRelations = relations(sweets, ({ many, one }) => ({
  inventory: one(inventory),
  transactions: many(transactions)
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  sweet: one(sweets, {
    fields: [inventory.sweetId],
    references: [sweets.id]
  }),
  restockedByUser: one(users, {
    fields: [inventory.restockedBy],
    references: [users.id]
  })
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  sweet: one(sweets, {
    fields: [transactions.sweetId],
    references: [sweets.id]
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  })
}));

// Export types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Sweet = typeof sweets.$inferSelect;
export type NewSweet = typeof sweets.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
import {
  pgTable, text, integer, real, boolean, timestamp, jsonb,
} from 'drizzle-orm/pg-core';

// ===== Users =====
export const users = pgTable('users', {
  id: text('id').primaryKey().default('u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)),
  email: text('email').notNull().unique(),
  apiKey: text('api_key').notNull().unique(),
  brandName: text('brand_name').default(''),
  brandCategory: text('brand_category').default(''),
  brandWebsite: text('brand_website').default(''),
  brandDesc: text('brand_desc').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== Wishlist Items =====
export const wishlistItems = pgTable('wishlist_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kolId: text('kol_id').notNull(),
  kolName: text('kol_name').notNull(),
  kolAvatar: text('kol_avatar').default(''),
  kolDesc: text('kol_desc').default(''),
  kolUrl: text('kol_url').default(''),
  followers: integer('followers').default(0),
  following: integer('following').default(0),
  notesCount: integer('notes_count').default(0),
  avgLikes: real('avg_likes').default(0),
  avgCollects: real('avg_collects').default(0),
  avgComments: real('avg_comments').default(0),
  engagementRate: real('engagement_rate').default(0),
  category: text('category').default(''),
  score: real('score').default(0),
  scoreBreakdown: jsonb('score_breakdown').$type<{ engagement: number; popularity: number; activity: number }>().default({ engagement: 0, popularity: 0, activity: 0 }),
  recentNotes: jsonb('recent_notes').$type<{ id: string; title: string; likes: number; collects: number; comments: number; cover: string }[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  notes: text('notes').default(''),
  status: text('status').default('pending'),
  estimatedBudget: real('estimated_budget').default(0),
  lastContacted: timestamp('last_contacted'),
  contactHistory: jsonb('contact_history').$type<{ timestamp: string; type: string; content: string }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== Campaigns =====
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  brandName: text('brand_name').notNull(),
  productName: text('product_name').notNull(),
  sellingPoints: text('selling_points').default(''),
  format: text('format').default('图文'),
  budget: text('budget').default(''),
  toneStyle: text('tone_style').default('friendly'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== Outreach Messages =====
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId: text('campaign_id'),
  kolId: text('kol_id').notNull(),
  kolName: text('kol_name').notNull(),
  message: text('message').notNull(),
  toneStyle: text('tone_style').default('friendly'),
  status: text('status').default('draft'),
  sentAt: timestamp('sent_at'),
  replyAt: timestamp('reply_at'),
  replyText: text('reply_text'),
  aiIntent: text('ai_intent'),
  followUpAt: timestamp('follow_up_at'),
  followUpMessage: text('follow_up_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== Settings =====
export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  autoScore: boolean('auto_score').default(true),
  scoreWeights: jsonb('score_weights').$type<{ engagement: number; popularity: number; activity: number }>().default({ engagement: 0.4, popularity: 0.3, activity: 0.3 }),
  theme: text('theme').default('dark'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== Scheduled Tasks =====
export const scheduledTasks = pgTable('scheduled_tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'follow_up' | 'reminder'
  targetId: text('target_id').notNull(), // message id
  dueAt: timestamp('due_at').notNull(),
  status: text('status').default('pending'), // pending | done | cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

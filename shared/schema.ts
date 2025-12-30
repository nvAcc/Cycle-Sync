import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, date, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar").default("🌸"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const periodLogs = pgTable("period_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  flow: text("flow"),
  mood: text("mood"),
  symptoms: text("symptoms").array(),
  painLevel: integer("pain_level"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: varchar("reported_user_id").references(() => users.id, { onDelete: "cascade" }),
  reportedThreadId: varchar("reported_thread_id").references(() => threads.id, { onDelete: "cascade" }),
  reportedCommentId: varchar("reported_comment_id").references(() => comments.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  periodLogs: many(periodLogs),
  threads: many(threads),
  comments: many(comments),
}));

export const periodLogsRelations = relations(periodLogs, ({ one }) => ({
  user: one(users, {
    fields: [periodLogs.userId],
    references: [users.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  thread: one(threads, {
    fields: [comments.threadId],
    references: [threads.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPeriodLogSchema = createInsertSchema(periodLogs).omit({
  id: true,
  createdAt: true,
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
  likes: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  likes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPeriodLog = z.infer<typeof insertPeriodLogSchema>;
export type PeriodLog = typeof periodLogs.$inferSelect;

export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

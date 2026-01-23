import {
  type User,
  type InsertUser,
  type PeriodLog,
  type InsertPeriodLog,
  type Thread,
  type InsertThread,
  type Comment,
  type InsertComment,
  users,
  periodLogs,
  threads,
  comments,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getPeriodLogs(userId: string, startDate?: Date, endDate?: Date): Promise<PeriodLog[]>;
  createPeriodLog(log: InsertPeriodLog): Promise<PeriodLog>;
  updatePeriodLog(id: string, log: Partial<InsertPeriodLog>): Promise<PeriodLog | undefined>;
  deletePeriodLog(id: string): Promise<void>;

  getThreads(limit?: number): Promise<Array<Thread & { author: User; replyCount: number }>>;
  getThread(id: string): Promise<(Thread & { author: User }) | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  deleteThread(id: string): Promise<void>;

  getComments(threadId: string): Promise<Array<Comment & { author: User }>>;
  createComment(comment: InsertComment): Promise<Comment>;

  likeThread(threadId: string): Promise<void>;
  likeComment(commentId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPeriodLogs(userId: string, startDate?: Date, endDate?: Date): Promise<PeriodLog[]> {
    const conditions = [eq(periodLogs.userId, userId)];

    if (startDate && endDate) {
      conditions.push(gte(periodLogs.date, startDate.toISOString().split('T')[0]));
      conditions.push(lte(periodLogs.date, endDate.toISOString().split('T')[0]));
    }

    const logs = await db
      .select()
      .from(periodLogs)
      .where(and(...conditions))
      .orderBy(desc(periodLogs.date));

    return logs;
  }

  async createPeriodLog(log: InsertPeriodLog): Promise<PeriodLog> {
    const [periodLog] = await db
      .insert(periodLogs)
      .values(log)
      .returning();
    return periodLog;
  }

  async updatePeriodLog(id: string, log: Partial<InsertPeriodLog>): Promise<PeriodLog | undefined> {
    const [updated] = await db
      .update(periodLogs)
      .set(log)
      .where(eq(periodLogs.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePeriodLog(id: string): Promise<void> {
    await db.delete(periodLogs).where(eq(periodLogs.id, id));
  }

  async getThreads(limit: number = 50): Promise<Array<Thread & { author: User; replyCount: number }>> {
    const results = await db
      .select({
        thread: threads,
        author: users,
        replyCount: sql<number>`(SELECT count(*) FROM ${comments} WHERE ${comments.threadId} = ${threads.id})`,
      })
      .from(threads)
      .leftJoin(users, eq(threads.authorId, users.id))
      .orderBy(desc(threads.createdAt))
      .limit(limit);

    return results.map((r: { thread: Thread; author: User | null; replyCount: number }) => ({
      ...r.thread,
      author: r.author!,
      replyCount: r.replyCount || 0,
    }));
  }

  async getThread(id: string): Promise<(Thread & { author: User }) | undefined> {
    const [result] = await db
      .select({
        thread: threads,
        author: users,
      })
      .from(threads)
      .leftJoin(users, eq(threads.authorId, users.id))
      .where(eq(threads.id, id));

    if (!result || !result.author) return undefined;

    return {
      ...result.thread,
      author: result.author,
    };
  }

  async createThread(thread: InsertThread): Promise<Thread> {
    const [newThread] = await db
      .insert(threads)
      .values(thread)
      .returning();
    return newThread;
  }

  async getComments(threadId: string): Promise<Array<Comment & { author: User }>> {
    const results = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.threadId, threadId))
      .orderBy(comments.createdAt);

    return results.map((r: { comment: Comment; author: User | null }) => ({
      ...r.comment,
      author: r.author!,
    }));
  }

  async deleteThread(id: string): Promise<void> {
    await db.delete(threads).where(eq(threads.id, id));
  }


  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async likeThread(threadId: string): Promise<void> {
    await db
      .update(threads)
      .set({ likes: sql`${threads.likes} + 1` })
      .where(eq(threads.id, threadId));
  }

  async likeComment(commentId: string): Promise<void> {
    await db
      .update(comments)
      .set({ likes: sql`${comments.likes} + 1` })
      .where(eq(comments.id, commentId));
  }
}

export const storage = new DatabaseStorage();

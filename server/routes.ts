import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import memorystore from "memorystore";
import { pool } from "./db";
import { insertUserSchema, insertPeriodLogSchema, insertThreadSchema, insertCommentSchema } from "@shared/schema";

const PgSession = connectPgSimple(session);
const MemoryStore = memorystore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  //session config
  const sessionStore = process.env.DATABASE_URL
    ? new PgSession({
      pool,
      createTableIfMissing: true,
    })
    : new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "luna-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  //passport config
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  //auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Not authenticated" });
  };

  //auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({ username, password });
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed after registration" });
        }
        res.json({ user: { id: user.id, username: user.username, avatar: user.avatar } });
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ user: { id: user.id, username: user.username, avatar: user.avatar } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({ user: { id: user.id, username: user.username, avatar: user.avatar } });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  //period logs routes
  app.get("/api/period-logs", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { startDate, endDate } = req.query;

      const logs = await storage.getPeriodLogs(
        user.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/period-logs", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const logData = insertPeriodLogSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const log = await storage.createPeriodLog(logData);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/period-logs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const log = await storage.updatePeriodLog(id, req.body);

      if (!log) {
        return res.status(404).json({ error: "Log not found" });
      }

      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/period-logs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePeriodLog(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  //community threads routes
  app.get("/api/threads", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const threads = await storage.getThreads(limit);
      res.json(threads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/threads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const thread = await storage.getThread(id);

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      res.json(thread);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/threads", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const threadData = insertThreadSchema.parse({
        ...req.body,
        authorId: user.id,
      });

      const thread = await storage.createThread(threadData);
      res.json(thread);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/threads/:id/like", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.likeThread(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  //comments routes
  app.get("/api/threads/:threadId/comments", async (req, res) => {
    try {
      const { threadId } = req.params;
      const comments = await storage.getComments(threadId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/threads/:threadId/comments", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { threadId } = req.params;

      const commentData = insertCommentSchema.parse({
        ...req.body,
        threadId,
        authorId: user.id,
      });

      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/comments/:id/like", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.likeComment(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

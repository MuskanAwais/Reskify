import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Validate if username is email or mobile number
function validateUsername(username: string): boolean {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Australian mobile number validation (+61 or 04)
  const mobileRegex = /^(\+61|04)[0-9]{8,9}$/;
  
  return emailRegex.test(username) || mobileRegex.test(username);
}

export function setupAuth(app: Express) {
  // Create memory store for session persistence
  const MemStore = MemoryStore(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "swms-builder-secret-2024",
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
  };

  // Configure session before passport
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializing user ID:', id);
      const user = await storage.getUser(id);
      console.log('Deserialized user:', user ? user.username : 'not found');
      done(null, user);
    } catch (error) {
      console.error('Deserialize error:', error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, companyName, primaryTrade, email, phone } = req.body;

      // Validate username format
      if (!validateUsername(username)) {
        return res.status(400).json({ 
          message: "Username must be a valid email address or Australian mobile number (04xxxxxxxx or +61xxxxxxxxx)" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        companyName,
        primaryTrade,
        email: email || (username.includes('@') ? username : ''),
        phone: phone || (!username.includes('@') ? username : ''),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: user.id, 
          username: user.username, 
          name: user.name,
          companyName: user.companyName,
          primaryTrade: user.primaryTrade 
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    const user = req.user as SelectUser;
    
    // Force session save
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
    });
    
    // Update last active time
    await storage.updateUserLastActive(user.id);
    
    res.status(200).json({ 
      id: user.id, 
      username: user.username, 
      name: user.name,
      companyName: user.companyName,
      primaryTrade: user.primaryTrade 
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as SelectUser;
    res.json({ 
      id: user.id, 
      username: user.username, 
      name: user.name,
      companyName: user.companyName,
      primaryTrade: user.primaryTrade 
    });
  });
}
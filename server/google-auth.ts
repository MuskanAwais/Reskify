import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import type { Express } from 'express';
import { storage } from './storage';

export function setupGoogleAuth(app: Express) {
  // Only setup Google OAuth if credentials are available
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Google OAuth credentials not configured - Google Sign-In disabled');
    
    // Fallback routes for when Google OAuth is not configured
    app.get('/api/auth/google', (req, res) => {
      res.status(503).json({ 
        error: 'Google Sign-In not configured',
        message: 'Google OAuth credentials are required to enable this feature.'
      });
    });
    
    app.get('/api/auth/google/callback', (req, res) => {
      res.redirect('/?error=google_auth_unavailable');
    });
    
    return;
  }

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Create new user with required fields
        user = await storage.createUser({
          username: profile.emails?.[0]?.value?.split('@')[0] || `user_${profile.id}`,
          email: profile.emails?.[0]?.value || '',
          companyName: 'Not Specified',
          primaryTrade: 'General Construction',
          name: profile.displayName || '',
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value || '',
          swmsGenerated: 0,
          subscriptionStatus: 'trial',
          trialUsed: false
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}
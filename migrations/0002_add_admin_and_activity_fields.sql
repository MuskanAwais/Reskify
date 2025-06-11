-- Add admin and activity tracking fields to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_active_at TIMESTAMP;

-- Set admin status for the admin user
UPDATE users SET is_admin = TRUE WHERE username = '0421869995';

-- Update last active for all existing users to current time
UPDATE users SET last_active_at = NOW();
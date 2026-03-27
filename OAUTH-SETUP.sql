-- ==============================================
-- DzBuild OAuth Setup for Supabase/PostgreSQL
-- Run this in Supabase SQL Editor
-- ==============================================

-- Create accounts table for NextAuth
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT accounts_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, "providerAccountId")
);

-- Create sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT sessions_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create verification_tokens table for NextAuth
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions("sessionToken");

-- Update the users table to allow empty passwords for OAuth users
-- Note: This is already handled by the schema, but included for reference

-- ==============================================
-- Instructions for Google OAuth Setup:
-- ==============================================
-- 1. Go to https://console.cloud.google.com/
-- 2. Create a new project or select existing one
-- 3. Go to "APIs & Services" > "Credentials"
-- 4. Click "Create Credentials" > "OAuth client ID"
-- 5. Select "Web application"
-- 6. Add authorized JavaScript origins:
--    - https://dzbuild.vercel.app
--    - http://localhost:3000 (for development)
-- 7. Add authorized redirect URIs:
--    - https://dzbuild.vercel.app/api/auth/callback/google
--    - http://localhost:3000/api/auth/callback/google (for development)
-- 8. Copy the Client ID and Client Secret

-- ==============================================
-- Instructions for GitHub OAuth Setup:
-- ==============================================
-- 1. Go to https://github.com/settings/developers
-- 2. Click "New OAuth App"
-- 3. Fill in the details:
--    - Application name: DzBuild
--    - Homepage URL: https://dzbuild.vercel.app
--    - Authorization callback URL: https://dzbuild.vercel.app/api/auth/callback/github
-- 4. For development, create another OAuth App:
--    - Homepage URL: http://localhost:3000
--    - Authorization callback URL: http://localhost:3000/api/auth/callback/github
-- 5. Copy the Client ID and Client Secret

-- ==============================================
-- Environment Variables to Add in Vercel:
-- ==============================================
-- GOOGLE_CLIENT_ID=your_google_client_id
-- GOOGLE_CLIENT_SECRET=your_google_client_secret
-- GITHUB_CLIENT_ID=your_github_client_id
-- GITHUB_CLIENT_SECRET=your_github_client_secret
-- NEXTAUTH_SECRET=B68lf6p/DYakZa0R4AiRupdRLSHSgNSg231cSHlntSA=
-- NEXTAUTH_URL=https://dzbuild.vercel.app

-- ==============================================
-- Success Message
-- ==============================================
SELECT 'OAuth tables created successfully! Please add the OAuth environment variables in Vercel.' as message;

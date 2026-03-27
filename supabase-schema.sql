-- DzBuild Reddit-Style Community Database Schema
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. COMMUNITIES TABLE (like subreddits)
-- ============================================
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(100),
  name_fr VARCHAR(100),
  name_en VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  icon VARCHAR(50) DEFAULT 'building',
  color VARCHAR(7) DEFAULT '#3B82F6',
  cover_image TEXT,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default communities
INSERT INTO communities (name, name_ar, name_fr, icon, color, description) VALUES
('engineering', 'الهندسة المدنية', 'Génie Civil', 'building', '#3B82F6', 'General civil engineering discussions'),
('concrete', 'الخرسانة', 'Béton', 'box', '#6366F1', 'Concrete mix design, pouring, and testing'),
('steel', 'حديد التسليح', 'Armature', 'grid-3x3', '#8B5CF6', 'Steel reinforcement and structural steel'),
('site-problems', 'مشاكل الموقع', 'Problèmes de chantier', 'alert-triangle', '#EF4444', 'Site issues and solutions'),
('jobs', 'الوظائف', 'Emplois', 'briefcase', '#F59E0B', 'Job opportunities in construction'),
('materials', 'المواد', 'Matériaux', 'package', '#10B981', 'Building materials discussion'),
('tools', 'الأدوات والمعدات', 'Outils et équipements', 'wrench', '#6366F1', 'Tools and equipment for construction')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500),
  content TEXT,
  author_id UUID NOT NULL,
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  post_type VARCHAR(50) DEFAULT 'standard',
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  
  -- Reddit-style voting
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0, -- upvotes - downvotes
  hot_score DOUBLE PRECISION DEFAULT 0, -- For hot sorting algorithm
  
  -- Counts
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Flags
  is_featured BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  
  -- Additional data
  project_data JSONB,
  job_data JSONB,
  service_data JSONB,
  product_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score DESC);

-- ============================================
-- 3. VOTES TABLE (for upvotes/downvotes)
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'post' or 'comment'
  vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)), -- 1 = upvote, -1 = downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id, target_type);

-- ============================================
-- 4. COMMENTS TABLE (with threading)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  
  -- Voting
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  
  likes_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ============================================
-- 5. COMMUNITY MEMBERS (for joining communities)
-- ============================================
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- 'member', 'moderator', 'admin'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- ============================================
-- 6. PROFILES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'NORMAL_USER',
  specialization VARCHAR(255),
  city VARCHAR(100),
  wilaya VARCHAR(100),
  bio TEXT,
  phone VARCHAR(50),
  website VARCHAR(255),
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to calculate hot score (Reddit-style algorithm)
-- Hot score = (upvotes - downvotes) + recency bonus
CREATE OR REPLACE FUNCTION calculate_hot_score()
RETURNS TRIGGER AS $$
DECLARE
  time_diff DOUBLE PRECISION;
  recency_bonus DOUBLE PRECISION;
BEGIN
  -- Calculate time difference in hours
  time_diff := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600.0;
  
  -- Recency bonus: newer posts get higher bonus
  -- Using logarithmic decay
  IF time_diff < 1 THEN
    recency_bonus := 10.0;
  ELSIF time_diff < 24 THEN
    recency_bonus := 5.0 * (1 - time_diff / 24);
  ELSE
    recency_bonus := 0;
  END IF;
  
  -- Calculate score
  NEW.score := NEW.upvotes - NEW.downvotes;
  
  -- Calculate hot score with recency
  NEW.hot_score := NEW.score + recency_bonus + (10000.0 / GREATEST(time_diff + 2, 2));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update hot score on post insert/update
DROP TRIGGER IF EXISTS update_hot_score ON posts;
CREATE TRIGGER update_hot_score
  BEFORE INSERT OR UPDATE OF upvotes, downvotes ON posts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_hot_score();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE posts SET 
        upvotes = upvotes + CASE WHEN NEW.vote_value = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes + CASE WHEN NEW.vote_value = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE comments SET 
        upvotes = upvotes + CASE WHEN NEW.vote_value = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes + CASE WHEN NEW.vote_value = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      UPDATE posts SET 
        upvotes = upvotes - CASE WHEN OLD.vote_value = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes - CASE WHEN OLD.vote_value = -1 THEN 1 ELSE 0 END
      WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      UPDATE comments SET 
        upvotes = upvotes - CASE WHEN OLD.vote_value = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes - CASE WHEN OLD.vote_value = -1 THEN 1 ELSE 0 END
      WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.target_type = 'post' THEN
      UPDATE posts SET 
        upvotes = upvotes - CASE WHEN OLD.vote_value = 1 THEN 1 ELSE 0 END + CASE WHEN NEW.vote_value = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes - CASE WHEN OLD.vote_value = -1 THEN 1 ELSE 0 END + CASE WHEN NEW.vote_value = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vote_counts_trigger ON votes;
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- Function to update community stats
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET post_count = post_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_stats ON posts;
CREATE TRIGGER update_community_stats
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_count();

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Communities are public" ON communities FOR SELECT USING (true);
CREATE POLICY "Posts are public" ON posts FOR SELECT USING (true);
CREATE POLICY "Comments are public" ON comments FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Anyone can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete own posts" ON posts FOR DELETE USING (true);

-- Voting policies
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vote" ON votes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vote" ON votes FOR DELETE USING (true);

-- Comment policies
CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own comments" ON comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete own comments" ON comments FOR DELETE USING (true);

-- Community member policies
CREATE POLICY "Anyone can view members" ON community_members FOR SELECT USING (true);
CREATE POLICY "Anyone can join community" ON community_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can leave community" ON community_members FOR DELETE USING (true);

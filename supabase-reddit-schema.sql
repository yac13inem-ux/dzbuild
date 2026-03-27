-- Reddit-Style Community System for DzBuild
-- Execute this SQL in Supabase SQL Editor

-- 1. Communities Table (like subreddits)
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  name_ar VARCHAR(100),
  name_fr VARCHAR(100),
  name_en VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  description_en TEXT,
  icon VARCHAR(50) DEFAULT 'building',
  color VARCHAR(20) DEFAULT '#6366f1',
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Posts Table to support communities and voting
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hot_score NUMERIC DEFAULT 0;

-- 3. Votes Table (track user votes) - بدون foreign key للمستخدمين
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
  vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

-- 4. Comments Table with nested replies - بدون foreign key للمستخدمين
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Community Memberships - بدون foreign key للمستخدمين
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- 6. Insert default communities
INSERT INTO communities (name, name_ar, name_fr, name_en, description, description_ar, description_fr, description_en, icon, color) VALUES
('engineering', 'الهندسة المدنية', 'Génie Civil', 'Civil Engineering', 'General civil engineering discussions', 'مناقشات عامة حول الهندسة المدنية', 'Discussions générales sur le génie civil', 'General civil engineering discussions', 'building', '#3b82f6'),
('concrete', 'الخرسانة', 'Béton', 'Concrete', 'Concrete design, mixes, and techniques', 'تصميم الخرسانة والخلطات والتقنيات', 'Conception du béton, mélanges et techniques', 'Concrete design, mixes, and techniques', 'box', '#64748b'),
('steel', 'حديد التسليح', 'Acier', 'Steel', 'Steel reinforcement and metal structures', 'حديد التسليح والهياكل المعدنية', 'Armature et structures métalliques', 'Steel reinforcement and metal structures', 'grid-3x3', '#78716c'),
('site-problems', 'مشاكل الموقع', 'Problèmes Chantier', 'Site Problems', 'On-site issues and solutions', 'مشاكل الموقع والحلول', 'Problèmes sur chantier et solutions', 'On-site issues and solutions', 'alert-triangle', '#f59e0b'),
('jobs', 'الوظائف', 'Emplois', 'Jobs', 'Job opportunities in construction', 'فرص عمل في قطاع البناء', 'Opportunités d''emploi dans la construction', 'Job opportunities in construction', 'briefcase', '#22c55e'),
('materials', 'المواد', 'Matériaux', 'Materials', 'Construction materials discussion', 'مناقشة مواد البناء', 'Discussion sur les matériaux de construction', 'Construction materials discussion', 'package', '#8b5cf6'),
('tools', 'الأدوات', 'Outils', 'Tools', 'Construction tools and equipment', 'أدوات ومعدات البناء', 'Outils et équipements de construction', 'Construction tools and equipment', 'wrench', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_votes_user_target ON votes(user_id, target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- 8. Function to calculate hot score
CREATE OR REPLACE FUNCTION calculate_hot_score(post_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  post_upvotes INTEGER;
  post_downvotes INTEGER;
  post_created TIMESTAMP WITH TIME ZONE;
  score NUMERIC;
  hours_passed NUMERIC;
BEGIN
  SELECT upvotes, downvotes, created_at INTO post_upvotes, post_downvotes, post_created
  FROM posts WHERE id = post_id;
  
  IF post_created IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Hot score = (upvotes - downvotes) + recency bonus
  hours_passed := EXTRACT(EPOCH FROM (NOW() - post_created)) / 3600;
  score := (post_upvotes - post_downvotes) + GREATEST(0, 24 - hours_passed);
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger to update hot score when votes change
CREATE OR REPLACE FUNCTION update_post_hot_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET hot_score = calculate_hot_score(id) WHERE id = NEW.target_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hot_score_trigger ON votes;
CREATE TRIGGER update_hot_score_trigger
AFTER INSERT OR UPDATE ON votes
FOR EACH ROW
WHEN (NEW.target_type = 'post')
EXECUTE FUNCTION update_post_hot_score();

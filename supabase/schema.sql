-- DzBuild - Construction Social Network Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PROFILES (Linked to Supabase Auth) ====================

CREATE TYPE user_role AS ENUM (
  'CIVIL_ENGINEER',
  'CONTRACTOR', 
  'ENGINEERING_OFFICE',
  'CRAFTSMAN',
  'CONSTRUCTION_COMPANY',
  'STORE_FACTORY',
  'NORMAL_USER',
  'ADMIN'
);

CREATE TYPE verification_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'REJECTED'
);

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role user_role DEFAULT 'NORMAL_USER',
  verification_status verification_status DEFAULT 'PENDING',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Profile fields
  bio TEXT,
  address TEXT,
  city TEXT,
  wilaya TEXT,
  latitude FLOAT,
  longitude FLOAT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  
  -- Role-specific fields
  specialization TEXT,
  experience INT,
  license_number TEXT,
  certifications JSONB DEFAULT '[]',
  
  -- Statistics
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  project_count INT DEFAULT 0,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'NORMAL_USER')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== POSTS (News Feed) ====================

CREATE TYPE post_type AS ENUM (
  'standard',
  'project',
  'job_offer',
  'service',
  'product',
  'consultation',
  'problem',
  'guide',
  'achievement'
);

CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  content TEXT,
  title TEXT,
  post_type post_type DEFAULT 'standard',
  
  -- Media
  images JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  
  -- Categorization
  category TEXT,
  tags JSONB DEFAULT '[]',
  
  -- Engagement
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  
  -- Visibility
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  
  -- Role-specific data
  project_data JSONB DEFAULT '{}',  -- For project posts
  job_data JSONB DEFAULT '{}',       -- For job offers
  service_data JSONB DEFAULT '{}',   -- For services
  product_data JSONB DEFAULT '{}',   -- For products
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- ==================== COMMENTS ====================

CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  
  likes_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- ==================== LIKES ====================

CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL,  -- 'post' or 'comment'
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== FOLLOWS ====================

CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ==================== NOTIFICATIONS ====================

CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== MESSAGES ====================

CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participants JSONB NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Indexes for performance ====================

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- ==================== Functions ====================

-- Function to toggle like
CREATE OR REPLACE FUNCTION toggle_like(
  p_user_id UUID,
  p_target_type TEXT,
  p_target_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_like UUID;
BEGIN
  SELECT id INTO existing_like FROM likes 
  WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;
  
  IF existing_like IS NOT NULL THEN
    DELETE FROM likes WHERE id = existing_like;
    
    IF p_target_type = 'post' THEN
      UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_target_id;
    ELSIF p_target_type = 'comment' THEN
      UPDATE comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_target_id;
    END IF;
    
    RETURN FALSE;
  ELSE
    INSERT INTO likes (user_id, target_type, target_id) VALUES (p_user_id, p_target_type, p_target_id);
    
    IF p_target_type = 'post' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = p_target_id;
    ELSIF p_target_type = 'comment' THEN
      UPDATE comments SET likes_count = likes_count + 1 WHERE id = p_target_id;
    END IF;
    
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle follow
CREATE OR REPLACE FUNCTION toggle_follow(
  p_follower_id UUID,
  p_following_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_follow UUID;
BEGIN
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;
  
  SELECT id INTO existing_follow FROM follows 
  WHERE follower_id = p_follower_id AND following_id = p_following_id;
  
  IF existing_follow IS NOT NULL THEN
    DELETE FROM follows WHERE id = existing_follow;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = p_follower_id;
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = p_following_id;
    RETURN FALSE;
  ELSE
    INSERT INTO follows (follower_id, following_id) VALUES (p_follower_id, p_following_id);
    UPDATE profiles SET following_count = following_count + 1 WHERE id = p_follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = p_following_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feed posts
CREATE OR REPLACE FUNCTION get_feed_posts(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  author_role user_role,
  content TEXT,
  title TEXT,
  post_type post_type,
  images JSONB,
  videos JSONB,
  category TEXT,
  tags JSONB,
  likes_count INT,
  comments_count INT,
  shares_count INT,
  views_count INT,
  is_featured BOOLEAN,
  is_sponsored BOOLEAN,
  created_at TIMESTAMPTZ,
  is_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.name AS author_name,
    pr.avatar AS author_avatar,
    pr.role AS author_role,
    p.content,
    p.title,
    p.post_type,
    p.images,
    p.videos,
    p.category,
    p.tags,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.views_count,
    p.is_featured,
    p.is_sponsored,
    p.created_at,
    EXISTS (
      SELECT 1 FROM likes l 
      WHERE l.target_type = 'post' AND l.target_id = p.id AND l.user_id = p_user_id
    ) AS is_liked
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE p.is_published = TRUE
  ORDER BY 
    p.is_sponsored DESC,
    p.is_featured DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

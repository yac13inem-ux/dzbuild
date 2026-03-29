-- ============================================================================
-- DzBuild - Row Level Security (RLS) Policies for Supabase
-- Run this after the main schema
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE craftsman_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_office_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_factory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE craftsman_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE craftsman_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR 
         EXISTS (SELECT 1 FROM admin_users WHERE user_id::text = auth.uid()::text));

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Service role can do everything (for Supabase Auth)
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Everyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- ROLE-SPECIFIC PROFILES POLICIES
-- ============================================================================

-- Engineer Profiles
CREATE POLICY "Engineer profiles viewable by all"
  ON engineer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own engineer profile"
  ON engineer_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Contractor Profiles
CREATE POLICY "Contractor profiles viewable by all"
  ON contractor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own contractor profile"
  ON contractor_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Craftsman Profiles
CREATE POLICY "Craftsman profiles viewable by all"
  ON craftsman_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own craftsman profile"
  ON craftsman_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Engineering Office Profiles
CREATE POLICY "Engineering office profiles viewable by all"
  ON engineering_office_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own engineering office profile"
  ON engineering_office_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Construction Company Profiles
CREATE POLICY "Construction company profiles viewable by all"
  ON construction_company_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own construction company profile"
  ON construction_company_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Store Factory Profiles
CREATE POLICY "Store factory profiles viewable by all"
  ON store_factory_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own store factory profile"
  ON store_factory_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Real Estate Profiles
CREATE POLICY "Real estate profiles viewable by all"
  ON real_estate_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users manage own real estate profile"
  ON real_estate_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- FOLLOWS POLICIES
-- ============================================================================

CREATE POLICY "Follows viewable by all"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid()::text = follower_id::text);

CREATE POLICY "Users can unfollow others"
  ON follows FOR DELETE
  USING (auth.uid()::text = follower_id::text);

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- Public posts are viewable by everyone
CREATE POLICY "Posts viewable by all"
  ON posts FOR SELECT
  USING (
    visibility = 'public' OR
    author_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id::text = auth.uid()::text 
      AND following_id = posts.author_id
      AND posts.visibility = 'followers'
    )
  );

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid()::text = author_id::text);

-- Users can update own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid()::text = author_id::text);

-- Users can delete own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid()::text = author_id::text);

-- ============================================================================
-- POST LIKES POLICIES
-- ============================================================================

CREATE POLICY "Post likes viewable by all"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

CREATE POLICY "Comments viewable by all"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid()::text = author_id::text);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid()::text = author_id::text);

-- ============================================================================
-- CRAFTSMAN BOOKINGS POLICIES
-- ============================================================================

CREATE POLICY "Bookings visible to parties"
  ON craftsman_bookings FOR SELECT
  USING (
    craftsman_id::text = auth.uid()::text OR
    client_id::text = auth.uid()::text
  );

CREATE POLICY "Clients can create bookings"
  ON craftsman_bookings FOR INSERT
  WITH CHECK (auth.uid()::text = client_id::text);

CREATE POLICY "Parties can update bookings"
  ON craftsman_bookings FOR UPDATE
  USING (
    craftsman_id::text = auth.uid()::text OR
    client_id::text = auth.uid()::text
  );

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

CREATE POLICY "Open projects viewable by all"
  ON projects FOR SELECT
  USING (
    status IN ('open', 'in_progress', 'completed') OR
    client_id::text = auth.uid()::text
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid()::text = client_id::text);

CREATE POLICY "Clients can update projects"
  ON projects FOR UPDATE
  USING (auth.uid()::text = client_id::text);

CREATE POLICY "Clients can delete projects"
  ON projects FOR DELETE
  USING (auth.uid()::text = client_id::text AND status = 'draft');

-- ============================================================================
-- PROJECT BIDS POLICIES
-- ============================================================================

CREATE POLICY "Bids visible to project owner and bidder"
  ON project_bids FOR SELECT
  USING (
    bidder_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM projects WHERE id = project_bids.project_id AND client_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create bids"
  ON project_bids FOR INSERT
  WITH CHECK (auth.uid()::text = bidder_id::text);

CREATE POLICY "Bidders can update own bids"
  ON project_bids FOR UPDATE
  USING (auth.uid()::text = bidder_id::text);

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

CREATE POLICY "Active products viewable by all"
  ON products FOR SELECT
  USING (status = 'active' OR seller_id::text = auth.uid()::text);

CREATE POLICY "Sellers can create products"
  ON products FOR INSERT
  WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Sellers can update products"
  ON products FOR UPDATE
  USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Sellers can delete products"
  ON products FOR DELETE
  USING (auth.uid()::text = seller_id::text);

-- ============================================================================
-- ORDERS POLICIES
-- ============================================================================

CREATE POLICY "Orders visible to buyer and seller"
  ON orders FOR SELECT
  USING (
    buyer_id::text = auth.uid()::text OR
    seller_id::text = auth.uid()::text
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid()::text = buyer_id::text);

CREATE POLICY "Parties can update orders"
  ON orders FOR UPDATE
  USING (
    buyer_id::text = auth.uid()::text OR
    seller_id::text = auth.uid()::text
  );

-- ============================================================================
-- JOBS POLICIES
-- ============================================================================

CREATE POLICY "Published jobs viewable by all"
  ON jobs FOR SELECT
  USING (status = 'published' OR employer_id::text = auth.uid()::text);

CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid()::text = employer_id::text);

CREATE POLICY "Employers can update jobs"
  ON jobs FOR UPDATE
  USING (auth.uid()::text = employer_id::text);

-- ============================================================================
-- JOB APPLICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Applications visible to employer and applicant"
  ON job_applications FOR SELECT
  USING (
    applicant_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM jobs WHERE id = job_applications.job_id AND employer_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can apply to jobs"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid()::text = applicant_id::text);

CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE
  USING (applicant_id::text = auth.uid()::text);

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

CREATE POLICY "Published courses viewable by all"
  ON courses FOR SELECT
  USING (status = 'published' OR instructor_id::text = auth.uid()::text);

CREATE POLICY "Instructors can create courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid()::text = instructor_id::text);

CREATE POLICY "Instructors can update courses"
  ON courses FOR UPDATE
  USING (auth.uid()::text = instructor_id::text);

-- ============================================================================
-- QUESTIONS & ANSWERS POLICIES
-- ============================================================================

CREATE POLICY "Questions viewable by all"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Users can create questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Users can update own questions"
  ON questions FOR UPDATE
  USING (auth.uid()::text = author_id::text);

CREATE POLICY "Answers viewable by all"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Users can create answers"
  ON answers FOR INSERT
  WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Users can update own answers"
  ON answers FOR UPDATE
  USING (auth.uid()::text = author_id::text);

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

CREATE POLICY "Reviews viewable by all"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid()::text = reviewer_id::text);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid()::text = reviewer_id::text);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Conversations
CREATE POLICY "Conversations visible to participants"
  ON conversations FOR SELECT
  USING (
    user1_id::text = auth.uid()::text OR
    user2_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id AND user_id::text = auth.uid()::text
    )
  );

-- Messages
CREATE POLICY "Messages visible to conversation participants"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE c.id = messages.conversation_id AND (
        c.user1_id::text = auth.uid()::text OR
        c.user2_id::text = auth.uid()::text OR
        cp.user_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- ============================================================================
-- VIDEOS POLICIES
-- ============================================================================

CREATE POLICY "Published videos viewable by all"
  ON videos FOR SELECT
  USING (status = 'published' OR uploader_id::text = auth.uid()::text);

CREATE POLICY "Users can upload videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid()::text = uploader_id::text);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  USING (auth.uid()::text = uploader_id::text);

-- ============================================================================
-- REPORTS POLICIES
-- ============================================================================

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid()::text = reporter_id::text);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (
    reporter_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM admin_users WHERE user_id::text = auth.uid()::text)
  );

-- ============================================================================
-- ADMIN TABLES POLICIES
-- ============================================================================

-- Admin Users - Only admins can access
CREATE POLICY "Admin users only"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN users u ON u.id = au.user_id
      WHERE u.id::text = auth.uid()::text
    )
  );

-- System Settings
CREATE POLICY "Settings readable by all"
  ON system_settings FOR SELECT
  USING (true);

CREATE POLICY "Settings writable by admins only"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- AI KNOWLEDGE BASE POLICIES
-- ============================================================================

CREATE POLICY "Knowledge base readable by all"
  ON ai_knowledge_base FOR SELECT
  USING (status = 'published');

-- AI Conversations
CREATE POLICY "AI conversations own access"
  ON ai_conversations FOR ALL
  USING (user_id::text = auth.uid()::text);

-- ============================================================================
-- CALCULATORS POLICIES
-- ============================================================================

CREATE POLICY "Calculators readable by all"
  ON calculators FOR SELECT
  USING (is_active = true);

CREATE POLICY "Calculator history own access"
  ON calculator_history FOR ALL
  USING (user_id::text = auth.uid()::text);

-- ============================================================================
-- PRICE LISTS POLICIES
-- ============================================================================

CREATE POLICY "Active price lists viewable by all"
  ON price_lists FOR SELECT
  USING (is_active = true);

CREATE POLICY "Price list items viewable by all"
  ON price_list_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM price_lists WHERE id = price_list_items.price_list_id AND is_active = true)
  );

-- ============================================================================
-- STORAGE POLICIES (for Supabase Storage)
-- ============================================================================

-- Note: Run these in Supabase Storage policies section
-- Bucket: avatars
-- Policy: Allow public read, authenticated write to own folder

-- Bucket: posts
-- Policy: Allow public read, authenticated write

-- Bucket: products
-- Policy: Allow public read, sellers can write

-- Bucket: documents
-- Policy: Private bucket, only owner can access

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a resource
CREATE OR REPLACE FUNCTION is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN resource_user_id::text = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================

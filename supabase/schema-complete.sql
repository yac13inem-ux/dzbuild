-- ============================================================================
-- DzBuild - Complete PostgreSQL Schema for Civil Engineering & Construction Platform
-- Compatible with Supabase
-- Version: 2.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User Roles
CREATE TYPE user_role AS ENUM (
  'CIVIL_ENGINEER',
  'CONTRACTOR',
  'ENGINEERING_OFFICE',
  'CRAFTSMAN',
  'CONSTRUCTION_COMPANY',
  'STORE_FACTORY',
  'REAL_ESTATE',
  'NORMAL_USER',
  'ADMIN'
);

-- Verification Status
CREATE TYPE verification_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'suspended'
);

-- Craftsmen Specialties
CREATE TYPE craftsman_specialty AS ENUM (
  'plumber',
  'electrician',
  'builder',
  'painter',
  'carpenter',
  'tiler',
  'welder',
  'roofer',
  'mason',
  'locksmith',
  'hvac',
  'glazier',
  'flooring',
  'insulation',
  'landscaper',
  'other'
);

-- Project Status
CREATE TYPE project_status AS ENUM (
  'draft',
  'open',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
);

-- Order Status
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Listing Status
CREATE TYPE listing_status AS ENUM (
  'active',
  'sold',
  'rented',
  'expired',
  'pending',
  'rejected'
);

-- Content Status
CREATE TYPE content_status AS ENUM (
  'draft',
  'published',
  'archived',
  'pending_review',
  'rejected'
);

-- Payment Status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- Ad Status
CREATE TYPE ad_status AS ENUM (
  'draft',
  'pending',
  'active',
  'paused',
  'completed',
  'rejected'
);

-- Report Status
CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

-- Notification Type
CREATE TYPE notification_type AS ENUM (
  'message',
  'like',
  'comment',
  'follow',
  'review',
  'booking',
  'order',
  'system',
  'promotion',
  'project',
  'job',
  'course'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ============================================================================
-- USERS TABLE (Main authentication table - extends Supabase auth.users)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  role user_role NOT NULL DEFAULT 'NORMAL_USER',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  verification_status verification_status DEFAULT 'pending',
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- PROFILES TABLE (Extended user information)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- Contact Info
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  website VARCHAR(255),
  
  -- Location
  country VARCHAR(100) DEFAULT 'Algeria',
  wilaya VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Social Links
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  twitter_url VARCHAR(255),
  
  -- Stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  
  -- Settings
  language VARCHAR(10) DEFAULT 'ar',
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT false,
  show_location BOOLEAN DEFAULT true,
  
  -- Professional Info
  experience_years INTEGER DEFAULT 0,
  education TEXT,
  certifications TEXT[],
  awards TEXT[],
  
  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_name ON profiles USING gin(name gin_trgm_ops);
CREATE INDEX idx_profiles_wilaya ON profiles(wilaya);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_rating ON profiles(rating DESC);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_featured ON profiles(is_featured) WHERE is_featured = true;

-- ============================================================================
-- ROLE-SPECIFIC PROFILES
-- ============================================================================

-- CIVIL ENGINEERS PROFILE
CREATE TABLE engineer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional Info
  license_number VARCHAR(100),
  specialization VARCHAR(255),
  sub_specializations TEXT[],
  education_level VARCHAR(100),
  university VARCHAR(255),
  graduation_year INTEGER,
  
  -- Work Info
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  years_of_experience INTEGER DEFAULT 0,
  
  -- Certifications
  professional_license VARCHAR(255),
  certifications JSONB DEFAULT '[]',
  memberships TEXT[],
  
  -- Expertise
  expertise_areas TEXT[],
  project_types TEXT[],
  software_skills TEXT[],
  
  -- Portfolio
  portfolio_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  
  -- Services
  consultation_fee DECIMAL(10, 2),
  available_for_consultation BOOLEAN DEFAULT true,
  available_for_projects BOOLEAN DEFAULT true,
  
  -- Stats
  projects_completed INTEGER DEFAULT 0,
  consultations_count INTEGER DEFAULT 0,
  
  -- Documents
  cv_url TEXT,
  license_document_url TEXT,
  certifications_urls TEXT[],
  
  -- Verification
  is_licensed_verified BOOLEAN DEFAULT false,
  license_verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engineer_profiles_specialization ON engineer_profiles(specialization);
CREATE INDEX idx_engineer_profiles_experience ON engineer_profiles(years_of_experience DESC);
CREATE INDEX idx_engineer_profiles_available ON engineer_profiles(available_for_consultation) WHERE available_for_consultation = true;

-- CONTRACTORS PROFILE
CREATE TABLE contractor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Company/Business Info
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  
  -- Scope
  specialization VARCHAR(255),
  project_types TEXT[],
  work_categories TEXT[],
  
  -- Capacity
  team_size INTEGER DEFAULT 1,
  max_concurrent_projects INTEGER DEFAULT 1,
  equipment_owned TEXT[],
  
  -- Financial
  annual_revenue_range VARCHAR(50),
  insurance_coverage DECIMAL(15, 2),
  bond_capacity DECIMAL(15, 2),
  
  -- Work Areas
  service_wilayas TEXT[],
  service_national BOOLEAN DEFAULT false,
  
  -- Portfolio
  portfolio_urls TEXT[],
  project_images TEXT[],
  
  -- Stats
  projects_completed INTEGER DEFAULT 0,
  projects_in_progress INTEGER DEFAULT 0,
  total_contract_value DECIMAL(20, 2) DEFAULT 0,
  
  -- Documents
  business_license_url TEXT,
  insurance_document_url TEXT,
  portfolio_document_url TEXT,
  
  -- Verification
  is_verified_contractor BOOLEAN DEFAULT false,
  verification_level VARCHAR(50) DEFAULT 'basic',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contractor_business_name ON contractor_profiles USING gin(business_name gin_trgm_ops);
CREATE INDEX idx_contractor_specialization ON contractor_profiles(specialization);

-- CRAFTSMEN PROFILE
CREATE TABLE craftsman_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional Info
  specialty craftsman_specialty NOT NULL,
  other_specialty VARCHAR(255),
  secondary_specialties craftsman_specialty[],
  
  -- Skills & Experience
  years_of_experience INTEGER DEFAULT 0,
  skills TEXT[],
  tools_owned TEXT[],
  
  -- Work Info
  work_type VARCHAR(50) DEFAULT 'independent', -- independent, company, freelance
  team_size INTEGER DEFAULT 1,
  
  -- Services
  services_offered TEXT[],
  service_radius_km INTEGER DEFAULT 20,
  available_for_emergency BOOLEAN DEFAULT false,
  available_weekends BOOLEAN DEFAULT true,
  available_evenings BOOLEAN DEFAULT false,
  
  -- Pricing
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  minimum_call_out_fee DECIMAL(10, 2),
  offers_free_quotes BOOLEAN DEFAULT true,
  
  -- Work Areas
  service_wilayas TEXT[],
  primary_wilaya VARCHAR(100),
  
  -- Portfolio
  work_samples TEXT[],
  before_after_photos TEXT[],
  
  -- Stats
  jobs_completed INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  on_time_rate DECIMAL(5, 2) DEFAULT 0,
  repeat_customer_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Verification
  is_verified_craftsman BOOLEAN DEFAULT false,
  background_check_verified BOOLEAN DEFAULT false,
  id_verified BOOLEAN DEFAULT false,
  
  -- Documents
  id_document_url TEXT,
  work_samples_urls TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_craftsman_specialty ON craftsman_profiles(specialty);
CREATE INDEX idx_craftsman_wilaya ON craftsman_profiles(primary_wilaya);
CREATE INDEX idx_craftsman_rating ON craftsman_profiles(user_id) WHERE (SELECT rating FROM profiles WHERE user_id = craftsman_profiles.user_id) > 4;

-- ENGINEERING OFFICE PROFILE
CREATE TABLE engineering_office_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Company Info
  office_name VARCHAR(255) NOT NULL,
  commercial_name VARCHAR(255),
  registration_number VARCHAR(100) UNIQUE,
  tax_id VARCHAR(100),
  
  -- Contact
  headquarters_address TEXT,
  headquarters_wilaya VARCHAR(100),
  headquarters_city VARCHAR(100),
  
  -- Business Info
  establishment_year INTEGER,
  business_type VARCHAR(50),
  capital DECIMAL(15, 2),
  
  -- Team
  total_employees INTEGER DEFAULT 1,
  engineers_count INTEGER DEFAULT 0,
  architects_count INTEGER DEFAULT 0,
  technicians_count INTEGER DEFAULT 0,
  
  -- Services
  services_offered TEXT[],
  specializations TEXT[],
  project_types TEXT[],
  
  -- Capacity
  max_concurrent_projects INTEGER DEFAULT 5,
  
  -- Coverage
  service_areas TEXT[],
  operates_nationally BOOLEAN DEFAULT false,
  operates_internationally BOOLEAN DEFAULT false,
  
  -- Certifications
  certifications JSONB DEFAULT '[]',
  iso_certified BOOLEAN DEFAULT false,
  iso_standards TEXT[],
  
  -- Portfolio
  notable_projects JSONB DEFAULT '[]',
  portfolio_urls TEXT[],
  
  -- Stats
  projects_completed INTEGER DEFAULT 0,
  total_project_value DECIMAL(20, 2) DEFAULT 0,
  
  -- Documents
  registration_document_url TEXT,
  insurance_document_url TEXT,
  certifications_urls TEXT[],
  
  -- Verification
  is_verified_office BOOLEAN DEFAULT false,
  verification_level VARCHAR(50) DEFAULT 'basic',
  
  -- Branches
  branches JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engineering_office_name ON engineering_office_profiles USING gin(office_name gin_trgm_ops);
CREATE INDEX idx_engineering_office_wilaya ON engineering_office_profiles(headquarters_wilaya);
CREATE INDEX idx_engineering_office_services ON engineering_office_profiles USING gin(services_offered);

-- CONSTRUCTION COMPANY PROFILE
CREATE TABLE construction_company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Company Info
  company_name VARCHAR(255) NOT NULL,
  commercial_name VARCHAR(255),
  registration_number VARCHAR(100) UNIQUE,
  tax_id VARCHAR(100),
  
  -- Contact
  headquarters_address TEXT,
  headquarters_wilaya VARCHAR(100),
  headquarters_city VARCHAR(100),
  
  -- Business Info
  establishment_year INTEGER,
  company_type VARCHAR(50),
  capital DECIMAL(20, 2),
  annual_revenue DECIMAL(20, 2),
  
  -- Team
  total_employees INTEGER DEFAULT 1,
  engineers_count INTEGER DEFAULT 0,
  skilled_workers_count INTEGER DEFAULT 0,
  administrative_staff_count INTEGER DEFAULT 0,
  
  -- Equipment
  equipment_owned JSONB DEFAULT '[]',
  equipment_rented JSONB DEFAULT '[]',
  
  -- Services
  services_offered TEXT[],
  construction_types TEXT[],
  project_categories TEXT[],
  
  -- Capacity
  max_concurrent_projects INTEGER DEFAULT 5,
  bonding_capacity DECIMAL(20, 2),
  
  -- Coverage
  operation_areas TEXT[],
  operates_nationally BOOLEAN DEFAULT false,
  operates_internationally BOOLEAN DEFAULT false,
  
  -- Certifications
  certifications JSONB DEFAULT '[]',
  quality_certifications TEXT[],
  safety_certifications TEXT[],
  
  -- Portfolio
  completed_projects JSONB DEFAULT '[]',
  ongoing_projects JSONB DEFAULT '[]',
  portfolio_urls TEXT[],
  
  -- Stats
  total_projects_completed INTEGER DEFAULT 0,
  total_project_value DECIMAL(25, 2) DEFAULT 0,
  largest_project_value DECIMAL(20, 2),
  
  -- Documents
  registration_document_url TEXT,
  insurance_document_url TEXT,
  certifications_urls TEXT[],
  
  -- Verification
  is_verified_company BOOLEAN DEFAULT false,
  verification_level VARCHAR(50) DEFAULT 'basic',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_construction_company_name ON construction_company_profiles USING gin(company_name gin_trgm_ops);
CREATE INDEX idx_construction_company_wilaya ON construction_company_profiles(headquarters_wilaya);

-- STORE/FACTORY PROFILE
CREATE TABLE store_factory_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Business Info
  business_name VARCHAR(255) NOT NULL,
  commercial_name VARCHAR(255),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  business_type VARCHAR(50), -- store, factory, distributor, wholesaler
  
  -- Contact
  address TEXT,
  wilaya VARCHAR(100),
  city VARCHAR(100),
  
  -- Operations
  establishment_year INTEGER,
  facility_size_sqm DECIMAL(15, 2),
  warehouse_size_sqm DECIMAL(15, 2),
  
  -- Products
  product_categories TEXT[],
  brands_carried TEXT[],
  manufactures_own_products BOOLEAN DEFAULT false,
  
  -- Services
  offers_delivery BOOLEAN DEFAULT false,
  delivery_areas TEXT[],
  delivery_fees JSONB DEFAULT '{}',
  minimum_order_value DECIMAL(10, 2),
  offers_installation BOOLEAN DEFAULT false,
  
  -- Payment
  accepted_payment_methods TEXT[],
  offers_credit BOOLEAN DEFAULT false,
  credit_terms VARCHAR(100),
  
  -- Hours
  working_hours JSONB DEFAULT '{}',
  open_on_saturdays BOOLEAN DEFAULT true,
  open_on_sundays BOOLEAN DEFAULT false,
  
  -- Branches
  branch_count INTEGER DEFAULT 1,
  branches JSONB DEFAULT '[]',
  
  -- Stats
  products_count INTEGER DEFAULT 0,
  orders_fulfilled INTEGER DEFAULT 0,
  average_delivery_days INTEGER,
  
  -- Documents
  registration_document_url TEXT,
  certifications_urls TEXT[],
  
  -- Verification
  is_verified_business BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_store_factory_name ON store_factory_profiles USING gin(business_name gin_trgm_ops);
CREATE INDEX idx_store_factory_wilaya ON store_factory_profiles(wilaya);
CREATE INDEX idx_store_factory_categories ON store_factory_profiles USING gin(product_categories);

-- REAL ESTATE PROFILE
CREATE TABLE real_estate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Business Info
  agency_name VARCHAR(255) NOT NULL,
  commercial_name VARCHAR(255),
  license_number VARCHAR(100),
  
  -- Contact
  address TEXT,
  wilaya VARCHAR(100),
  city VARCHAR(100),
  
  -- Operations
  establishment_year INTEGER,
  
  -- Specializations
  property_types TEXT[],
  services_offered TEXT[],
  
  -- Coverage
  coverage_areas TEXT[],
  
  -- Stats
  active_listings INTEGER DEFAULT 0,
  successful_deals INTEGER DEFAULT 0,
  
  -- Verification
  is_licensed BOOLEAN DEFAULT false,
  license_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_real_estate_name ON real_estate_profiles USING gin(agency_name gin_trgm_ops);

-- ============================================================================
-- FOLLOW SYSTEM
-- ============================================================================

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ============================================================================
-- POSTS AND CONTENT
-- ============================================================================

-- POSTS TABLE
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(500),
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'text', -- text, image, video, article, project, question
  
  -- Media
  images TEXT[],
  videos TEXT[],
  attachments TEXT[],
  
  -- Categorization
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Visibility
  visibility VARCHAR(20) DEFAULT 'public', -- public, followers, private
  is_featured BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Status
  status content_status DEFAULT 'published',
  
  -- Location
  location_name VARCHAR(255),
  wilaya VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_wilaya ON posts(wilaya);
CREATE INDEX idx_posts_tags ON posts USING gin(tags);
CREATE INDEX idx_posts_content ON posts USING gin(content gin_trgm_ops);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = true;

-- POST LIKES
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- POST COMMENTS
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  images TEXT[],
  
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- COMMENT LIKES
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(comment_id, user_id)
);

-- SAVED POSTS
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_name VARCHAR(100) DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_saved_posts_user ON saved_posts(user_id);

-- ============================================================================
-- CRAFTSMEN DIRECTORY
-- ============================================================================

-- CRAFTSMAN SERVICES
CREATE TABLE craftsman_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  craftsman_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2),
  price_unit VARCHAR(50), -- hour, day, m2, unit, fixed
  estimated_duration_hours DECIMAL(5, 2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_craftsman_services_craftsman ON craftsman_services(craftsman_id);
CREATE INDEX idx_craftsman_services_name ON craftsman_services USING gin(service_name gin_trgm_ops);

-- CRAFTSMAN BOOKINGS
CREATE TABLE craftsman_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  craftsman_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES craftsman_services(id) ON DELETE SET NULL,
  
  -- Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  wilaya VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Scheduling
  requested_date DATE,
  requested_time TIME,
  confirmed_date DATE,
  confirmed_time TIME,
  duration_hours DECIMAL(5, 2),
  
  -- Pricing
  quoted_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'DZD',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
  
  -- Contact
  client_phone VARCHAR(20),
  client_name VARCHAR(255),
  
  -- Notes
  notes TEXT,
  cancellation_reason TEXT,
  
  -- Rating
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  client_review TEXT,
  craftsman_rating INTEGER CHECK (craftsman_rating >= 1 AND craftsman_rating <= 5),
  craftsman_review TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_craftsman_bookings_craftsman ON craftsman_bookings(craftsman_id);
CREATE INDEX idx_craftsman_bookings_client ON craftsman_bookings(client_id);
CREATE INDEX idx_craftsman_bookings_status ON craftsman_bookings(status);
CREATE INDEX idx_craftsman_bookings_date ON craftsman_bookings(requested_date);

-- ============================================================================
-- PROJECTS MARKETPLACE
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  project_type VARCHAR(100),
  category VARCHAR(100),
  
  -- Location
  location_name TEXT,
  wilaya VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Budget
  budget_min DECIMAL(15, 2),
  budget_max DECIMAL(15, 2),
  budget_type VARCHAR(50) DEFAULT 'fixed', -- fixed, hourly, negotiable
  
  -- Timeline
  estimated_duration_days INTEGER,
  start_date DATE,
  end_date DATE,
  deadline DATE,
  
  -- Requirements
  required_skills TEXT[],
  required_equipment TEXT[],
  required_certifications TEXT[],
  
  -- Scope
  scope_of_work TEXT,
  deliverables TEXT[],
  materials_included BOOLEAN DEFAULT false,
  
  -- Media
  images TEXT[],
  documents TEXT[],
  blueprints TEXT[],
  
  -- Bidding
  bidding_enabled BOOLEAN DEFAULT true,
  bid_deadline TIMESTAMP WITH TIME ZONE,
  bids_count INTEGER DEFAULT 0,
  
  -- Status
  status project_status DEFAULT 'open',
  
  -- Assigned
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  
  -- Completion
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_wilaya ON projects(wilaya);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_budget ON projects(budget_max);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_title ON projects USING gin(title gin_trgm_ops);

-- PROJECT BIDS
CREATE TABLE project_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Bid Details
  bid_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  
  -- Proposal
  proposal TEXT NOT NULL,
  estimated_duration_days INTEGER,
  
  -- Terms
  payment_terms TEXT,
  milestones JSONB DEFAULT '[]',
  
  -- Attachments
  attachments TEXT[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, bidder_id)
);

CREATE INDEX idx_project_bids_project ON project_bids(project_id);
CREATE INDEX idx_project_bids_bidder ON project_bids(bidder_id);

-- ============================================================================
-- MARKETPLACE - PRODUCTS
-- ============================================================================

-- PRODUCT CATEGORIES
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  name_fr VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  icon VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  
  -- Basic Info
  name VARCHAR(500) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  brand VARCHAR(255),
  model VARCHAR(255),
  
  -- Pricing
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'DZD',
  
  -- Inventory
  quantity INTEGER DEFAULT 0,
  quantity_unit VARCHAR(50), -- piece, m, m2, m3, kg, ton, box
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  
  -- Dimensions
  weight_kg DECIMAL(10, 3),
  length_cm DECIMAL(10, 2),
  width_cm DECIMAL(10, 2),
  height_cm DECIMAL(10, 2),
  
  -- Attributes
  attributes JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  
  -- Media
  images TEXT[],
  videos TEXT[],
  
  -- Status
  status listing_status DEFAULT 'active',
  is_published BOOLEAN DEFAULT true,
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(500),
  meta_description TEXT,
  slug VARCHAR(500) UNIQUE,
  
  -- Location (for pickup)
  pickup_address TEXT,
  pickup_wilaya VARCHAR(100),
  pickup_city VARCHAR(100),
  
  -- Delivery
  offers_delivery BOOLEAN DEFAULT false,
  delivery_options JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- PRODUCT PRICE HISTORY
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'DZD',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON product_price_history(product_id);

-- WISHLIST
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Items
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal DECIMAL(15, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  
  -- Delivery
  delivery_method VARCHAR(50),
  delivery_address TEXT,
  delivery_wilaya VARCHAR(100),
  delivery_city VARCHAR(100),
  delivery_phone VARCHAR(20),
  delivery_notes TEXT,
  
  -- Payment
  payment_method VARCHAR(50),
  payment_status payment_status DEFAULT 'pending',
  payment_reference VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status order_status DEFAULT 'pending',
  
  -- Tracking
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  buyer_notes TEXT,
  seller_notes TEXT,
  cancellation_reason TEXT,
  
  -- Rating
  buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  buyer_review TEXT,
  seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),
  seller_review TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================================
-- REAL ESTATE LISTINGS
-- ============================================================================

CREATE TABLE real_estate_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Property Type
  property_type VARCHAR(100) NOT NULL, -- apartment, house, villa, land, commercial, office
  listing_type VARCHAR(50) NOT NULL, -- sale, rent, lease
  
  -- Location
  wilaya VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  neighborhood VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property Details
  total_area_m2 DECIMAL(10, 2),
  living_area_m2 DECIMAL(10, 2),
  land_area_m2 DECIMAL(10, 2),
  
  bedrooms INTEGER,
  bathrooms INTEGER,
  kitchens INTEGER,
  living_rooms INTEGER,
  
  floors INTEGER,
  floor_number INTEGER,
  total_floors INTEGER,
  
  year_built INTEGER,
  
  -- Features
  features JSONB DEFAULT '{}',
  amenities TEXT[],
  
  -- Parking
  parking_type VARCHAR(50),
  parking_spaces INTEGER,
  
  -- Pricing
  price DECIMAL(15, 2) NOT NULL,
  price_per_m2 DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'DZD',
  
  -- For Rent
  rent_frequency VARCHAR(50), -- monthly, quarterly, yearly
  
  -- Fees
  agency_fee DECIMAL(10, 2),
  security_deposit DECIMAL(15, 2),
  
  -- Media
  images TEXT[],
  videos TEXT[],
  virtual_tour_url VARCHAR(500),
  
  -- Status
  status listing_status DEFAULT 'active',
  
  -- Availability
  available_from DATE,
  available_until DATE,
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Contact
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_real_estate_seller ON real_estate_listings(seller_id);
CREATE INDEX idx_real_estate_type ON real_estate_listings(property_type);
CREATE INDEX idx_real_estate_listing_type ON real_estate_listings(listing_type);
CREATE INDEX idx_real_estate_wilaya ON real_estate_listings(wilaya);
CREATE INDEX idx_real_estate_price ON real_estate_listings(price);
CREATE INDEX idx_real_estate_status ON real_estate_listings(status);
CREATE INDEX idx_real_estate_title ON real_estate_listings USING gin(title gin_trgm_ops);

-- ============================================================================
-- JOBS
-- ============================================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  
  -- Job Details
  job_type VARCHAR(50), -- full_time, part_time, contract, freelance, internship
  employment_type VARCHAR(50), -- permanent, temporary, seasonal
  
  -- Category
  category VARCHAR(100),
  specialty VARCHAR(255),
  
  -- Location
  location_type VARCHAR(50) DEFAULT 'onsite', -- onsite, remote, hybrid
  wilaya VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  
  -- Experience
  experience_level VARCHAR(50), -- entry, junior, mid, senior, expert
  min_experience_years INTEGER,
  max_experience_years INTEGER,
  
  -- Education
  education_level VARCHAR(100),
  field_of_study VARCHAR(255),
  
  -- Salary
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  salary_type VARCHAR(50), -- monthly, hourly, yearly
  currency VARCHAR(3) DEFAULT 'DZD',
  salary_negotiable BOOLEAN DEFAULT true,
  
  -- Requirements
  required_skills TEXT[],
  preferred_skills TEXT[],
  certifications_required TEXT[],
  languages_required TEXT[],
  
  -- Benefits
  benefits TEXT[],
  
  -- Positions
  positions_available INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,
  
  -- Application
  application_deadline DATE,
  application_url VARCHAR(500),
  application_email VARCHAR(255),
  
  -- Media
  company_logo_url TEXT,
  
  -- Status
  status content_status DEFAULT 'published',
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_wilaya ON jobs(wilaya);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_title ON jobs USING gin(title gin_trgm_ops);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- JOB APPLICATIONS
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url VARCHAR(500),
  
  -- Expected Salary
  expected_salary DECIMAL(12, 2),
  
  -- Availability
  available_from DATE,
  notice_period_days INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, shortlisted, interviewed, offered, hired, rejected
  
  -- Notes
  employer_notes TEXT,
  
  -- Timeline
  reviewed_at TIMESTAMP WITH TIME ZONE,
  interviewed_at TIMESTAMP WITH TIME ZONE,
  offered_at TIMESTAMP WITH TIME ZONE,
  hired_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);

-- ============================================================================
-- TRAINING COURSES
-- ============================================================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Category
  category VARCHAR(100),
  subcategory VARCHAR(100),
  level VARCHAR(50), -- beginner, intermediate, advanced
  
  -- Content
  curriculum TEXT[],
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  
  -- Media
  thumbnail_url TEXT,
  preview_video_url TEXT,
  
  -- Pricing
  price DECIMAL(10, 2) DEFAULT 0,
  original_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'DZD',
  is_free BOOLEAN DEFAULT false,
  
  -- Duration
  total_duration_minutes INTEGER,
  lessons_count INTEGER DEFAULT 0,
  
  -- Format
  format VARCHAR(50) DEFAULT 'online', -- online, in_person, hybrid
  location TEXT,
  
  -- Language
  language VARCHAR(10) DEFAULT 'ar',
  has_subtitles BOOLEAN DEFAULT false,
  subtitle_languages TEXT[],
  
  -- Certificate
  provides_certificate BOOLEAN DEFAULT false,
  certificate_template_url TEXT,
  
  -- Status
  status content_status DEFAULT 'draft',
  
  -- Stats
  enrolled_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_title ON courses USING gin(title gin_trgm_ops);

-- COURSE LESSONS
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Content
  video_url TEXT,
  video_duration_seconds INTEGER,
  
  -- Resources
  resources TEXT[],
  
  -- Order
  sort_order INTEGER DEFAULT 0,
  
  -- Access
  is_preview BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_lessons_course ON course_lessons(course_id);

-- COURSE ENROLLMENTS
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Progress
  progress_percent INTEGER DEFAULT 0,
  completed_lessons TEXT[],
  current_lesson_id UUID REFERENCES course_lessons(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'enrolled', -- enrolled, in_progress, completed, dropped
  
  -- Completion
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  
  -- Payment
  paid_amount DECIMAL(10, 2),
  payment_status payment_status,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(course_id, student_id)
);

CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_student ON course_enrollments(student_id);

-- ============================================================================
-- QUESTIONS & ANSWERS (Community Problem Solving)
-- ============================================================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  
  -- Categorization
  category VARCHAR(100),
  tags TEXT[],
  
  -- Media
  images TEXT[],
  attachments TEXT[],
  
  -- Status
  is_solved BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  upvotes_count INTEGER DEFAULT 0,
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  
  -- Best Answer
  accepted_answer_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_author ON questions(author_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_tags ON questions USING gin(tags);
CREATE INDEX idx_questions_solved ON questions(is_solved);
CREATE INDEX idx_questions_created ON questions(created_at DESC);
CREATE INDEX idx_questions_title ON questions USING gin(title gin_trgm_ops);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  images TEXT[],
  
  -- Status
  is_accepted BOOLEAN DEFAULT false,
  
  -- Stats
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_author ON answers(author_id);
CREATE INDEX idx_answers_accepted ON answers(is_accepted) WHERE is_accepted = true;

-- QUESTION/ANSWER VOTES
CREATE TABLE qa_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  votable_type VARCHAR(50) NOT NULL, -- question, answer
  votable_id UUID NOT NULL,
  vote_value SMALLINT NOT NULL CHECK (vote_value IN (-1, 1)),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, votable_type, votable_id)
);

-- ============================================================================
-- ENGINEERING CONSULTATIONS
-- ============================================================================

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Request
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  consultation_type VARCHAR(100), -- structural, architectural, electrical, plumbing, general
  
  -- Project Context
  project_type VARCHAR(100),
  project_location TEXT,
  
  -- Media
  attachments TEXT[],
  blueprints TEXT[],
  photos TEXT[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
  
  -- Scheduling
  preferred_date DATE,
  preferred_time TIME,
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Duration
  estimated_duration_minutes INTEGER DEFAULT 60,
  actual_duration_minutes INTEGER,
  
  -- Payment
  fee DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'DZD',
  payment_status payment_status DEFAULT 'pending',
  
  -- Result
  notes TEXT,
  report_url TEXT,
  
  -- Rating
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  client_review TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consultations_client ON consultations(client_id);
CREATE INDEX idx_consultations_engineer ON consultations(engineer_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_type ON consultations(consultation_type);

-- ============================================================================
-- REVIEWS AND RATINGS
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reference
  reference_type VARCHAR(50) NOT NULL, -- user, product, project, service, course, consultation
  reference_id UUID,
  
  -- Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  
  -- Media
  images TEXT[],
  
  -- Categorization
  category VARCHAR(100),
  
  -- Stats
  helpful_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Response
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(reviewer_id, reviewee_id, reference_type, reference_id)
);

CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_reference ON reviews(reference_type, reference_id);

-- REVIEW HELPfulness
CREATE TABLE review_helpfulness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

-- CONVERSATIONS
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Type
  conversation_type VARCHAR(50) DEFAULT 'direct', -- direct, group
  
  -- For direct messages
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- For group chats
  group_name VARCHAR(255),
  group_image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Last message preview
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);

-- CONVERSATION PARTICIPANTS (for group chats)
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Permissions
  role VARCHAR(50) DEFAULT 'member', -- admin, member
  
  -- Status
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  -- Unread
  last_read_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  
  -- Notifications
  notifications_enabled BOOLEAN DEFAULT true,
  
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT,
  
  -- Media
  attachments TEXT[],
  images TEXT[],
  
  -- Type
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, location, contact
  
  -- Location
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Reply
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- Status
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Read by
  read_by UUID[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- MESSAGE REACTIONS
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction VARCHAR(50) NOT NULL, -- emoji or reaction type
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(message_id, user_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Type
  type notification_type NOT NULL,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  -- Reference
  reference_type VARCHAR(50),
  reference_id UUID,
  
  -- Sender
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Action
  action_url VARCHAR(500),
  
  -- Delivery
  delivered_email BOOLEAN DEFAULT false,
  delivered_push BOOLEAN DEFAULT false,
  delivered_sms BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- ADVERTISEMENTS
-- ============================================================================

CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  
  -- Link
  link_url VARCHAR(500),
  link_text VARCHAR(100),
  
  -- Type
  ad_type VARCHAR(50) NOT NULL, -- banner, video, native, sponsored_post
  position VARCHAR(50) NOT NULL, -- home_top, home_middle, sidebar, feed, search, etc.
  
  -- Targeting
  target_audience JSONB DEFAULT '{}',
  target_locations TEXT[],
  target_roles TEXT[],
  target_interests TEXT[],
  
  -- Schedule
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Budget
  budget DECIMAL(12, 2),
  spent DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'DZD',
  pricing_model VARCHAR(50), -- cpm, cpc, cpa
  
  -- Stats
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5, 4) DEFAULT 0,
  
  -- Status
  status ad_status DEFAULT 'pending',
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ads_advertiser ON advertisements(advertiser_id);
CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_ads_position ON advertisements(position);
CREATE INDEX idx_ads_dates ON advertisements(start_date, end_date);

-- AD CLICKS
CREATE TABLE ad_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  
  -- Location
  country VARCHAR(100),
  city VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ad_clicks_ad ON ad_clicks(ad_id);

-- ============================================================================
-- VIDEO LIBRARY
-- ============================================================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Media
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  
  -- Type
  video_type VARCHAR(50) DEFAULT 'tutorial', -- tutorial, documentary, project_showcase, tips, webinar
  
  -- Category
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  
  -- Visibility
  visibility VARCHAR(20) DEFAULT 'public',
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Status
  status content_status DEFAULT 'published',
  
  -- Featured
  is_featured BOOLEAN DEFAULT false,
  
  -- Duration tiers
  duration_tier VARCHAR(20), -- short, medium, long
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_uploader ON videos(uploader_id);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_type ON videos(video_type);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_title ON videos USING gin(title gin_trgm_ops);
CREATE INDEX idx_videos_created ON videos(created_at DESC);

-- VIDEO LIKES
CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(video_id, user_id)
);

-- VIDEO COMMENTS
CREATE TABLE video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AI KNOWLEDGE BASE
-- ============================================================================

CREATE TABLE ai_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  
  -- Category
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  
  -- Type
  content_type VARCHAR(50) DEFAULT 'article', -- article, faq, guide, standard, formula, tip
  
  -- Metadata
  source VARCHAR(255),
  author VARCHAR(255),
  publication_date DATE,
  
  -- Relevance
  keywords TEXT[],
  related_topics TEXT[],
  
  -- Embedding for AI search
  embedding VECTOR(1536),
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  -- Status
  status content_status DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_kb_category ON ai_knowledge_base(category);
CREATE INDEX idx_ai_kb_tags ON ai_knowledge_base USING gin(tags);
CREATE INDEX idx_ai_kb_title ON ai_knowledge_base USING gin(title gin_trgm_ops);

-- AI CONVERSATION HISTORY
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context
  title VARCHAR(255),
  
  -- Messages
  messages JSONB DEFAULT '[]',
  
  -- Stats
  message_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id);

-- ============================================================================
-- CONSTRUCTION CALCULATORS
-- ============================================================================

CREATE TABLE calculators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Info
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  name_fr VARCHAR(255),
  description TEXT,
  
  -- Category
  category VARCHAR(100),
  
  -- Formula
  formula JSONB NOT NULL,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  
  -- UI
  icon VARCHAR(100),
  image_url TEXT,
  
  -- Order
  sort_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER CALCULATOR HISTORY
CREATE TABLE calculator_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  calculator_id UUID NOT NULL REFERENCES calculators(id) ON DELETE CASCADE,
  
  -- Input values
  input_values JSONB NOT NULL,
  
  -- Results
  results JSONB NOT NULL,
  
  -- Notes
  notes TEXT,
  project_name VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calc_history_user ON calculator_history(user_id);
CREATE INDEX idx_calc_history_calculator ON calculator_history(calculator_id);

-- ============================================================================
-- PRICE LISTS
-- ============================================================================

CREATE TABLE price_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Coverage
  wilayas TEXT[],
  is_national BOOLEAN DEFAULT false,
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE price_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  
  -- Item
  item_name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- Pricing
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  unit VARCHAR(50), -- m, m2, m3, piece, kg, ton, bag
  
  -- Details
  brand VARCHAR(255),
  specifications TEXT,
  
  -- Availability
  in_stock BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_price_list_items_list ON price_list_items(price_list_id);
CREATE INDEX idx_price_list_items_name ON price_list_items USING gin(item_name gin_trgm_ops);
CREATE INDEX idx_price_list_items_category ON price_list_items(category);

-- ============================================================================
-- REPORTS AND MODERATION
-- ============================================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reported content
  content_type VARCHAR(50) NOT NULL, -- user, post, comment, product, project, review, message
  content_id UUID NOT NULL,
  
  -- Reason
  reason VARCHAR(100) NOT NULL, -- spam, inappropriate, harassment, fraud, fake, other
  description TEXT,
  
  -- Evidence
  evidence_urls TEXT[],
  
  -- Status
  status report_status DEFAULT 'pending',
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  action_taken VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_content ON reports(content_type, content_id);

-- MODERATION LOGS
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Action
  action VARCHAR(100) NOT NULL,
  content_type VARCHAR(50),
  content_id UUID,
  user_id UUID REFERENCES users(id),
  
  -- Details
  reason TEXT,
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mod_logs_moderator ON moderation_logs(moderator_id);
CREATE INDEX idx_mod_logs_created ON moderation_logs(created_at DESC);

-- ============================================================================
-- ADMIN MANAGEMENT
-- ============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role
  admin_level VARCHAR(50) DEFAULT 'moderator', -- super_admin, admin, moderator
  
  -- Permissions
  permissions TEXT[],
  
  -- Departments
  departments TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  last_action_at TIMESTAMP WITH TIME ZONE,
  actions_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_users_user ON admin_users(user_id);

-- SYSTEM SETTINGS
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- ============================================================================
-- ANALYTICS AND TRACKING
-- ============================================================================

-- USER ACTIVITY
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Activity
  activity_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  
  -- Location
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created ON user_activity(created_at DESC);

-- PLATFORM STATISTICS (Daily Snapshots)
CREATE TABLE platform_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  
  -- Users
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  
  -- By Role
  engineers_count INTEGER DEFAULT 0,
  contractors_count INTEGER DEFAULT 0,
  craftsmen_count INTEGER DEFAULT 0,
  companies_count INTEGER DEFAULT 0,
  
  -- Content
  posts_created INTEGER DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  products_listed INTEGER DEFAULT 0,
  jobs_posted INTEGER DEFAULT 0,
  
  -- Engagement
  messages_sent INTEGER DEFAULT 0,
  reviews_posted INTEGER DEFAULT 0,
  consultations_booked INTEGER DEFAULT 0,
  
  -- Revenue
  ad_revenue DECIMAL(15, 2) DEFAULT 0,
  transaction_volume DECIMAL(20, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_platform_stats_date ON platform_stats(date DESC);

-- ============================================================================
-- HELPER FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp trigger to all relevant tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.columns 
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%s_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    ', t, t);
  END LOOP;
END;
$$;

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  order_num VARCHAR;
BEGIN
  order_num := 'DZB' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default product categories
INSERT INTO product_categories (name, name_ar, name_fr, slug, description) VALUES
('Ciment & Béton', 'الإسمنت والخرسانة', 'Ciment et Béton', 'cement-concrete', 'Ciment, béton prêt à l''emploi, mortier'),
('Fer & Acier', 'الحديد والصلب', 'Fer et Acier', 'iron-steel', 'Barres de fer, poutres, tôles'),
('Bois & Dérivés', 'الخشب ومشتقاته', 'Bois et Dérivés', 'wood-products', 'Bois de construction, contreplaqué'),
('Carrelage & Faïence', 'البلاط والقيشاني', 'Carrelage et Faïence', 'tiles', 'Carreaux, faïence, mosaïque'),
('Peinture & Enduits', 'الدهانات والطلاء', 'Peinture et Enduits', 'paints', 'Peintures, vernis, enduits'),
('Plomberie', 'السباكة', 'Plomberie', 'plumbing', 'Tubes, robinets, sanitaires'),
('Électricité', 'الكهرباء', 'Électricité', 'electrical', 'Câbles, interrupteurs, tableaux'),
('Isolation', 'العزل', 'Isolation', 'insulation', 'Isolation thermique et phonique'),
('Outillage', 'الأدوات', 'Outillage', 'tools', 'Outils manuels et électriques'),
('Quincaillerie', 'الحدادة', 'Quincaillerie', 'hardware', 'Vis, clous, serrures'),
('Serrurerie', 'النجارة المعدنية', 'Serrurerie', 'metalwork', 'Portes, fenêtres, portails'),
('Revetements', 'الأرضيات', 'Revêtements', 'flooring', 'Parquet, vinyle, moquette');

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('site_name', '"DzBuild"', 'Platform name'),
('site_description', '"Réseau social pour le génie civil et la construction en Algérie"', 'Platform description'),
('contact_email', '"contact@dzbuild.dz"', 'Contact email'),
('max_images_per_post', '10', 'Maximum images per post'),
('max_video_size_mb', '100', 'Maximum video size in MB'),
('featured_listing_price', '5000', 'Price for featured listing in DZD'),
('ad_min_budget', '10000', 'Minimum ad budget in DZD');

-- Create admin user placeholder (password should be changed)
INSERT INTO users (id, email, role, is_active, is_verified, verification_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@dzbuild.dz',
  'ADMIN',
  true,
  true,
  'verified'
);

INSERT INTO profiles (user_id, name, bio)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'System Administrator',
  'DzBuild Platform Administrator'
);

INSERT INTO admin_users (user_id, admin_level, permissions)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin',
  ARRAY['users:read', 'users:write', 'users:delete', 'content:read', 'content:write', 'content:delete', 'ads:read', 'ads:write', 'ads:delete', 'reports:read', 'reports:write', 'settings:read', 'settings:write']
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active craftsmen view
CREATE VIEW active_craftsmen AS
SELECT 
  u.id,
  p.name,
  p.avatar_url,
  p.wilaya,
  p.city,
  p.rating,
  p.reviews_count,
  cp.specialty,
  cp.years_of_experience,
  cp.hourly_rate,
  cp.daily_rate
FROM users u
JOIN profiles p ON u.id = p.user_id
JOIN craftsman_profiles cp ON u.id = cp.user_id
WHERE u.is_active = true AND u.verification_status = 'verified';

-- Featured products view
CREATE VIEW featured_products AS
SELECT 
  p.*,
  pr.name as seller_name,
  pr.avatar_url as seller_avatar,
  pc.name as category_name
FROM products p
JOIN users u ON p.seller_id = u.id
JOIN profiles pr ON u.id = pr.user_id
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.status = 'active' AND p.is_featured = true AND p.featured_until > NOW();

-- Open projects view
CREATE VIEW open_projects AS
SELECT 
  proj.*,
  p.name as client_name,
  p.avatar_url as client_avatar,
  p.rating as client_rating
FROM projects proj
JOIN users u ON proj.client_id = u.id
JOIN profiles p ON u.id = p.user_id
WHERE proj.status = 'open';

-- Recent questions view
CREATE VIEW recent_questions AS
SELECT 
  q.*,
  p.name as author_name,
  p.avatar_url as author_avatar,
  u.role as author_role
FROM questions q
JOIN users u ON q.author_id = u.id
JOIN profiles p ON u.id = p.user_id
WHERE q.is_closed = false
ORDER BY q.created_at DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- ===============================================
-- DzBuild - إنشاء جداول قاعدة البيانات
-- ===============================================
-- انسخ هذا الكود كاملاً والصقه في Supabase SQL Editor
-- https://supabase.com/dashboard/project/ecbmanzwvjoyenufmuib/sql
-- ===============================================

-- 1. جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'NORMAL_USER',
  wilaya TEXT,
  city TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  project_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنشورات
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'discussion',
  images TEXT,
  author_id TEXT,
  author_name TEXT DEFAULT 'زائر',
  edit_token TEXT UNIQUE,
  is_published BOOLEAN DEFAULT true,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول التعليقات
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT DEFAULT 'زائر',
  author_id TEXT,
  is_approved BOOLEAN DEFAULT true,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول المكتبة
CREATE TABLE IF NOT EXISTS library_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  title_ar TEXT,
  title_fr TEXT,
  description TEXT,
  category TEXT DEFAULT 'guide',
  file_url TEXT,
  thumbnail TEXT,
  tags TEXT,
  author TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الإعلانات
CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar',
  type TEXT DEFAULT 'image',
  duration_days INTEGER DEFAULT 30,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  clicks_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  target_audience TEXT DEFAULT 'all',
  wilaya TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول المنتجات (سوق البناء)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  category_id TEXT,
  price DECIMAL(12,2) DEFAULT 0,
  old_price DECIMAL(12,2),
  unit TEXT DEFAULT 'piece',
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  images TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  company_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول الوظائف
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'engineers',
  company_name TEXT,
  company_logo TEXT,
  wilaya TEXT,
  city TEXT,
  experience_level TEXT,
  salary_range TEXT,
  job_type TEXT DEFAULT 'full_time',
  contact_email TEXT,
  contact_phone TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول الشركات
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  name_fr TEXT,
  description TEXT,
  description_fr TEXT,
  type TEXT NOT NULL,
  logo TEXT,
  cover_image TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  wilaya TEXT,
  founded_year INTEGER,
  specialties TEXT[],
  services TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. جدول الحرفيين
CREATE TABLE IF NOT EXISTS craftsmen (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  category TEXT NOT NULL,
  city TEXT,
  wilaya TEXT,
  experience INTEGER,
  specializations TEXT[],
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. جدول المشاريع
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  title_ar TEXT,
  title_fr TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  status TEXT DEFAULT 'planning',
  progress INTEGER DEFAULT 0,
  location TEXT,
  city TEXT,
  wilaya TEXT,
  budget DECIMAL(15,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  images TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- إنشاء الفهارس لتحسين الأداء
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_ads_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_position ON advertisements(position);

CREATE INDEX IF NOT EXISTS idx_craftsmen_category ON craftsmen(category);
CREATE INDEX IF NOT EXISTS idx_craftsmen_active ON craftsmen(is_active);

CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

CREATE INDEX IF NOT EXISTS idx_library_category ON library_resources(category);
CREATE INDEX IF NOT EXISTS idx_library_published ON library_resources(is_published);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ===============================================
-- تعطيل RLS (Row Level Security) للتبسيط
-- يمكنك تفعيله لاحقاً إذا أردت
-- ===============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE library_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE craftsmen DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- ===============================================
-- تم! الجداول جاهزة للاستخدام
-- ===============================================

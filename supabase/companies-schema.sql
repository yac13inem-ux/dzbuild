-- =====================================================
-- جدول الشركات والمكاتب (Companies Directory)
-- =====================================================

-- جدول الشركات الرئيسي
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات أساسية
  name TEXT NOT NULL,
  name_fr TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  description_fr TEXT,
  
  -- نوع الشركة
  company_type TEXT NOT NULL DEFAULT 'CONSTRUCTION', -- BET, CONSTRUCTION, MATERIALS, SURVEY, ELECTRICAL_MECHANICAL
  
  -- معلومات الاتصال
  email TEXT,
  phone TEXT,
  phone2 TEXT,
  fax TEXT,
  website TEXT,
  
  -- العنوان
  address TEXT,
  city TEXT,
  wilaya TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- معلومات قانونية
  registration_number TEXT,
  tax_id TEXT,
  capital DECIMAL(15, 2),
  founded_year INTEGER,
  
  -- معلومات العمل
  employee_count_range TEXT, -- 1-10, 11-50, 51-200, 200+
  specialties TEXT[], -- تخصصات الشركة
  services TEXT[], -- الخدمات المقدمة
  certifications TEXT[], -- الشهادات والاعتمادات
  
  -- التقييم والسمعة
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  project_count INTEGER DEFAULT 0,
  
  -- الإحصائيات
  views_count INTEGER DEFAULT 0,
  contact_requests_count INTEGER DEFAULT 0,
  
  -- الحالة
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  
  -- المسؤول
  owner_id UUID,
  
  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول مشاريع الشركة
CREATE TABLE IF NOT EXISTS company_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  
  -- تفاصيل المشروع
  project_type TEXT,
  client_name TEXT,
  location TEXT,
  wilaya TEXT,
  
  -- القيمة والتواريخ
  value DECIMAL(15, 2),
  currency TEXT DEFAULT 'DZD',
  start_date DATE,
  end_date DATE,
  completion_percentage INTEGER DEFAULT 100,
  
  -- الصور
  images TEXT[],
  
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول صور الشركة
CREATE TABLE IF NOT EXISTS company_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول شهادات الشركة
CREATE TABLE IF NOT EXISTS company_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_number TEXT,
  document_url TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول طلبات التواصل مع الشركة
CREATE TABLE IF NOT EXISTS company_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- معلومات المرسل
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- المحتوى
  subject TEXT,
  message TEXT NOT NULL,
  project_type TEXT,
  budget_range TEXT,
  
  -- الحالة
  status TEXT DEFAULT 'pending', -- pending, read, responded, closed
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تقييمات الشركة
CREATE TABLE IF NOT EXISTS company_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  
  -- جوانب التقييم
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- الفهارس
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_wilaya ON companies(wilaya);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(is_verified);
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(is_featured);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_companies_created ON companies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_company_projects_company ON company_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_company_projects_featured ON company_projects(is_featured);

CREATE INDEX IF NOT EXISTS idx_company_reviews_company ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_rating ON company_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_company_contact_company ON company_contact_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_company_contact_status ON company_contact_requests(status);

-- =====================================================
-- تعطيل RLS للتطوير
-- =====================================================

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_contact_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_reviews DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- التعليقات
-- =====================================================

COMMENT ON TABLE companies IS 'جدول الشركات والمكاتب الهندسية';
COMMENT ON COLUMN companies.company_type IS 'نوع الشركة: BET=مكتب دراسات, CONSTRUCTION=مقاولات, MATERIALS=مواد بناء, SURVEY=مسح طوبوغرافي, ELECTRICAL_MECHANICAL=كهرباء وميكانيك';
COMMENT ON TABLE company_projects IS 'مشاريع الشركة';
COMMENT ON TABLE company_reviews IS 'تقييمات الشركة';
COMMENT ON TABLE company_contact_requests IS 'طلبات التواصل مع الشركة';

-- جدول الإعلانات
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'sidebar', -- sidebar, header, footer, feed, popup
  ad_type TEXT DEFAULT 'image', -- image, video, text
  duration_days INTEGER DEFAULT 30,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  clicks_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  target_audience TEXT DEFAULT 'all', -- all, engineers, contractors, craftsmen
  wilaya TEXT, -- targeting specific region
  priority INTEGER DEFAULT 0, -- higher = more prominent
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_ads_position ON ads(position);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads(start_date, end_date);

-- تعطيل RLS للتطوير
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;

-- إضافة تعليق
COMMENT ON TABLE ads IS 'جدول الإعلانات المدفوعة';
COMMENT ON COLUMN ads.position IS 'مكان الإعلان: sidebar, header, footer, feed, popup';
COMMENT ON COLUMN ads.ad_type IS 'نوع الإعلان: image, video, text';
COMMENT ON COLUMN ads.target_audience IS 'الجمهور المستهدف: all, engineers, contractors, craftsmen';

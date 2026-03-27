-- ===============================================
-- DzBuild - إصلاح جدول التعليقات
-- ===============================================

-- حذف الجدول القديم إذا كان موجوداً بأعمدة مختلفة
DROP TABLE IF EXISTS comments CASCADE;

-- إنشاء جدول التعليقات بالأعمدة الصحيحة
CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT DEFAULT 'زائر',
  is_approved BOOLEAN DEFAULT true,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- تعطيل RLS
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- رسالة نجاح
SELECT 'تم إنشاء جدول التعليقات بنجاح!' as message;

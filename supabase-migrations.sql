-- DzBuild - إضافة عمود edit_token للمنشورات
-- Run this SQL in Supabase Dashboard > SQL Editor

-- إضافة عمود edit_token للمنشورات (يسمح للمستخدمين بتعديل وحذف منشوراتهم)
ALTER TABLE guest_posts ADD COLUMN IF NOT EXISTS edit_token VARCHAR(64) UNIQUE;

-- إضافة عمود updated_at لتتبع التعديلات
ALTER TABLE guest_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- إضافة عمود category للتصنيفات الفرعية
ALTER TABLE guest_posts ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- إنشاء فهرس لتحسين البحث
CREATE INDEX IF NOT EXISTS idx_guest_posts_edit_token ON guest_posts(edit_token);
CREATE INDEX IF NOT EXISTS idx_guest_posts_section ON guest_posts(section);
CREATE INDEX IF NOT EXISTS idx_guest_posts_category ON guest_posts(category);

-- تحديث المنشورات الموجودة لتوليد edit_token لها
-- (فقط للمنشورات التي لا تحتوي على edit_token)
UPDATE guest_posts 
SET edit_token = encode(gen_random_bytes(32), 'hex')
WHERE edit_token IS NULL;

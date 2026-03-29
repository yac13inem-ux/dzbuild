# 🚀 دليل ربط DzBuild مع Vercel من الصفر

## الخطوة 1: إنشاء حساب على Vercel

1. اذهب إلى: https://vercel.com
2. اضغط **"Sign Up"**
3. اختر **"Continue with GitHub"**
4. سمح لـ Vercel بالوصول إلى حسابك على GitHub

---

## الخطوة 2: استيراد المشروع من GitHub

1. بعد تسجيل الدخول، اضغط **"Add New..."** → **"Project"**
2. اختر **"Import Git Repository"**
3. ابحث عن `dzbuild` واضغط **"Import"**

---

## الخطوة 3: إعداد المشروع

### Configure Project:

| الإعداد | القيمة |
|---------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` |
| **Build Command** | `prisma generate && next build` |
| **Output Directory** | `.next` |
| **Install Command** | `bun install` |

---

## الخطوة 4: إضافة متغيرات البيئة

قبل النشر، اضغط **"Environment Variables"** وأضف:

```
DATABASE_URL
postgresql://postgres.sxdilkvyxfquuaxsvjta:Amina022000l@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_DATABASE_URL
postgresql://postgres.sxdilkvyxfquuaxsvjta:Amina022000l@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

NEXTAUTH_SECRET
Amina022000lSecretKey2024

NEXTAUTH_URL
https://dzbuild.vercel.app

NEXT_PUBLIC_SUPABASE_URL
https://sxdilkvyxfquuaxsvjta.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZGlsa3Z5eGZxdXVheHN2anRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjk5NjcsImV4cCI6MjA4ODc0NTk2N30.UrPOUfd1PayqLPPnxokhhaYJ-OLjYEUmIul9D4rhUGk
```

---

## الخطوة 5: النشر

1. اضغط **"Deploy"**
2. انتظر حتى ينتهي البناء (2-3 دقائق)
3. ستظهر لك رسالة **"Congratulations! 🎉"**

---

## الخطوة 6: إنشاء الجداول على Supabase

بعد أول نشر، يجب إنشاء الجداول:

### الطريقة 1: عبر Supabase SQL Editor

1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. اضغط **SQL Editor**
4. الصق هذا الكود:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'NORMAL_USER',
  "verificationStatus" TEXT DEFAULT 'PENDING',
  "isVerified" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "isEmailVerified" BOOLEAN DEFAULT false,
  bio TEXT,
  address TEXT,
  city TEXT,
  wilaya TEXT,
  latitude FLOAT,
  longitude FLOAT,
  website TEXT,
  "socialLinks" TEXT,
  specialization TEXT,
  experience INT,
  "licenseNumber" TEXT,
  certifications TEXT,
  rating FLOAT DEFAULT 0,
  "reviewCount" INT DEFAULT 0,
  "projectCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  images TEXT,
  videos TEXT,
  category TEXT,
  tags TEXT,
  "isPublished" BOOLEAN DEFAULT true,
  "isFeatured" BOOLEAN DEFAULT false,
  "isSponsored" BOOLEAN DEFAULT false,
  "viewCount" INT DEFAULT 0,
  "likeCount" INT DEFAULT 0,
  "commentCount" INT DEFAULT 0,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  images TEXT,
  "authorName" TEXT,
  "authorRole" TEXT,
  "answersCount" INT DEFAULT 0,
  "votesCount" INT DEFAULT 0,
  "viewsCount" INT DEFAULT 0,
  "isSolved" BOOLEAN DEFAULT false,
  "isPinned" BOOLEAN DEFAULT false,
  "isPublished" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- External Comments Table
CREATE TABLE IF NOT EXISTS external_comments (
  id TEXT PRIMARY KEY,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  content TEXT NOT NULL,
  "editToken" TEXT UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "isApproved" BOOLEAN DEFAULT true,
  "likeCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "nameAr" TEXT,
  "nameFr" TEXT,
  type TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  city TEXT,
  wilaya TEXT,
  rating FLOAT DEFAULT 0,
  "reviewCount" INT DEFAULT 0,
  "projectCount" INT DEFAULT 0,
  "isVerified" BOOLEAN DEFAULT false,
  "isFeatured" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Craftsmen Table
CREATE TABLE IF NOT EXISTS craftsmen (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  specialty TEXT,
  city TEXT,
  wilaya TEXT,
  phone TEXT,
  phone2 TEXT,
  email TEXT,
  "experienceYears" INT,
  bio TEXT,
  images TEXT,
  avatar TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "isAvailable" BOOLEAN DEFAULT true,
  rating FLOAT DEFAULT 0,
  "reviewCount" INT DEFAULT 0,
  "viewsCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  position TEXT,
  "imageUrl" TEXT,
  "videoUrl" TEXT,
  "linkUrl" TEXT,
  content TEXT,
  "targetAudience" TEXT,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  budget FLOAT,
  spent FLOAT DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  "advertiserId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts("authorId");
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_external_comments_target ON external_comments("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_wilaya ON companies(wilaya);
CREATE INDEX IF NOT EXISTS idx_craftsmen_category ON craftsmen(category);

-- Insert Admin User
INSERT INTO users (id, email, password, name, role, "isVerified", "isActive", "isEmailVerified", "verificationStatus")
VALUES (
  'admin-dzbuild-001',
  'yac13inem@gmail.com',
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'ADMIN',
  true,
  true,
  true,
  'VERIFIED'
) ON CONFLICT (email) DO NOTHING;
```

5. اضغط **"Run"**

---

## الخطوة 7: التحقق من النشر

1. اذهب إلى رابط موقعك: `https://dzbuild.vercel.app`
2. تأكد من أن الصفحة الرئيسية تظهر
3. جرب تسجيل الدخول كمسؤول:
   - **البريد**: `yac13inem@gmail.com`
   - **كلمة المرور**: `Amina022000l`

---

## ⚠️ ملاحظات مهمة

1. **كلمة مرور المسؤول**: يجب إنشاء hash لكلمة المرور وإدخالها في قاعدة البيانات
2. **Custom Domain**: يمكنك إضافة نطاق مخصص من Settings → Domains
3. **Logs**: يمكنك مراجعة السجلات من Deployments → اختر أي نشر → Logs

---

## 🔧 حل المشاكل الشائعة

| المشكلة | الحل |
|---------|------|
| Build Failed | تحقق من Build Logs |
| Database Error | تحقق من متغيرات DATABASE_URL |
| 500 Error | راجع Function Logs |
| Prisma Error | تأكد من prisma generate في Build Command |

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع Vercel Logs
2. تحقق من Supabase Dashboard
3. راجع هذا الدليل مرة أخرى

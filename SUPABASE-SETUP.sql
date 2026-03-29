-- DzBuild - Supabase Database Setup
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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
  
  -- Profile fields
  bio TEXT,
  address TEXT,
  city TEXT,
  wilaya TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  website TEXT,
  "socialLinks" TEXT,
  
  -- Role-specific fields
  specialization TEXT,
  experience INTEGER,
  "licenseNumber" TEXT,
  certifications TEXT,
  
  -- Statistics
  rating DOUBLE PRECISION DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "projectCount" INTEGER DEFAULT 0,
  
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== POSTS TABLE ====================
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  images TEXT,
  videos TEXT,
  category TEXT,
  tags TEXT,
  "isPublished" BOOLEAN DEFAULT true,
  "isFeatured" BOOLEAN DEFAULT false,
  "isSponsored" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "likeCount" INTEGER DEFAULT 0,
  "commentCount" INTEGER DEFAULT 0,
  
  -- Author info
  "authorId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  "guestName" TEXT,
  "guestEmail" TEXT,
  
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== COMMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  
  -- Author info
  "authorId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  "guestName" TEXT,
  "guestEmail" TEXT,
  
  "postId" TEXT REFERENCES posts(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== COMPANIES TABLE ====================
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "nameAr" TEXT,
  "nameFr" TEXT,
  type TEXT NOT NULL,
  description TEXT,
  "descriptionAr" TEXT,
  "descriptionFr" TEXT,
  logo TEXT,
  "coverImage" TEXT,
  address TEXT,
  city TEXT,
  wilaya TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  specialties TEXT,
  services TEXT,
  "foundedYear" INTEGER,
  "employeeCount" INTEGER,
  rating DOUBLE PRECISION DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "projectCount" INTEGER DEFAULT 0,
  "isVerified" BOOLEAN DEFAULT false,
  "isFeatured" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== CRAFTSMEN TABLE ====================
CREATE TABLE IF NOT EXISTS craftsmen (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  specialty TEXT,
  city TEXT,
  wilaya TEXT,
  phone TEXT,
  phone2 TEXT,
  email TEXT,
  "experienceYears" INTEGER,
  bio TEXT,
  images TEXT,
  avatar TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "isAvailable" BOOLEAN DEFAULT true,
  rating DOUBLE PRECISION DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "viewsCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== JOBS TABLE ====================
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "companyLogo" TEXT,
  wilaya TEXT,
  city TEXT,
  "experienceLevel" TEXT,
  "experienceRequired" TEXT,
  "salaryRange" TEXT,
  "jobType" TEXT,
  "applicationMethod" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  deadline TIMESTAMP,
  requirements TEXT,
  benefits TEXT,
  "isFeatured" BOOLEAN DEFAULT false,
  "viewsCount" INTEGER DEFAULT 0,
  "applicationsCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  unit TEXT,
  "quantityAvailable" INTEGER,
  "supplierName" TEXT,
  "supplierPhone" TEXT,
  "supplierEmail" TEXT,
  wilaya TEXT,
  city TEXT,
  images TEXT,
  "isFeatured" BOOLEAN DEFAULT false,
  "viewsCount" INTEGER DEFAULT 0,
  "inquiriesCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== QUESTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  images TEXT,
  "authorName" TEXT,
  "authorEmail" TEXT,
  "authorRole" TEXT,
  "answersCount" INTEGER DEFAULT 0,
  "votesCount" INTEGER DEFAULT 0,
  "viewsCount" INTEGER DEFAULT 0,
  "isSolved" BOOLEAN DEFAULT false,
  "isPinned" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== LIBRARY RESOURCES TABLE ====================
CREATE TABLE IF NOT EXISTS library_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  "titleAr" TEXT,
  "titleFr" TEXT,
  description TEXT,
  category TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "fileSize" INTEGER,
  thumbnail TEXT,
  "videoUrl" TEXT,
  "readTime" INTEGER,
  "downloadCount" INTEGER DEFAULT 0,
  "likeCount" INTEGER DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  "isFeatured" BOOLEAN DEFAULT false,
  tags TEXT,
  author TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== PROJECTS TABLE ====================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  "titleAr" TEXT,
  "titleFr" TEXT,
  description TEXT,
  "descriptionAr" TEXT,
  "descriptionFr" TEXT,
  status TEXT DEFAULT 'planning',
  category TEXT DEFAULT 'other',
  progress INTEGER DEFAULT 0,
  location TEXT,
  city TEXT,
  wilaya TEXT,
  budget DOUBLE PRECISION,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  images TEXT,
  "clientName" TEXT,
  "clientPhone" TEXT,
  "clientEmail" TEXT,
  "isFeatured" BOOLEAN DEFAULT false,
  "isPublished" BOOLEAN DEFAULT true,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== ADVERTISEMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  position TEXT,
  "imageUrl" TEXT,
  "videoUrl" TEXT,
  "linkUrl" TEXT,
  content TEXT,
  "targetAudience" TEXT,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  budget DOUBLE PRECISION,
  spent DOUBLE PRECISION DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  "advertiserId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== SERVICES TABLE ====================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images TEXT,
  price DOUBLE PRECISION,
  "priceType" TEXT DEFAULT 'fixed',
  duration INTEGER,
  "providerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating DOUBLE PRECISION DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "orderCount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== JOB LISTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS job_listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  "titleAr" TEXT,
  "titleFr" TEXT,
  description TEXT NOT NULL,
  "descriptionAr" TEXT,
  "descriptionFr" TEXT,
  requirements TEXT,
  responsibilities TEXT,
  benefits TEXT,
  "jobType" TEXT NOT NULL,
  category TEXT,
  "experienceLevel" TEXT,
  "experienceYears" TEXT,
  "salaryMin" DOUBLE PRECISION,
  "salaryMax" DOUBLE PRECISION,
  "salaryType" TEXT,
  currency TEXT DEFAULT 'DZD',
  location TEXT,
  city TEXT,
  wilaya TEXT,
  "isRemote" BOOLEAN DEFAULT false,
  "isHybrid" BOOLEAN DEFAULT false,
  vacancies INTEGER DEFAULT 1,
  applications INTEGER DEFAULT 0,
  deadline TIMESTAMP,
  status TEXT DEFAULT 'active',
  "isFeatured" BOOLEAN DEFAULT false,
  "isUrgent" BOOLEAN DEFAULT false,
  "postedById" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "companyId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== REVIEWS TABLE ====================
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL,
  comment TEXT,
  images TEXT,
  "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "isVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== COURSES TABLE ====================
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  category TEXT,
  level TEXT DEFAULT 'beginner',
  duration INTEGER,
  lessons INTEGER,
  price DOUBLE PRECISION DEFAULT 0,
  "isFree" BOOLEAN DEFAULT false,
  "instructorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating DOUBLE PRECISION DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "enrollmentCount" INTEGER DEFAULT 0,
  "isPublished" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== COURSE VIDEOS TABLE ====================
CREATE TABLE IF NOT EXISTS course_videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  thumbnail TEXT,
  duration INTEGER,
  "order" INTEGER DEFAULT 0,
  "isPreview" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== COURSE ENROLLMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS course_enrollments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  "completedLessons" TEXT,
  "startedAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP
);

-- ==================== PROBLEMS TABLE ====================
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT,
  category TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  "viewCount" INTEGER DEFAULT 0,
  "upvoteCount" INTEGER DEFAULT 0,
  "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== SOLUTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS solutions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  images TEXT,
  "isAccepted" BOOLEAN DEFAULT false,
  "upvoteCount" INTEGER DEFAULT 0,
  "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "problemId" TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "senderId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "receiverId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ==================== FAVORITES TABLE ====================
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "targetType", "targetId")
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts("authorId");
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments("authorId");
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments("postId");
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_wilaya ON companies(wilaya);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_wilaya ON projects(wilaya);
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON advertisements(status);
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON advertisements(position);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services("providerId");
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_job_listings_postedby ON job_listings("postedById");
CREATE INDEX IF NOT EXISTS idx_job_listings_category ON job_listings(category);
CREATE INDEX IF NOT EXISTS idx_job_listings_wilaya ON job_listings(wilaya);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON reviews("authorId");
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses("instructorId");
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_course_videos_course ON course_videos("courseId");
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments("userId");
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments("courseId");
CREATE INDEX IF NOT EXISTS idx_problems_author ON problems("authorId");
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_solutions_author ON solutions("authorId");
CREATE INDEX IF NOT EXISTS idx_solutions_problem ON solutions("problemId");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages("receiverId");
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites("userId");

-- ==================== INSERT ADMIN USER ====================
-- Password: Amina022000l (hashed with bcrypt)
INSERT INTO users (id, email, password, name, role, "isVerified", "isActive", "isEmailVerified", rating, "reviewCount", "projectCount")
VALUES (
  'admin_001',
  'yac13inem@gmail.com',
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'ADMIN',
  true,
  true,
  true,
  0,
  0,
  0
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'DzBuild database setup completed successfully!' as message;

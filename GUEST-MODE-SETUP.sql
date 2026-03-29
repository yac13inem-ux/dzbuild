-- DzBuild - Guest Mode Setup
-- Allows posting and commenting without login
-- Only Admin needs to login for dashboard access

-- ==================== CLEAN DATABASE ====================
DROP TABLE IF EXISTS "videos" CASCADE;
DROP TABLE IF EXISTS "construction_guides" CASCADE;
DROP TABLE IF EXISTS "settings" CASCADE;
DROP TABLE IF EXISTS "advertisements" CASCADE;
DROP TABLE IF EXISTS "favorites" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "solutions" CASCADE;
DROP TABLE IF EXISTS "problems" CASCADE;
DROP TABLE IF EXISTS "course_enrollments" CASCADE;
DROP TABLE IF EXISTS "course_videos" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "service_ratings" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "library_resources" CASCADE;
DROP TABLE IF EXISTS "questions" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "job_listings" CASCADE;
DROP TABLE IF EXISTS "jobs" CASCADE;
DROP TABLE IF EXISTS "craftsmen" CASCADE;
DROP TABLE IF EXISTS "company_employees" CASCADE;
DROP TABLE IF EXISTS "companies" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ==================== USERS TABLE ====================
-- Only for Admin and registered users who want advanced features
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'NORMAL_USER',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "address" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "website" TEXT,
    "socialLinks" TEXT,
    "specialization" TEXT,
    "experience" INTEGER,
    "licenseNumber" TEXT,
    "certifications" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ADMIN USER ====================
-- Password: Amina022000l
INSERT INTO "users" (
    "id", "email", "password", "name", "role",
    "isVerified", "isActive", "isEmailVerified",
    "verificationStatus", "createdAt", "updatedAt"
) VALUES (
    'admin-dzbuild-001',
    'yac13inem@gmail.com',
    '$2b$10$m0QZT9/JJjITCbpkQVPZseHniLn8S1okz9TliO2n2dxTZq4ZYcFwm',
    'Admin',
    'ADMIN',
    true,
    true,
    true,
    'VERIFIED',
    NOW(),
    NOW()
);

-- ==================== POSTS TABLE ====================
-- Supports both logged-in users and guests
CREATE TABLE "posts" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT,
    "content" TEXT,
    "images" TEXT,
    "videos" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    -- Author info - can be registered user OR guest
    "authorId" TEXT,          -- Null for guest posts
    "guestName" TEXT,         -- For guest posts
    "guestEmail" TEXT,        -- For guest posts
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
CREATE INDEX "posts_category_idx" ON "posts"("category");
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== COMMENTS TABLE ====================
-- Supports both logged-in users and guests
CREATE TABLE "comments" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    -- Author info - can be registered user OR guest
    "authorId" TEXT,          -- Null for guest comments
    "guestName" TEXT,         -- For guest comments
    "guestEmail" TEXT,        -- For guest comments
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");
CREATE INDEX "comments_postId_idx" ON "comments"("postId");
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== COMPANIES TABLE ====================
CREATE TABLE "companies" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameFr" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "address" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "specialties" TEXT,
    "services" TEXT,
    "foundedYear" INTEGER,
    "employeeCount" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "companies_type_idx" ON "companies"("type");
CREATE INDEX "companies_wilaya_idx" ON "companies"("wilaya");
CREATE INDEX "companies_city_idx" ON "companies"("city");

-- ==================== CRAFTSMEN TABLE ====================
CREATE TABLE "craftsmen" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specialty" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "phone" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "experienceYears" INTEGER,
    "bio" TEXT,
    "images" TEXT,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== JOBS TABLE ====================
CREATE TABLE "jobs" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "wilaya" TEXT,
    "city" TEXT,
    "experienceLevel" TEXT,
    "experienceRequired" TEXT,
    "salaryRange" TEXT,
    "jobType" TEXT,
    "applicationMethod" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "deadline" TIMESTAMP(3),
    "requirements" TEXT,
    "benefits" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE "products" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "quantityAvailable" INTEGER,
    "supplierName" TEXT,
    "supplierPhone" TEXT,
    "supplierEmail" TEXT,
    "wilaya" TEXT,
    "city" TEXT,
    "images" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "inquiriesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== QUESTIONS TABLE ====================
CREATE TABLE "questions" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "category" TEXT NOT NULL,
    "images" TEXT,
    "authorName" TEXT,
    "authorRole" TEXT,
    "answersCount" INTEGER NOT NULL DEFAULT 0,
    "votesCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== LIBRARY_RESOURCES TABLE ====================
CREATE TABLE "library_resources" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "thumbnail" TEXT,
    "videoUrl" TEXT,
    "readTime" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PROJECTS TABLE ====================
CREATE TABLE "projects" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "category" TEXT NOT NULL DEFAULT 'other',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "budget" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "images" TEXT,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "clientEmail" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "projects_category_idx" ON "projects"("category");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "projects_wilaya_idx" ON "projects"("wilaya");

-- ==================== ADVERTISEMENTS TABLE ====================
CREATE TABLE "advertisements" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "linkUrl" TEXT,
    "content" TEXT,
    "targetAudience" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "advertiserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "advertisements_status_idx" ON "advertisements"("status");
CREATE INDEX "advertisements_position_idx" ON "advertisements"("position");

-- ==================== SUCCESS! ====================
SELECT '✅ SUCCESS! Guest Mode is enabled!
✅ Admin: yac13inem@gmail.com / Amina022000l
✅ Anyone can post and comment without login
✅ Only Admin can access dashboard and delete content' AS message;

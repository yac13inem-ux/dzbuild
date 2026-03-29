-- DzBuild - Simple Guest Mode Setup (Open Publishing - no login required)
-- Only Admin needs to login for dashboard access

-- Clean database
DROP TABLE IF EXISTS "videos" CASCADE;
DROP TABLE IF EXISTS "construction_guides" CASCADE;
drop TABLE IF EXISTS "settings" CASCADE;
drop TABLE IF EXISTS "advertisements" CASCADE;
drop TABLE IF EXISTS "favorites" CASCADE;
drop TABLE IF EXISTS "notifications" CASCADE;
drop TABLE IF EXISTS "messages" CASCADE;
drop TABLE IF EXISTS "reviews" CASCADE;
drop TABLE IF EXISTS "solutions" CASCADE;
drop TABLE IF EXISTS "problems" CASCADE;
drop TABLE IF EXISTS "course_enrollments" CASCADE;
drop TABLE IF EXISTS "course_videos" CASCADE;
drop TABLE IF EXISTS "courses" CASCADE;
drop TABLE IF EXISTS "service_ratings" CASCADE;
drop TABLE IF EXISTS "services" CASCADE;
drop TABLE IF EXISTS "projects" CASCADE;
drop TABLE IF EXISTS "library_resources" CASCADE;
drop TABLE IF EXISTS "questions" CASCADE;
drop TABLE IF EXISTS "products" CASCADE;
drop TABLE IF EXISTS "job_listings" CASCADE;
drop TABLE IF EXISTS "jobs" CASCADE;
drop TABLE IF EXISTS "craftsmen" CASCADE;
drop TABLE IF EXISTS "company_employees" CASCADE;
drop TABLE IF EXISTS "companies" CASCADE;
drop TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
drop TABLE IF EXISTS "users" CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ==================== USERS TABLE ====================
-- Only for Admin and registered users
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
    true,
    true,
    true,
    'VERIFIED',
    NOW(),
    NOW()
);

-- ==================== POSTS table (supports both logged-in users and guests) ====================
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
    -- Author info
    "authorId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
CREATE INDEX "posts_category_idx" ON "posts"("category");

-- ==================== Comments table ====================
CREATE TABLE "comments" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    "authorId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "postId" TEXT REFERENCES posts(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");
CREATE INDEX "comments_postId_idx" ON "comments"("postId");

-- ==================== Other tables ====================
CREATE TABLE "companies" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "city" TEXT,
    "wilaya" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "craftsmen" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT,
    "wilaya" TEXT,
    "phone" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "jobs" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "city" TEXT,
    "wilaya" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "products" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "wilaya" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== Success! ====================
SELECT '✅ SUCCESS! Open publishing enabled!
✅ Anyone can post without login
✅ Admin: yac13inem@gmail.com / Amina022000l' AS message;
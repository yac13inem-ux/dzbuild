-- DzBuild - Clean Database Setup
-- No fake data - only real users and content
-- Open publishing enabled (no login required to post/comment)

-- ==================== DROP EXISTING TABLES ====================
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

-- ==================== ADMIN USER ONLY ====================
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
    "authorId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
CREATE INDEX "posts_category_idx" ON "posts"("category");

-- ==================== COMMENTS TABLE ====================
CREATE TABLE "comments" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    "authorId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "postId" TEXT REFERENCES "posts"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");
CREATE INDEX "comments_postId_idx" ON "comments"("postId");

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

-- ==================== SERVICES TABLE ====================
CREATE TABLE "services" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "category" TEXT,
    "images" TEXT,
    "price" DOUBLE PRECISION,
    "priceType" TEXT NOT NULL DEFAULT 'fixed',
    "duration" INTEGER,
    "providerId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "location" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "availability" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "services_providerId_idx" ON "services"("providerId");
CREATE INDEX "services_category_idx" ON "services"("category");

-- ==================== JOB_LISTINGS TABLE ====================
CREATE TABLE "job_listings" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "benefits" TEXT,
    "jobType" TEXT NOT NULL,
    "category" TEXT,
    "experienceLevel" TEXT,
    "experienceYears" TEXT,
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "salaryType" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "location" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "isHybrid" BOOLEAN NOT NULL DEFAULT false,
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "postedById" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "job_listings_postedById_idx" ON "job_listings"("postedById");
CREATE INDEX "job_listings_category_idx" ON "job_listings"("category");
CREATE INDEX "job_listings_wilaya_idx" ON "job_listings"("wilaya");

-- ==================== REVIEWS TABLE ====================
CREATE TABLE "reviews" (
    "id" TEXT PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "images" TEXT,
    "authorId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "reviews_authorId_idx" ON "reviews"("authorId");
CREATE INDEX "reviews_targetType_targetId_idx" ON "reviews"("targetType", "targetId");

-- ==================== COURSES TABLE ====================
CREATE TABLE "courses" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "thumbnail" TEXT,
    "category" TEXT,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "duration" INTEGER,
    "lessons" INTEGER,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oldPrice" DOUBLE PRECISION,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "instructorId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "syllabus" TEXT,
    "requirements" TEXT,
    "outcomes" TEXT,
    "language" TEXT NOT NULL DEFAULT 'arabic',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "courses_instructorId_idx" ON "courses"("instructorId");
CREATE INDEX "courses_category_idx" ON "courses"("category");

-- ==================== COURSE_VIDEOS TABLE ====================
CREATE TABLE "course_videos" (
    "id" TEXT PRIMARY KEY,
    "courseId" TEXT NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "course_videos_courseId_idx" ON "course_videos"("courseId");

-- ==================== COURSE_ENROLLMENTS TABLE ====================
CREATE TABLE "course_enrollments" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedLessons" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "certificateUrl" TEXT
);

CREATE INDEX "course_enrollments_userId_idx" ON "course_enrollments"("userId");
CREATE INDEX "course_enrollments_courseId_idx" ON "course_enrollments"("courseId");

-- ==================== PROBLEMS TABLE ====================
CREATE TABLE "problems" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "images" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "problems_authorId_idx" ON "problems"("authorId");
CREATE INDEX "problems_category_idx" ON "problems"("category");

-- ==================== SOLUTIONS TABLE ====================
CREATE TABLE "solutions" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    "images" TEXT,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "problemId" TEXT NOT NULL REFERENCES "problems"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "solutions_authorId_idx" ON "solutions"("authorId");
CREATE INDEX "solutions_problemId_idx" ON "solutions"("problemId");

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE "notifications" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- ==================== FAVORITES TABLE ====================
CREATE TABLE "favorites" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "targetType", "targetId")
);

CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- ==================== MESSAGES TABLE ====================
CREATE TABLE "messages" (
    "id" TEXT PRIMARY KEY,
    "senderId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "receiverId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "attachments" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

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

-- ==================== SETTINGS TABLE ====================
CREATE TABLE "settings" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CONSTRUCTION_GUIDES TABLE ====================
CREATE TABLE "construction_guides" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "content" TEXT NOT NULL,
    "contentAr" TEXT,
    "contentFr" TEXT,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT,
    "videos" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "construction_guides_category_idx" ON "construction_guides"("category");

-- ==================== VIDEOS TABLE ====================
CREATE TABLE "videos" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "thumbnail" TEXT,
    "videoUrl" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'youtube',
    "category" TEXT NOT NULL,
    "duration" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "videos_category_idx" ON "videos"("category");

-- ==================== SUCCESS! ====================
SELECT '✅ Database ready!
✅ Admin: yac13inem@gmail.com / Amina022000l
✅ No fake data - clean database
✅ Open publishing enabled' AS message;

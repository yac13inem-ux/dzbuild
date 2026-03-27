# DzBuild Database Schema Documentation

## Overview

This PostgreSQL database schema is designed for the DzBuild platform - a comprehensive civil engineering and construction ecosystem for Algeria. The schema supports all 25 required modules.

## Schema Files

1. **schema-complete.sql** - Main database schema with all tables
2. **rls-policies.sql** - Row Level Security policies for Supabase

## How to Apply

### Step 1: Apply Main Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `schema-complete.sql`
3. Paste and execute

### Step 2: Apply RLS Policies
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `rls-policies.sql`
3. Paste and execute

### Step 3: Enable pgvector Extension (for AI features)
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Database Structure Summary

### Core Tables (Authentication & Users)

| Table | Description |
|-------|-------------|
| `users` | Main user accounts with authentication |
| `profiles` | Extended user profile information |
| `admin_users` | Admin accounts and permissions |

### Role-Specific Profiles

| Table | Role | Description |
|-------|------|-------------|
| `engineer_profiles` | CIVIL_ENGINEER | Engineer-specific data, licenses, expertise |
| `contractor_profiles` | CONTRACTOR | Contractor business info, project capacity |
| `craftsman_profiles` | CRAFTSMAN | Craftsman specialties, services, rates |
| `engineering_office_profiles` | ENGINEERING_OFFICE | Engineering firm details, team, certifications |
| `construction_company_profiles` | CONSTRUCTION_COMPANY | Construction company info, equipment, capacity |
| `store_factory_profiles` | STORE_FACTORY | Store/factory details, products, delivery |
| `real_estate_profiles` | REAL_ESTATE | Real estate agency information |

### Social & Content

| Table | Description |
|-------|-------------|
| `follows` | User follow relationships |
| `posts` | User posts and content |
| `post_likes` | Post likes |
| `comments` | Post comments |
| `comment_likes` | Comment likes |
| `saved_posts` | Bookmarked posts |
| `videos` | Video library |
| `video_likes` | Video likes |
| `video_comments` | Video comments |

### Craftsmen Directory

| Table | Description |
|-------|-------------|
| `craftsman_services` | Services offered by craftsmen |
| `craftsman_bookings` | Booking requests for craftsmen |

### Projects Marketplace

| Table | Description |
|-------|-------------|
| `projects` | Construction project listings |
| `project_bids` | Bids on projects |

### Marketplace (Products & Materials)

| Table | Description |
|-------|-------------|
| `product_categories` | Product category hierarchy |
| `products` | Product listings |
| `product_price_history` | Price tracking over time |
| `wishlist` | User wishlists |
| `orders` | Purchase orders |
| `price_lists` | Supplier price lists |
| `price_list_items` | Items in price lists |

### Real Estate

| Table | Description |
|-------|-------------|
| `real_estate_listings` | Property listings |

### Jobs

| Table | Description |
|-------|-------------|
| `jobs` | Job postings |
| `job_applications` | Job applications |

### Training & Courses

| Table | Description |
|-------|-------------|
| `courses` | Training courses |
| `course_lessons` | Course lessons |
| `course_enrollments` | Student enrollments |

### Q&A & Consultations

| Table | Description |
|-------|-------------|
| `questions` | Community questions |
| `answers` | Answers to questions |
| `qa_votes` | Voting on Q&A |
| `consultations` | Engineering consultations |

### Reviews & Ratings

| Table | Description |
|-------|-------------|
| `reviews` | User/business reviews |
| `review_helpfulness` | Helpful votes on reviews |

### Messaging

| Table | Description |
|-------|-------------|
| `conversations` | Chat conversations |
| `conversation_participants` | Group chat members |
| `messages` | Chat messages |
| `message_reactions` | Reactions to messages |

### Notifications

| Table | Description |
|-------|-------------|
| `notifications` | User notifications |

### Advertisements

| Table | Description |
|-------|-------------|
| `advertisements` | Ad campaigns |
| `ad_clicks` | Click tracking |

### AI Features

| Table | Description |
|-------|-------------|
| `ai_knowledge_base` | Knowledge base for AI |
| `ai_conversations` | AI chat history |

### Calculators

| Table | Description |
|-------|-------------|
| `calculators` | Construction calculators |
| `calculator_history` | User calculation history |

### Moderation & Reports

| Table | Description |
|-------|-------------|
| `reports` | User reports |
| `moderation_logs` | Moderation action logs |

### System

| Table | Description |
|-------|-------------|
| `system_settings` | Platform settings |
| `user_activity` | Activity tracking |
| `platform_stats` | Daily statistics snapshots |

## Key Features

### 1. UUID Primary Keys
All tables use UUID primary keys for better security and distributed systems compatibility.

### 2. Timestamps
All tables include `created_at` and `updated_at` timestamps with automatic triggers.

### 3. Full-Text Search Support
- `pg_trgm` extension for trigram-based text search
- GIN indexes on searchable text fields
- Arabic, French, and English support

### 4. Location Support
- PostGIS extension for geospatial queries
- Latitude/longitude fields
- Wilaya/city fields for Algeria

### 5. Row Level Security
- Complete RLS policies for all tables
- User ownership verification
- Admin access controls

### 6. Views
Pre-built views for common queries:
- `active_craftsmen` - Verified active craftsmen
- `featured_products` - Featured product listings
- `open_projects` - Open project marketplace
- `recent_questions` - Recent Q&A items

## Enums

The schema uses PostgreSQL ENUMs for:
- `user_role` - User account types
- `verification_status` - Account verification states
- `craftsman_specialty` - Types of craftsmen
- `project_status` - Project lifecycle states
- `order_status` - Order processing states
- `listing_status` - Marketplace listing states
- `content_status` - Content moderation states
- `payment_status` - Payment processing states
- `ad_status` - Advertisement states
- `report_status` - Report processing states
- `notification_type` - Types of notifications

## Indexes

Comprehensive indexes on:
- Foreign keys
- Search fields (GIN with trigram)
- Date fields
- Status fields
- Geographic data (PostGIS)

## Relationships

```
users ─┬─ profiles (1:1)
       ├─ engineer_profiles (1:1)
       ├─ contractor_profiles (1:1)
       ├─ craftsman_profiles (1:1)
       ├─ engineering_office_profiles (1:1)
       ├─ construction_company_profiles (1:1)
       ├─ store_factory_profiles (1:1)
       ├─ real_estate_profiles (1:1)
       ├─ posts (1:N)
       ├─ comments (1:N)
       ├─ follows (1:N)
       ├─ products (1:N)
       ├─ projects (1:N)
       ├─ jobs (1:N)
       └─ courses (1:N)

posts ─┬─ post_likes (1:N)
       ├─ comments (1:N)
       └─ saved_posts (1:N)

products ─┬─ product_price_history (1:N)
          ├─ wishlist (1:N)
          └─ orders (1:N via items)

projects ─── project_bids (1:N)

courses ─┬─ course_lessons (1:N)
         └─ course_enrollments (1:N)

questions ─┬─ answers (1:N)
           └─ qa_votes (1:N)

conversations ─┬─ messages (1:N)
               └─ conversation_participants (1:N)
```

## Performance Considerations

1. **Partitioning**: Consider partitioning large tables (messages, notifications, user_activity) by date
2. **Connection Pooling**: Use Supabase connection pooling for production
3. **Read Replicas**: Configure read replicas for high-traffic scenarios
4. **Caching**: Use Redis for frequently accessed data

## Backup Strategy

1. Enable Supabase automatic backups
2. Configure point-in-time recovery
3. Regular exports for critical tables
4. Test restore procedures

## Security Notes

1. All password hashes should be handled by Supabase Auth
2. RLS policies enforce data access control
3. Admin tables have additional access restrictions
4. Sensitive data requires proper encryption

## Migration Commands

After applying the schema:

```sql
-- Check table count
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Verify extensions
SELECT * FROM pg_extension;
```

## Support

For issues with the schema:
1. Check Supabase logs
2. Verify all extensions are installed
3. Ensure RLS policies are correctly applied
4. Check for conflicting table names

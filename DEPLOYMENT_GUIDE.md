# دليل نشر DzBuild على Vercel مع Supabase

## الخطوة 1: إعداد Supabase

### 1.1 الحصول على معلومات الاتصال

من لوحة تحكم Supabase:
1. اذهب إلى **Settings** > **Database**
2. انسخ المعلومات التالية:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432` (أو `6543` للـ pooler)
   - **User**: `postgres`
   - **Password**: (انقر على "Show" لعرض كلمة المرور)

### 1.2 إنشاء جداول قاعدة البيانات

1. اذهب إلى **SQL Editor** في Supabase
2. انسخ محتوى ملف `supabase-setup.sql`
3. الصقه في المحرر وانقر **Run**

## الخطوة 2: إعداد متغيرات البيئة في Vercel

في لوحة تحكم Vercel، اذهب إلى **Settings** > **Environment Variables** وأضف:

### متغيرات قاعدة البيانات (مطلوبة)

```env
# Database Connection - Transaction Mode (for migrations)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Database Connection - Session Mode (for direct queries)
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**مثال:**
```env
DATABASE_URL="postgresql://postgres.abcdefghijk:MyPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.abcdefghijk:MyPassword123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

### متغيرات Supabase (مطلوبة)

```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
```

### متغيرات إضافية (اختيارية)

```env
# JWT Secret for authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App URL
NEXT_PUBLIC_APP_URL="https://dzbuild.vercel.app"
```

## الخطوة 3: الحصول على مفاتيح Supabase

من لوحة تحكم Supabase:
1. اذهب إلى **Settings** > **API**
2. انسخ:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## الخطوة 4: إعادة النشر

بعد إضافة متغيرات البيئة:
1. اذهب إلى **Deployments**
2. انقر على **Redeploy** على آخر نشر

## الخطوة 5: التحقق من الاتصال

بعد النشر الناجح، تحقق من:
- [ ] تسجيل مستخدم جديد يعمل
- [ ] تسجيل الدخول يعمل
- [ ] إنشاء منشور جديد يعمل
- [ ] إضافة تعليقات تعمل

## تنسيق Connection String

### Pooler Connection (للـ serverless مثل Vercel):
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Direct Connection:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.com:5432/postgres
```

## ملاحظات مهمة

1. **استخدم Pooler Connection** لـ Vercel لأنه أفضل للـ serverless functions
2. **لا تستخدم** Direct Connection للتطبيق (فقط للـ migrations)
3. **أعد نشر** التطبيق بعد كل تغيير في متغيرات البيئة
4. **تحقق من logs** في Vercel إذا واجهت مشاكل

## استكشاف الأخطاء

### خطأ: "Can't reach database server"
- تحقق من صحة Connection String
- تأكد من أن قاعدة البيانات نشطة (not paused)

### خطأ: "Authentication failed"
- تحقق من صحة كلمة المرور
- تأكد من أن المستخدم `postgres` صحيح

### خطأ: "SSL connection required"
- أضف `?sslmode=require` إلى نهاية Connection String

## الروابط المفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

# 🏗️ DzBuild - منصة البناء الجزائري

منصة تواصل اجتماعي متكاملة للهندسة المدنية والبناء في الجزائر.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)

## ✨ المميزات

- 🏢 **دليل الشركات** - شركات البناء والمقاولات
- 👷 **دليل الحرفيين** - البحث عن حرفيين في جميع الولايات
- 🛒 **سوق البناء** - بيع وشراء مواد البناء
- 🧮 **حاسبة البناء** - حساب تكاليف البناء
- 📚 **مكتبة المقالات** - مقالات ونصائح البناء
- ❓ **أسئلة وأجوبة** - مجتمع للأسئلة والاستشارات
- 📰 **منشورات** - شبكة تواصل اجتماعي

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| Next.js 16 | Framework |
| TypeScript | لغة البرمجة |
| Tailwind CSS 4 | التنسيقات |
| shadcn/ui | مكونات UI |
| Prisma | ORM |
| Supabase | قاعدة البيانات |
| NextAuth.js | المصادقة |

## 📦 التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/dzbuild.git
cd dzbuild

# تثبيت المتطلبات
npm install

# إنشاء ملف .env
cp .env.example .env
# ثم عدّل القيم في ملف .env

# توليد Prisma Client
npm run db:generate

# دفع Schema لقاعدة البيانات
npm run db:push

# تشغيل الخادم
npm run dev
```

## ⚙️ متغيرات البيئة

أنشئ ملف `.env` بالمتغيرات التالية:

```env
# قاعدة البيانات (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (اختياري)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 🚀 النشر على Vercel

### الطريقة 1: من لوحة تحكم Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **New Project**
3. اختر مستودع GitHub
4. أضف متغيرات البيئة
5. اضغط **Deploy**

### الطريقة 2: GitHub Actions (تلقائي)

1. احصل على Token من Vercel:
   - اذهب إلى Settings → Tokens
   - أنشئ Token جديد

2. احصل على Project ID:
   ```bash
   vercel link
   ```

3. أضف Secrets في GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

4. عند الـ Push إلى master، سيتم النشر تلقائيًا!

## 📝 الأوامر المتاحة

```bash
npm run dev      # تشغيل بيئة التطوير
npm run build    # بناء للإنتاج
npm run start    # تشغيل الإنتاج
npm run lint     # فحص الكود
npm run db:push  # دفع Schema لقاعدة البيانات
```

## 📁 هيكل المشروع

```
dzbuild/
├── prisma/
│   ├── schema.prisma      # Schema للتطوير (SQLite)
│   └── schema.prod.prisma # Schema للإنتاج (PostgreSQL)
├── src/
│   ├── app/               # صفحات Next.js
│   ├── components/        # مكونات React
│   │   ├── sections/      # أقسام الصفحة الرئيسية
│   │   └── ui/            # مكونات shadcn/ui
│   └── lib/               # المكتبات المساعدة
│       └── supabase/      # عميل Supabase
├── .github/
│   └── workflows/         # GitHub Actions
└── vercel.json            # إعدادات Vercel
```

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:
1. Fork المشروع
2. إنشاء branch جديد
3. تقديم Pull Request

## 📄 الرخصة

MIT License

---

صُنع بـ ❤️ في الجزائر

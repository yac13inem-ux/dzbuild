#!/bin/bash

# ==============================================
# سكريبت رفع مشروع DzBuild إلى GitHub
# ==============================================

echo "🚀 بدء رفع مشروع DzBuild إلى GitHub..."
echo ""

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# التحقق من Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git غير مثبت! قم بتثبيته أولاً${NC}"
    exit 1
fi

# طلب معلومات GitHub
echo -e "${YELLOW}📝 أدخل معلومات GitHub الخاصة بك:${NC}"
echo ""

read -p "👤 اسم المستخدم على GitHub (مثال: ahmed-dz): " GITHUB_USER
read -p "📁 اسم المستودع (مثال: dzbuild): " REPO_NAME

# التحقق من الإدخال
if [ -z "$GITHUB_USER" ] || [ -z "$REPO_NAME" ]; then
    echo -e "${RED}❌ يجب إدخال جميع المعلومات!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ سيتم رفع المشروع إلى:${NC}"
echo -e "   https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""

read -p "هل تريد المتابعة؟ (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}تم الإلغاء${NC}"
    exit 0
fi

# تهيئة Git إذا لم يكن موجودًا
if [ ! -d ".git" ]; then
    echo ""
    echo -e "${YELLOW}🔧 تهيئة Git...${NC}"
    git init
    git branch -M master
fi

# إضافة جميع الملفات
echo ""
echo -e "${YELLOW}📦 إضافة الملفات...${NC}"
git add .

# حفظ التغييرات
echo ""
echo -e "${YELLOW}💾 حفظ التغييرات...${NC}"
git commit -m "🚀 نشر مشروع DzBuild - منصة البناء الجزائري

✨ المميزات:
- دليل الشركات والحرفيين
- سوق البناء
- حاسبة تكاليف البناء
- مكتبة المقالات
- أسئلة وأجوبة
- شبكة تواصل اجتماعي

🛠️ التقنيات:
- Next.js 16 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma + Supabase (PostgreSQL)
"

# ربط المستودع البعيد
echo ""
echo -e "${YELLOW}🔗 ربط المستودع البعيد...${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git

# رفع المشروع
echo ""
echo -e "${YELLOW}⬆️ رفع المشروع إلى GitHub...${NC}"
git push -u origin master --force

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ تم الرفع بنجاح!${NC}"
    echo ""
    echo -e "${GREEN}🎉 رابط المشروع:${NC}"
    echo -e "   https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo -e "${YELLOW}📋 الخطوة التالية:${NC}"
    echo "   1. اذهب إلى vercel.com"
    echo "   2. اضغط 'New Project'"
    echo "   3. اختر مستودع: $REPO_NAME"
    echo "   4. أضف متغيرات البيئة"
    echo "   5. اضغط 'Deploy'"
    echo ""
else
    echo ""
    echo -e "${RED}❌ حدث خطأ أثناء الرفع${NC}"
    echo -e "${YELLOW}تأكد من:${NC}"
    echo "   1. أن المستودع موجود على GitHub"
    echo "   2. أنك سجل دخولك في Git"
    echo "   3. أن لديك صلاحية الكتابة"
    echo ""
    echo "💡 نصيحة: إذا كان المستودع غير موجود، أنشئه أولاً على:"
    echo "   https://github.com/new"
fi

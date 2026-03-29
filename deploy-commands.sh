#!/bin/bash

# ==============================================
# 🚀 أوامر رفع مشروع DzBuild إلى GitHub
# ==============================================
# انسخ هذه الأوامر والصقها في Terminal
# ==============================================

# 1️⃣ أدخل معلومات GitHub (غيّرها إلى معلوماتك)
GITHUB_USER="YOUR_GITHUB_USERNAME"  # مثال: ahmed-dz
REPO_NAME="dzbuild"                  # اسم المستودع

# 2️⃣ تهيئة Git
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# 3️⃣ التحقق من الحالة
git status

# 4️⃣ إضافة جميع الملفات
git add .

# 5️⃣ حفظ التغييرات
git commit -m "🚀 نشر مشروع DzBuild - منصة البناء الجزائري"

# 6️⃣ ربط المستودع البعيد (غيّر YOUR_USERNAME)
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git

# 7️⃣ رفع المشروع
git push -u origin master --force

# ==============================================
# ✅ بعد الرفع، اذهب إلى:
# https://github.com/YOUR_USERNAME/dzbuild
# ==============================================

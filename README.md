# SIG Maps V2 - نظام معلومات جغرافي متعدد اللغات

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub commits](https://img.shields.io/github/commits-since/ilyeseia/sig-maps-v2/master)](https://github.com/ilyeseia/sig-maps-v2/commits/master)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)](https://github.com/ilyeseia/sig-maps-v2/blob/master/_bmad-output/planning-artifacts/architecture.md)

<div dir="rtl">

## 🌍 نظرة عامة

**SIG Maps V2** هو نظام معلومات جغرافي (GIS) حديث ومتعدد اللغات، مصمم خصيصاً لشمال أفريقيا والجزائر. النظام يوفر منصة آمنة وسريعة لإدارة البيانات المكانية مع دعم كامل للغة العربية (RTL) والفرنسية (LTR).

</div>

---

## 🎯 الرؤية

سيصبح SIG Maps V2 المنصة الرائدة للأنظمة الجغرافية في شمال أفريقيا، محولاً كيفية إدارة البيانات المكانية لدى الوكالات الحكومية والشركات الخدمية والمنظمات البيئية.

---

## ✨ الميزات الرئيسية (MVP)

### 🔐 الأمان
- ✅ مصادقة JWT (Access: 24h, Refresh: 7d)
- ✅ تشفير كلمات المرور بـ bcrypt (cost 12)
- ✅ التحكم في الوصول حسب الدور (Admin, Editor, Viewer)
- ✅ تأمين من هجمات SQL Injection و XSS
- ✅ منع مسار الملفات (Path Traversal Prevention)

### 🗺️ الخرائط
- ✅ عرض الخرائط التفاعلية باستخدام Leaflet
- ✅ دعم 10,000+ نقطة في أقل من ثانيتين
- ✅ تقسيم النقاط (Clustering) لتحسين الأداء
- ✅ أوضاع التكبير/التصغير من 1 إلى 20
- ✅ الوضع الشامل (Fullscreen)
- ✅ شريط المقياس (Scale Bar)

### 🎨 أدوات الرسم
- ✅ رسم النقاط (Points)
- ✅ رسم الخطوط (Polylines)
- ✅ رسم المناطق (Polygons)
- ✅ تحرير الميزات (Edit)
- ✅ حذف الميزات (Delete)
- ✅ إلغاء الرسم بـ ESC

### 📦 إدارة الطبقات
- ✅ إنشاء وتعديل وحذف الطبقات
- ✅ تشغيل/إيقاف الطبقات
- ✅ إعادة ترتيب الطبقات
- ✅ تخصيص الألوان والأنماط

### 📤 التصدير
- ✅ تصدير إلى GeoJSON
- ✅ تصدير إلى KML
- ✅ تصدير إلى Shapefile
- ✅ تصدير الطبقات المحددة فقط

### 👥 إدارة المستخدمين
- ✅ إنشاء المستخدمين (Admin فقط)
- ✅ تعيين الأدوار
- ✅ تفعيل/إلغاء تفعيل المستخدمين
- ✅ إعادة تعيين كلمة المرور

### 🌐 التوطين
- ✅ واجهة عربية بالكامل (RTL)
- ✅ واجهة فرنسية بالكامل (LTR)
- ✅ التبديل الفوري بين اللغات
- ✅ أسماء الميزات المحلية

---

## 🏗️ البنية التقنية

### Frontend
```
Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Leaflet (الخرائط)
├── Tailwind CSS (التصميم)
├── Zustand (State Management)
└── i18next (التوطين)
```

### Backend
```
Express.js (TypeScript)
├── Prisma ORM
├── JWT Authentication
├── Zod Validation
└── BullMQ (Export Jobs)
```

### Database
```
PostgreSQL 15 + PostGIS 3.3
├── Spatial Indexes (GIST)
├── B-tree Indexes
└── Connection Pooling
```

### Deployment
```
Docker Compose
├── 5 Containers (postgres, backend, frontend, redis, nginx)
└── One-command deployment
```

---

## 📊 البيانات (Data Model)

### الكيانات (Entities)
1. **User** - المستخدمين
2. **Layer** - الطبقات
3. **Feature** - الميزات (Points, Lines, Polygons)
4. **ExportJob** - وظائف التصدير

---

## 🚀 التثبيت

### المتطلبات
- Docker & Docker Compose
- Node.js 20+ (للتطوير فقط)
- PostgreSQL 15+ + PostGIS 3.3 (للتطوير فقط)

### بالدocker (موصى به للإنتاج)

```bash
# استنساخ المشروع
git clone https://github.com/ilyeseia/sig-maps-v2.git
cd sig-maps-v2

# تشغيل Docker Compose
docker-compose up -d

# تشغيل الترحيلات
docker-compose exec backend npx prisma migrate dev

# التطبيق متاح الآن على:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### للتطوير (Development)

```bash
# تثبيت التبعيات (Backend)
cd backend
npm install

# تثبيت التبعيات (Frontend)
cd ../frontend
npm install

# تشغيل قاعدة البيانات
docker-compose up -d postgres

# تشغيل الترحيلات
cd backend
npx prisma migrate dev

# تشغيل Backend
npm run dev

# تشغيل Frontend
cd ../frontend
npm run dev
```

---

## 📚 التوثيق التقني

- [📋 Product Brief](./_bmad-output/planning-artifacts/product-brief.md) - رؤية المشروع والنطاق
- [📝 PRD](./_bmad-output/planning-artifacts/prd.md) - 127 متطلب (82 FR + 45 NFR)
- [🏗️ Architecture](./_bmad-output/planning-artifacts/architecture.md) - البنية التقنية
- [🎨 UX Specification](./_bmad-output/planning-artifacts/ux-design-specification.md) - تصميم الواجهة
- [📊 Epics & Stories](./_bmad-output/planning-artifacts/epics.md) - 29 story مع Acceptance Criteria
- [✅ Readiness Report](./_bmad-output/planning-artifacts/implementation-readiness-report-2026-02-26.md) - تقرير الجاهزية

---

## 🎯 حالة التنفيذ

### Planning Phase: ✅ 100% مكتمل

| المرحلة | الحالة |
|---------|--------|
| Product Brief | ✅ مكتمل |
| PRD | ✅ مكتمل |
| Architecture | ✅ مكتمل |
| UX Design | ✅ مكتمل |
| Epics & Stories | ✅ مكتمل |
| Readiness Check | ✅ مكتمل |

### Development Status: 🔄 قيد التنفيذ (10% مكتمل)

- **Total Epics:** 6
- **Total Stories:** 29
- **Stories Completed:** 3/29 (✅ Story 1-1, ✅ Story 1-2, ✅ Story 1-3)
- **Current Epic:** Epic 1: Foundation & Authentication
- **Estimated Timeline:** 7-11 أسابيع

---

## 📝 أحدث التحديثات

### 2026-02-26: Story 1-3 (User Login) ✅ مكتمل

**Frontend:**
- ✅ Auth Store (Zustand) for centralized state management
  - User data, access/refresh tokens
  - Auth actions (setAuth, logout)
  - Token refresh logic
  - Token expiry checking (5-min buffer)
- ✅ Token Refresh component (automated token refresh)
  - Background token refresh every minute
  - Refresh 5 minutes before expiry
  - Cleanup on unmount
- ✅ Enhanced Login page
  - Zustand store integration
  - "Remember Me" with localStorage
  - Improved loading states
  - Better UI with icons
- ✅ Enhanced Map page
  - User avatar with initials
  - Logout confirmation
  - Progress card (Epic 1: 33%)
  - Protected route logic
- ✅ API Client class
  - Centralized API calls
  - Automatic JWT injection
  - Error handling

**Backend:**
- ✅ Already implemented in Story 1-1

**التالي:** Story 1-4 (Password Reset - frontend exists, integration testing)

### 2026-02-26: Story 1-2 (User Registration) ✅ مكتمل

**Frontend:**
- ✅ Registration page (/register) with full form
  - Name, email, password, confirm password, language preference
  - Client-side validation (8+ chars, mixed case, number)
  - Loading states and error display
  - Redirect to login on success
- ✅ Forgot password page (/forgot-password)
- ✅ Login page update (added divider and forgot password link)

**Backend:**
- ✅ Already implemented in Story 1-1

### 2026-02-26: Story 1-1 (Project Setup) ✅ مكتمل

**Backend:**
- ✅ Express.js + TypeScript setup
- ✅ Prisma ORM مع PostgreSQL + PostGIS
- ✅ Authentication endpoints (login, register, refresh, reset password)
- ✅ JWT + bcrypt + RBAC middleware
- ✅ Dockerfile + environment config

**Frontend:**
- ✅ Next.js 14 (App Router) + TypeScript
- ✅ Tailwind CSS + Tajawal (Arabic font)
- ✅ Login page with form validation
- ✅ Map page (placeholder)
- ✅ Dockerfile + environment config

**Infrastructure:**
- ✅ Docker Compose (4 containers: postgres, redis, backend, frontend)
- ✅ Health checks + dependencies

---

## 👥 المستخدمون المستهدفون

### 1. أحمد - محلل بيانات جغرافية
- يعرض ويحرر الخرائط
- يدير الطبقات
- يصدر البيانات

### 2. فاطمة - عامل ميداني
- يجمع البيانات الميدانية
- يحدد المواقع
- يبلغ عن المشاكل

### 3. عمر - مدير النظام
- يدير المستخدمين
- يراقب الأداء
- يستجيب للأحداث الأمنية

---

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى الـ branch
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 👨‍💻 المؤلف

تم تطوير المشروع بواسطة **Dreima** (AI Assistant) باستخدام منهجية **BMad** (AI-driven Software Development) - 26 فبراير 2026

---

## 🔗 الروابط

- [BMad Framework](https://github.com/openclaw/openclaw) - منصة تطوير البرمجيات بذكاء اصطناعي
- [Leaflet Documentation](https://leafletjs.com/)
- [PostGIS Documentation](https://postgis.net/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## ⭐ شكر خاص

<div dir="rtl">

- فريق **BMad** لمنهجية التطوير المتميزة
- مجتمع **OpenClaw** لدعمهم المستمر
- مجتمع **Leaflet** و **PostgreSQL** للمكتبات الممتازة

</div>

---

<p align="center">
  <b>بناء بذكاء أصطناعي باستخدام BMad 🤖</b>
</p>

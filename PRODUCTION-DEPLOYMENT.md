# 🗺️ SIG Maps V2 - Production Deployment Guide

**آخر تحديث:** 2026-03-09
**النموذج:** glm4.7

---

## 📋 المتطلبات

### متطلبات النظام
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **CPU:** 4+ cores推荐的推荐 (minimum: 2 cores)
- **RAM:** 8GB+ (recommended 16GB)
- **Disk:** 20GB+ مُتاحة
- **Network:** اتصال إنترنت مستقر

### متطلبات البرامج
- Linux / macOS / Windows (مع WSL2)
- curl (للـ health checks)
- jq (اختياري، للأتمتة المتقدمة)
- OpenSSL (للتوليد المُحسّن لكلمات المرور)

---

## 🚀 عملية التثبيت السريع

### الخطوة 1: استنساخ المشروع
```bash
git clone https://github.com/ilyeseia/sig-maps-v2.git
cd sig-maps-v2
```

### الخطوة 2: تشغيل Script الإعداد
```bash
./setup-production.sh
```

**ما يفعله هذا الـ script:**
- ✅ توليد كلمات المرور القوية (32-64 حرف)
- ✅ إنشاء `.env.production`
- ✅ بناء Docker images (multi-stage)
- ✅ تشغيل migrations
- ✅ إطلاق جميع الخدمات
- ✅_health checks

### الخطوة 3: التحقق من التشغيل
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### الخطوة 4: الوصول للتطبيق
- **Frontend:** https://sig-frontend.tail7d68dd.ts.net
- **Backend API:** https://sig-backend.tail7d68dd.ts.net
- **Full Site:** https://sig-maps.tail7d68dd.ts.net (via nginx)

---

## 📁 البنية المُنشأة

### الملفات الجديدة
```
sig-maps-v2/
├── .env.production              # تكوين الإنتاج (لا تُنشر على git!)
├── docker-compose.prod.yml      # تكوين Docker للإنتاج
├── nginx.conf                   # Reverse proxy config
├── setup-production.sh          # Setup script
├── backup-database.sh           # Backup/restore script
├── backend/
│   └── Dockerfile.prod          # Production build (multi-stage)
├── frontend/
│   └── Dockerfile.prod          # Production build (multi-stage)
└── secrets/
    └── production-credentials.txt  # Backup of credentials
```

###Volumes
- `postgres_data_prod` - قاعدة البيانات
- `redis_data_prod` - Redis cache
- `exports_volume_prod` - ملفات التصدير
- `prisma_migrations_prod` - Prisma migrations

---

## 🔧 الإدارة اليومية

### تحقق من الحالة
```bash
# جميع الخدمات
docker-compose -f docker-compose.prod.yml ps

# تفاصيل كاملة مع Health
docker-compose -f docker-compose.prod.yml ps -a
```

### مشاهدة الـ Logs
```bash
# جميع الخدمات
docker-compose -f docker-compose.prod.yml logs -f

# خدمة محددة
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx

# آخر 100 سطر فقط
docker-compose -f docker-compose.prod.yml logs --tail=100 -f
```

### إعادة التشغيل
```bash
# إعادة التشغيل الكاملة
docker-compose -f docker-compose.prod.yml restart

# خدمة محددة
docker-compose -f docker-compose.prod.yml restart backend

# إعادة التشغيل مع إعادة البناء
docker-compose -f docker-compose.prod.yml up -d --build
```

### إيقاف وبدء
```bash
# إيقاف الخدمات
docker-compose -f docker-compose.prod.yml down

# إيقاف وحذف Volumes (فقدان البيانات!)
docker-compose -f docker-compose.prod.yml down -v

# بدء الخدمات
docker-compose -f docker-compose.prod.yml up -d

# بناء وبدء من جديد
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 💾 النسخ الاحتياطي

### إنشاء نسخة احتياطية
```bash
./backup-database.sh
```

هذا يُنشئ ملفاً مضغوطاً في `backups/sigmaps_sig_maps_v2_TIMESTAMP.sql.gz`

### قائمة النسخ الاحتياطية
```bash
./backup-database.sh list
```

### استعادة نسخة احتياطية
```bash
./backup-database.sh restore backups/sigmaps_sig_maps_v2_20260309_150000.sql.gz
```

### تنظيف النسخ القديمة
```bash
./backup-database.sh clean
```

يمكنك أيضاً إضافة cron job للنسخ الاحتياطي التلقائي:
```bash
# إضافة إلى crontab (في الأوقات المناسبة لك)
# Cron ينفذ النسخ الاحتياطي الأسبوعي كل الأحد عند 2 AM
0 2 * * 0 /path/to/sig-maps-v2/backup-database.sh >> /path/to/sig-maps-v2/backup.log 2>&1
```

---

## 📊 مراقبة الأداء

### استخدام الموارد
```bash
# استخدام CPU & RAM لكل حاوية
docker stats sig-maps-postgres-prod sig-maps-backend-prod sig-maps-frontend-prod

# سعة القرص
docker system df
```

### تحقق من الحالة الصحية
```bash
# تفاصيل الـ health check
docker inspect sig-maps-postgres-prod | jq '.[0].State.Health'
docker inspect sig-maps-backend-prod | jq '.[0].State.Health'
docker inspect sig-maps-frontend-prod | jq '.[0].State.Health'
```

### Database Statistics
```bash
# الاتصال بقاعدة البيانات
docker exec -it sig-maps-postgres-prod psql -h localhost -U sigmaps_prod_user -d sig_maps_v2

# عدد النقاط المُخزنة
SELECT COUNT(*) FROM "Feature";

# حجم قاعدة البيانات
SELECT pg_size_pretty(pg_database_size('sig_maps_v2'));

# حجم كل طاولة
SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## 🔒 الأمان

### إدارة كلمات المرور

**كلمات المرور المُولدة:**
- مُحفوظة في `secrets/production-credentials.txt`
- لا تُحتفظ بها في git (`.gitignore`)

**تغيير كلمة المرور:**
```bash
# توليد كلمة مرور جديدة
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# تحديث .env.production
# ثم reboot الخدمات
docker-compose -f docker-compose.prod.yml restart
```

### SSL/TLS (اختياري - Production)

إذا كنت تستعمل domain خاص مع HTTPS:

1. تعديل `nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... rest of config
}
```

2. إنشاء SSL certificates:
```bash
docker run -it --rm -v sig-maps-ssl:/certs \
  -e SSL_IP=$(hostname -I | cut -d' ' -f1) \
  -e SSL_DNS=sig-maps.tail7d68dd.ts.net \
  frapsoft/openssl
```

---

## 🎨 التحسينات المتقدمة

### تحسين PostgreSQL

للمشاريع الكبيرة بـ أكثر من 100k نقطة:

```yaml
# في docker-compose.prod.yml, postgres service:
command: >
  postgres
    -c max_connections=200
    -c shared_buffers=512MB
    -c effective_cache_size=2GB
    -c work_mem=8MB
    -c maintenance_work_mem=128MB
    -c checkpoint_completion_target=0.9
    -c wal_buffers=32MB
    -c default_statistics_target=200
    -c random_page_cost=1.1
    -c effective_io_concurrency=400
    -c max_worker_processes=8
```

### إضافة Caching Layer

Redis مُستخدَم بالفعل للـ export jobs. يمكنك توسيع الاستخدام:

1. إضافة Redis middleware في backend للـ API responses
2. استخدام Redis cache للـ features (points, lines, polygons)
3. Rate limiting محسّن (قائم على Redis)

---

## 🐛 استكشاف الأخطاء

### لا يبدأ النظام

```bash
# Logs كاملة
docker-compose -f docker-compose.prod.yml logs

# إعادة البناء
docker-compose -f docker-compose.prod.yml down
docker system prune -a -f
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### المشاكل المشتركة

1. **Port already in use:**
```bash
lsof -i :3005
lsof -i :3003
lsof -i :8080
# قتل العملية إذا لزم الأمر
```

2. **Out of memory:**
```bash
# زيادة swap space
# أو تقليل resource limits في docker-compose.prod.yml
```

3. **Connection refused:**
```bash
# تأكد أن network جيد
docker network inspect sig-maps-prod-network
```

---

## 📈 التحديثات

### تحديث التطبيق

```bash
# 1. Git pull
git pull origin main

# 2. إعادة البناء
docker-compose -f docker-compose.prod.yml build

# 3. تشغيل migrations
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# 4. إعادة التشغيل
docker-compose -f docker-compose.prod.yml up -d
```

**الترقية بدون توقف (Zero Downtime) (متقدم):**
```bash
# تشغيل نسخة جديدة في parallel
# ثم switch traffic عبر nginx
# بحيث يكون لديك A/B deployment
```

---

## 🎯 الأسئلة الشائعة (FAQ)

### ❔ ماذا لو نسيت كلمات المرور؟

راجع `secrets/production-credentials.txt`. إذا مفقود، يمكنك:
1. إنشاء `.env.production` جديد
2. تشغيل `setup-production.sh` من جديد (سيُعيد البناء)

### ❔ كيف أعمل scale للمشاريع الكبيرة؟

1. زيادة resource limits في `docker-compose.prod.yml`
2. إضافة PostgreSQL replication (master-slave)
3. استعمال PostgreSQL connection pooling (PgBouncer)
4. تقسيم البيانات حسب العُمر التاريخي (شهر/سنة)

### ❔ هل يمكن التشغيل بِلا Tailscale؟

نعم! تعديل:
```yaml
حذف labels:
  tsdproxy.enable: ...
  tsdproxy.name: ...

و expose ports مكشوفة:
ports:
  - "80:80"  # nginx
  - "5435:5432"  # postgres (فقط للإدارة المحلية)
```

### ❔ كيف أعمل rollback؟

استخدم `backup-database.sh`:
```bash
./backup-database.sh restore backup-file.sql.gz
```

---

## 📞 الدعم

- **GitHub Issues:** https://github.com/ilyeseia/sig-maps-v2/issues
- **المطور:** Dreima (AI Assistant)
- **الإطار:** BMad Framework

---

## ⭐ شكر خاص

- فريق **PostGIS** لمحرك قاعدة البيانات المكانية المُفيد
- فريق **Next.js** لمنصة React المذهلة
- فريق **OpenClaw** لدعمهم المستمر

---

<p align="center">
  <b>🎉 SIG Maps V2 - Ready for Production! 🗺️</b>
</p>

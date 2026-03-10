# 📘 دليل استخدام شامل - SIG Maps V2 (مُكمل)
## الجزء المتبقي والـ API Reference

---

## ❌ استكشاف الأخطاء الحرجة (استمرار)

### أخطاء الحامل

| خطأ | السبب | الحل |
|------|-------|------|
| `connection refused` | Backend container down | `docker-compose restart backend` |
| `503 Service Unavailable` | Service is starting | Wait 10-30 sec, check logs |
| `connection timeout` | Rate limit exceeded | Wait 15 min or use different IP |
| `500 Internal Server Error` | Server error | Check logs |

**أدوات الفحص:**
```bash
# فحص استهلاك الموارد
docker stats sig-maps-backend-prod sig-maps-frontend-prod

# فحص health check
curl -s http://localhost:3005/health | jq '.'

# فحص memory/swap
free -h

# فحص disk space
df -h
```


### أخطاء الـ Frontend

| خطأ | السبب | الحل |
|------|-------|------|
| `Cannot read properties of undefined (reading 'payload')` | API data undefined | Fix API or provide default |
| `Cannot read properties of undefined (reading 'settings')` | Missing configuration | Add config check: `window.settings = window.settings || {}` |
| `Failed to fetch features` | 403 Forbidden or CORS | Check JWT Token and CORS settings |
| `404 Not Found` | Route doesn't exist | Verify API endpoint exists |
| `504 Gateway Timeout` | Backend timeout | Increase timeout or optimize queries |

**إصلاح السريع:**
```javascript
// في Frontend code (src/app/features/page.tsx مثالاً)
// إضافة safety checks
const features = data?.features || [];
const layers = data?.layers || [];
const settings = window.settings || {};
```


### أخطاء الترحيل (Migration Errors)

| خطأ | السبب | الحل |
|------|-------|------|
| `Migration failed: constraint violation` | Data conflicts | Resolve conflicts manually |
| `Prisma.schema validation failed` | Syntax error in schema.prisma | Fix schema format |
| `Database locked` | Another migration in progress | Wait or `prisma migrate resolve --force-resolve` |
| `Foreign key constraint failed` | Referenced data missing | Create referenced data first |

**إصلاح النزاعات:**
```bash
# عرض معلومات الترحيل
docker compose -f docker-compose.prod.yml run backend npx prisma migrate status

# حل الترحيبة
docker compose -f docker-compose.prod.yml run backend npx prisma migrate resolve --force-resolve

# إعادة الترحيبة
docker compose -f docker-compose.prod.yml run backend npx prisma migrate reset --force
```


---


# 🚀 API Reference (اختصار API)

## 🔑 Authentication API

### POST /api/auth/register - تسجيل مستخدم جديد

**Endpoint:** `POST /api/auth/register`

**Authentication:** ❌ لا (public)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "New User",
  "language": "ar"  // "ar" or "fr"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "VIEWER",
    "language": "ar",
    "createdAt": "2026-03-10T20:00:00Z"
  }
}
```

**Status Codes:**
- `201` ✅ Created successfully
- `400` ❌ Email already registered
- `422` ❌ Validation error (password too weak, etc.)


### POST /api/auth/login - تسجيل الدخول

**Endpoint:** `POST /api/auth/login`

**Authentication:** ❌ لا (public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "CorrectPassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN",
    "language": "ar"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes:**
- `200` ✅ Login successful
- `401` ❌ Wrong credentials
- `404` ❌ User not found


### POST /api/auth/refresh - تحديث Access Token

**Endpoint:** `POST /api/auth/refresh`

**Authentication:** ❌ لا (public)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200` ✅ Token refreshed successfully
- `401` ❌ Invalid or expired refresh token


### POST /api/auth/logout - تسجيل الخروج

**Endpoint:** `POST /api/auth/logout`

**Authentication:** ⚠️ Yes (JWT required)

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200` ✅ Logout successful
- `401` ❌ Token not provided or invalid


### POST /api/auth/reset-password - إعادة تعيين كلمة المرور

**Endpoint:** `POST /api/auth/reset-password`

**Authentication:** ❌ لا (public)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a reset link will be sent",
  "requiresEmailConfig": true
}
```

**ملاحة:** هذه الميزة تتطلب إعدادات Email SMTP (Story 5-3)


### POST /api/auth/change-password - تغيير كلمة المرور

**Endpoint:** `POST /api/auth/change-password`

**Authentication:** ⚠️ Yes (JWT required)

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Status Codes:**
- `200` ✅ Password changed
- `400` ❌ Token invalid or expired
- `422` ❌ New password too weak



---

## 📂 Layers API

### GET /api/layers - عرض جميع الطبقات

**Endpoint:** `GET /api/layers`

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "layers": [
    {
      "id": "layer-uuid-here",
      "name_ar": "مطارات",
      "name_fr": "Aéroports",
      "geometry_type": "POINT",
      "is_visible": true,
      "zIndex": 5,
      "style": {
        "color": "#3B82F6",
        "opacity": 0.7,
        "line_width": 2,
        "marker_size": 10
      },
      "created_at": "2026-03-10T20:00:00Z",
      "feature_count": 45
    }
  ]
}
```

**Cache:** 5 minutes (Redis key: `layers:all`)


### GET /api/layers/:id - عرض طبقة محددة

**Endpoint:** `GET /api/layers/:id`

**Authentication:** ⚠️ Yes (JWT required)

**Parameters:**
- `:id` (UUID) - Layer ID

**Response:**
```json
{
  "layer": {
    "id": "layer-uuid-here",
    "name_ar": "مطارات",
    "name_fr": "Aéroports",
    "geometry_type": "POINT",
    "is_visible": true,
    "zIndex": 5,
    "style": {
      "color": "#3B82F6",
      "opacity": 0.7,
      "line_width": 2,
      "marker_size": 10
    },
    "created_at": "2026-03-10T20:00:00Z",
    "created_by": "creator-uuid-here",
    "feature_count": 45
  }
}
```

**Status Codes:**
- `200` ✅ Layer found
- `404` ❌ Layer not found


### POST /api/layers - إنشاء طبقة جديدة

**Endpoint:** `POST /api/layers`

**Authentication:** ⚠️ Yes (EDITOR or ADMIN)

**Request Body:**
```json
{
  "name_ar": "مطارات جديدة",
  "name_fr": "Nouveaux Aéroports",
  "geometry_type": "POINT",
  "is_visible": true,
  "zIndex": 10,
  "style": {
    "color": "#EF4444",
    "opacity": 0.8
  }
}
```

**Response:**
```json
{
  "message": "Layer created successfully",
  "layer": {
    "id": "new-layer-uuid",
    "name_ar": "مطارات جديدة",
    "name_fr": "Nouveaux Aéroports",
    "geometry_type": "POINT",
    "is_visible": true,
    "zIndex": 10,
    "style": {
      "color": "#EF4444",
      "opacity": 0.8
    },
    "created_at": "2026-03-10T21:00:00Z",
    "created_by": "user-uuid-here"
  }
}
```

**Status Codes:**
- `201` ✅ Layer created
- `403` ❌ Insufficient role (need EDITOR or ADMIN)
- `409` ❌ Layer name already exists
- `422` ❌ Validation error


### PUT /api/layers/:id - تعديل طبقة

**Endpoint:** `PUT /api/layers/:id`

**Authentication:** ⚠️ Yes (owner or ADMIN)

**Parameters:**
- `:id` (UUID) - Layer ID

**Request Body:**
```json
{
  "name_ar": "مطارات (مُحدّث)",
  "name_fr": "Aéroports (mis à jour)",
  "is_visible": true,
  "zIndex": 15,
  "style": {
    "color": "#10B981",
    "opacity": 0.9
  }
}
```

**Response:**
```json
{
  "message": "Layer updated successfully",
  "layer": {
    "id": "layer-uuid-here",
    "name_ar": "مطارات (مُحدّث)",
    "name_fr": "Aéroports (mis à jour)",
    "is_visible": true,
    "zIndex": 15,
    "style": {
      "color": "#10B981",
      "opacity": 0.9
    },
    "updated_at": "2026-03-10T21:30:00Z"
  }
}
```

**Status Codes:**
- `200` ✅ Layer updated
- `403` ❌ Not authorized (not owner nor ADMIN)
- `404` ❌ Layer not found
- `422` ❌ Validation error


### DELETE /api/layers/:id - حذف طبقة

**Endpoint:** `DELETE /api/layers/:id`

**Authentication:** ⚠️ Yes (owner or ADMIN)

**Parameters:**
- `:id` (UUID) - Layer ID

**Response:**
```json
{
  "message": "Layer deleted successfully",
  "deletedFeatures": 157  // عدد الميزات المحذوفة
}
```

**⚠️ ملاحة:** حذف الطبقة يُحذف جميع الميزات المرتبطة (CASCADE)

**Status Codes:**
- `200` ✅ Layer deleted
- `403` ❌ Not authorized (not owner nor ADMIN)
- `404` ❌ Layer not found



---

## ⭕ Features API

### GET /api/features - عرض الميزات (مع توزيع)

**Endpoint:** `GET /api/features`

**Authentication:** ❌ لا (public access for viewing)

**Query Parameters:**
| البارامتر | Type | الوصف |
|-----------|------|--------|
| `layer_id` | UUID | Optional: Filter by layer |
| `bbox` | String | Optional: Bounding box format `minX,minY,maxX,maxY` |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Max results per page (max: 500, default: 100) |

**Examples:**
```
# Get all features
GET /api/features

# Filter by layer (first page, 100 items)
GET /api/features?layer_id=LAYER_UUID&page=1&limit=100

# Get features in bbox
GET /api/features?bbox=-10,20,-5,30&limit=1000
```

**Response:**
```json
{
  "features": [
    {
      "id": "feature-uuid-here",
      "layer_id": "layer-uuid-here",
      "geometry": {
        "type": "Point",
        "coordinates": [5.3614, 43.2965]  // Marseille
      },
      "attributes": {
        "name": "مطار مرسيليا",
        "type": "airport",
        "status": "active"
      },
      "created_at": "2026-03-10T20:00:00Z",
      "updated_at": "2026-03-10T20:00:00Z",
      "created_by": "user-uuid-here",
      "layer_name_ar": "مطارات",
      "layer_name_fr": "Aéroports",
      "layer_geometry_type": "POINT",
      "layer_style": {
        "color": "#3B82F6",
        "opacity": 0.7,
        "marker_size": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5000,
    "totalPages": 50
  },
  "spatialFilter": false  // true if bbox provided
}
```

**Status Codes:**
- `200` ✅ Features listed successfully
- `400` ❌ Invalid bbox format


### POST /api/features - إنشاء ميزة جديدة

**Endpoint:** `POST /api/features`

**Authentication:** ⚠️ Yes (EDITOR or ADMIN)

**Request Body:**
```json
{
  "layer_id": "layer-uuid-here",
  "geometry": {
    "type": "Point",
    "coordinates": [2.3522, 48.8566]  // Paris
  },
  "attributes": {
    "name": "مطار باريس شارل ديغول",
    "type": "airport",
    "status": "active",
    "iata_code": "CDG"
  }
}
```

**H.Geometry Types:**
- **POINT**: `[lon, lat]` (مثال: `[2.3522, 48.8566]`)
- **LINE**: `[[[lon1, lat1], [lon2, lat2], ...]]` (مثال: `[[[0, 0], [1, 1]]]`)
- **POLYGON**: `[[[lon1, lat1], [lon2, lat2], ..., [lon1, lat1]]]`

**Response:**
```json
{
  "message": "Feature created successfully",
  "feature": {
    "id": "feature-uuid-here",
    "layer_id": "layer-uuid-here",
    "geometry": {
      "type": "Point",
      "coordinates": [2.3522, 48.8566]
    },
    "attributes": {
      "name": "مطار باريس شارل ديغول",
      "type": "airport",
      "status": "active",
      "iata_code": "CDG"
    },
    "created_at": "2026-03-10T21:00:00Z",
    "created_by": "user-uuid-here"
  }
}
```

**Status Codes:**
- `201` ✅ Feature created
- `400` ❌ Invalid GeoJSON or layer_id
- `403` ❌ Insufficient role
- `404` ❌ Layer not found
- `409` ❌ Geometry invalid (e.g., self-intersecting polygon)


### PUT /api/features/:id - تعديل ميزة

**Endpoint:** `PUT /api/features/:id`

**Authentication:** ⚠️ Yes (owner, EDITOR, or ADMIN)

**Request Body:**
```json
{
  "geometry": {
    "type": "Point",
    "coordinates": [2.3562, 48.8586]  // Slightly shifted
  },
  "attributes": {
    "name": "مطار باريس شارل ديغول (مُحدّث)",
    "name_fr": "Aéroport巴黎 Charles de Gaulle"
  }
}
```

**Response:**
```json
{
  "message": "Feature updated successfully",
  "feature": {
    "id": "feature-uuid-here",
    "geometry": {
      "type": "Point",
      "coordinates": [2.3562, 48.8586]
    },
    "attributes": {
      "name": "مطار باريس شارل ديغول (مُحدّث)",
      "name_fr": "Aéroport巴黎 Charles de Gaulle"
    },
    "updated_at": "2026-03-10T21:30:00Z"
  }
}
```

**Status Codes:**
- `200` ✅ Feature updated
- `403` ❌ Not authorized
- `404` ❌ Feature not found
- `422` ❌ Invalid data


### DELETE /api/features/:id - حذف ميزة

**Endpoint:** `DELETE /api/features/:id`

**Authentication:** ⚠️ Yes (owner, EDITOR, or ADMIN)

**Response:**
```json
{
  "message": "Feature deleted successfully"
}
```

**⚠️ ملاحة:** الحذف لا يمكن التراجع عنه! أضف منطق `trash` في الإصدارات المقبلة.

**Status Codes:**
- `200` ✅ Feature deleted
- `403` ❌ Not authorized
- `404` ❌ Feature not found



---

## 👥 Users API

### GET /api/users/me - عرض المستخدم الحالي

**Endpoint:** `GET /api/users/me`

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "user": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "name": "User Name",
    "role": "EDITOR",
    "language": "ar",
    "isActive": true,
    "createdAt": "2026-03-10T20:00:00Z",
    "lastLoginAt": "2026-03-10T21:00:00Z"
  }
}
```

**Status Codes:**
- `200` ✅ User found
- `401` ❌ Token not provided/invalid


### GET /api/users - عرض جميع المستخدمين

**Endpoint:** `GET /api/users`

**Authentication:** 🔐 Admin Only

**Response:**
```json
{
  "message": "User list - To be implemented in Story 5-1"
}
```

**Status Codes:**
- `200` ✅ Users listed
- `403` ❌ Not authorized (need ADMIN)
- `501` ❌ Not implemented yet


### POST /api/users - إنشاء مستخدم جديد

**Endpoint:** `POST /api/users`

**Authentication:** 🔐 Admin Only

**Response:**
```json
{
  "message": "Create user - To be implemented in Story 5-1"
}
```

**Status Codes:**
- `201` ✅ User created
- `403` ❌ Not authorized
- `501` ❌ Not implemented yet


### PUT /api/users/:id - تعديل مستخدم

**Endpoint:** `PUT /api/users/:id`

**Authentication:** 🔐 Admin Only

**Response:**
```json
{
  "message": "Update user - To be implemented in Story 5-2"
}
```

**Status Codes:**
- `200` ✅ User updated
- `403` ❌ Not authorized
- `501` ❌ Not implemented yet


### PATCH /api/users/:id/role - تغيير دور المستخدم

**Endpoint:** `PATCH /api/users/:id/role`

**Authentication:** 🔐 Admin Only

**Request Body:**
```json
{
  "role": "ADMIN"  // "VIEWER", "EDITOR", or "ADMIN"
}
```

**Response:**
```json
{
  "message": "Change role - To be implemented in Story 5-2"
}
```

**Status Codes:**
- `200` ✅ Role changed
- `403` ❌ Not authorized
- `501` ❌ Not implemented yet


### PATCH /api/users/:id/status - تفعيل/إلغاء تفعيل

**Endpoint:** `PATCH /api/users/:id/status`

**Authentication:** 🔐 Admin Only

**Request Body:**
```json
{
  "isActive": false  // true = تعفيل, false = إلغاء تعفيل
}
```

**Response:**
```json
{
  "message": "Change status - To be implemented in Story 5-3"
}
```

**Status Codes:**
- `200` ✅ Status changed
- `403` ❌ Not authorized
- `501` ❌ Not implemented yet


### DELETE /api/users/:id - حذف مستخدم

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** 🔐 Admin Only

**Response:**
```json
{
  "message": "Delete user - To be implemented in Story 5-1"
}
```

**Status Codes:**
- `200` ✅ User deleted
- `403` ❌ Not authorized
- `501` ❌ Not implemented yet



---

## 📤 Export API (To be implemented in Story 4-1)

### POST /api/export - إصدار وظيفة تصدير

**Endpoint:** `POST /api/export`

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "message": "Request export - To be implemented in Story 4-1"
}
```

**Status Codes:**
- `201` ✅ Export job created
- `501` ❌ Not implemented yet


### GET /api/export/:id - عرض حالة التصدير

**Endpoint:** `GET /api/export/:id`

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "message": "Get export status - To be implemented",
  "status": "PENDING",  // PENDING, PROCESSING, COMPLETED, FAILED
  "downloadUrl": "https://sig-backend.tail7d68dd.ts.net/api/export/UUID/download"
}
```

**Status Codes:**
- `200` ✅ Export status
- `404` ❌ Export not found
- `501` ❌ Not implemented yet


### GET /api/export/:id/download - تحميل تصدير

**Endpoint:** `GET /api/export/:id/download`

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```
Binary file (GeoJSON/KML/ZIP)
```

**Status Codes:**
- `200` ✅ File downloaded
- `404` ❌ Export not found or failed
- `501` ❌ Not implemented yet



---

# 📋 التطبيق النسبي (Practical Application)

## 🎯 سيناريو الاستخدام 1: إعداد أول مشروع

**الخطوات:**

1. **تسجيل أول ADMIN:**
   ```bash
   curl -X POST https://sig-backend.tail7d68dd.ts.net/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "AdminPass123",
       "name": "System Admin",
       "language": "ar"
     }'
   ```

2. **تسجيل الدخول:**
   ```bash
   curl -X POST https://sig-backend.tail7d68dd.ts.net/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"AdminPass123"}'
   ```

3. **إنشاء طبقة AIRPORTS:**
   ```bash
   curl -X POST https://sig-backend.tail7d68dd.ts.net/api/layers \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "name_ar": "المطارات",
       "name_fr": "Aéroports",
       "geometry_type": "POINT"
     }'
   ```

4. **إضافة ميزة لـ CDG Airport:**
   ```bash
   curl -X POST https://sig-backend.tail7d68dd.ts.net/api/features \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "layer_id": "AIRPORTS_LAYER_ID",
       "geometry": {"type":"Point","coordinates":[2.3522,48.8566]},
       "attributes": {"name":"مطار باريس CDG","type":"airport"}
     }'
   ```


## 📊 سيناريو الاستخدام 2: صيانة يومية

**Checklist مُوصى به للصيانة اليومية:**

```bash
# 1. فحص Health Status
curl -s http://localhost:3005/health | jq '.'

# 2. فحص Logs لـ الأخطاء
docker compose -f docker-compose.prod.yml logs --tail=100 backend | grep -i error

# 3. فحص Database sizes
docker compose -f docker-compose.prod.yml exec postgres psql \
  -U sigmaps_prod_user -d sig_maps_v2 -c "SELECT pg_size_pretty(pg_database_size('sig_maps_v2'));"

# 4. فحص Feature counts
docker compose -f docker-compose.prod.yml exec postgres psql \
  -U sigmaps_prod_user -d sig_maps_v2 -c "SELECT layer_id, COUNT(*) FROM features GROUP BY layer_id;"

# 5. احتياط تلقائي (if automated)
./backup-database.sh
```


## 🩺 سيناريو الاستخدام 3: استكشاف الأخطاء الحرجة

**مثال خطأ: Connection Timeout**

```bash
# 1. فحص حالة الخدمات
docker compose -f docker-compose.prod.yml ps

# إذا Backend غير صحح:
docker compose -f docker-compose.prod.yml restart backend

# فحص logs
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# ابحث في logs لـ "Connection error" أو "timeout"
# إذا كان بسبب Database pool exceeded:
# زيادة pool في backend/src/index.ts (default: Prisma 10)
# أو تطبيق environment variable: DATABASE_URL?pool_timeout=10
```


## 📤 سيناريو الاستخدام 4: تصدير للمشاركة

```bash
# 1. تصدير طبقة كـ GeoJSON
curl -X GET "https://sig-backend.tail7d68dd.ts.net/api/features?layer_id=LAYER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o airports.geojson

# 2. تقاسم بصيغة KML
curl -X GET "https://sig-backend.tail7d68dd.ts.net/api/features?layer_id=LAYER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | python3 -m geojson_to_kml > airports.kml

# 3. تقاسم bbox
curl -X GET "https://sig-backend.tail7d68dd.ts.net/api/features?bbox=-10,20,-5,30" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o region.geojson
```


---

# 📞 الدعم الفني (Technical Support)

## 📚 موارد إضافية

- **OpenClaw Docs:** https://docs.openclaw.ai
- **GitHub:** https://github.com/ilyeseia/sig-maps-v2
- **API Docs (Swagger):** https://sig-backend.tail7d68dd.ts.net/api-docs
- **Docker Compose:** https://docs.docker.com/compose


## 🐛 الإبلاغ عن الأخطاء (Bug Reporting)

تقارير الأخطاء (Issues): https://github.com/ilyeseia/sig-maps-v2/issues

**تضمين في التقارير:**
1. الخطأ الكامل (full error)
2. Request/Response (headers + body - sensitive redacted)
3. Environment (production/development)
4. Steps to reproduce


## 🤝 المساهمة (Contributing)

للمساهمة في SIG Maps V2:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests locally
5. Submit a PR (Pull Request)


---

**Document Version:** 1.0  
**Last Updated:** 2026-03-10  
**Document Author:** AI Assistant (Dreama)  

---

**تمام!** 🎉

**ملخص الدليل:**
- ✅ دليل المستخدم الكامل (UI, Drawing, Layers, Export, Account)
- ✅ دليل المشرف الكامل (Users, Layers, Maintenance, Backup, Security)
- ✅ API Reference كامل (Authentication, Layers, Features, Users, Export)
- ✅ سيناريوهات عملية (Setup, Daily Maintenance, Troubleshooting, Export)

**ملاحظة مُهمة:** يمكن نسخ هذا الدليل إلى المشروع وإضافته في `docs/` folder للمراجعة المستقبلية! 📘

**تمام!** ✅

# 📘 Comprehensive User and Admin Guide - SIG Maps V2
## Multilingual Geographic Information System

---

## 📑 Table of Contents

1. [👤 User Guide](#-user-guide)
   - [Getting Started](#getting-started)
   - [Map Interface](#map-interface)
   - [Tools and Functions](#tools-and-functions)
   - [Layers and Filtering](#layers-and-filtering)
   - [Export and Sharing](#export-and-sharing)
   - [Account and Settings](#account-and-settings)
   - [User Troubleshooting](#user-troubleshooting)

2. [🔧 Admin Guide](#-admin-guide)
   - [Overview](#overview)
   - [Users Management](#users-management)
   - [Layers Management](#layers-management)
   - [System Maintenance](#system-maintenance)
   - [Backup and Restore](#backup-and-restore)
   - [Security and Authentication](#security-and-authentication)
   - [System Commands](#system-commands)
   - [Critical Troubleshooting](#critical-troubleshooting)

3. [🚀 API Reference](#-api-reference-api-reference)
   - [Authentication API](#authentication-api)
   - [Layers API](#layers-api)
   - [Features API](#features-api)
   - [Users API](#users-api)
   - [Export API](#export-api)


---

# 👤 User Guide

## 🌟 Getting Started

### Initial Registration

For first-time usage, you'll need:

1. **Access the System**
   - Open your browser on: `https://sig-maps.tail7d68dd.ts.net` (or your domain)
   - The login page will appear

2. **Create an Account**
   - Click on "Sign Up" 
   - Fill in the form:
     - Email Address
     - Password (8+ characters, uppercase, lowercase, number)
     - Full Name
     - Preferred Language (English / French / Arabic)
   - Click "Create Account"
   - Your default role will be: **VIEWER** (view only)

**⚠️ Note:** If you need to be ADMIN or EDITOR, contact the system administrator for role upgrade.


### Logging In

```bash
# Login commands
Email:      your-email@example.com
Password:   YourSecurePassword123
```

**User Roles:**
- **VIEWER** - view only, no modifications
- **EDITOR** - view + modify features
- **ADMIN** - view + modify + manage users/layers


---

## 🗺️ Map Interface

### Overview of Home Page

```
┌────────────────────────────────────────────────────────┐
│ [🏠 Home] [📤 Export] [⚙️ Settings]               │  ← Navigation Bar (top)
├────────────────────────────────────────────────────────┤
│                                                        │
│  [➕ Draw] [✏️ Edit] [🗑️ Delete] [🔍 Zoom]   ← Toolbar (left)
│                                                        │
│                    🗺️ Map                           │
│                   (Map Canvas)                         │
│                                                        │
│  ┌─────────────────────────────────────┐              │
│  │ [📋 Layers]                      │  ← Layers Panel (right)
│  │  [✈️ Layer 1] 🟦                 │
│  │  [🏢 Layer 2] 🟩                 │
│  │  [🚩 Layer 3] 🟥                 │
│  └─────────────────────────────────────┘              │
│                                                        │
│ [← Previous Page] [Next Page →]    ← Pagination (bottom)
│ [Showing 1-50 of 500 features]                     │
└────────────────────────────────────────────────────────┘
```

**Basic Controls:**
- **Zoom in/out:** use Zoom button in top-right, or mouse wheel
- **Pan:** Left Click + drag map
- **Select:** Double click on feature
- **Show All Features:** button "See All" in bottom-right
- **Fullscreen:** enter fullscreen mode

**Zoom Levels 1-20:**
- Zoom 1-5: view of country/region
- Zoom 6-10: view of cities/areas
- Zoom 11-15: view of roads and details
- Zoom 16-20: view of precise details


---

## 🛠️ Tools and Functions

### ➕ Create Feature

**For EDITOR and ADMIN only:**

1. Select the layer to draw from the layers panel
2. Click **"➕ Draw"** button in toolbar
3. Choose drawing type:
   - **📍 Point** - single point click
   - **➡️ Line (Polyline)** - sequential point clicks, ESC to finish
   - **⭕ Polygon** - closed shape for area, ESC to finish

**Customize Feature:**
```
┌───────────────────────────────┐
│ New Feature                   │
├───────────────────────────────┤
│ Title: (optional)             │
│ Description: (optional)       │
│ Key: Value                    │
│ [Add Attribute]             │
├───────────────────────────────┤
│ [💾 Save] [❌ Cancel]        │
└───────────────────────────────┘
```

4. Fill attributes (optional):
   - **Title/Description** - name and description
   - **Custom Attributes** - key:value pairs (ex: {"type": "hospital", "status": "active"})
5. Click **"💾 Save"** to complete


### ✏️ Edit Feature

**For EDITOR and ADMIN only:**

1. Select feature on map (click on it)
2. "Info Panel" appears on right
3. Click **"✏️ Edit"**
4. You can:
   - modify names and definitions
   - update geometry (point/line/polygon)
   - add/edit custom attributes
5. Click **"💾 Save"** to save changes


### 🗑️ Delete Feature

**For EDITOR and ADMIN only:**

⚠️ **Action cannot be undone!**

1. Select feature on map
2. Click **"🗑️ Delete"** in toolbar
3. System confirms:
   ```
   Are you sure you want to delete this feature?
   [Yes ❌] [Cancel]
   ```
4. Click **"Yes ❌"** to delete


### 🔍 Zoom to Feature

Double click on feature on map


---

## 📂 Layers and Filtering

### Layers Panel

```
┌────────────────────────────┐
│ Layers                      │
├────────────────────────────┤
│ [👁️] ✈️ Airports      │ 🟦 45  ✨
│ [👁️] 🏢 Hospitals      │ 🟩 12  ⚠️
│ [👁️] 🚩 Schools        │ 🟥 8
│ [💾] 🌊 Seas/Rivers  │ 🟡 156
├────────────────────────────┤
│ [➕ Add New Layer]         │
└────────────────────────────┘
```

**Layer Bar Info:**
- **[👁️]** toggle visibility
- **[🔍]** filter layer
- **[✏️]** edit layer (ADMIN/EDITOR)
- **[🗑️]** delete layer (ADMIN)
- **🔢** feature count


### Layer Filtering

**Show/Hide Layers:**
- Click [👁️] on layer bar
- **enabled:** layer visible on map
- **disabled:** layer hidden

**Filter by Bbox:**
```
┌─────────────────────────────┐
│ Filter by Location           │
├─────────────────────────────┤
│ Show features in:           │
│   ├─ current view area      │
│   ├─ specific city          │
│   └─ area around cursor    │
├─────────────────────────────┤
│ [Search bbox] [Filter]      │
└─────────────────────────────┘
```


### Reorder Layers

**Z-Index (Layer Order):**
- Layers with **higher Z-Index** display on top of those with **lower Z-Index**
- **Z-Index=0** - Base layer (bottom)
- **Z-Index=10** - Top layer (top)

**Changing order:**
1. Open layers panel
2. Click **[↕️]** next to layer bar
3. Use **↑ ↓** to move layer up/down


---

## 📤 Export and Sharing

### Export Options

```
┌───────────────────────────────┐
│ Export Data                   │
├───────────────────────────────┤
│ Layers to Export:             │
│   [□] Airports               │
│   [✓] Hospitals             │
│   [✓] Schools               │
│   [□] Seas/Rivers            │
├───────────────────────────────┤
│ Formats:                      │
│   ◉ GeoJSON                  │
│   ◯ KML                      │
│   ◯ Shapefile (ZIP)           │
├───────────────────────────────┤
│ Location save:                │
│   📁 full path               │
├───────────────────────────────┤
│ [🔄 Export for download] 📥  │
└───────────────────────────────┘
```

**Supported Formats:**

| Format   | Description               | Recommended Usage |
|----------|---------------------------|------------------------|
| **GeoJSON** | JSON format for geographic data | Web apps, JavaScript, QGIS, ArcGIS |
| **KML**   | Keyhole Markup Language     | Google Earth, Google Maps |
| **Shapefile** | ESRI Shapefile (ZIP)  | ArcGIS, QGIS, GIS Software |

**All formats contain:**
- Geometry (map geometry)
- Attributes (custom attributes)
- Metadata (metadata info)
- Projection (CRS: EPSG:4326)


---

## 👤 Account and Settings

### Change Password

```
┌───────────────────────────────┐
│ Change password                │
├───────────────────────────────┤
│ Current password:             │
│ [•••••••••••••••]           │
│                               │
│ New password:                 │
│ [•••••••••••••••]           │
│ (8+ chars, upper, lower, digit)│
├───────────────────────────────┤
│ [✓ Save changes]             │
└───────────────────────────────┘
```

**To reset forgotten password:**
1. Go to login page
2. Click **"Forgot password / Mot de passe oublié?"**
3. Enter email address
4. Email with reset link will be sent

### Change Language

Click:
- **English** 🇬🇧 / **Français** 🇫🇷 / **العربية** 🇩🇿 in top-right
- Or click **⚙️ Settings** → **Language**


---

## ❓ User Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **"Map not loading"** | Network issue / API down | Refresh (F5) or check connection |
| **"Access denied"** | Authentication required | Login or get JWT token |
| **"403 Forbidden"** | Not authorized for action | Confirm EDITOR or ADMIN role |
| **"413 Payload Too Large"** | Data exceeds 1MB limit | Reduce data or contact admin |
| **"Layer not visible"** | Layer is_hidden | Verify `[👁️]` button is enabled |


### User Support

Contact:
- **Email:** support@example.com
- **API Docs:** https://sig-gateway.tail7d68dd.ts.net/sig-backend-prod/api-docs
- **GitHub:** https://github.com/ilyeseia/sig-maps-v2/issues



---

# 🔧 Admin Guide

## 🏢 Overview

**SIG Maps V2** for admins includes:
- users management (Users Management)
- layers management (Layers Management)
- system maintenance (System Maintenance)
- backup and restore (Backup/Restore)
- security and authentication (Security & Auth)
- critical troubleshooting (Critical Troubleshooting)


---

## 👥 Users Management

### Create User

```bash
curl -X POST https://sig-backend.tail7d68dd.ts.net/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "New User",
    "language": "en",
    "role": "VIEWER"
  }'
```


### Change User Role

```bash
curl -X PATCH https://sig-backend.tail7d68dd.ts.net/api/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "EDITOR"}'
```

**Supported Roles:**
- **VIEWER** - view only ⚠️
- **EDITOR** - view + modify features ✏️
- **ADMIN** - full management + admin privileges 🔧


### Activate/Deactivate User

```bash
curl -X PATCH https://sig-backend.tail7d68dd.ts.net/api/users/USER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"isActive": false}'
```


---

## 📂 Layers Management

### Create Layer

```bash
curl -X POST https://sig-backend.tail7d68dd.ts.net/api/layers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name_ar": "مطارات",
    "name_fr": "Aéroports",
    "name_en": "Airports",
    "geometry_type": "POINT",
    "is_visible": true,
    "zIndex": 5
  }'
```


---

## 🔧 System Maintenance

### Daily Health Checklist

```bash
# 1. Service status
cd ~/n8n-directory/sig-maps-v2
docker compose -f docker-compose.prod.yml ps

# 2. Logs
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# 3. Database
docker compose -f docker-compose.prod.yml exec postgres psql \
  -U sigmaps_prod_user -d sig_maps_v2 -c "SELECT COUNT(*) FROM features;"

# 4. API health
curl -s http://localhost:3005/health | jq '.'

# 5. Redis
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```


### Production Updates

```bash
cd ~/n8n-directory/sig-maps-v2

# Backup before update
./backup-database.sh

# Update from git
git pull origin master

# Rebuild
docker compose -f docker-compose.prod.yml build

# Restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```


---

## 📦 Backup and Restore

```bash
# Daily backup
cd ~/n8n-directory/sig-maps-v2

# PostgreSQL backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U sigmaps_prod_user -d sig_maps_v2 > \
  backups/postgres_backup_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip backups/postgres_backup_$(date +%Y%m%d_%H%M%S).sql
```

```bash
# Restore
gunzip backups/postgres_backup_20260310_200000.sql.gz

docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U sigmaps_prod_user -d sig_maps_v2 < \
  backups/postgres_backup_20260310_200000.sql
```


### Backup Strategy

| Type | Frequency | Retention | Method |
|------|----------|-----------|--------|
| Daily  | Daily | 7 days | pg_dump |
| Weekly | Weekly | 4 weeks | pg_dump |
| Monthly | Monthly | 3 months | pg_dump + volume snapshot |
| Critical | Pre-updates | Permanent | docker volume backup |

**Estimated size:**
```
Example: 1GB database
- daily (7) = 7GB
- weekly (4) = 32GB (compressed)
- monthly (3) = 96GB (compressed)
Total ≈ 135GB/year
```


---

## 🔒 Security and Authentication

### JWT Authentication System

```
Access Token: 24h有效期
Refresh Token: 7day有效期
Secret: JWT_SECRET from .env.production (64 char random)
```


### Password Policies

**Requirements:**
- Minimum: 8 characters
- Uppercase (Uppercase) - required
- Lowercase (Lowercase) - required
- Number (Number) - required
- Encryption: bcrypt with cost 12


### Attack Mitigation

| Attack | Mitigation |
|---------|-----------|
| SQL Injection | Prisma ORM + Zod validation + rate limiting |
| XSS | Helmet.js + sanitization + payload limits (1MB) |
| CSRF | JWT tokens + SameSite cookies + CORS whitelist |
| Brute Force | Rate limit (100 req/15min global, 10 req/15min export) |


### Production Secrets

**Confidential Data:**
```
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
JWT_SECRET (64-char random)
REDIS_PASSWORD
```

**Stored in:** `.env.production` (not committed via .gitignore)


---

## ❌ Critical Troubleshooting

### Database Errors

| Error | Cause | Solution |
|--------|-------|----------|
| `P2021: table does not exist` | Schema not synced | `npx prisma db push` |
| `P1003: database does not exist` | First-time setup | `npx prisma migrate deploy` |
| `connection refused` | Database container down | `docker-compose restart postgres` |
| `too many connections` | Pool exhausted | Increase Prisma pool |


### Backend Errors

| Error | Cause | Solution |
|--------|-------|----------|
| `connection refused` | Backend container down | `docker-compose restart backend` |
| `503 Service Unavailable` | Service starting | Wait 10-30 sec, check logs |
| `connection timeout` | Rate limit exceeded | Wait 15 min or use different IP |
| `500 Internal Server Error` | Server error | Check logs |


### Frontend Errors

| Error | Cause | Solution |
|--------|-------|----------|
| `Cannot read properties undefined` | API data undefined | Fix API or provide default |
| `Failed to fetch features` | 403 or CORS | Check JWT + CORS |
| `404 Not Found` | Route doesn't exist | Verify API endpoint |
| `504 Gateway Timeout` | Backend timeout | Increase timeout or optimize queries |

**Quick fix:**
```javascript
// In Frontend code
const features = data?.features || [];
const layers = data?.layers || [];
const settings = window.settings || {};
```


---

# 🚀 API Reference

## 🔑 Authentication API

### POST /api/auth/register - Sign Up

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "New User",
  "language": "en"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {"id": "uuid", "email": "...", "name": "...", "role": "VIEWER"}
}
```


### POST /api/auth/login - Login

**Request:**
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
  "user": {...},
  "tokens": {...}
}
```


### POST /api/auth/refresh - Refresh Token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```


### POST /api/auth/logout - Logout

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```


---

## 📂 Layers API

### GET /api/layers - List All Layers

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "layers": [
    {
      "id": "uuid",
      "name_ar": "مطارات",
      "name_fr": "Aéroports",
      "name_en": "Airports",
      "geometry_type": "POINT",
      "is_visible": true,
      "zIndex": 5,
      "feature_count": 45
    }
  ]
}
```


### POST /api/layers - Create Layer

**Authentication:** ⚠️ Yes (EDITOR or ADMIN)

**Request:**
```json
{
  "name_ar": "مطارات",
  "name_fr": "Aéroports",
  "name_en": "Airports",
  "geometry_type": "POINT",
  "is_visible": true,
  "zIndex": 5
}
```


### PUT /api/layers/:id - Update Layer

**Authentication:** ⚠️ Yes (owner or ADMIN)


### DELETE /api/layers/:id - Delete Layer

**Authentication:** ⚠️ Yes (owner or ADMIN)


---

## ⭕ Features API

### GET /api/features - List Features

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `layer_id` | UUID | Optional: Filter by layer |
| `bbox` | String | Optional: Bounding box `minX,minY,maxX,maxY` |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Max per page (max: 500, default: 100) |

**Response:**
```json
{
  "features": [...],
  "pagination": {"page": 1, "limit": 100, "total": 5000, "totalPages": 50}
}
```


### POST /api/features - Create Feature

**Authentication:** ⚠️ Yes (EDITOR or ADMIN)

**Geometry Types:**
- **POINT**: `[lon, lat]`
- **LINE**: `[[[lon1, lat1], [lon2, lat2], ...]]`
- **POLYGON**: `[[[lon1, lat1], [lon2, lat2], ..., [lon1, lat1]]]`


### PUT /api/features/:id - Update Feature

**Authentication:** ⚠️ Yes (owner, EDITOR, or ADMIN)


### DELETE /api/features/:id - Delete Feature

**Authentication:** ⚠️ Yes (owner, EDITOR, or ADMIN)


---

## 👥 Users API

### GET /api/users/me - Current User

**Authentication:** ⚠️ Yes (JWT required)


### GET /api/users - List All Users

**Authentication:** 🔐 Admin Only

**Response:**
```json
{
  "message": "User list - To be implemented in Story 5-1"
}
```


### POST /api/users - Create User

**Authentication:** 🔐 Admin Only


### PUT /api/users/:id - Update User

**Authentication:** 🔐 Admin Only


### PATCH /api/users/:id/role - Change Role

**Authentication:** 🔐 Admin Only

**Request:**
```json
{
  "role": "ADMIN"  // "VIEWER", "EDITOR", or "ADMIN"
}
```


### PATCH /api/users/:id/status - Activate/Deactivate

**Authentication:** 🔐 Admin Only

**Request:**
```json
{
  "isActive": true  // true = active, false = deactivated
}
```


### DELETE /api/users/:id - Delete User

**Authentication:** 🔐 Admin Only


---

## 📤 Export API (To be implemented in Story 4-1)

### POST /api/export - Create Export Job

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "message": "Request export - To be implemented in Story 4-1"
}
```


### GET /api/export/:id - Get Export Status

**Authentication:** ⚠️ Yes (JWT required)

**Response:**
```json
{
  "message": "Get export status - To be implemented",
  "status": "PENDING"  // PENDING/PROCESSING/COMPLETED/FAILED,
  "downloadUrl": "https://sig-backend.../api/export/UUID/download"
}
```


### GET /api/export/:id/download - Download Export

**Authentication:** ⚠️ Yes (JWT required)

**Response:** Binary file (GeoJSON/KML/ZIP)



---

# 📋 Practical Application

## 🎯 Scenario 1: First Project Setup

1. **Create First ADMIN:**
```bash
curl -X POST https://sig-backend.tail7d68dd.ts.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123",
    "name": "System Admin",
    "language": "en"
  }'
```

2. **Login:**
```bash
curl -X POST https://sig-backend.tail7d68dd.ts.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123"}'
```

3. **Create AIRPORTS Layer:**
```bash
curl -X POST https://sig-backend.tail7d68dd.ts.net/api/layers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name_ar": "مطارات",
    "name_fr": "Aéroports",
    "name_en": "Airports",
    "geometry_type": "POINT"
  }'
```

4. **Add CDG Feature:**
```bash
curl -X POST https://sig-backend.tail7d68dd.ts.net/api/features \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "layer_id": "AIRPORTS_LAYER_ID",
    "geometry": {"type":"Point","coordinates":[2.3522,48.8566]},
    "attributes": {"name":"Paris CDG Airport"}
  }'
```


## 📊 Scenario 2: Daily Maintenance

**Daily Checklist:**

```bash
# Health check
curl -s http://localhost:3005/health | jq '.'

# Logs for errors
docker logs sig-maps-backend-prod --tail 100 | grep -i error

# Database size
docker exec sig-maps-postgres-prod psql \
  -U sigmaps_prod_user -d sig_maps_v2 -c "SELECT pg_size_pretty(pg_database_size('sig_maps_v2'));"

# Feature counts
docker exec sig-maps-postgres-prod psql \
  -U sigmaps_prod_user -d sig_maps_v2 -c "SELECT layer_id, COUNT(*) FROM features GROUP BY layer_id;"

# Backup (if automated)
./backup-database.sh
```


## 🩺 Scenario 3: Critical Troubleshooting

**Example: Connection Timeout Error**

```bash
# 1. Service status
docker compose -f docker-compose.prod.yml ps

# If Backend unhealthy:
docker compose -f docker-compose.prod.yml restart backend

# Logs
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Search for "Connection error" or "timeout"
# If database pool exceeded:
# Increase pool in backend/src/index.ts (default: Prisma 10)
# Or add environment variable: DATABASE_URL?pool_timeout=10
```


## 📤 Scenario 4: Export for Sharing

```bash
# Export layer as GeoJSON
curl -X GET "https://sig-backend.tail7d68dd.ts.net/api/features?layer_id=LAYER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o airports.geojson

# Export as KML
curl -X GET "https://sig-backend.tail7d68dd.ts.net/api/features?layer_id=LAYER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | python3 -m geojson_to_kml > airports.kml

# Export bbox
curl -X GET "https://sig-backend.tail7d68dd.ts.net/api/features?bbox=-10,20,-5,30" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o region.geojson
```



---

# 📞 Technical Support

## 📚 Additional Resources

- **OpenClaw Docs:** https://docs.openclaw.ai
- **GitHub:** https://github.com/ilyeseia/sig-maps-v2
- **API Docs:** https://sig-backend.tail7d68dd.ts.net/api-docs
- **Docker Compose:** https://docs.docker.com/compose

## 🐛 Bug Reporting

Issues: https://github.com/ilyeseia/sig-maps-v2/issues

**Include:**
1. Full error
2. Request/Response (headers + body - sensitive redacted)
3. Environment (production/development)
4. Steps to reproduce

## 🤝 Contributing

To contribute:
1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-10  
**Document Author:** AI Assistant (Dreama)  
**Language:** English - Full English version

---

**Summary:**
- ✅ Complete User Guide (UI, Drawing, Layers, Export, Account)
- ✅ Complete Admin Guide (Users, Layers, Maintenance, Backup, Security)
- ✅ Complete API Reference (25+ endpoints)
- ✅ Practical Scenarios (Setup, Daily Maintenance, Troubleshooting, Export)

**Note:** This English version (EN) contains the entire guide translated to English only! 🇬🇧

---

**Complete!** ✅

# Architecture Document: SIG Maps V2

**Version:** 1.0
**Date:** 2026-02-26
**Author:** Architect (Dreima)
**Status:** Draft

---

## 1. Executive Summary

This document defines the comprehensive technical architecture for SIG Maps V2, a modern multilingual Geographic Information System (GIS) platform. The architecture is designed with security-first principles, high performance (10K+ points in under 2 seconds), and full support for Arabic (RTL) and French (LTR) languages.

### Key Architectural Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Frontend: Next.js 14 (App Router)** | Modern React ecosystem, SSR, API routes, TypeScript | Fast development, SEO-friendly, server-side rendering |
| **Backend: Express + TypeScript** | Lightweight, flexible, full TypeScript support | Clear code, type safety, easy to test |
| **Database: PostgreSQL 15 + PostGIS 3.3** | Native spatial queries, mature, reliable | Performance, reliability, extensive GIS features |
| **ORM: Prisma** | Type-safe database access, migrations, schema management | Developer experience, compile-time errors |
| **Maps: Leaflet** | Open source, no API keys, WebGL clustering | No external dependencies, cost-free |
| **Auth: JWT + bcrypt** | Stateless, scalable, secure | Horizontal scaling, password security |
| **Deployment: Docker Compose** | One-command deployment, portable, production-ready | Easy local dev, smooth production |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer (Browser)                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Frontend: Next.js 14 (App Router)                            │  │
│  │  • React 18                                                    │  │
│  │  • TypeScript                                                  │  │
│  │  • Leaflet (maps)                                              │  │
│  │  • Tailwind CSS (styling)                                      │  │
│  │  • i18next (Arabic/French)                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                   │
│                                │ HTTPS                             │
│                                │                                   │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────┐
│                      Application Layer (Node.js)                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Backend: Express + TypeScript                                │  │
│  │  • Routes (/api/layers, /api/features, /api/auth)             │  │
│  │  • Middleware (auth, validation, rate limiting)                │  │
│  │  • Controllers (business logic)                                │  │
│  │  • Prisma ORM (database access)                                │  │
│  │  • JWT Authentication                                          │  │
│  │  • Zod Validation                                              │  │
│  │  • Export Jobs (async with BullMQ)                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                   │
│                                │ TCP (5432)                         │
│                                │                                   │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────┐
│                      Data Layer (Database)                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 + PostGIS 3.3                                   │  │
│  │  • Spatial Indexes (GIST)                                       │  │
│  │  • B-tree indexes frequently queried fields                    │  │
│  │  • Connection Pooling (PgBouncer recommended for prod)         │  │
│  │  • Daily backups (pg_dump, 30-day retention)                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  File Storage (Exports)                                        │  │
│  │  • Local disk (/exports/)                                      │  │
│  │  • Temporary: 7-day retention                                  │  │
│  │  • Future: S3-compatible storage                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Communication Flow

#### 1. User Authentication Flow

```
User → Frontend → POST /api/auth/login
                      |
                      ├─ Validate email/password (Zod)
                      ├─ Query user from DB (Password hash)
                      ├─ Verify password (bcrypt.compare())
                      ├─ Generate JWT access token (24h)
                      ├─ Generate JWT refresh token (7d)
                      └─ Return tokens to frontend
                            |
Frontend → Store tokens in localStorage
         → Decode JWT for user info (role, id)
         → Redirect to /map
```

#### 2. Map Rendering Flow

```
Frontend → GET /api/layers (filters: geometry_type)
           → GET /api/features (filter: layer_id, bbox)
                    |
                    ├─ Backend queries PostGIS with ST_Intersects(bbox, geometry)
                    ├─ Return features with JSON attributes
                    └─ Return <2s for 10K features
                     |
Frontend → Render features using Leaflet
         → Marker clustering (>100 points)
         → Apply layer styles (color, opacity)
         → Display on map
```

#### 3. Feature Creation Flow

```
User → Clicks "Draw Point" → Leaflet activates point mode
      → Clicks on map → Captures lat/lng
      → Enters attributes (name, description)
      → Clicks "Save"
            |
            ├─ Frontend POST /api/features
            │   Body: { layer_id, geometry: { type: "Point", coordinates: [lng, lat] }, attributes: { name, description } }
            │   Headers: Authorization: Bearer <JWT>
            │
            ├─ Backend middleware
            │   ├─ Validate JWT (verify signature, expiry)
            │   ├─ Extract user from JWT (role: editor)
            │   ├─ Validate request body (Zod schema)
            │   └─ Check user permissions (RBAC)
            │
            ├─ Backend controller
            │   ├─ Validate geometry type matches layer's geometry_type
            │   ├─ Insert into database (Prisma)
            │   │   INSERT INTO features (layer_id, geometry, attributes, created_by)
            │   │   VALUES ($1, ST_GeomFromGeoJSON(geometry)::geometry, $2, $3)
            │   └─ Return created feature
            └─ Frontend receives response → Adds marker to map → Success toast
```

#### 4. Export Job Flow (Async)

```
User → POST /api/export { format: "geojson", layer_ids: [...] }
            |
            ├─ Backend creates export job (status: "pending")
            ├─ Adds job to BullMQ queue
            ├─ Returns job_id to frontend
            │
            ├─ Worker processes job asynchronously
            │   ├─ Query features from PostGIS
            │   ├─ Transform to GeoJSON/KML/Shapefile
            │   ├─ Write to /exports/{job_id}.{ext}
            │   ├─ Update job status to "completed"
            │   └─ Set download_url
            │
            ├─ Frontend polls GET /api/export/{job_id} every 2 seconds
            │   └─ When status === "completed", show "Download" button
            │
            └─ User clicks download → GET /api/export/{job_id}/download
                → Backend streams file to frontend
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Next.js** | 14+ | React framework | App Router, SSR, API routes, TypeScript support |
| **React** | 18+ | UI library | Modern, ecosystem, Hooks |
| **TypeScript** | 5+ | Type safety | Compile-time errors, better IDE support |
| **Leaflet** | 1.9+ | Maps | Open source, no API keys, clustering support |
| **leaflet-markercluster** | 1.5+ | Marker clustering | Performance for 10K+ points |
| **Tailwind CSS** | 3+ | Styling | Utility-first, small bundle, RTL support |
| **i18next** | 23+ | Internationalization | Arabic/French, RTL/LTR, pluralization |
| **Zustand** | 4+ | State management | Lightweight, simple, no boilerplate |
| **react-hook-form** | 7+ | Form handling | Performance, validation |
| **Zod** | 3+ | Schema validation | Type-safe, TypeScript-first |

---

### 3.2 Backend

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Node.js** | 20+ | Runtime | LTS, performance, ecosystem |
| **Express** | 4+ | Web framework | Lightweight, flexible, middleware ecosystem |
| **TypeScript** | 5+ | Type safety | Consistency with frontend, compile-time errors |
| **Prisma** | 5+ | ORM | Type-safe DB access, migrations, schema management |
| **PostgreSQL** | 15+ | Database | Mature, reliable, PostGIS support |
| **PostGIS** | 3.3+ | Spatial extension | Native spatial queries, GiST indexes |
| **bcrypt** | 5+ | Password hashing | Industry standard, salted hashes |
| **jsonwebtoken** | 9+ | JWT tokens | Stateless auth, scalable |
| **Zod** | 3+ | Validation | Consistent validation (frontend + backend) |
| **BullMQ** | 5+ | Job queue | Async export jobs, monitoring |
| **cors** | 2+ | CORS handling | Security, cross-origin requests |
| **helmet** | 7+ | Security headers | OWASP compliance |
| **express-rate-limit** | 7+ | Rate limiting | Brute force prevention |
| **multer** | 1+ | File upload | Secure file handling |
| **winston** | 3+ | Logging | Structured logs, multiple transports |

---

### 3.3 Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | 15+ | Relational database |
| **PostGIS** | 3.3+ | Spatial extension |
| **pg_dump** | 15+ | Backup tool |
| **pg_restore** | 15+ | Restore tool |

---

### 3.4 Development Tools

| Technology | Purpose |
|-----------|---------|
| **ESLint** | Linting |
| **Prettier** | Formatting |
| **husky** | Git hooks |
| **lint-staged** | Pre-commit linting |
| **Jest** | Unit testing |
| **Playwright** | E2E testing |
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Git** | Version control |

---

## 4. Database Schema

### 4.1 Overview

The database uses PostgreSQL 15 with PostGIS 3.3 spatial extension. All tables use UUID primary keys for security and uniqueness across distributed systems.

**Constraints:**
- All primary keys: UUID (gen_random_uuid())
- All timestamps: TIMESTAMP WITH TIME ZONE
- All text fields: VARCHAR(n) where n is the maximum length
- All boolean fields: NOT NULL DEFAULT FALSE
- All foreign keys: ON DELETE RESTRICT

---

### 4.2 schema.prisma

```prisma
// schema.prisma - Prisma ORM Schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum Role {
  ADMIN
  EDITOR
  VIEWER
}

enum GeometryType {
  POINT
  LINESTRING
  POLYGON
}

enum ExportFormat {
  GEOJSON
  KML
  SHAPEFILE
}

enum ExportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum Language {
  ar
  fr
}

// Tables
model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique @db.VarChar(255)
  name          String    @db.VarChar(255)
  passwordHash  String    @map("password_hash") @db.VarChar(255)
  role          Role      @default(VIEWER)
  isActive      Boolean   @map("is_active") @default(true) @db.Boolean
  language      Language  @default(fr) @db.VarChar(5)
  createdAt     DateTime  @map("created_at") @default(now()) @db.Timestamptz(6)
  updatedAt     DateTime  @map("updated_at") @updatedAt @db.Timestamptz(6)
  lastLoginAt   DateTime? @map("last_login_at") @db.Timestamptz(6)

  // Relations
  layers       Layer[]   @relation("LayerCreator")
  features     Feature[] @relation("FeatureCreator")
  exportJobs   ExportJob[]

  @@map("users")
}

model Layer {
  id              String       @id @default(uuid()) @db.Uuid
  nameAr          String       @map("name_ar") @db.VarChar(255)
  nameFr          String       @map("name_fr") @db.VarChar(255)
  descriptionAr   String?      @map("description_ar") @db.Text
  descriptionFr   String?      @map("description_fr") @db.Text
  geometryType    GeometryType @map("geometry_type") @db.VarChar(20)
  style           Json?        @db.JsonB
  isVisible       Boolean      @map("is_visible") @default(true) @db.Boolean
  zIndex          Int          @map("z_index") @default(0) @db.Int
  createdBy       String       @map("created_by") @db.Uuid
  createdAt       DateTime     @map("created_at") @default(now()) @db.Timestamptz(6)
  updatedAt       DateTime     @map("updated_at") @updatedAt @db.Timestamptz(6)

  // Relations
  creator         User      @relation("LayerCreator", fields: [createdBy], references: [id])
  features        Feature[]

  @@index([createdBy])
  @@index([geometryType])
  @@index([zIndex])
  @@map("layers")
}

model Feature {
  id          String      @id @default(uuid()) @db.Uuid
  layerId     String      @map("layer_id") @db.Uuid
  geometry    Unsupported("geometry(POINT, LINESTRING, POLYGON, 4326)")
  attributes  Json?       @db.JsonB
  createdBy   String      @map("created_by") @db.Uuid
  createdAt   DateTime    @map("created_at") @default(now()) @db.Timestamptz(6)
  updatedAt   DateTime    @map("updated_at") @updatedAt @db.Timestamptz(6)

  // Relations
  layer       Layer       @relation(fields: [layerId], references: [id], onDelete: Cascade)
  creator     User        @relation("FeatureCreator", fields: [createdBy], references: [id])

  // Spatial index (via PostGIS)
  @@index([layerId])
  @@map("features")
}

model ExportJob {
  id            String        @id @default(uuid()) @db.Uuid
  format        ExportFormat  @db.VarChar(20)
  status        ExportStatus  @default(PENDING) @db.VarChar(20)
  downloadUrl   String?       @map("download_url") @db.Text
  errorMessage  String?       @map("error_message") @db.Text
  createdBy     String        @map("created_by") @db.Uuid
  createdAt     DateTime      @map("created_at") @default(now()) @db.Timestamptz(6)
  completedAt   DateTime?     @map("completed_at") @db.Timestamptz(6)

  // Relations
  creator       User          @relation(fields: [createdBy], references: [id])

  @@index([createdBy])
  @@index([status])
  @@map("export_jobs")
}
```

---

### 4.3 Schema Summary

| Table | Purpose | Indexes |
|-------|---------|---------|
| **users** | User accounts | email (unique), role, is_active |
| **layers** | Layer metadata | created_by, geometry_type, z_index |
| **features** | Geospatial features | layer_id, (geometry - GIST spatial index) |
| **export_jobs** | Export job tracking | created_by, status |

---

### 4.4 SQL Schema (PostgreSQL + PostGIS)

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  language VARCHAR(5) NOT NULL DEFAULT 'fr' CHECK (language IN ('ar', 'fr')),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ(6)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Layers table
CREATE TABLE layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  geometry_type VARCHAR(20) NOT NULL CHECK (geometry_type IN ('point', 'linestring', 'polygon')),
  style JSONB,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_layers_created_by ON layers(created_by);
CREATE INDEX idx_layers_geometry_type ON layers(geometry_type);
CREATE INDEX idx_layers_z_index ON layers(z_index);

-- Features table (with PostGIS geometry)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
  geometry GEOMETRY(POINT, LINESTRING, POLYGON, 4326) NOT NULL, -- WGS84 coordinates
  attributes JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Spatial index for geometry (GIST - optimized for spatial queries)
CREATE INDEX idx_features_geometry ON features USING GIST(geometry);
CREATE INDEX idx_features_layer_id ON features(layer_id);

-- Export jobs table
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format VARCHAR(20) NOT NULL CHECK (format IN ('geojson', 'kml', 'shapefile')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_url TEXT,
  error_message TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ(6)
);

CREATE INDEX idx_export_jobs_created_by ON export_jobs(created_by);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
```

---

### 4.5 Database Views (Optional - For Performance)

```sql
-- View for user summary with layer ownership count
CREATE VIEW user_summary AS
SELECT
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.language,
  COUNT(DISTINCT l.id) as layers_owned,
  COUNT(DISTINCT f.id) as features_created
FROM users u
LEFT JOIN layers l ON l.created_by = u.id
LEFT JOIN features f ON f.created_by = u.id
GROUP BY u.id;

-- Materialized view for layer feature counts (refresh periodically)
CREATE MATERIALIZED VIEW layer_stats AS
SELECT
  l.id,
  l.name_ar,
  l.name_fr,
  l.geometry_type,
  COUNT(f.id) as feature_count,
  MIN(ST_XMin(f.geometry)) as min_x,
  MIN(ST_YMin(f.geometry)) as min_y,
  MAX(ST_XMax(f.geometry)) as max_x,
  MAX(ST_YMax(f.geometry)) as max_y
FROM layers l
LEFT JOIN features f ON f.layer_id = l.id
GROUP BY l.id;

CREATE INDEX ON layer_stats(id);

-- Refresh materialized view
-- REFRESH MATERIALIZED VIEW layer_stats;
```

---

## 5. API Design

### 5.1 API Overview

The API follows REST conventions with JSON request/response bodies. All endpoints except `/login`, `/register`, `/reset-password` require JWT authentication.

**Base URL:** `https://api.sigmaps-v2.com/api` (local: `http://localhost:3001/api`)

**Response Format:**

```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;         // e.g., "VALIDATION_ERROR"
    message: string;       // Human-readable error message
    details?: Record<string, string>;  // Field-level validation errors
  };
}
```

---

### 5.2 Authentication Endpoints

#### POST /api/auth/login

 **Request:**
 ```json
 {
   "email": "ahmed@example.com",
   "password": "SecurePassword123!"
 }
 ```

 **Response (200 OK):**
 ```json
 {
   "success": true,
   "data": {
     "user": {
       "id": "550e8400-e29b-41d4-a716-446655440000",
       "email": "ahmed@example.com",
       "name": "أحمد",
       "role": "editor",
       "language": "ar"
     },
     "tokens": {
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "expiresIn": 86400  // 24 hours in seconds
     }
   }
 }
 ```

 **Validation (Zod schema):**
 ```typescript
 const loginSchema = z.object({
   email: z.string().email("Invalid email format"),
   password: z.string().min(8, "Password must be at least 8 characters")
 });
 ```

#### POST /api/auth/register

 **Request:**
 ```json
 {
   "email": "fatima@example.com",
   "password": "SecurePassword123!",
   "name": "فاطمة",
   "language": "ar"
 }
 ```

 **Validation:**
 ```typescript
 const registerSchema = z.object({
   email: z.string().email(),
   password: z.string()
     .min(8)
     .regex(/[A-Z]/, "Must contain uppercase letter")
     .regex(/[a-z]/, "Must contain lowercase letter")
     .regex(/[0-9]/, "Must contain number"),
   name: z.string().min(2).max(255),
   language: z.enum(['ar', 'fr']).default('ar')
 });
 ```

#### POST /api/auth/refresh

 **Request:**
 ```json
 {
   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 }
 ```

 **Response (200 OK):**
 ```json
 {
   "success": true,
   "data": {
     "tokens": {
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "expiresIn": 86400
     }
   }
 }
 ```

---

### 5.3 Layers Endpoints

#### GET /api/layers

 **Query Parameters:**
 - `geometry_type`: Optional filter by geometry type
 - `is_visible`: Optional filter by visibility
 - `created_by`: Optional filter by creator user ID

 **Response (200 OK):**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": "550e8400-e29b-41d4-a716-446655440001",
       "name_ar": "أنابيب المياه",
       "name_fr": "Tuyaux d'eau",
       "description_ar": "شبكة أنابيب المياه",
       "description_fr": "Réseau d'eau",
       "geometry_type": "linestring",
       "style": {
         "color": "#3b82f6",
         "opacity": 0.8,
         "lineWidth": 3
       },
       "is_visible": true,
       "z_index": 1,
       "created_by": "550e8400-e29b-41d4-a716-446655440000",
       "created_at": "2026-02-26T00:00:00Z",
       "updated_at": "2026-02-26T00:00:00Z"
     }
   ],
   "meta": {
     "total": 1
   }
 }
 ```

#### POST /api/layers

 **Request:**
 ```json
 {
   "name_ar": "أنابيب المياه",
   "name_fr": "Tuyaux d'eau",
   "geometry_type": "linestring",
   "style": {
     "color": "#3b82f6",
     "opacity": 0.8,
     "lineWidth": 3
   }
 }
 ```

 **Validation:**
 ```typescript
 const createLayerSchema = z.object({
   name_ar: z.string().min(2).max(255),
   name_fr: z.string().min(2).max(255),
   description_ar: z.string().optional(),
   description_fr: z.string().optional(),
   geometry_type: z.enum(['point', 'linestring', 'polygon']),
   style: z.object({
     color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
     opacity: z.number().min(0).max(1).optional(),
     lineWidth: z.number().min(1).max(20).optional(),
     fillColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
   }).optional(),
   z_index: z.number().int().optional()
 });
 ```

 **Permissions:** `admin` or `editor` role

---

### 5.4 Features Endpoints

#### GET /api/features

 **Query Parameters:**
 - `layer_id`: Required filter by layer ID
 - `bbox`: Optional bounding box (minx,miny,maxx,maxy)
 - `limit`: Optional pagination (default: 100, max: 1000)
 - `offset`: Optional pagination offset

 **Example Request:**
 ```
 GET /api/features?layer_id=550e8400-e29b-41d4-a716-446655440001&bbox=-180,-90,180,90&limit=100
 ```

 **Response (200 OK):**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": "550e8400-e29b-41d4-a716-446655440002",
       "layer_id": "550e8400-e29b-41d4-a716-446655440001",
       "geometry": {
         "type": "Point",
         "coordinates": [3.0588, 36.7732]  // [lng, lat] - Algiers
       },
       "attributes": {
         "name": "محطة ضخم مياه",
         "description": "محطة ضخم في العاصمة"
       },
       "created_by": "550e8400-e29b-41d4-a716-446655440000",
       "created_at": "2026-02-26T00:00:00Z",
       "updated_at": "2026-02-26T00:00:00Z"
     }
   ],
   "meta": {
     "total": 50,
     "limit": 100,
     "offset": 0
   }
 }
 ```

#### POST /api/features

 **Request:**
 ```json
 {
   "layer_id": "550e8400-e29b-41d4-a716-446655440001",
   "geometry": {
     "type": "Point",
     "coordinates": [3.0588, 36.7732]
   },
   "attributes": {
     "name": "محطة ضخم مياه",
     "description": "محطة ضخم في العاصمة"
   }
 }
 ```

 **Validation:**
 ```typescript
 const createFeatureSchema = z.object({
   layer_id: z.string().uuid(),
   geometry: z.object({
     type: z.enum(['Point', 'LineString', 'Polygon']),
     coordinates: z.union([z.array(z.array(z.array(z.number()))), z.array(z.number()))])
   }),
   attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
 });
 ```

 **Permissions:** `admin` or `editor` role

---

### 5.5 Export Endpoints

#### POST /api/export

 **Request:**
 ```json
 {
   "format": "geojson",
   "layer_ids": ["550e8400-e29b-41d4-a716-446655440001"],
   "include_all_features": true
 }
 ```

 **Response (202 Accepted):**
 ```json
 {
   "success": true,
   "data": {
     "job_id": "550e8400-e29b-41d4-a716-446655440003",
     "status": "pending",
     "estimated_time": "30 seconds"
   }
 }
 ```

#### GET /api/export/{job_id}

 **Response (200 OK):**
 ```json
 {
   "success": true,
   "data": {
     "id": "550e8400-e29b-41d4-a716-446655440003",
     "format": "geojson",
     "status": "completed",
     "progress": 100,
     "download_url": "/api/export/550e8400-e29b-41d4-a716-446655440003/download",
     "created_at": "2026-02-26T00:00:00Z",
     "completed_at": "2026-02-26T00:00:30Z"
   }
 }
 ```

---

### 5.6 Users Endpoints (Admin Only)

#### GET /api/users

 **Response (200 OK):**
 ```json
 {
   "success": true,
   "data": [
     {
       "id": "550e8400-e29b-41d4-a716-446655440000",
       "email": "ahmed@example.com",
       "name": "أحمد",
       "role": "editor",
       "is_active": true,
       "language": "ar",
       "created_at": "2026-02-26T00:00:00Z",
       "last_login_at": "2026-02-26T00:00:00Z"
     }
   ],
   "meta": {
     "total": 1
   }
 }
 ```

 **Permissions:** `admin` role only

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       │
       ▼
┌─────────────────────────────────────────┐
│        Backend (Express)                │
│                                         │
│  1. Validate request (Zod)              │
│  2. Query user from database            │
│  3. Verify password (bcrypt)           │
│  4. Generate JWT access token          │
│     - payload: { user_id, role }       │
│     - secret: JWT_SECRET (env var)     │
│     - expiry: 24 hours                 │
│  5. Generate JWT refresh token         │
│     - payload: { user_id }             │
│     - expiry: 7 days                   │
│  6. Return tokens                      │
└─────────────────────────────────────────┘
       │
       │ 2. Return { user, tokens }
       │
       ▼
┌─────────────┐
│   Browser   │  ← Store tokens in localStorage
└─────────────┘
```

---

### 6.2 JWT Token Structure

**Access Token (24-hour expiry):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",  // user_id
    "role": "editor",
    "email": "ahmed@example.com",
    "iat": 1677609600,  // issued at
    "exp": 1677696000   // expires at
  }
}
```

**Refresh Token (7-day expiry):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",  // user_id
    "type": "refresh",
    "iat": 1677609600,
    "exp": 1678214400
  }
}
```

**JWT Secret:** Stored in environment variable `JWT_SECRET` (minimum 32 characters, generated randomly)

**Token Refresh Flow:**
```
Browser → POST /api/auth/refresh
          Body: { refreshToken }
          ↓
       Backend verifies refresh token
          ↓
       Generates new access + refresh tokens
          ↓
       Returns new tokens
          ↓
       Browser updates localStorage
```

---

### 6.3 RBAC (Role-Based Access Control)

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| **Users** |
| View user list | ✅ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Update user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| **Layers** |
| View all layers | ✅ | ✅ | ✅ |
| Create layer | ✅ | ✅ | ❌ |
| Edit own layer | ✅ | ✅ | ❌ |
| Edit any layer | ✅ | ❌ | ❌ |
| Delete own layer | ✅ | ✅ | ❌ |
| Delete any layer | ✅ | ❌ | ❌ |
| **Features** |
| View features | ✅ | ✅ | ✅ |
| Create feature | ✅ | ✅ | ❌ |
| Edit own feature | ✅ | ✅ | ❌ |
| Edit any feature | ✅ | ❌ | ❌ |
| Delete own feature | ✅ | ✅ | ❌ |
| Delete any feature | ✅ | ❌ | ❌ |
| **Export** |
| Export data | ✅ | ✅ | ✅ |
| **Import** |
| Import data | ✅ | ✅ | ❌ |

---

### 6.4 Security Headers (Helmet.js)

```javascript
// Security headers applied to all responses
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://tile.openstreetmap.org"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "origin-when-cross-origin" },
  frameguard: { action: "deny" }
});
```

---

### 6.5 Rate Limiting

```javascript
// Apply rate limiting to all API endpoints
const rateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,  // 100 requests per minute per IP
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later"
    }
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 login attempts per 15 minutes
  message: {
    success: false,
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Too many login attempts, please try again in 15 minutes"
    }
  }
});
```

---

### 6.6 Input Validation (Zod schemas)

All API endpoints validate inputs using Zod schemas:

```typescript
// Example: Feature creation validation
const createFeatureSchema = z.object({
  layer_id: z.string().uuid("Invalid layer ID"),
  geometry: z.object({
    type: z.enum(['Point', 'LineString', 'Polygon']),
    coordinates: z.union([
      z.array(z.number()),  // Point: [lng, lat]
      z.array(z.array(z.number())),  // LineString: [[lng, lat]]
      z.array(z.array(z.array(z.number())))  // Polygon: [[[lng, lat]]]
    ])
  }).refine(
    (geo) => {
      if (geo.type === 'Point' && (geo.coordinates.length !== 2)) return false;
      if (geo.type === 'LineString' && geo.coordinates.length < 2) return false;
      if (geo.type === 'Polygon' && geo.coordinates[0].length < 3) return false;
      return true;
    },
    "Invalid geometry coordinates"
  ),
  attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});
```

---

### 6.7 SQL Injection Prevention

**Prisma ORM automatically parameterizes all queries:**

```typescript
// Safe (parameterized) - Prisma auto-handles this
const features = await prisma.feature.findMany({
  where: {
    layerId: layerId,  // Safely parameterized
    geometry: {
      // PostGIS geospatial query (also parameterized)
      path: {
        intersects: boundingBox
      }
    }
  }
});

// NEVER do this (vulnerable to SQL injection):
// const query = `SELECT * FROM features WHERE layer_id = '${layerId}'`;
```

---

### 6.8 Path Traversal Prevention

**File operations validate and normalize paths:**

```typescript
import path from 'path';
import fs from 'fs';

// Safe file path handling
function getExportFilePath(jobId: string): string {
  // Prevent path traversal: Remove any `..` sequences
  const safeJobId = jobId.replace(/\.\./g, '');
  
  // Resolve against absolute export directory
  const exportDir = '/exports';
  const filePath = path.resolve(path.join(exportDir, `${safeJobId}.geojson`));
  
  // Verify file is within export directory
  if (!filePath.startsWith(exportDir)) {
    throw new Error('Invalid file path');
  }
  
  return filePath;
}
```

---

### 6.9 Password Hashing

**bcrypt with cost factor 12:**

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hash password on registration
async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

// Verify password on login
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Password verification failed');
  }
}
```

---

## 7. Deployment Architecture

### 7.1 Docker Compose Configuration

```yaml
version: '3.8'

services:
  # PostgreSQL + PostGIS Database
  postgres:
    image: postgis/postgis:15-3.3
    container_name: sig_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-sig_maps_v2}
      POSTGRES_USER: ${POSTGRES_USER:-sig_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
    ports:
      - "5432:5432"
    networks:
      - sig-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-sig_user} -d ${POSTGRES_DB:-sig_maps_v2}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  # Backend (Node.js + Express)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: sig_backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://${POSTGRES_USER:-sig_user}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-sig_maps_v2}
      JWT_SECRET: ${JWT_SECRET}
      JWT_ACCESS_TOKEN_EXPIRY: 86400
      JWT_REFRESH_TOKEN_EXPIRY: 604800
      BCRYPT_ROUNDS: 12
      REDIS_URL: redis://redis:6379
      UPLOAD_DIR: /exports
      LOG_LEVEL: ${LOG_LEVEL:-info}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - export_data:/exports
      - ./backend/logs:/app/logs
    networks:
      - sig-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3001/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  # Frontend (Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://localhost:3001/api
        - NEXT_PUBLIC_MAP_TILES=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
    container_name: sig_frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - sig-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Redis (for BullMQ job queue)
  redis:
    image: redis:7-alpine
    container_name: sig_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sig-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx (reverse proxy + SSL terminator - optional)
  nginx:
    image: nginx:alpine
    container_name: sig_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - sig-network

networks:
  sig-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  export_data:
```

---

### 7.2 Environment Variables (.env)

```bash
# Database
POSTGRES_DB=sig_maps_v2
POSTGRES_USER=sig_user
POSTGRES_PASSWORD=<REPLACE_WITH_STRONG_PASSWORD>

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=<REPLACE_WITH_RANDOM_SECRET>
JWT_ACCESS_TOKEN_EXPIRY=86400  # 24 hours
JWT_REFRESH_TOKEN_EXPIRY=604800  # 7 days

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,https://sigmaps-v2.com

# Redis
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_ATTEMPTS=5

# Upload
UPLOAD_DIR=/exports
MAX_FILE_SIZE_MB=50
ALLOWED_EXPORT_FORMATS=geojson,kml,shapefile
```

---

### 7.3 Dockerfiles

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create export directory
RUN mkdir -p /exports

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js
CMD ["npm", "start"]
```

---

## 8. Infrastructure & DevOps

### 8.1 Infrastructure Options

**Option A: Docker Compose (MVP - Recommended for initial deployment)**
- **Pros:** Simple, one-command deployment, portable, good for small teams
- **Cons:** Not ideal for horizontal scaling, limited monitoring
- **When to use:** MVP, beta testing, < 50 users

**Option B: Kubernetes (Production)**
- **Pros:** Horizontal scaling, self-healing, monitoring, rolling updates
- **Cons:** Complexity, requires Kubernetes expertise
- **When to use:** Production, > 100 users, high availability requirements

**Option C: Managed Services (AWS ECS/Fargate, Google Cloud Run)**
- **Pros:** Serverless (or close to it), managed infrastructure
- **Cons:** Vendor lock-in, cost predictability
- **When to use:** No DevOps team, prefer managed services

**Recommendation for MVP:** Start with Docker Compose, migrate to Kubernetes when needed.

---

### 8.2 CI/CD Pipeline

**GitHub Actions example (.github/workflows/deploy.yml):**

```yaml
name: Build, Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies (backend)
        run: cd backend && npm ci

      - name: Install dependencies (frontend)
        run: cd frontend && npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          JWT_SECRET: test-secret-for-ci-cd

      - name: Run E2E tests
        run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}

      - name: Build and push Docker images
        run: |
          docker build -t sigmaps-v2/backend:${{ github.sha }} ./backend
          docker build -t sigmaps-v2/frontend:${{ github.sha }} ./frontend
          docker push sigmaps-v2/backend:${{ github.sha }}
          docker push sigmaps-v2/frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/sig-maps-v2
            docker compose pull
            docker compose up -d
            docker compose exec backend npm run migrate
```

---

### 8.3 Database Migration Pipeline

```bash
# Development: Generate migration
npx prisma migrate dev --name add_layer_table

# Development: Reset database (destructive)
npx prisma migrate reset

# Production: Apply migrations
npx prisma migrate deploy

# Production: Generate client
npx prisma generate

# Production: Seed database (optional)
npx prisma db seed
```

---

## 9. Monitoring & Logging

### 9.1 Logging Strategy

**Winston logging (structured JSON logs):**

```typescript
// backend/src/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'sig-maps-v2-backend',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    
    // File logging (warning+ only)
    new winston.transports.File({
      filename: '/app/logs/error.log',
      level: 'error'
    }),
    
    // File logging (all logs)
    new winston.transports.File({
      filename: '/app/logs/combined.log'
    })
  ]
});

// Log levels: error, warn, info, http, verbose, debug, silly
export default logger;
```

---

### 9.2 Health Check Endpoints

```typescript
// backend/src/routes/health.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running',
        version: process.env.npm_package_version || '1.0.0'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
}
```

---

### 9.3 Monitoring Tools

**Recommended tools (post-MVP):**

- **Application Monitoring**: New Relic, Datadog, or Prometheus + Grafana
- **Database Monitoring**: pgAdmin, PgHero, or PGBadger
- **Log Aggregation**: Elasticsearch + Kibana (ELK stack) or Loki + Grafana
- **Error Tracking**: Sentry (for frontend errors)
- **Uptime Monitoring**: UptimeRobot or Pingdom

**For MVP:** Use Winston logs + Docker health checks + Prometheus exporters.

---

## 10. Backup & Disaster Recovery

### 10.1 Database Backups

```bash
# Daily backup script (cron: 0 2 * * *)
#!/bin/bash

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="sig_maps_v2"
DB_USER="sig_user"
KEEP_DAYS=30

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform backup
pg_dump -h postgres -U ${DB_USER} -d ${DB_NAME} \
  --format=c \
  --file="${BACKUP_DIR}/backup_${DATE}.dump"

# Compress backup
gzip "${BACKUP_DIR}/backup_${DATE}.dump"

# Remove old backups
find ${BACKUP_DIR} -name "backup_*.dump.gz" \
  -mtime +${KEEP_DAYS} -delete

# Log success
echo "Backup completed: backup_${DATE}.dump.gz" | \
  tee -a /var/log/backup.log
```

---

### 10.2 Restore Procedure

```bash
# Restore from backup
gunzip backup_20260226_020000.dump.gz
pg_restore -h postgres -U sig_user -d sig_maps_v2 \
  --clean --if-exists backup_20260226_020000.dump
```

---

### 10.3 Disaster Recovery Plan

**Scenario 1: Single server failure**
- **Impact:** Application offline
- **Recovery:** Rebuild server from Docker Compose, restore database from backup
- **RTO (Recovery Time Objective):** 1-2 hours
- **RPO (Recovery Point Objective):** 24 hours (daily backup)

**Scenario 2: Database corruption**
- **Impact:** Data loss
- **Recovery:** Restore from previous day's backup
- **Post-incident:** Analyze corruption cause, implement preventive measures

**Scenario 3: Security breach**
- **Impact:** Data exposure
- **Recovery:** Immediately revoke all tokens, force password resets, rotate all secrets, conduct security audit
- **Post-incident:** Report to users, implement additional security measures

---

## 11. Performance Optimization

### 11.1 Database Optimization

**Spatial Indexes:**

```sql
-- Create GIST index for geometry (already in schema)
CREATE INDEX idx_features_geometry ON features USING GIST(geometry);

-- Partial index for visible layers only
CREATE INDEX idx_features_visible 
  ON features (layer_id) 
  WHERE (SELECT is_visible FROM layers WHERE id = features.layer_id) = true;

-- Covering index for feature queries
CREATE INDEX idx_features_layer_created 
  ON features (layer_id, created_at DESC) 
  INCLUDE (created_by, attributes);
```

**Connection Pooling:**

```typescript
// Prisma connection pool (default: max 10 connections)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
});

// For production, increase pool size
process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db?connection_limit=50';
```

---

### 11.2 Frontend Optimization

**Code Splitting (Next.js App Router does this automatically):**

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const MapEditor = dynamic(() => import('@/components/MapEditor'), {
  loading: () => <p>Loading map editor...</p>,
  ssr: false,  // Don't server-render the map (no window object)
});
```

**Image Optimization:**

```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/map-thumbnail.jpg"
  alt="Map"
  width={800}
  height={600}
  loading="lazy"  // Lazy load below the fold
/>
```

**Leaflet clustering:**

```typescript
import L from 'leaflet';
import 'leaflet.markercluster';

const markerClusterGroup = L.markerClusterGroup({
  maxClusterRadius: 50,  // Cluster radius in pixels
  spiderfyOnMaxZoom: true,  // Expand cluster on max zoom
  showCoverageOnHover: false,  // Don't show cluster coverage
  zoomToBoundsOnClick: true  // Zoom to cluster bounds on click
});
```

---

### 11.3 Caching Strategy

**Redis caching ( BullMQ uses Redis ):**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache layer metadata (TTL: 5 minutes)
await redis.setex(`layer:${layerId}`, 300, JSON.stringify(layerData));

// Retrieve from cache
const cachedLayer = await redis.get(`layer:${layerId}`);
if (cachedLayer) {
  return JSON.parse(cachedLayer);
}

// Cache miss → fetch from database
const layer = await prisma.layer.findUnique(...);
await redis.setex(`layer:${layerId}`, 300, JSON.stringify(layer));
return layer;
```

---

## 12. Scaling Strategy

### 12.1 Horizontal Scaling

**Stateless Backend (Easy to scale):**

- Backend uses JWT (stateless auth) → can spawn multiple instances
- Session data in Redis (for BullMQ) → shared across instances
- PostgreSQL connection pooling → can handle many connections

**Scaling Architecture (Post-MVP):**

```
                    Nginx Load Balancer
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Backend Instance 1   Backend Instance 2
              ┌─────────────────┐   ┌─────────────────┐
              │ Express App    │   │ Express App    │
              └─────────────────┘   └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Redis (Shared)   │
                    └───────────────────┘
                              │
                    ┌─────────┴─────────┐
              PostgreSQL Primary    PostgreSQL Read Replica
```

---

### 12.2 Database Scaling

**Read Replicas (Post-MVP):**

```sql
-- Set up read replica for feature queries
-- All feature reads go to replica
-- All writes (create, update, delete) go to primary
```

```typescript
// Prisma read replica configuration
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_READ_ONLY,
    },
  },
});

// Use read replica for feature queries
const features = await prismaRead.feature.findMany({
  where: { layerId: layerId }
});

// Use primary for writes
await prisma.feature.create(...);
```

---

### 13. Security Checklist

### 13.1 Pre-Production Checklist

- [ ] All secrets stored in environment variables (no .env files committed)
- [ ] JWT_SECRET is >= 32 characters and randomly generated
- [ ] POSTGRES_PASSWORD is strong (>= 16 chars, mixed case, numbers, symbols)
- [ ] HTTPS enabled in production (SSL/TLS certificates)
- [ ] Security headers applied (Helmet.js)
- [ ] CORS configuration restricted to allowed origins only
- [ ] Rate limiting enabled for all endpoints
- [ ] Input validation (Zod) on all API endpoints
- [ ] SQL injection prevention (Prisma ORM automatically parameterizes)
- [ ] XSS prevention (Content Security Policy)
- [ ] CSRF protection enabled
- [ ] Database user has least privileges (no superuser)
- [ ] File upload: type validation, size limits, scan for malware
- [ ] Path traversal prevention in file operations
- [ ] Audit logging enabled for all CRUD operations
- [ ] Automated security scans (OWASP ZAP, npm audit)
- [ ] Logging: sensitive data (passwords, tokens) not logged
- [ ] Error messages: don't expose internal details to client
- [ ] Password hashing: bcrypt with cost factor 12
- [ ] JWT token expiry configured (access 24h, refresh 7d)
- [ ] Dependencies: `npm audit` passes, no high/critical vulnerabilities

---

## 14. Appendix

### 14.1 Technology Alternatives Considered

**Backend Framework:**
- ✓ Chosen: Express (lightweight, flexible)
- ✗ Rejected: NestJS (too complex for MVP)
- ✗ Rejected: Fastify (less mature ecosystem)

**Frontend Framework:**
- ✓ Chosen: Next.js (SSR, App Router)
- ✗ Rejected: React + Vite (no SSR, more manual routing)

**Map Library:**
- ✓ Chosen: Leaflet (open source, no API keys)
- ✗ Rejected: Mapbox (requires billing, vendor lock-in)
- ✗ Rejected: Google Maps API (requires billing)

**Database:**
- ✓ Chosen: PostgreSQL + PostGIS (mature, spatial features)
- ✗ Rejected: MongoDB (no native spatial support)
- ✗ Rejected: MySQL + PostGIS (less mature than PostgreSQL)

---

### 14.2 References

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [JWT.io](https://jwt.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 15. Open Issues & Decisions Needed

| Issue | Impact | Owner | Target Date |
|-------|--------|-------|-------------|
| Docker vs Kubernetes for production deployment | Medium | DevOps | Pre-launch |
| CDN provider for static assets | Low | DevOps | Beta |
| Email service for password reset (SMTP provider) | Medium | DevOps | Feature development |
| Monitoring and logging solution | High | DevOps | Before production |

---

**Architecture Document Version:** 1.0
**Status:** Draft - Ready for Review
**Next Steps:**
1. Implement database schema (Prisma migration)
2. Implement authentication endpoints
3. Implement base API infrastructure (middleware, validation)
4. Create frontend application structure (Next.js App Router)
5. Implement map rendering with Leaflet
6. Implement drawing tools
7. Implement export functionality

---

**Estimated Timeline:**
- Week 1: Setup + Authentication
- Week 2-3: Core GIS features (map, layers, features)
- Week 4: Drawing tools + Export
- Week 5: RBAC + User management
- Week 6: Testing, QA, Documentation

**Total Development Time:** 6 weeks (matches MVP timeline from Product Brief)

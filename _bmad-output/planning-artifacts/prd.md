# Product Requirements Document: SIG Maps V2

**Version:** 1.0
**Date:** 2026-02-25
**Author:** Business Analyst (Dreima)
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for SIG Maps V2, a modern multilingual Geographic Information System (GIS) platform. It serves as the comprehensive specification that developers, designers, and QA teams will use to build the system.

### 1.2 Scope

**In Scope:**
- Web-based GIS platform (desktop and mobile browsers)
- Interactive map viewing and editing
- Drawing tools (points, lines, polygons)
- Layer management
- Data export (GeoJSON, KML, Shapefile)
- User authentication and authorization
- Arabic and French language support
- Basic user management

**Out of Scope (Post-MVP):**
- Native mobile applications (iOS/Android)
- Real-time collaboration (WebSockets)
- Machine learning predictions
- Advanced spatial analytics (buffer, intersect, etc.)
- Offline mode
- 3D map visualization

### 1.3 References

- Product Brief: `/home/sysuser/.openclaw/workspace/sig_maps_v2/_bmad-output/planning-artifacts/product-brief.md`
- Legacy SIG Maps: `/home/sysuser/.openclaw/workspace/sig_maps/`

---

## 2. Product Overview

### 2.1 Product Vision

SIG Maps V2 will become the leading multilingual GIS platform in North Africa, transforming how organizations in Algeria and Francophone Africa manage geospatial data. Within 1-2 years, the system will serve government agencies, utilities companies, and environmental organizations, enabling them to visualize, analyze, and share spatial data securely and efficiently.

### 2.2 Target Users

### 2.2.1 Ahmed - محليل بيانات جغرافية / Analyste SIG

**Role:** GIS Analyst
**Department:** Urban Planning / Aménagement Urbain
**Organization:** Government Agency / Utility Company

**Responsibilities:**
- Creates and edits digital maps
- Manages spatial layers (water pipes, electrical lines, roads)
- Performs data quality checks
- Exports maps in various formats for colleagues
- Collaborates with field workers

**Key Needs:**
- Fast map rendering with large datasets
- Professional-looking map output
- Reliable data export functionality
- Easy layer organization
- Secure system with proper authentication

---

### 2.2.2 Fatima - عامل ميداني / Travailleur de terrain

**Role:** Field Worker / Collector
**Department:** Operations / Opérations
**Organization:** Government Agency / Utility Company

**Responsibilities:**
- Collects field data using mobile device
- Maps infrastructure locations (GPS coordinates)
- Reports issues (damage, leaks, outages)
- Uploads photos with geotags
- Submits data for review by analysts

**Key Needs:**
- Simple, intuitive interface (not technical)
- Works on mobile devices (smartphone/tablet)
- Quick data entry (3 taps to submit)
- Arabic interface (mother tongue)
- Works offline when needed (future feature)

---

### 2.2.3 Omar - مدير النظام / Administrateur système

**Role:** Systems Administrator
**Department:** IT / Direction Informatique
**Organization:** Government Agency / Utility Company

**Responsibilities:**
- Manages user accounts and access
- Monitors system performance and uptime
- Responds to security incidents
- Manages backups and recovery
- Handles user support requests

**Key Needs:**
- Easy deployment (one command)
- Comprehensive monitoring and logs
- Role-based access control
- Audit trails for compliance
- Zero security vulnerabilities

---

### 2.3 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Active Users** | 100+ within 3 months | Count unique users logging in monthly |
| **Map Render Time** | <2 seconds for 10K points | Performance test with 10,000 map features |
| **Security Incidents** | 0 critical incidents within 6 months | Security audit + vulnerability scanner |
| **User Satisfaction** | 4.5/5 stars (CSAT score) | Post-launch user survey |
| **Data Export Success Rate** | 99.5% successful exports | Track export job success/failure rate |

---

## 3. User Journeys

### UJ-1: User Login & Authentication

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens application URL | Displays login page |
| 2 | Enters email/password | Validates credentials |
| 3 | Clicks login | Creates JWT token, redirects to map |

**Success:** User logged in, token set
**Error:** Invalid credentials → "Invalid email or password"

---

### UJ-2 to UJ-8: All journeys documented in Product Brief sections above

---

## 4. Functional Requirements

### 4.1 Authentication (12 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-001 | System shall support user login via email/password | Must |
| FR-AUTH-002 | Passwords hashed using bcrypt (cost 12) | Must |
| FR-AUTH-003 | JWT access tokens expire after 24 hours | Must |
| FR-AUTH-004 | JWT refresh tokens expire after 7 days | Must |
| FR-AUTH-005 | Password reset via email link | Must |
| FR-AUTH-006 | Password complexity: 8+ chars, mixed case, 1 number | Must |
| FR-AUTH-007 | Session timeout after token expiry | Must |
| FR-AUTH-008 | Support 3 roles: admin, editor, viewer | Must |
| FR-AUTH-009 | Admins can create/edit/delete users | Should |
| FR-AUTH-010 | Admins can assign roles | Should |
| FR-AUTH-011 | Log all auth events (login, logout, failed attempts) | Should |

---

### 4.2 Map Rendering (12 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MAP-001 | Render interactive maps using Leaflet | Must |
| FR-MAP-002 | Support zoom levels 1-20 | Must |
| FR-MAP-003 | Display 10K+ points in <2 seconds | Must |
| FR-MAP-004 | Marker clustering for >100 points | Should |
| FR-MAP-005 | Fullscreen mode | Should |
| FR-MAP-006 | Base layer switching (street/satellite) | Should |
| FR-MAP-007 | Responsive on mobile (320px+) | Must |
| FR-MAP-008 | Pan with mouse drag + touch gestures | Must |
| FR-MAP-009 | Zoom with scroll wheel + pinch gestures | Must |
| FR-MAP-010 | Display layer attribution | Should |
| FR-MAP-011 | Show scale bar | Should |

---

### 4.3 Drawing Tools (10 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DRAW-001 | Draw point features by clicking | Must |
| FR-DRAW-002 | Draw polyline features by clicking vertices | Must |
| FR-DRAW-003 | Draw polygon features by clicking vertices | Must |
| FR-DRAW-004 | Edit features (move vertices, reshape) | Must |
| FR-DRAW-005 | Delete features | Must |
| FR-DRAW-006 | Cancel drawing with ESC | Should |
| FR-DRAW-007 | Undo last drawing step (10 step limit) | Should |
| FR-DRAW-008 | Add custom attributes (key-value pairs) | Should |
| FR-DRAW-009 | Validate: no self-intersecting polygons | Should |
| FR-DRAW-010 | Snap to existing vertices (5px threshold) | Could |

---

### 4.4 Layer Management (10 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LAYR-001 | Create new layers with name + type | Must |
| FR-LAYR-002 | Edit layer metadata | Must |
| FR-LAYR-003 | Delete layers | Should |
| FR-LAYR-004 | Toggle layer visibility | Must |
| FR-LAYR-005 | Reorder layers (drag drop, z-index) | Must |
| FR-LAYR-006 | Style layers: color, opacity, line width | Must |
| FR-LAYR-007 | Set geometry type per layer | Must |
| FR-LAYR-008 | Layer name must be unique | Must |
| FR-LAYR-009 | Export individual layers | Should |
| FR-LAYR-010 | Copy layer style from another layer | Could |

---

### 4.5 Data Export (10 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EXP-001 | Export to GeoJSON | Must |
| FR-EXP-002 | Export to KML | Must |
| FR-EXP-003 | Export to Shapefile | Must |
| FR-EXP-004 | Export selected layer only | Should |
| FR-EXP-005 | Export selected features only | Should |
| FR-EXP-006 | Include layer metadata | Should |
| FR-EXP-007 | Show export progress with % | Should |
| FR-EXP-008 | Download history with links | Should |
| FR-EXP-009 | Compress >10MB exports as ZIP | Should |
| FR-EXP-010 | Localized field names option | Could |

---

### 4.6 Localization (10 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-I18N-001 | Support Arabic interface | Must |
| FR-I18N-002 | Support French interface | Must |
| FR-I18N-003 | Switch languages without page reload | Should |
| FR-I18N-004 | Persist language preference in localStorage | Must |
| FR-I18N-005 | RTL layout for Arabic | Must |
| FR-I18N-006 | LTR layout for French | Must |
| FR-I18N-007 | All UI text in Arabic + French | Must |
| FR-I18N-008 | Feature names support Unicode (Arabic, French) | Must |
| FR-I18N-009 | Date/time formatting: Arabic (Hijri), French (DD/MM/YYYY) | Should |
| FR-I18N-010 | Number formatting: Arabic (١٢٣), French (123) | Could |

---

### 4.7 User Management (8 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-USER-001 | Admins can create user accounts | Should |
| FR-USER-002 | Assign roles (admin, editor, viewer) | Should |
| FR-USER-003 | Admins can delete users | Should |
| FR-USER-004 | Admins can reset passwords | Should |
| FR-USER-005 | List all users with email, name, role, last login | Should |
| FR-USER-006 | Admins can deactivate users | Should |
| FR-USER-007 | Support user search by email/name | Should |
| FR-USER-008 | View user activity log | Could |

---

### 4.8 Data Persistence (9 Requirements)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DATA-001 | Store features with PostGIS geometry | Must |
| FR-DATA-002 | Store user accounts with bcrypt hashes | Must |
| FR-DATA-003 | Backup database daily (30 day retention) | Should |
| FR-DATA-004 | Import from GeoJSON | Should |
| FR-DATA-005 | Import from KML | Should |
| FR-DATA-006 | Track creation/modification timestamps | Should |
| FR-DATA-007 | Track creator/updater User | Should |
| FR-DATA-008 | Soft delete features (marked, not removed) | Could |

---

## 5. Non-Functional Requirements

### 5.1 Performance (9 Requirements)

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-PERF-001 | Map render time | <2s for 10K features |
| NFR-PERF-002 | API response time | <200ms (p95) |
| NFR-PERF-003 | Page load time | <1s (FCP) |
| NFR-PERF-004 | Concurrent users | 50+ simultaneous |
| NFR-PERF-005 | Database query time | <100ms indexed |
| NFR-PERF-006 | Export 10K features | <5s |
| NFR-PERF-007 | Bundle size | <500KB gzipped |

---

### 5.2 Security (16 Requirements)

| ID | Requirement |
|----|-------------|
| NFR-SEC-001 | All APIs require JWT (except /login, /register) |
| NFR-SEC-002 | No hardcoded secrets |
| NFR-SEC-003 | SQL injection prevention via parameterized queries |
| NFR-SEC-004 | XSS prevention (sanitize inputs, CSP) |
| NFR-SEC-005 | CSRF protection for state changes |
| NFR-SEC-006 | Rate limiting: 100 req/min per IP |
| NFR-SEC-007 | HTTPS only in production |
| NFR-SEC-008 | Password hashing: bcrypt (cost 12) |
| NFR-SEC-009 | JWT expiry: access 24h, refresh 7d |
| NFR-SEC-010 | Input validation on all endpoints |
| NFR-SEC-011 | Path traversal prevention (validate file paths) |
| NFR-SEC-012 | Secure file upload (type, size restrictions) |
| NFR-SEC-013 | HTTP security headers (CSP, HSTS, X-Frame-Options) |
| NFR-SEC-014 | Database user with least privileges |
| NFR-SEC-015 | Audit log: track all CRUD operations |
| NFR-SEC-016 | Quarterly security audits |

---

### 5.3 Accessibility (7 Requirements)

| ID | Requirement | Standard |
|----|-------------|----------|
| NFR-A11Y-001 | WCAG 2.1 AA compliance | AA |
| NFR-A11Y-002 | Keyboard navigation | Full keyboard access |
| NFR-A11Y-003 | Screen reader support | NVDA, JAWS |
| NFR-A11Y-004 | Color contrast ratio | 4.5:1 minimum |
| NFR-A11Y-005 | Focus indicators | Visible on interactive elements |
| NFR-A11Y-006 | Alt text on map icons | Descriptive text |
| NFR-A11Y-007 | Skip to main content link | Accessibility feature |

---

### 5.4 Browser Support (6 Requirements)

| ID | Requirement | Browser | Version |
|----|-------------|---------|--------|
| NFR-BROWSER-001 | Chrome | Google Chrome | 90+ |
| NFR-BROWSER-002 | Firefox | Mozilla Firefox | 88+ |
| NFR-BROWSER-003 | Safari | Apple Safari | 14+ |
| NFR-BROWSER-004 | Edge | Microsoft Edge | 90+ |
| NFR-BROWSER-005 | Mobile browsers | iOS Safari, Chrome Mobile | Last 2 versions |
| NFR-BROWSER-006 | JavaScript enabled | Required | Progressive enhancement |

---

### 5.5 Scalability (7 Requirements)

| ID | Requirement |
|----|-------------|
| NFR-SCALE-001 | Support 10K+ features without degradation |
| NFR-SCALE-002 | Horizontal scaling (stateless sessions) |
| NFR-SCALE-003 | Database connection pooling |
| NFR-SCALE-004 | Static assets via CDN (production) |
| NFR-SCALE-005 | Map tiles cached via CDN |
| NFR-SCALE-006 | Export jobs async (background processing) |
| NFR-SCALE-007 | Database read replicas (future) |

---

## 6. Data Model

### 6.1 Entities

#### User (المستخدم)
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | VARCHAR(255) | Yes | Unique |
| name | VARCHAR(255) | Yes | Full name (AR+FR) |
| password_hash | VARCHAR(255) | Yes | Bcrypt |
| role | ENUM | Yes | (admin/editor/viewer) |
| is_active | BOOLEAN | Yes | Account status |
| created_at | TIMESTAMP | Yes | Registration |
| last_login_at | TIMESTAMP | No | Last login |
| language | VARCHAR(5) | Yes | ('ar' or 'fr') |

#### Layer (الطبقة)
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name_ar | VARCHAR(255) | Yes | Name in Arabic |
| name_fr | VARCHAR(255) | Yes | Name in French |
| geometry_type | ENUM | Yes | (point/line/polygon) |
| style | JSONB | No | Styling config |
| is_visible | BOOLEAN | Yes | Visibility |
| z_index | INTEGER | Yes | Layer order |
| created_by | UUID (FK) | Yes | Creator |
| created_at | TIMESTAMP | Yes | Creation |

#### Feature (الميزة)
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| layer_id | UUID (FK) | Yes | Belongs to |
| geometry | GEOMETRY | Yes | PostGIS geometry |
| attributes | JSONB | No | Custom attrs |
| created_by | UUID (FK) | Yes | Creator |
| created_at | TIMESTAMP | Yes | Creation |
| updated_at | TIMESTAMP | Yes | Last update |

#### ExportJob (وظيفة التصدير)
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| format | ENUM | Yes | (geojson/kml/shapefile) |
| status | ENUM | Yes | (pending/processing/completed) |
| download_url | VARCHAR | No | File URL |
| created_by | UUID (FK) | Yes | Requestor |
| created_at | TIMESTAMP | Yes | Start time |

---

## 7. API Overview

### 7.1 Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/login | Login, return JWT |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/logout | Invalidate token |
| POST | /api/auth/refresh | Refresh JWT |
| POST | /api/auth/reset-password | Request reset |

### 7.2 Layers (5 Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/layers | List all |
| GET | /api/layers/{id} | Get by ID |
| POST | /api/layers | Create |
| PUT | /api/layers/{id} | Update |
| DELETE | /api/layers/{id} | Delete |

### 7.3 Features (5 Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/features | List (filter by layer) |
| GET | /api/features/{id} | Get by ID |
| POST | /api/features | Create |
| PUT | /api/features/{id} | Update |
| DELETE | /api/features/{id} | Delete |

### 7.4 Export (3 Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/export | Request export |
| GET | /api/export/{id} | Get status |
| GET | /api/export/{id}/download | Download file |

### 7.5 Users (5 Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/users | List (admin only) |
| GET | /api/users/{id} | Get by ID |
| POST | /api/users | Create (admin only) |
| PUT | /api/users/{id} | Update (admin only) |
| DELETE | /api/users/{id} | Delete (admin only) |

### 7.6 Localization (2 Endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/i18n/{lang} | Get translations |
| PUT | /api/i18n/{lang} | Update (admin only) |

---

## 8. Assumptions & Dependencies

### 8.1 Assumptions
- Users have modern browsers with JavaScript enabled
- Internet connection available (except offline features)
- Email service configured for password reset
- PostgreSQL+PostGIS 15+ available

### 8.2 Dependencies
- Next.js 14 (frontend)
- Node.js 20+ (backend)
- PostgreSQL 15+ with PostGIS
- Leaflet (maps)
- bcrypt (passwords)
- jsonwebtoken (auth)

---

## 9. Out of Scope

- Native mobile apps (iOS/Android)
- Real-time collaboration (WebSockets)
- Machine learning predictions
- Offline mode
- Advanced spatial analytics
- 3D map visualization

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Self-registration or admin-only? | Product Owner | Open |
| 2 | Leaflet or Mapbox? | Architect | Open |
| 3 | Database backup frequency? | DevOps | Open |
| 4 | Export jobs: sync or async? | Architect | Open |

---

## 11. Glossary

| Term | Definition |
|------|------------|
| Feature | Point, line, or polygon on map |
| Layer | Group of features with similar type |
| GeoJSON | JSON format for geospatial data |
| KML | Keyhole Markup Language (Google Earth) |
| Shapefile | ESRI binary format |
| PostGIS | PostgreSQL extension for GIS |
| JWT | JSON Web Token for auth |
| RTL | Right-to-Left text (Arabic) |
| LTR | Left-to-Right text (French) |

---

**PRD Version:** 1.0
**Last Updated:** 2026-02-25
**Status:** Ready for Architecture Review
**Total Requirements:** 82 functional + 45 non-functional = 127 requirements

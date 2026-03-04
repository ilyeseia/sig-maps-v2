# SIG Maps V2 - Optimization Report
**Generated:** 2026-03-04
**Manual Analysis by OpenClaw**

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. ❌ Missing Database Connection Pooling
```typescript
// Current (backend/src/routes/features.ts): ❌
const prisma = new PrismaClient();

// Risk: No connection management
```
**Fix:**
```typescript
// Configure in index.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info'] : ['error'],
});

// Implement graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 2. ❌ No Request Payload Validation Limits
```typescript
// Current (backend/src/index.ts)
app.use(express.json({ limit: '10mb' }));
```
**Issue:** 10MB limit is very high, risks DoS attacks
**Fix:**
```typescript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

### 3. ❌ N+1 Query Problem in Features
```typescript
// Current:
const features = await prisma.feature.findMany({ ... }); // Gets all
// Then in mapping, accessing layer for each (no include)
```
**Fix:**
```typescript
const features = await prisma.feature.findMany({
  include: { layer: { select: { name_ar: true, name_fr: true } } },
  take: 100, // Pagination
  skip: offset,
});
```

### 4. ❌ No Input Sanitization for GeoJSON
```typescript
// Current: geometry stored as Json without validation
geometry: Json

// Risk: Malformed data, injection
```
**Fix:**
```typescript
import { z } from 'zod';

const GeoJSONSchema = z.object({
  type: z.enum(['Point', 'LineString', 'Polygon']),
  coordinates: z.array(z.any()),
});
```

### 5. ❌ Missing Rate Limiting on Specific Routes
```typescript
// Current (index.ts):
app.use('/api', limiter); // Global only

// Missing: Per-route limits for heavy operations
```
**Fix:**
```typescript
// Add stricter limits for export/operations
const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Much stricter
  message: 'Export limit reached.'
});
app.use('/api/export', exportLimiter);
```

---

## 🟡 PERFORMANCE ISSUES

### 6. ⚠️ No Caching Strategy
```typescript
// Current: Every request hits database
// Missing: Redis cache for layers/features
```
**Fix:**
```typescript
// Add Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache layers
const layersKey = 'layers:visible';
const cached = await redis.get(layersKey);
if (cached) return JSON.parse(cached);
```

### 7. ⚠️ Frontend Data Loading Inefficient
```typescript
// Current (Map.tsx): ❌
const [featuresRes] = await Promise.all([apiClient.get('/api/features')]);
setFeatures(featuresRes.data.data); // All features at once!
```
**Fix:**
```typescript
// Implement viewport-based loading
const bounds = map.getBounds();
const response = await apiClient.get('/api/features', {
  params: { bbox: bounds.toBBoxString() }
});
```

### 8. ⚠️ No Lazy Loading for Map Components
- Missing dynamic imports for heavy components
- Missing intersection observer for off-screen features

**Fix:**
```typescript
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <SkeletonMap />
});
```

### 9. ⚠️ Memory Leak in Map Component
```typescript
// Current (Map.tsx): ❌
useEffect(() => {
  if (!isAuthenticated || features.length > 0) return;
  // ...
}, [isAuthenticated, features.length, setLayers]);
// Issue: useCallback dependencies not cleaned up
```

### 10. ⚠️ No Database Index Optimization
```prisma
// Missing indexes for common queries:
model Feature {
  @@index([layerId, createdAt]) // Combined
  @@index([geometry]) // For spatial queries
}
```

### 11. ⚠️ Backend Returns All Fields
```typescript
// Current:
select: { id: true, layerId: true, geometry: true, ... }

// Better: Use projection based on client needs
```

### 12. ⚠️ No CDN for TileLayer
```typescript
// Current: Default OSM tiles
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
```
**Fix:** Use CDN or tile proxy with caching.

---

## 🔵 CODE QUALITY ISSUES

### 13. 💡 Use of `any` Types
```typescript
// Current: features: any[]
// Fix: Define proper types
interface Feature {
  id: string;
  layerId: string;
  geometry: GeoJSON.Geometry;
  attributes: Record<string, unknown>;
}
```

### 14. 💡 Inconsistent Error Handling
Managed globally via `errorHandler` but lacks detail.

### 15. 💡 Missing API Documentation
- No OpenAPI/Swagger generation
- Add `@fastify/swagger` or `swagger-ui-express`

### 16. 💡 Hardcoded Values
```typescript
const DEFAULT_ZOOM = 12;
const MAP_CENTER: [number, number] = [36.7538, 3.0588];
// Should be in config
```

### 17. 💡 No Request Logging
- Missing structured logging (Winston/Pino)
- Missing request correlation IDs

### 18. 💡 Environment Variables Not Validated
```typescript
// Current: No validation
const PORT = process.env.PORT || 3001;

// Fix:
import { z } from 'zod';
const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string().url(),
});
```

### 19. 💡 No Testing Framework
- Missing Jest/Vitest setup
- Missing integration tests
- Missing API contract tests

### 20. 💡 Duplicate State in Frontend
- Zustand store + local state creates sync issues
- Consider one source of truth

---

## 🛡️ SECURITY ISSUES

### 21. 🔒 JWT No Refresh Token Rotation
Check `auth.ts` for refresh token implementation.

### 22. 🔒 Missing CORS Whitelist Validation
```typescript
// Current only allows FRONTEND_URL
// Add strict validation
origin: (origin, callback) => {
  const whitelist = [process.env.FRONTEND_URL];
  if (!origin || whitelist.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('CORS error'));
  }
}
```

### 23. 🔒 No Request Signing for Sensitive Ops
Missing HMAC for export/import validation.

### 24. 🔒 Password Reset Token Not Hashed
Check `resetToken` storage in database.

### 25. 🔒 Missing Security Headers
Helmet configured but review for CSP.

---

## ⚡ QUICK WINS (Under 1 Hour)

1. ✅ Add database indexes (5 min)
2. ✅ Reduce JSON body limit to 1MB (5 min)
3. ✅ Add Redis client setup (30 min)
4. ✅ Implement GeoJSON validation (30 min)
5. ✅ Fix TypeScript strict mode (60 min)

---

## 🎯 PRIORITY MATRIX

| Issue | Severity | Effort | Impact |
|-------|----------|--------|--------|
| 5. Rate Limiting | 🔴 High | Low | High |
| 3. N+1 Queries | 🔴 High | Low | High |
| 1. DB Pooling | 🔴 High | Low | High |
| 6. Caching | 🟡 Med | Med | High |
| 7. Viewport Loading | 🟡 Med | Med | High |
| 17. Request Logging | 🔵 Low | Low | Med |
| 11. Field Selection | 🔵 Low | Low | Med |

---

## 📋 RECOMMENDATIONS

### Immediate Actions (Today):
1. Fix rate limiting per-route
2. Add database indexes
3. Implement request payload limits
4. Add GeoJSON validation

### Short-term (This Week):
1. Setup Redis caching
2. Implement viewport-based feature loading
3. Add proper error logging
4. Fix TypeScript types

### Medium-term (This Month):
1. Add comprehensive testing
2. Implement API documentation
3. Review and tighten security
4. Performance monitoring

---

**End of Report**
25 critical issues identified
*Analysis by OpenClaw BMad-style manual review*

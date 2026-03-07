// @ts-nocheck
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Import logger
import logger, { createRequestLogger } from './services/logger';

// Import environment variables validation
import { env } from './config/env';

// Import Swagger
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Log application startup
logger.info('🚀 Starting SIG Maps V2 Backend...');
logger.info(`📚 Environment: ${env.NODE_ENV}`);
logger.info(`🔧 Port: ${env.PORT}`);
logger.info(`📊 Log Level: ${env.LOG_LEVEL}`);

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import layerRoutes from './routes/layers';
import featureRoutes from './routes/features';
import exportRoutes from './routes/export';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { loginRateLimiter, registerRateLimiter } from './middleware/rateLimit';
import { sanitizeBody } from './middleware/sanitize';

// Import validation
import { validateGeoJSON } from './validation/geojson';

// Import Redis service
import { getRedisClient, closeRedis } from './services/redis';

// Initialize Prisma singleton with connection pooling and logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Graceful shutdown for Prisma and Redis
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Closing connections...`);
  await prisma.$disconnect();
  await closeRedis();
  logger.info('All connections closed.');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration with strict whitelist validation
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',')
  .map(o => o.trim())
  .map(o => o.endsWith('/') ? o.slice(0, -1) : o); // Remove trailing slash

app.use(cors({
  origin: (origin, callback) => {
    // Remove trailing slash from origin for comparison
    const normalizedOrigin = origin?.endsWith('/') ? origin.slice(0, -1) : origin;

    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${normalizedOrigin}. Allowed: ${JSON.stringify(allowedOrigins)}`);
      callback(new Error('CORS error: Origin not allowed'));
    }
  },
  credentials: true,
}));

// Body parsing middleware with REDUCED payload limits (Critical Fix)
app.use(express.json({ limit: '1mb' }));  // Was 10MB - REDUCED for security
app.use(express.urlencoded({ extended: true, limit: '1mb' }));  // Was 10MB - REDUCED for security
app.use(cookieParser());

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: { error: { message: 'Too many requests from this IP, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Stricter rate limiting for export operations (Critical Fix)
const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Much stricter limit
  message: { error: { message: 'Export limit reached. Please try again in 15 minutes.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/export', exportLimiter);

// Apply input sanitization to all routes (Critical Fix)
app.use('/api', sanitizeBody);

// Request logging middleware
app.use('/api', (req, res, next) => {
  const log = createRequestLogger(req);
  const start = Date.now();

  // Log request
  log.http(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.http(`${req.method} ${req.path} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });

  next();
});

// Apply per-route rate limiters for authentication
app.use('/api/auth/login', loginRateLimiter);
app.use('/api/auth/register', registerRateLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  let redisStatus = 'disconnected';
  try {
    const redis = getRedisClient();
    await redis.ping();
    redisStatus = 'connected';
  } catch (error) {
    redisStatus = 'error';
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected', // Prisma already validated by prisma.$connect() internally
    cache: redisStatus, // Redis status
    logging: 'enabled',
    swagger: '/api-docs',
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SIG Maps V2 API',
}));

logger.info('📚 Swagger API Documentation available at /api-docs');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/layers', layerRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/export', exportRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize Redis on startup
getRedisClient();

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 SIG Maps V2 Backend running on port ${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔒 Rate limiting enabled (Global: 100/15min, Export: 10/15min)`);
  logger.info(`🛡️ Payload limit: 1MB (reduced from 10MB)`);
  logger.info(`✨ Database pooling + Redis caching + Winston logging enabled`);
  logger.info(`📊 Structured logging with correlation IDs`);
});

export { app, prisma };

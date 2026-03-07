// @ts-nocheck
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colored and readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Error log file (rotates daily)
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // Combined log file (rotates daily)
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: logFormat,
  transports,
});

// Add request correlation ID wrapper
export const createRequestLogger = (req: any) => {
  const correlationId = req.headers['x-correlation-id'] || Date.now().toString();

  return {
    info: (message: string, meta?: any) =>
      logger.info(message, { ...meta, correlationId }),
    warn: (message: string, meta?: any) =>
      logger.warn(message, { ...meta, correlationId }),
    error: (message: string, meta?: any) =>
      logger.error(message, { ...meta, correlationId }),
    debug: (message: string, meta?: any) =>
      logger.debug(message, { ...meta, correlationId }),
    http: (message: string, meta?: any) =>
      logger.http(message, { ...meta, correlationId }),
  };
};

// Export logger
export default logger;

// Export streams for morgan (if needed)
export { winston };

// @ts-nocheck
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SIG Maps V2 API',
      version: '2.0.0',
      description: `
        **SIG Maps V2** - Multilingual GIS Platform API Documentation

        ## Features
        - Multi-layer geospatial data management
        - PostGIS spatial queries with viewport-based filtering
        - Role-based access control (ADMIN, EDITOR, VIEWER)
        - Redis caching for improved performance
        - JWT authentication with refresh tokens

        ## Authentication
        Most endpoints require JWT authentication. Include the token in the Authorization header:

        \`Authorization: Bearer YOUR_JWT_TOKEN\`
      `,
      contact: {
        name: 'SIG Maps Team',
        email: 'contact@sigmaps.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'https://sig-backend.tail7d68dd.ts.net',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'EDITOR', 'VIEWER'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user account is active',
            },
          },
        },
        Layer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nameAr: {
              type: 'string',
              description: 'Layer name in Arabic',
            },
            nameFr: {
              type: 'string',
              description: 'Layer name in French',
            },
            geometryType: {
              type: 'string',
              enum: ['POINT', 'LINE', 'POLYGON'],
            },
            isVisible: {
              type: 'boolean',
            },
            zIndex: {
              type: 'integer',
            },
            style: {
              type: 'object',
              properties: {
                color: {
                  type: 'string',
                  example: '#3B82F6',
                },
                opacity: {
                  type: 'number',
                  minimum: 0,
                  maximum: 1,
                  example: 0.7,
                },
              },
            },
          },
        },
        Feature: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            layerId: {
              type: 'string',
              format: 'uuid',
            },
            geometry: {
              type: 'object',
              description: 'GeoJSON Geometry object',
            },
            attributes: {
              type: 'object',
              description: 'Custom attributes key-value pairs',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 100,
            },
            total: {
              type: 'integer',
            },
            totalPages: {
              type: 'integer',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Layers',
        description: 'Layer management',
      },
      {
        name: 'Features',
        description: 'Geospatial feature management with spatial filtering',
      },
      {
        name: 'Export',
        description: 'Export data in various formats',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

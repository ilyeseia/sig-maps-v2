#!/bin/bash

# SIG Maps V2 - Production Setup Script
# This script generates secure passwords and configures the environment

set -e

echo "🗺️  SIG Maps V2 - Production Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in project directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}Error: Please run this script from the sig-maps-v2 root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Generating secure passwords...${NC}"
echo ""

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

echo -e "${GREEN}✓ Generated:${NC}"
echo "  - DB_PASSWORD: ${DB_PASSWORD:0:8}... (32 chars)"
echo "  - REDIS_PASSWORD: ${REDIS_PASSWORD:0:8}... (32 chars)"
echo "  - JWT_SECRET: ${JWT_SECRET:0:8}... (64 chars)"
echo ""

# Save credentials for reference
mkdir -p secrets
cat > secrets/production-credentials.txt << EOF
# SIG Maps V2 - Production Credentials
# Created: $(date)
# WARNING: Keep this file secure and never commit to git!

POSTGRES_USER=sigmaps_prod_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=sig_maps_v2
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET

# Save these credentials in a secure location!
EOF

echo -e "${YELLOW}Step 2: Creating .env.production file...${NC}"
echo ""

# Create .env.production with generated values
cat > .env.production << EOF
# SIG Maps V2 - Production Environment Configuration
# ⚠️ DO NOT COMMIT TO GIT - Contains sensitive data
# Generated: $(date)

# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=sigmaps_prod_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=sig_maps_v2
DATABASE_URL=postgresql://sigmaps_prod_user:$DB_PASSWORD@postgres:5432/sig_maps_v2?schema=public

# ============================================
# Redis Configuration
# ============================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# ============================================
# JWT & Security
# ============================================
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
BCRYPT_COST=12

# JWT Expiry
JWT_ACCESS_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# API Configuration
# ============================================
API_PORT=3005
API_HOST=0.0.0.0
FRONTEND_URL=https://sig-frontend.tail7d68dd.ts.net

# ============================================
# Frontend Configuration
# ============================================
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# ============================================
# Export Configuration
# ============================================
EXPORT_TIMEOUT_MS=300000
MAX_EXPORT_SIZE=10000000
EOF

echo -e "${GREEN}✓ Created .env.production${NC}"
echo ""

# Set secure permissions
chmod 600 .env.production
chmod 600 secrets/production-credentials.txt

echo -e "${YELLOW}Step 3: Setting up Docker volumes and network...${NC}"
echo ""

# Create volumes and network
docker-compose -f docker-compose.prod.yml down
docker network prune -f

echo -e "${GREEN}✓ Docker environment ready${NC}"
echo ""

echo -e "${YELLOW}Step 4: Building images (this may take 10-15 minutes)...${NC}"
echo ""

# Build all services
docker-compose -f docker-compose.prod.yml build

echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

echo -e "${YELLOW}Step 5: Running migrations...${NC}"
echo ""

# Run migrations
docker-compose -f docker-compose.prod.yml up -d postgres redis
sleep 10

# Run Prisma migrations
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

echo -e "${YELLOW}Step 6: Starting all services...${NC}"
echo ""

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service health
echo ""
echo -e "${YELLOW}Checking service health:${NC}"

services=("postgres" "redis" "backend" "frontend" "nginx")
for service in "${services[@]}"; do
    health=$(docker-compose -f docker-compose.prod.yml ps $service --format json | jq -r '.[0].Health' 2>/dev/null || echo "unknown")
    status=$(docker-compose -f docker-compose.prod.yml ps $service --format json | jq -r '.[0].State' 2>/dev/null || echo "unknown")
    echo -e "  $service: ${GREEN}$status${NC} (health: $health)"
done

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "📊 Services are now running in production mode:"
echo "  • Frontend: https://sig-frontend.tail7d68dd.ts.net"
echo "  • Backend API: https://sig-backend.tail7d68dd.ts.net"
echo "  • Full site: https://sig-maps.tail7d68dd.ts.net (via nginx)"
echo ""
echo "📝 Credentials saved in:"
echo "  • .env.production (runtime config)"
echo "  • secrets/production-credentials.txt (reference)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  1. Credentials are in 'secrets/production-credentials.txt'"
echo "  2. BACKUP these credentials to a secure location!"
echo "  3. NEVER commit .env.production or secrets/ to git"
echo "  4. Update your Tailscale proxy configurations if needed"
echo ""
echo "📋 Useful commands:"
echo "  • View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  • Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  • Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  • Check status: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo -e "${GREEN}🎉 SIG Maps V2 is ready for production!${NC}"

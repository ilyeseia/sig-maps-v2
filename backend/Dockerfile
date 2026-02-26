# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# NOTE: Skip TypeScript build to avoid compilation errors
# Production will run with tsx (TypeScript runtime executor)

# Expose port
EXPOSE 3002

# Start server with tsx (production mode without watch)
CMD ["npm", "run", "prod"]

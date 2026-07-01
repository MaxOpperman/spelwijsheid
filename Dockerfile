# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Build argument for base path (empty for root path deployment)
ARG BASE_PATH=
ENV BASE_PATH=${BASE_PATH}

# Copy package files and scripts
COPY package*.json ./
COPY scripts ./scripts

# Install dependencies (this will run the preinstall script)
RUN npm ci

# Copy rest of source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./
COPY scripts ./scripts

# Download wordlist first (preinstall script)
RUN node scripts/download-wordlist.js

# Install only production dependencies (skip prepare script which needs husky)
RUN npm ci --omit=dev --ignore-scripts

# Copy built files assets from builder
COPY --from=builder /app/build ./build

# Copy database migrations and the migration runner
COPY drizzle ./drizzle
COPY scripts/migrate.js ./scripts/migrate.js

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Run database migrations, refresh the GeoLite2 database, then start the server
CMD ["sh", "-c", "node scripts/migrate.js && node scripts/download-geoip.js && node build/index.js"]

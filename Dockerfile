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

# Install serve to run the static site
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Run the application
CMD ["serve", "-s", "build", "-l", "3000"]

# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Build argument for base path (empty for root path deployment)
ARG BASE_PATH=
ENV BASE_PATH=${BASE_PATH}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Download wordlist
RUN npm run download-wordlist

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

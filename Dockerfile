# ChromaDB Admin Management System (CAMS)
# Multi-stage Docker build for production

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build:vite

# Stage 2: Production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/server ./server
COPY --from=builder /app/.env.example ./.env.example

# Create .env if it doesn't exist
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose port
EXPOSE 3434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3434/api/v1/healthcheck', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3434

# Labels for metadata
LABEL maintainer="Neetpal Singh <neetpalsingh750@gmail.com>"
LABEL description="ChromaDB Admin Management System - Web-based admin dashboard for ChromaDB"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/neetpalsingh/ChromaDB-Admin-managment"
LABEL org.opencontainers.image.description="ChromaDB Admin Management System (CAMS)"
LABEL org.opencontainers.image.licenses="MIT"

# Start the application
CMD ["node", "server/productionServer.js"]

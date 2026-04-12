# ============================================================================
# PRODUCTION DOCKERFILE - Multi-Stage Build
# ============================================================================
#
# WHAT IS THIS?
# - Production-ready container for AWS ECS Fargate
# - Multi-stage build: separate compilation from runtime
# - Optimized for production: small, secure, fast
#
# WHEN IS THIS USED?
# - AWS CodePipeline → CodeBuild → ECR → ECS Fargate
# - Production deployments only
# - CI/CD pipeline (buildspec.yml references this)
#
# BUILD PROCESS:
# 1. Builder stage: Install all deps, compile TypeScript
# 2. Production stage: Copy only runtime files, install prod deps
# 3. Result: ~150MB optimized image (vs ~500MB with dev tools)
#
# SECURITY FEATURES:
# - Non-root user (node:18-alpine runs as node user)
# - Minimal attack surface (no dev tools, source code)
# - Health checks for container orchestration
# - Alpine Linux (small, secure base image)
#
# MULTI-STAGE BUILD BENEFITS:
# - Smaller final image (faster downloads, less storage)
# - Better security (no build tools in final image)
# - Faster deployments (smaller images = faster ECR push/pull)
# - Production-only dependencies (no dev tools in runtime)
#
# ============================================================================

# BUILDER STAGE - Compile TypeScript to JavaScript
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# ============================================================================
# PRODUCTION STAGE - Runtime Only
# ============================================================================

FROM node:18-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Change ownership of working directory to nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (no dev tools)
RUN npm ci --only=production && npm cache clean --force

# Copy compiled JavaScript from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { \
    if (r.statusCode !== 200) throw new Error('Health check failed: ' + r.statusCode) \
  })"

# Start the application
CMD ["node", "dist/index.js"]

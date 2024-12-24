# Stage 1: Build Stage (Generate Prisma client & Build application)
FROM oven/bun:alpine AS builder

WORKDIR /app

# Install necessary build dependencies (only for the build stage)
RUN apk update && \
    apk add --no-cache build-base python3 make gcc libssl3 curl

# Copy package files and Prisma schema
COPY package*.json ./

COPY bun.lockb ./

COPY prisma ./prisma

# Install all dependencies (including dev dependencies for build)
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client (for runtime)
RUN bun prisma generate

# Build the application
RUN bun run build

# Stage 2: Prune Stage (Clean unnecessary files)
FROM golang:1.22.0-alpine AS prune

WORKDIR /app

# Install node-prune
RUN go install github.com/tj/node-prune@latest

# Copy application files from the build stage
COPY --from=builder /app /app

# Run node-prune to clean unnecessary files from node_modules
RUN node-prune

# Stage 3: Production Runtime Stage (with minimal runtime dependencies)
FROM oven/bun:alpine AS runtime

WORKDIR /app

# Install only necessary runtime dependencies (no build dependencies)
RUN apk update && apk add --no-cache libssl3 curl

# Copy the pruned application from the prune stage
COPY --from=prune /app /app

# Install only production dependencies (no dev dependencies)
RUN bun install --production

# Expose the application port
EXPOSE 3000

# Default command for running the app
CMD ["bun", "run", "start:prod"]

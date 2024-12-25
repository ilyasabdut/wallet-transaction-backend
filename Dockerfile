FROM oven/bun:alpine AS builder

ENV NODE_ENV production

WORKDIR /app

# Install necessary build dependencies
RUN apk update && \
    apk add --no-cache build-base python3 make gcc libssl3

# Copy package files
COPY package*.json ./
COPY bun.lockb ./
COPY prisma ./prisma

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client and build
RUN bun prisma generate && bun run build

# Prune stage
FROM oven/bun:alpine AS prune

WORKDIR /app

# Copy files from the builder stage
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/tsconfig*.json /app/
COPY --from=builder /app/*.tsbuildinfo /app/

# Install node-prune
RUN apk add --no-cache curl bash
RUN curl -sfL https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin

# Prune unnecessary files
RUN /usr/local/bin/node-prune
RUN find node_modules -name "*.map" -type f -delete
RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/swagger-ui-dist/*.map

# Final stage
FROM oven/bun:alpine

WORKDIR /app

# Copy pruned files
COPY --from=prune /app/node_modules /app/node_modules
COPY --from=prune /app/dist /app/dist
COPY --from=prune /app/package*.json ./
COPY --from=prune /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json /app/

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:prod"]

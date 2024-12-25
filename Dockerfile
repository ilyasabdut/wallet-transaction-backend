FROM oven/bun:alpine AS builder

ENV NODE_ENV production

WORKDIR /app

# Install necessary build dependencies
RUN apk update && \
    apk add --no-cache build-base python3 make gcc libssl3 curl

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

FROM oven/bun:alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.build.json ./
COPY --from=builder /app/tsconfig.build.tsbuildinfo ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:prod"]
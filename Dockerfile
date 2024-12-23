FROM oven/bun:alpine

WORKDIR /app

# Install necessary build dependencies
RUN apk update && \
    apk add --no-cache build-base python3 make gcc libssl3 curl

# Copy package files
COPY package*.json ./

COPY prisma ./prisma

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Generate Prisma client and build
RUN bun prisma generate && bun run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:prod"]
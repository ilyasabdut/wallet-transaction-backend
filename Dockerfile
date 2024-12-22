FROM node:21-alpine

WORKDIR /app

# Install necessary build dependencies
RUN apk update && \
    apk add --no-cache build-base python3 make gcc libssl3 curl

# Copy package files
COPY package*.json ./

COPY prisma ./prisma

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && \
    npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
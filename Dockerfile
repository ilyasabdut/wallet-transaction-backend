# Stage 1: Build Stage
# Use node:20-alpine as the base image for the build stage
FROM oven/bun:alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy all files from the host to the container
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Run the build script defined in package.json
RUN bun run build

# Remove node_modules to prepare for a clean production install
RUN rm -rf node_modules

# Install only production dependencies
RUN bun install --omit=dev

# Stage 2: Prune Stage
# Use golang:1.22.0-alpine as the base image for the prune stage
FROM golang:1.22.0-alpine AS prune

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the build output and dependencies from the build stage
COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/node_modules/ /app/node_modules/
COPY --from=build /app/package*.json /app/

# Install node-prune to remove unnecessary files
RUN go install github.com/tj/node-prune@latest

# Run node-prune to remove unnecessary files from node_modules
RUN node-prune

# Stage 3: Production Stage
# Use node:20-alpine as the base image for the production stage
FROM node:20-alpine as production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the pruned application files from the prune stage
COPY --from=prune /usr/src/app /usr/src/app

# Expose port 3000 to the host
EXPOSE 3000

# Define the command to run the application
CMD ["node", "dist/main"]
# ---------- Build Stage ----------
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install dependencies (including handling self-signed SSL)
COPY package.json package-lock.json ./
# Skip puppeteer download (avoid SSL issues) and install all dependencies for build
ENV PUPPETEER_SKIP_DOWNLOAD=1
RUN npm config set strict-ssl false && npm ci

# Copy source files
COPY . .

# Build the Vite application
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Add a simple health check endpoint (nginx returns 200 for any existing file)
# We'll rely on the default index.html for health checks.

# Run nginx in foreground (default cmd)

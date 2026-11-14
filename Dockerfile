# ========================================================
# Kestrel Finance — Production Multi-Stage Containerfile
# ========================================================

# Stage 1: Build Application
FROM node:22-alpine AS builder
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install dependencies with frozen lockfile
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and configurations
COPY . .

# Run TypeScript compilation and Vite production bundling
RUN npm run build

# Run unit tests to enforce zero build regressions
RUN npm test

# Stage 2: Hardened Production Nginx Runtime
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Copy custom hardened nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose non-privileged HTTP port
EXPOSE 8080

# Container healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

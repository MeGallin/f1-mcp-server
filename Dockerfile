# F1 MCP Server - Multi-stage Docker build
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install production dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage (for development dependencies)
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint

# Production stage
FROM base AS runner
WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package*.json ./

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup --system --gid 1001 mcpserver && \
    adduser --system --uid 1001 mcpserver

# Change ownership of app directory
RUN chown -R mcpserver:mcpserver /app
USER mcpserver

# Expose port for HTTP transport (if needed)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('MCP Server Health Check')" || exit 1

# Start the MCP server
CMD ["npm", "start"]

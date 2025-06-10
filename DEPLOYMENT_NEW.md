# F1 MCP Server Deployment Guide

## Overview

The F1 MCP Server can run in two modes:

1. **stdio mode** (traditional MCP server) - for local development with LangGraph
2. **web mode** (HTTP server) - for cloud deployment on platforms like Render.com

## Deployment Modes

### stdio Mode (Local Development)

- Uses Model Context Protocol via standard input/output
- Communicates directly with LangGraph applications
- Set `DEPLOY_MODE=stdio` in environment

### web Mode (Cloud Deployment)

- Runs as HTTP web service
- Provides health check and info endpoints
- Required for Render.com and similar platforms
- Set `DEPLOY_MODE=web` in environment

## Render.com Deployment

### Environment Variables

Set these in your Render.com service:

```
NODE_ENV=production
MCP_SERVER_NAME=f1-mcp-server
MCP_SERVER_VERSION=1.0.0
DEPLOY_MODE=web
PORT=3001
F1_API_PROXY_URL=https://f1-api-proxy.onrender.com
F1_API_TIMEOUT=15000
LOG_LEVEL=info
LOG_FORMAT=json
MAX_SEASONS=10
MAX_RACES_PER_SEASON=25
MAX_DRIVERS_PER_SEASON=30
DEFAULT_SEASON=current
```

### Service Configuration

- **Service Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: Will auto-detect from PORT environment variable

### Available Endpoints

When running in web mode, the following HTTP endpoints are available:

- `GET /` - Service information
- `GET /health` - Health check
- `GET /tools` - List of available MCP tools

## Architecture

```
Cloud Deployment (web mode):
LangGraph → HTTP → F1 MCP Server (web) → F1 API Proxy → Jolpica F1 API

Local Development (stdio mode):
LangGraph → stdio → F1 MCP Server (stdio) → F1 API Proxy → Jolpica F1 API
```

## Troubleshooting

### "No open ports detected" Error

- **Cause**: Server was running in stdio mode on cloud platform
- **Solution**: Set `DEPLOY_MODE=web` environment variable

### Environment shows "development"

- **Cause**: NODE_ENV not set to production
- **Solution**: Set `NODE_ENV=production` environment variable

### MCP Tools Not Working

- **Note**: In web mode, this is an HTTP wrapper. For actual MCP functionality, use stdio mode locally
- The web mode provides information endpoints but doesn't implement full MCP protocol over HTTP

## Local Development Setup

For local development with LangGraph:

1. Copy `.env.development` to `.env`
2. Start f1-api-proxy: `npm start` (in f1-api-proxy directory)
3. Start f1-mcp-server: `npm start` (in f1-mcp-server directory)
4. Configure LangGraph to use stdio transport

## Production Deployment

For production cloud deployment:

1. Deploy f1-api-proxy first
2. Update F1_API_PROXY_URL with deployed proxy URL
3. Set DEPLOY_MODE=web
4. Deploy f1-mcp-server

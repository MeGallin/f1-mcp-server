# URGENT: Fix Render.com Deployment

## Issue
Your f1-mcp-server is failing on Render.com with "No open ports detected" because it's running in stdio mode instead of web mode.

## Quick Fix

### 1. Update Environment Variables on Render.com

Go to your f1-mcp-server service on Render.com and add/update these environment variables:

```
NODE_ENV=production
DEPLOY_MODE=web
PORT=3001
F1_API_PROXY_URL=https://f1-api-proxy.onrender.com
```

### 2. Redeploy

After adding the environment variables, trigger a new deployment.

## What Changed

I've modified your f1-mcp-server to support two modes:

- **stdio mode**: Traditional MCP server for local development
- **web mode**: HTTP server for cloud deployment

## Expected Results

After the fix, your deployment should:

1. ✅ Bind to port 3001 (no more "no open ports" error)
2. ✅ Show "mode": "web" in logs
3. ✅ Provide HTTP endpoints:
   - `GET /health` - Health check
   - `GET /tools` - Available MCP tools
   - `GET /` - Service info

## Next Steps

1. **Fix the deployment** with the environment variables above
2. **Deploy f1-api-proxy** (you still need this service)
3. **Update F1_API_PROXY_URL** to the actual deployed API proxy URL

## Files Modified

- `src/server.js` - Added web mode support
- `package.json` - Added Express dependency
- `.env` - Updated with web deployment config

The server will now work on Render.com while maintaining MCP functionality for local development.

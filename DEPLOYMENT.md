# F1 MCP Server Deployment Guide

## Render.com Deployment

### Prerequisites

1. A Render.com account
2. The f1-api-proxy service deployed and running
3. Git repository with the f1-mcp-server code

### Environment Variables

Set these environment variables in your Render.com service configuration:

```
NODE_ENV=production
MCP_SERVER_NAME=f1-mcp-server
MCP_SERVER_VERSION=1.0.0
F1_API_PROXY_URL=https://your-f1-api-proxy.onrender.com
F1_API_TIMEOUT=15000
LOG_LEVEL=info
LOG_FORMAT=json
```

### Deployment Steps

1. **Create New Web Service**

   - Connect your GitHub repository
   - Choose Node.js environment
   - Set build command: `npm install`
   - Set start command: `npm start`

2. **Configure Environment**

   - Add all environment variables listed above
   - Set `F1_API_PROXY_URL` to your deployed API proxy URL

3. **Health Check Configuration**
   - The MCP server will start even if the API proxy is unavailable in production mode
   - This allows for independent service deployments
   - Check logs for service health status

### Production Features

- **Graceful Degradation**: Server starts even when API proxy is unavailable
- **Enhanced Logging**: Structured logging with correlation IDs
- **Error Handling**: Comprehensive error responses for all tools
- **Resource Optimization**: Production-optimized timeouts and configurations

### Monitoring

Monitor your deployment using:

- Render.com dashboard logs
- Health check endpoints
- API response times

### Troubleshooting

**Common Issues:**

1. **Server fails to start**

   - Check environment variables are set correctly
   - Verify NODE_ENV=production
   - Check logs for specific error messages

2. **API calls fail**

   - Verify F1_API_PROXY_URL is correct and accessible
   - Check API proxy service is running
   - Review network connectivity

3. **Tool errors**
   - Tools will return structured error responses
   - Check logs for detailed error information
   - Verify API proxy endpoints are working

### Development vs Production

**Development Mode (NODE_ENV=development):**

- Requires F1 API proxy to be available at startup
- More verbose logging
- Shorter timeouts for faster feedback

**Production Mode (NODE_ENV=production):**

- Starts even if F1 API proxy is unavailable
- Optimized logging
- Longer timeouts for network reliability
- Graceful error handling for service dependencies

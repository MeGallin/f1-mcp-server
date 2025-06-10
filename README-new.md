# F1 MCP Server

A comprehensive Model Context Protocol (MCP) server that provides Formula 1 racing data tools for LangGraph applications. This server connects to the F1 API Proxy and exposes structured F1 data through MCP-compliant tools.

## 🏎️ Features

### MCP Tools Available

- **Seasons**: Get F1 season information (all seasons, current season)
- **Races**: Access race calendars and specific race details
- **Drivers**: Retrieve driver information and statistics
- **Constructors**: Get team/constructor data
- **Results**: Access race results, qualifying, and championship standings

### Architecture

- **MCP Protocol Compliance**: Full support for Model Context Protocol
- **Service Integration**: Seamless connection to F1 API Proxy
- **Error Handling**: Comprehensive error handling and logging
- **Docker Support**: Containerized deployment ready
- **Production Ready**: Structured logging, health checks, graceful shutdown

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- F1 API Proxy running (see `../f1-api-proxy/`)
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start in development mode
npm run dev

# Start in production mode
npm start
```

### Environment Variables

```env
NODE_ENV=development
MCP_SERVER_NAME=f1-mcp-server
MCP_SERVER_VERSION=1.0.0
MCP_HOST=localhost
MCP_PORT=3001
F1_API_PROXY_URL=http://localhost:8000
F1_API_TIMEOUT=10000
LOG_LEVEL=info
LOG_FORMAT=json
```

## 🔧 Development

### Available Scripts

```bash
npm start        # Start server
npm run dev      # Development with auto-reload
npm test         # Run tests
npm run lint     # Lint code
npm run lint:fix # Fix linting issues
```

### Project Structure

```
src/
├── server.js              # Main MCP server
├── services/
│   └── f1ApiClient.js     # F1 API Proxy client
├── tools/                 # MCP tools
│   ├── seasonsTools.js    # Season-related tools
│   ├── racesTools.js      # Race-related tools
│   ├── driversTools.js    # Driver-related tools
│   ├── constructorsTools.js # Constructor-related tools
│   └── resultsTools.js    # Results-related tools
└── utils/
    └── logger.js          # Logging utility
```

## 🏁 MCP Tools Reference

### Seasons Tools

- `get_f1_seasons`: Get all available F1 seasons
- `get_current_f1_season`: Get current season information

### Races Tools

- `get_f1_races`: Get races for a specific season
- `get_f1_race_details`: Get detailed race information
- `get_current_f1_race`: Get current/most recent race
- `get_next_f1_race`: Get next upcoming race

### Drivers Tools

- `get_f1_drivers`: Get all drivers for a season
- `get_f1_driver_details`: Get specific driver information

### Constructors Tools

- `get_f1_constructors`: Get all constructors for a season
- `get_f1_constructor_details`: Get specific constructor information

### Results Tools

- `get_f1_race_results`: Get race results
- `get_f1_qualifying_results`: Get qualifying results
- `get_f1_driver_standings`: Get driver championship standings
- `get_f1_constructor_standings`: Get constructor championship standings

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t f1-mcp-server .

# Run with docker-compose
docker-compose up -d

# Run with full stack (includes API proxy)
docker-compose --profile full-stack up -d
```

### Docker Configuration

- **Multi-stage build**: Optimized for production
- **Health checks**: Automatic health monitoring
- **Logging**: Persistent log volumes
- **Security**: Non-root user execution
- **Networking**: Bridge network for service communication

## 🔗 Integration

### LangGraph Integration

```python
# Python example using MCP HTTP transport
from langchain_core.tools import tool
import requests

@tool
def get_f1_current_race():
    """Get current F1 race information"""
    response = requests.post(
        "http://localhost:3001/mcp/tools/call",
        json={
            "method": "tools/call",
            "params": {
                "name": "get_current_f1_race",
                "arguments": {}
            }
        }
    )
    return response.json()
```

### MCP Client Configuration

```json
{
  "mcpServers": {
    "f1-racing": {
      "command": "node",
      "args": ["path/to/f1-mcp-server/src/server.js"],
      "transport": "stdio"
    }
  }
}
```

## 📊 Monitoring

### Health Check

```bash
# Check server health
curl http://localhost:3001/health

# Check available tools
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

### Logging

- **Structured logging**: JSON format for production
- **Log levels**: Configurable (debug, info, warn, error)
- **Request correlation**: Unique IDs for request tracking
- **Error tracking**: Comprehensive error logging

## 🚨 Error Handling

The server provides comprehensive error handling:

- **API Errors**: Structured error responses from F1 API
- **Network Errors**: Connection failure handling
- **Validation Errors**: Input parameter validation
- **MCP Errors**: Protocol-compliant error responses

## 🔒 Security

- **Input validation**: Zod schema validation
- **Error sanitization**: Safe error message exposure
- **Docker security**: Non-root user execution
- **Dependency management**: Regular security updates

## 📈 Performance

- **Caching**: Leverages F1 API Proxy caching
- **Connection pooling**: Efficient HTTP connections
- **Memory management**: Optimized for long-running processes
- **Async operations**: Non-blocking I/O operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🏆 F1 MCP LangGraph Project

This MCP server is part of the larger F1 MCP LangGraph project:

- **f1-api-proxy**: Caching API proxy for F1 data
- **f1-mcp-server**: This MCP server (current)
- **f1-test-client**: Testing and integration examples

For the complete project documentation, see the main [README.md](../README.md).

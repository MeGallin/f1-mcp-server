# F1 MCP Server

Model Context Protocol (MCP) server for Formula 1 racing data, designed for integration with LangGraph agentic applications.

## Overview

This MCP server provides standardized access to Formula 1 data through the Model Context Protocol, enabling LangGraph workflows and other AI applications to access comprehensive F1 racing information.

## Features

- **MCP Tools**: 9 specialized tools for F1 data access
- **MCP Resources**: Dynamic and static F1 data resources
- **MCP Prompts**: Pre-built prompt templates for F1 analysis
- **HTTP Transport**: StreamableHTTP for LangGraph integration
- **Service Discovery**: Health checks and tool discovery endpoints

## MCP Tools

- `get_f1_seasons` - All F1 seasons
- `get_f1_races` - Race schedules and details
- `get_f1_drivers` - Driver information and statistics
- `get_f1_constructors` - Team/constructor data
- `get_f1_qualifying` - Qualifying session results
- `get_f1_lap_times` - Lap time data
- `get_f1_pitstops` - Pit stop information
- `get_f1_standings` - Championship standings
- `get_f1_results` - Race results

## LangGraph Integration

- **Endpoint**: `http://localhost:3000/mcp`
- **Health Check**: `http://localhost:3000/health`
- **Service Discovery**: `http://localhost:3000/tools`
- **Registry**: `http://localhost:3000/registry`

## Architecture

- **Node.js** with MCP JavaScript SDK
- **Express.js** for HTTP transport
- **JavaScript** (ES6+ with CommonJS modules)
- **Zod** for schema validation
- **Session Management** for concurrent clients

## Development

```bash
npm install
npm run dev
```

## Deployment

- **Port**: 3000
- **Transport**: StreamableHTTP + Stdio
- **Protocol**: MCP 2025-03-26

Part of the F1 MCP LangGraph project ecosystem.

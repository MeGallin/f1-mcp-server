// Load environment variables first
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import logger from './utils/logger.js';
import f1ApiClient from './services/f1ApiClient.js';

// Import F1 tools
import seasonsTools from './tools/seasonsTools.js';
import racesTools from './tools/racesTools.js';
import driversTools from './tools/driversTools.js';
import constructorsTools from './tools/constructorsTools.js';
import resultsTools from './tools/resultsTools.js';

/**
 * F1 MCP Server
 * Provides Formula 1 racing data tools for LangGraph applications
 * Implements Model Context Protocol (MCP) specification
 */
class F1MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || 'f1-mcp-server',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupErrorHandling();
    this.registerTools();
    this.setupRequestHandlers();
  }

  /**
   * Setup global error handling
   * @private
   */
  setupErrorHandling() {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection:', { reason, promise });
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });
  }

  /**
   * Register all F1 tools with the MCP server
   * @private
   */
  registerTools() {
    const toolCategories = [
      seasonsTools,
      racesTools,
      driversTools,
      constructorsTools,
      resultsTools,
    ];

    // Register tools from all categories
    toolCategories.forEach((category) => {
      category.getTools().forEach((tool) => {
        this.server.setRequestHandler(
          { method: 'tools/call', name: tool.name },
          tool.handler,
        );
      });
    });

    logger.info('Registered F1 MCP tools', {
      totalTools: toolCategories.reduce(
        (sum, category) => sum + category.getTools().length,
        0,
      ),
      categories: toolCategories.map((category) => category.constructor.name),
    });
  }

  /**
   * Setup MCP request handlers
   * @private
   */
  setupRequestHandlers() {
    // Handle tools/list requests
    this.server.setRequestHandler({ method: 'tools/list' }, async () => {
      const allTools = [
        ...seasonsTools.getTools(),
        ...racesTools.getTools(),
        ...driversTools.getTools(),
        ...constructorsTools.getTools(),
        ...resultsTools.getTools(),
      ];

      return {
        tools: allTools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Handle ping requests
    this.server.setRequestHandler({ method: 'ping' }, async () => {
      return {};
    });
  }

  /**
   * Start the MCP server
   */
  async start() {
    try {
      // Verify F1 API connection
      await f1ApiClient.healthCheck();
      logger.info('F1 API proxy connection verified');

      // Start server with stdio transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      logger.info('F1 MCP Server started successfully', {
        serverName: process.env.MCP_SERVER_NAME,
        version: process.env.MCP_SERVER_VERSION,
        apiProxyUrl: process.env.F1_API_PROXY_URL,
      });
    } catch (error) {
      logger.error('Failed to start F1 MCP Server:', error);
      process.exit(1);
    }
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new F1MCPServer();
  server.start().catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export default F1MCPServer;

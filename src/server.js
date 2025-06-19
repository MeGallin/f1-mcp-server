// Load environment variables first
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cron from 'node-cron';
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
    this.setupCronJobs();
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
   * Setup cron jobs for maintenance tasks
   * @private
   */
  setupCronJobs() {
    // Run every 30 seconds - health check and cache maintenance
    cron.schedule('*/30 * * * * *', async () => {
      try {
        // Health check
        const isHealthy = await f1ApiClient.healthCheck();
        logger.debug('Scheduled health check completed', { isHealthy });
        
        // Optional: Add cache cleanup or other maintenance tasks here
        
      } catch (error) {
        logger.error('Scheduled health check failed:', error);
      }
    });

    logger.info('Cron jobs scheduled: health check every 30 seconds');
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

    // Collect all tools
    const allTools = [];
    toolCategories.forEach((category) => {
      allTools.push(...category.getTools());
    });

    // Register tool call handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const tool = allTools.find((t) => t.name === toolName);

      if (!tool) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${toolName}`,
            },
          ],
        };
      }

      try {
        return await tool.handler(request);
      } catch (error) {
        logger.error(`Error executing tool ${toolName}:`, error);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing tool: ${error.message}`,
            },
          ],
        };
      }
    });

    logger.info('Registered F1 MCP tools', {
      totalTools: allTools.length,
      toolNames: allTools.map((t) => t.name),
      categories: toolCategories.map((category) => category.constructor.name),
    });
  }
  /**
   * Setup MCP request handlers
   * @private
   */
  setupRequestHandlers() {
    // Handle tools/list requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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
  } /**
   * Start the MCP server
   */
  async start() {
    try {
      // Verify F1 API connection (optional in production)
      const isApiAvailable = await f1ApiClient.healthCheck();

      if (isApiAvailable) {
        logger.info('Jolpica F1 API connection verified');
      } else {
        if (process.env.NODE_ENV === 'production') {
          logger.warn(
            'Jolpica F1 API not available, but continuing in production mode',
            {
              jolpicaApiUrl: process.env.JOLPICA_API_URL,
            },
          );
        } else {
          throw new Error(
            'Jolpica F1 API is not available and required in development mode',
          );
        }
      }

      // Check if we should run as web service (for Render.com deployment)
      if (process.env.DEPLOY_MODE === 'web') {
        await this.startWebService();
      } else {
        // Start server with stdio transport (traditional MCP server)
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
      }

      logger.info('F1 MCP Server started successfully', {
        serverName: process.env.MCP_SERVER_NAME,
        version: process.env.MCP_SERVER_VERSION,
        jolpicaApiUrl: process.env.JOLPICA_API_URL,
        environment: process.env.NODE_ENV,
        apiAvailable: isApiAvailable,
        mode: process.env.DEPLOY_MODE || 'stdio',
      });
    } catch (error) {
      logger.error('Failed to start F1 MCP Server:', error);
      process.exit(1);
    }
  }

  /**
   * Start as web service for cloud deployment
   * @private
   */ async startWebService() {
    const app = express();
    const port = process.env.PORT || 3001;

    // CORS configuration for f1-client integration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || [
        'http://localhost:3000', // React dev server default
        'http://localhost:3001', // Vite dev server
        'http://localhost:5173', // Vite dev server alternative
        'https://f1-client-ui.onrender.com', // Production UI (when deployed)
        '*', // Allow all origins in development
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

    // Add CORS middleware
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      const allowedOrigins = Array.isArray(corsOptions.origin)
        ? corsOptions.origin
        : [corsOptions.origin];

      if (corsOptions.origin === '*' || allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
      }

      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        corsOptions.methods.join(', '),
      );
      res.header(
        'Access-Control-Allow-Headers',
        corsOptions.allowedHeaders.join(', '),
      );

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      next();
    });

    // Add other middleware
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        server: process.env.MCP_SERVER_NAME,
        version: process.env.MCP_SERVER_VERSION,
        timestamp: new Date().toISOString(),
        apiAvailable: true, // We checked this in start()
      });
    });

    // MCP tools info endpoint
    app.get('/tools', (req, res) => {
      const tools = [];

      // Get tool information from registered tools
      if (
        this.server &&
        this.server._capabilities &&
        this.server._capabilities.tools
      ) {
        // This is a simplified representation
        res.json({
          success: true,
          tools: [
            'get_f1_seasons',
            'get_current_f1_season',
            'get_f1_races',
            'get_f1_race_details',
            'get_current_f1_race',
            'get_next_f1_race',
            'get_f1_drivers',
            'get_f1_driver_details',
            'get_f1_constructors',
            'get_f1_constructor_details',
            'get_f1_race_results',
            'get_f1_qualifying_results',
            'get_f1_driver_standings',
            'get_f1_constructor_standings',
          ],
          totalTools: 14,
        });
      } else {
        res.json({
          success: true,
          tools: [],
          totalTools: 0,
        });
      }
    });

    // Tool invocation endpoint for HTTP access
    app.post('/tools/invoke', async (req, res) => {
      try {
        const { tool: toolName, parameters = {} } = req.body;

        if (!toolName) {
          return res.status(400).json({
            success: false,
            error: 'Tool name is required'
          });
        }

        // Get all available tools
        const allTools = [
          ...seasonsTools.getTools(),
          ...racesTools.getTools(),
          ...driversTools.getTools(),
          ...constructorsTools.getTools(),
          ...resultsTools.getTools(),
        ];

        // Find the requested tool
        const tool = allTools.find((t) => t.name === toolName);

        if (!tool) {
          return res.status(404).json({
            success: false,
            error: `Unknown tool: ${toolName}`,
            availableTools: allTools.map(t => t.name)
          });
        }

        // Execute the tool
        const request = {
          params: {
            name: toolName,
            arguments: parameters
          }
        };

        const result = await tool.handler(request);

        // Return the result
        res.json({
          success: true,
          tool: toolName,
          parameters,
          result: result.content || result,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Tool invocation error:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Info endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'F1 MCP Server',
        version: process.env.MCP_SERVER_VERSION,
        description: 'Formula 1 racing data tools for LangGraph applications',
        protocol: 'Model Context Protocol (MCP)',
        endpoints: {
          health: '/health',
          tools: '/tools',
          invoke: '/tools/invoke',
        },
        note: 'This is a web service wrapper for the MCP server. For actual MCP usage, connect via stdio transport.',
      });
    });

    // Start HTTP server
    return new Promise((resolve) => {
      app.listen(port, '0.0.0.0', () => {
        logger.info(`F1 MCP Web Service listening on port ${port}`);
        resolve();
      });
    });
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

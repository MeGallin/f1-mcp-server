import F1MCPServer from '../src/server.js';
import f1ApiClient from '../src/services/f1ApiClient.js';

// Mock f1ApiClient for testing
jest.mock('../src/services/f1ApiClient.js');

describe('F1 MCP Server', () => {
  let server;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock successful health check
    f1ApiClient.healthCheck = jest.fn().mockResolvedValue(true);
  });

  afterEach(() => {
    if (server) {
      // Clean up server instance
      server = null;
    }
  });

  describe('Server Initialization', () => {
    test('should create server instance', () => {
      server = new F1MCPServer();
      expect(server).toBeDefined();
      expect(server.server).toBeDefined();
    });

    test('should register error handlers', () => {
      const processOnSpy = jest.spyOn(process, 'on');
      server = new F1MCPServer();

      expect(processOnSpy).toHaveBeenCalledWith(
        'uncaughtException',
        expect.any(Function),
      );
      expect(processOnSpy).toHaveBeenCalledWith(
        'unhandledRejection',
        expect.any(Function),
      );
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith(
        'SIGTERM',
        expect.any(Function),
      );

      processOnSpy.mockRestore();
    });
  });

  describe('F1 API Client', () => {
    test('should have health check method', () => {
      expect(f1ApiClient.healthCheck).toBeDefined();
      expect(typeof f1ApiClient.healthCheck).toBe('function');
    });

    test('should have all required API methods', () => {
      const requiredMethods = [
        'getSeasons',
        'getCurrentSeason',
        'getRaces',
        'getRace',
        'getCurrentRace',
        'getNextRace',
        'getDrivers',
        'getDriver',
        'getConstructors',
        'getConstructor',
        'getRaceResults',
        'getQualifyingResults',
        'getDriverStandings',
        'getConstructorStandings',
      ];

      requiredMethods.forEach((method) => {
        expect(f1ApiClient[method]).toBeDefined();
        expect(typeof f1ApiClient[method]).toBe('function');
      });
    });
  });

  describe('Tool Registration', () => {
    test('should register all tool categories', () => {
      server = new F1MCPServer();

      // Check that server has request handlers
      expect(server.server).toBeDefined();

      // This test validates that the server initializes without errors
      // More detailed tool testing would require integration tests
    });
  });

  describe('Environment Configuration', () => {
    test('should use environment variables with defaults', () => {
      const originalEnv = process.env;

      // Test with custom environment
      process.env = {
        ...originalEnv,
        MCP_SERVER_NAME: 'test-server',
        MCP_SERVER_VERSION: '2.0.0',
      };

      server = new F1MCPServer();

      // Restore original environment
      process.env = originalEnv;

      expect(server).toBeDefined();
    });

    test('should handle missing environment variables', () => {
      const originalEnv = process.env;

      // Test with minimal environment
      process.env = {
        ...originalEnv,
        MCP_SERVER_NAME: undefined,
        MCP_SERVER_VERSION: undefined,
      };

      server = new F1MCPServer();

      // Restore original environment
      process.env = originalEnv;

      expect(server).toBeDefined();
    });
  });
});

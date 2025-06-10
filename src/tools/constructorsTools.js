import f1ApiClient from '../services/f1ApiClient.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

/**
 * Constructors Tools
 * MCP tools for accessing Formula 1 constructor/team information
 */

/**
 * Get F1 Constructors tool
 */
const getF1Constructors = {
  name: 'get_f1_constructors',
  description:
    'Get all constructors (teams) for a specific Formula 1 season including team information, headquarters, and nationality.',
  inputSchema: {
    type: 'object',
    properties: {
      season: {
        type: 'string',
        description:
          "Season year (e.g., '2023', '2024') or 'current' for current season",
        default: 'current',
      },
    },
    required: [],
  },
  handler: async (request) => {
    try {
      const season = request.params?.season || 'current';

      logger.info('Getting F1 constructors', { season });

      const data = await f1ApiClient.getConstructors(season);

      logger.info('Successfully retrieved F1 constructors', {
        season,
        count: data.MRData?.ConstructorTable?.Constructors?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Retrieved ${data.MRData?.ConstructorTable?.Constructors?.length || 0} constructors for ${season} season`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 constructors:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'CONSTRUCTORS_ERROR',
                },
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Get F1 Constructor Details tool
 */
const getF1ConstructorDetails = {
  name: 'get_f1_constructor_details',
  description:
    'Get detailed information about a specific Formula 1 constructor/team including history, headquarters, and current drivers.',
  inputSchema: {
    type: 'object',
    properties: {
      constructorId: {
        type: 'string',
        description:
          "Constructor ID (e.g., 'mercedes', 'red_bull', 'ferrari', 'mclaren'). Use the team's name in lowercase with underscores for spaces.",
      },
      season: {
        type: 'string',
        description:
          "Season year (e.g., '2023', '2024') or 'current' for current season",
        default: 'current',
      },
    },
    required: ['constructorId'],
  },
  handler: async (request) => {
    try {
      const constructorId = request.params?.constructorId;
      const season = request.params?.season || 'current';

      if (!constructorId) {
        throw new Error('Constructor ID is required');
      }

      logger.info('Getting F1 constructor details', { constructorId, season });

      const data = await f1ApiClient.getConstructor(constructorId, season);

      logger.info('Successfully retrieved F1 constructor details', {
        constructorId,
        season,
        constructorName:
          data.MRData?.ConstructorTable?.Constructors?.[0]?.name || 'Unknown',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Constructor details for ${constructorId} in ${season} season: ${
                  data.MRData?.ConstructorTable?.Constructors?.[0]?.name ||
                  'Constructor not found'
                }`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 constructor details:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'CONSTRUCTOR_DETAILS_ERROR',
                },
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Get available tools
 * @returns {Array} Array of tool definitions
 */
function getTools() {
  return [getF1Constructors, getF1ConstructorDetails];
}

export default {
  getTools,
  getF1Constructors,
  getF1ConstructorDetails,
};

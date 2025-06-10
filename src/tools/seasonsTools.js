import f1ApiClient from '../services/f1ApiClient.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

/**
 * Seasons Tools
 * MCP tools for accessing Formula 1 season information
 */

/**
 * Get F1 Seasons tool
 */
const getF1Seasons = {
  name: 'get_f1_seasons',
  description:
    'Get all available Formula 1 seasons. Returns a list of all seasons from 1950 to current year with basic information about each season.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async (request) => {
    try {
      logger.info('Getting F1 seasons');

      const data = await f1ApiClient.getSeasons();

      logger.info('Successfully retrieved F1 seasons', {
        count: data.MRData?.SeasonTable?.Seasons?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Retrieved ${data.MRData?.SeasonTable?.Seasons?.length || 0} F1 seasons`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 seasons:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'SEASONS_ERROR',
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
 * Get Current F1 Season tool
 */
const getCurrentF1Season = {
  name: 'get_current_f1_season',
  description:
    'Get information about the current Formula 1 season including season year, race schedule, and current status.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async (request) => {
    try {
      logger.info('Getting current F1 season');

      const data = await f1ApiClient.getCurrentSeason();

      logger.info('Successfully retrieved current F1 season', {
        season: data.MRData?.SeasonTable?.season,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Current F1 season: ${data.MRData?.SeasonTable?.season || 'Unknown'}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting current F1 season:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'CURRENT_SEASON_ERROR',
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
  return [getF1Seasons, getCurrentF1Season];
}

export default {
  getTools,
  getF1Seasons,
  getCurrentF1Season,
};

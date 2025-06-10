import f1ApiClient from '../services/f1ApiClient.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

/**
 * Races Tools
 * MCP tools for accessing Formula 1 race information
 */

/**
 * Get F1 Races tool
 */
const getF1Races = {
  name: 'get_f1_races',
  description:
    'Get races for a specific Formula 1 season. Returns the complete race calendar including dates, locations, and circuit information.',
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

      logger.info('Getting F1 races', { season });

      const data = await f1ApiClient.getRaces(season);

      logger.info('Successfully retrieved F1 races', {
        season,
        count: data.MRData?.RaceTable?.Races?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Retrieved ${data.MRData?.RaceTable?.Races?.length || 0} races for ${season} season`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 races:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'RACES_ERROR',
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
 * Get F1 Race Details tool
 */
const getF1RaceDetails = {
  name: 'get_f1_race_details',
  description:
    'Get detailed information about a specific Formula 1 race including circuit details, date, time, and location.',
  inputSchema: {
    type: 'object',
    properties: {
      season: {
        type: 'string',
        description:
          "Season year (e.g., '2023', '2024') or 'current' for current season",
        default: 'current',
      },
      round: {
        type: 'number',
        description: 'Race round number (1-24 depending on season)',
        minimum: 1,
        maximum: 25,
      },
    },
    required: ['round'],
  },
  handler: async (request) => {
    try {
      const season = request.params?.season || 'current';
      const round = request.params?.round;

      if (!round) {
        throw new Error('Round number is required');
      }

      logger.info('Getting F1 race details', { season, round });

      const data = await f1ApiClient.getRace(season, round);

      logger.info('Successfully retrieved F1 race details', {
        season,
        round,
        raceName: data.MRData?.RaceTable?.Races?.[0]?.raceName,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Race details for ${season} season, round ${round}: ${data.MRData?.RaceTable?.Races?.[0]?.raceName || 'Unknown'}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 race details:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'RACE_DETAILS_ERROR',
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
 * Get Current F1 Race tool
 */
const getCurrentF1Race = {
  name: 'get_current_f1_race',
  description:
    'Get information about the current Formula 1 race (the race happening now or most recently completed).',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async (request) => {
    try {
      logger.info('Getting current F1 race');

      const data = await f1ApiClient.getCurrentRace();

      logger.info('Successfully retrieved current F1 race', {
        raceName: data.MRData?.RaceTable?.Races?.[0]?.raceName,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Current F1 race: ${data.MRData?.RaceTable?.Races?.[0]?.raceName || 'No current race found'}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting current F1 race:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'CURRENT_RACE_ERROR',
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
 * Get Next F1 Race tool
 */
const getNextF1Race = {
  name: 'get_next_f1_race',
  description:
    'Get information about the next upcoming Formula 1 race including date, time, and circuit details.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async (request) => {
    try {
      logger.info('Getting next F1 race');

      const data = await f1ApiClient.getNextRace();

      logger.info('Successfully retrieved next F1 race', {
        raceName: data.MRData?.RaceTable?.Races?.[0]?.raceName,
        date: data.MRData?.RaceTable?.Races?.[0]?.date,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Next F1 race: ${data.MRData?.RaceTable?.Races?.[0]?.raceName || 'No upcoming race found'} on ${data.MRData?.RaceTable?.Races?.[0]?.date || 'TBD'}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting next F1 race:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'NEXT_RACE_ERROR',
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
  return [getF1Races, getF1RaceDetails, getCurrentF1Race, getNextF1Race];
}

export default {
  getTools,
  getF1Races,
  getF1RaceDetails,
  getCurrentF1Race,
  getNextF1Race,
};

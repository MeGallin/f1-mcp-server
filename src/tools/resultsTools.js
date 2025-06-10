import f1ApiClient from '../services/f1ApiClient.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

/**
 * Results Tools
 * MCP tools for accessing Formula 1 race results and standings
 */

/**
 * Get F1 Race Results tool
 */
const getF1RaceResults = {
  name: 'get_f1_race_results',
  description:
    'Get race results for a specific Formula 1 race including finishing positions, lap times, and points awarded.',
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

      logger.info('Getting F1 race results', { season, round });

      const data = await f1ApiClient.getRaceResults(season, round);

      logger.info('Successfully retrieved F1 race results', {
        season,
        round,
        resultCount: data.MRData?.RaceTable?.Races?.[0]?.Results?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Race results for ${season} season, round ${round}: ${data.MRData?.RaceTable?.Races?.[0]?.Results?.length || 0} results`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 race results:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'RACE_RESULTS_ERROR',
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
 * Get F1 Qualifying Results tool
 */
const getF1QualifyingResults = {
  name: 'get_f1_qualifying_results',
  description:
    'Get qualifying results for a specific Formula 1 race including Q1, Q2, Q3 times and grid positions.',
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

      logger.info('Getting F1 qualifying results', { season, round });

      const data = await f1ApiClient.getQualifyingResults(season, round);

      logger.info('Successfully retrieved F1 qualifying results', {
        season,
        round,
        resultCount:
          data.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Qualifying results for ${season} season, round ${round}: ${data.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.length || 0} results`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 qualifying results:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'QUALIFYING_RESULTS_ERROR',
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
 * Get F1 Driver Standings tool
 */
const getF1DriverStandings = {
  name: 'get_f1_driver_standings',
  description:
    'Get current driver championship standings for a specific Formula 1 season including points, wins, and positions.',
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

      logger.info('Getting F1 driver standings', { season });

      const data = await f1ApiClient.getDriverStandings(season);

      logger.info('Successfully retrieved F1 driver standings', {
        season,
        standingCount:
          data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings
            ?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Driver standings for ${season} season: ${data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.length || 0} drivers`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 driver standings:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'DRIVER_STANDINGS_ERROR',
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
 * Get F1 Constructor Standings tool
 */
const getF1ConstructorStandings = {
  name: 'get_f1_constructor_standings',
  description:
    'Get current constructor championship standings for a specific Formula 1 season including points, wins, and team positions.',
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

      logger.info('Getting F1 constructor standings', { season });

      const data = await f1ApiClient.getConstructorStandings(season);

      logger.info('Successfully retrieved F1 constructor standings', {
        season,
        standingCount:
          data.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings
            ?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Constructor standings for ${season} season: ${data.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.length || 0} teams`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 constructor standings:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'CONSTRUCTOR_STANDINGS_ERROR',
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
  return [
    getF1RaceResults,
    getF1QualifyingResults,
    getF1DriverStandings,
    getF1ConstructorStandings,
  ];
}

export default {
  getTools,
  getF1RaceResults,
  getF1QualifyingResults,
  getF1DriverStandings,
  getF1ConstructorStandings,
};

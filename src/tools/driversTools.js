import f1ApiClient from '../services/f1ApiClient.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

/**
 * Drivers Tools
 * MCP tools for accessing Formula 1 driver information
 */

/**
 * Get F1 Drivers tool
 */
const getF1Drivers = {
  name: 'get_f1_drivers',
  description:
    'Get all drivers for a specific Formula 1 season including their personal information, team affiliations, and driver numbers.',
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

      logger.info('Getting F1 drivers', { season });

      const data = await f1ApiClient.getDrivers(season);

      logger.info('Successfully retrieved F1 drivers', {
        season,
        count: data.MRData?.DriverTable?.Drivers?.length || 0,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Retrieved ${data.MRData?.DriverTable?.Drivers?.length || 0} drivers for ${season} season`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 drivers:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'DRIVERS_ERROR',
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
 * Get F1 Driver Details tool
 */
const getF1DriverDetails = {
  name: 'get_f1_driver_details',
  description:
    'Get detailed information about a specific Formula 1 driver including biography, career statistics, and current team information.',
  inputSchema: {
    type: 'object',
    properties: {
      driverId: {
        type: 'string',
        description:
          "Driver ID (e.g., 'hamilton', 'verstappen', 'leclerc'). Use the driver's last name in lowercase or their official driver ID.",
      },
      season: {
        type: 'string',
        description:
          "Season year (e.g., '2023', '2024') or 'current' for current season",
        default: 'current',
      },
    },
    required: ['driverId'],
  },
  handler: async (request) => {
    try {
      const driverId = request.params?.driverId;
      const season = request.params?.season || 'current';

      if (!driverId) {
        throw new Error('Driver ID is required');
      }

      logger.info('Getting F1 driver details', { driverId, season });

      const data = await f1ApiClient.getDriver(driverId, season);

      logger.info('Successfully retrieved F1 driver details', {
        driverId,
        season,
        driverName: data.MRData?.DriverTable?.Drivers?.[0]
          ? `${data.MRData.DriverTable.Drivers[0].givenName} ${data.MRData.DriverTable.Drivers[0].familyName}`
          : 'Unknown',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: data,
                summary: `Driver details for ${driverId} in ${season} season: ${
                  data.MRData?.DriverTable?.Drivers?.[0]
                    ? `${data.MRData.DriverTable.Drivers[0].givenName} ${data.MRData.DriverTable.Drivers[0].familyName}`
                    : 'Driver not found'
                }`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting F1 driver details:', error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'DRIVER_DETAILS_ERROR',
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
  return [getF1Drivers, getF1DriverDetails];
}

export default {
  getTools,
  getF1Drivers,
  getF1DriverDetails,
};

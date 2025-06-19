import axios from 'axios';
import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

/**
 * F1 API Client - Direct Jolpica API Access
 * Handles communication directly with the Jolpica F1 API (bypassing proxy)
 * Provides structured access to Formula 1 racing data with caching
 */
class F1ApiClient {
  constructor() {
    // Use Jolpica API directly instead of proxy
    this.baseURL = process.env.JOLPICA_API_URL || 'http://api.jolpi.ca/ergast/f1';
    this.timeout = parseInt(process.env.F1_API_TIMEOUT) || 10000;
    
    // Initialize cache
    this.cache = new NodeCache({ 
      stdTTL: parseInt(process.env.CACHE_TTL_DEFAULT) || 300, // 5 minutes default
      checkperiod: 120 
    });

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'User-Agent': 'F1-MCP-Server/1.0.0',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   * @private
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('F1 API request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('F1 API request error', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('F1 API response', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length,
        });
        return response;
      },
      (error) => {
        const errorInfo = {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        };
        logger.error('F1 API response error', errorInfo);
        return Promise.reject(this.formatError(error));
      },
    );
  }

  /**
   * Format API errors for consistent handling
   * @private
   * @param {Error} error - Axios error
   * @returns {Error} Formatted error
   */
  formatError(error) {
    if (error.response) {
      // Server responded with error status
      const apiError = new Error(
        error.response.data?.error?.message || 'F1 API request failed',
      );
      apiError.status = error.response.status;
      apiError.code = error.response.data?.error?.code || 'API_ERROR';
      return apiError;
    } else if (error.request) {
      // Request made but no response
      const networkError = new Error('Jolpica F1 API service unavailable');
      networkError.code = 'NETWORK_ERROR';
      return networkError;
    } else {
      // Request setup error
      return error;
    }
  }

  /**
   * Determine cache TTL based on data type
   * @private
   * @param {string} endpoint - API endpoint
   * @returns {number} TTL in seconds
   */
  getCacheTTL(endpoint) {
    if (endpoint.includes('current')) {
      return 60; // 1 minute for current data
    } else if (endpoint.includes('standings') || endpoint.includes('results')) {
      return 300; // 5 minutes for results/standings
    } else if (endpoint.includes('drivers') || endpoint.includes('constructors')) {
      return 3600; // 1 hour for driver/constructor data
    } else {
      return 1800; // 30 minutes default
    }
  }

  /**
   * Generic method to make cached API calls
   * @private
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - API response data
   */
  async makeRequest(endpoint) {
    const cacheKey = endpoint;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit', { endpoint, cacheKey });
      return cached;
    }

    try {
      const response = await this.client.get(endpoint);
      const data = response.data;

      // Determine cache TTL based on endpoint
      const ttl = this.getCacheTTL(endpoint);
      
      // Cache the response
      this.cache.set(cacheKey, data, ttl);
      logger.debug('Data cached', { endpoint, ttl });

      return data;
    } catch (error) {
      logger.error('API request failed', { endpoint, error: error.message });
      throw error;
    }
  }

  /**
   * Health check - verify Jolpica API is available
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/seasons.json', { params: { limit: 1 } });
      return response.status === 200;
    } catch (error) {
      logger.warn('F1 API health check failed', {
        error: error.message,
        baseURL: this.baseURL,
      });
      return false;
    }
  }

  // ==================== SEASONS ====================
  /**
   * Get all available seasons
   * @returns {Promise<Object>}
   */
  async getSeasons() {
    const data = await this.makeRequest('/seasons.json');
    return {
      success: true,
      data: data.MRData?.SeasonTable?.Seasons || [],
      total: data.MRData?.total || '0'
    };
  }

  /**
   * Get current season information
   * @returns {Promise<Object>}
   */
  async getCurrentSeason() {
    const data = await this.makeRequest('/current.json');
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || new Date().getFullYear().toString()
    };
  }

  // ==================== RACES ====================
  /**
   * Get races for a specific season
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getRaces(season = 'current') {
    const data = await this.makeRequest(`/${season}.json`);
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || season
    };
  }

  /**
   * Get specific race details
   * @param {string|number} season - Season year or 'current'
   * @param {number} round - Race round number
   * @returns {Promise<Object>}
   */
  async getRace(season, round) {
    const data = await this.makeRequest(`/${season}/${round}.json`);
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || season,
      round: data.MRData?.RaceTable?.round || round
    };
  }

  /**
   * Get current race information
   * @returns {Promise<Object>}
   */
  async getCurrentRace() {
    const data = await this.makeRequest('/current/last.json');
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || 'current'
    };
  }

  /**
   * Get next race information
   * @returns {Promise<Object>}
   */
  async getNextRace() {
    const data = await this.makeRequest('/current/next.json');
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || 'current'
    };
  }

  // ==================== DRIVERS ====================
  /**
   * Get drivers for a specific season
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getDrivers(season = 'current') {
    const data = await this.makeRequest(`/${season}/drivers.json`);
    return {
      success: true,
      data: data.MRData?.DriverTable?.Drivers || [],
      season: data.MRData?.DriverTable?.season || season
    };
  }

  /**
   * Get specific driver information
   * @param {string} driverId - Driver ID
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getDriver(driverId, season = 'current') {
    const data = await this.makeRequest(`/${season}/drivers/${driverId}.json`);
    return {
      success: true,
      data: data.MRData?.DriverTable?.Drivers || [],
      season: data.MRData?.DriverTable?.season || season,
      driverId: driverId
    };
  }

  // ==================== CONSTRUCTORS ====================
  /**
   * Get constructors for a specific season
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getConstructors(season = 'current') {
    const data = await this.makeRequest(`/${season}/constructors.json`);
    return {
      success: true,
      data: data.MRData?.ConstructorTable?.Constructors || [],
      season: data.MRData?.ConstructorTable?.season || season
    };
  }

  /**
   * Get specific constructor information
   * @param {string} constructorId - Constructor ID
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getConstructor(constructorId, season = 'current') {
    const data = await this.makeRequest(`/${season}/constructors/${constructorId}.json`);
    return {
      success: true,
      data: data.MRData?.ConstructorTable?.Constructors || [],
      season: data.MRData?.ConstructorTable?.season || season,
      constructorId: constructorId
    };
  }

  // ==================== RESULTS ====================
  /**
   * Get race results
   * @param {string|number} season - Season year or 'current'
   * @param {number} round - Race round number
   * @returns {Promise<Object>}
   */
  async getRaceResults(season, round) {
    const data = await this.makeRequest(`/${season}/${round}/results.json`);
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || season,
      round: data.MRData?.RaceTable?.round || round
    };
  }

  /**
   * Get qualifying results
   * @param {string|number} season - Season year or 'current'
   * @param {number} round - Race round number
   * @returns {Promise<Object>}
   */
  async getQualifyingResults(season, round) {
    const data = await this.makeRequest(`/${season}/${round}/qualifying.json`);
    return {
      success: true,
      data: data.MRData?.RaceTable?.Races || [],
      season: data.MRData?.RaceTable?.season || season,
      round: data.MRData?.RaceTable?.round || round
    };
  }

  /**
   * Get driver standings
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getDriverStandings(season = 'current') {
    const data = await this.makeRequest(`/${season}/driverStandings.json`);
    return {
      success: true,
      data: data.MRData?.StandingsTable?.StandingsLists || [],
      season: data.MRData?.StandingsTable?.season || season
    };
  }

  /**
   * Get constructor standings
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getConstructorStandings(season = 'current') {
    const data = await this.makeRequest(`/${season}/constructorStandings.json`);
    return {
      success: true,
      data: data.MRData?.StandingsTable?.StandingsLists || [],
      season: data.MRData?.StandingsTable?.season || season
    };
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache() {
    this.cache.flushAll();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// Create singleton instance
const f1ApiClient = new F1ApiClient();

export default f1ApiClient;
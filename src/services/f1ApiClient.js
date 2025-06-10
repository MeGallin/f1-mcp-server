import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * F1 API Client
 * Handles communication with the f1-api-proxy service
 * Provides structured access to Formula 1 racing data
 */
class F1ApiClient {
  constructor() {
    this.baseURL = process.env.F1_API_PROXY_URL || 'http://localhost:8000';
    this.timeout = parseInt(process.env.F1_API_TIMEOUT) || 10000;

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
      const networkError = new Error('F1 API service unavailable');
      networkError.code = 'NETWORK_ERROR';
      return networkError;
    } else {
      // Request setup error
      return error;
    }
  } /**
   * Health check - verify API proxy is available
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
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
    const response = await this.client.get('/api/seasons');
    return response.data;
  }

  /**
   * Get current season information
   * @returns {Promise<Object>}
   */
  async getCurrentSeason() {
    const response = await this.client.get('/api/seasons/current');
    return response.data;
  }

  // ==================== RACES ====================

  /**
   * Get races for a specific season
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getRaces(season = 'current') {
    const response = await this.client.get(`/api/races/${season}`);
    return response.data;
  }

  /**
   * Get specific race details
   * @param {string|number} season - Season year or 'current'
   * @param {number} round - Race round number
   * @returns {Promise<Object>}
   */
  async getRace(season, round) {
    const response = await this.client.get(`/api/races/${season}/${round}`);
    return response.data;
  }

  /**
   * Get current race information
   * @returns {Promise<Object>}
   */
  async getCurrentRace() {
    const response = await this.client.get('/api/races/current/current');
    return response.data;
  }

  /**
   * Get next race information
   * @returns {Promise<Object>}
   */
  async getNextRace() {
    const response = await this.client.get('/api/races/current/next');
    return response.data;
  }

  // ==================== DRIVERS ====================

  /**
   * Get drivers for a specific season
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getDrivers(season = 'current') {
    const response = await this.client.get(`/api/drivers/${season}`);
    return response.data;
  }

  /**
   * Get specific driver information
   * @param {string} driverId - Driver ID
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getDriver(driverId, season = 'current') {
    const response = await this.client.get(
      `/api/drivers/${season}/${driverId}`,
    );
    return response.data;
  }

  // ==================== CONSTRUCTORS ====================

  /**
   * Get constructors for a specific season
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getConstructors(season = 'current') {
    const response = await this.client.get(`/api/constructors/${season}`);
    return response.data;
  }

  /**
   * Get specific constructor information
   * @param {string} constructorId - Constructor ID
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getConstructor(constructorId, season = 'current') {
    const response = await this.client.get(
      `/api/constructors/${season}/${constructorId}`,
    );
    return response.data;
  }

  // ==================== RESULTS ====================

  /**
   * Get race results
   * @param {string|number} season - Season year or 'current'
   * @param {number} round - Race round number
   * @returns {Promise<Object>}
   */
  async getRaceResults(season, round) {
    const response = await this.client.get(`/api/results/${season}/${round}`);
    return response.data;
  }

  /**
   * Get qualifying results
   * @param {string|number} season - Season year or 'current'
   * @param {number} round - Race round number
   * @returns {Promise<Object>}
   */
  async getQualifyingResults(season, round) {
    const response = await this.client.get(
      `/api/results/${season}/${round}/qualifying`,
    );
    return response.data;
  }

  /**
   * Get driver standings
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getDriverStandings(season = 'current') {
    const response = await this.client.get(`/api/results/${season}/drivers`);
    return response.data;
  }

  /**
   * Get constructor standings
   * @param {string|number} season - Season year or 'current'
   * @returns {Promise<Object>}
   */
  async getConstructorStandings(season = 'current') {
    const response = await this.client.get(
      `/api/results/${season}/constructors`,
    );
    return response.data;
  }
}

// Create singleton instance
const f1ApiClient = new F1ApiClient();

export default f1ApiClient;

const logger = require('../utils/logger.js');
const RestClient = require('./RestClient.js');

class CommonALB {
  constructor(serviceUrls, configs = {}) {
    if (!Array.isArray(serviceUrls) || serviceUrls.length === 0) {
      throw new Error('Service URLs must be a non-empty array');
    }
    this.serviceUrls = serviceUrls; // List of service URLs (e.g., behind a load balancer)
    this.currentIndex = 0; // Index to track the current service URL
    this.restClient = new RestClient(configs); // Reuse the existing RestClient
  }

  /**
   * Get the next service URL in a round-robin fashion
   * @returns {string} - The next service URL
   */
  getNextServiceUrl() {
    const url = this.serviceUrls[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.serviceUrls.length; // Round-robin logic
    return url;
  }

  /**
   * Make a request to the service
   * @param {string} type - HTTP method (GET, POST, etc.)
   * @param {string} path - API path (e.g., /users)
   * @param {object} data - Request body (for POST, PUT, etc.)
   * @param {object} headers - Additional headers
   * @param {number} pageNumber - Page number for paginated requests
   * @param {number} pageSize - Page size for paginated requests
   * @returns {Promise<object>} - Response from the service
   */
  async makeRequest(type, path, data = null, headers = {}, pageNumber = null, pageSize = null) {
    let attempts = 0;
    const maxAttempts = this.serviceUrls.length;
    while (attempts < maxAttempts) {
      const baseUrl = this.getNextServiceUrl();
      const url = `${baseUrl}${path}`;
      try {
        // Use the existing RestClient to make the request
        return await this.restClient.makeRequest(type, url, data, headers, pageNumber, pageSize);
      } catch (error) {
        attempts++;
        logger.error(`Error with ${url}: ${error.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`All service URLs failed after ${maxAttempts} attempts`);
        }
      }
    }
  }
}

module.exports = CommonALB;
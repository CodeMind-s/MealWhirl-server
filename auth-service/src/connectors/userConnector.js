const { USER_SERVICE_PORT, USER_SERVICE_HOST } = require("../constants/configConstants.js");
const RestClientException = require("../exceptions/RestClientException.js");
const logger = require("../utils/logger.js");
const CommonALB = require("./commonALB.js");

const USER_SERVICE = [`http://${USER_SERVICE_HOST}:${USER_SERVICE_PORT}`];

class UserConnector {
  constructor(serviceUrls) {
    this.alb = new CommonALB(serviceUrls, {
      timeout: 10000, // 10 seconds timeout
    });
  }

  async getUserByIdentifier({ identifier, category }, headers = {}) {
    try {
      const response = await this.alb.makeRequest(
        "POST",
        `/V1/get-by-id`,
        { identifier },
        headers
      );

      return response.data.data;
    } catch (error) {
      logger.error(`Error fetching ${category || "user"}: ${error.message}`);
      throw new RestClientException(
        `Failed to fetch user with ID: ${identifier}`
      );
    }
  }

  async createUser(userData, headers = {}) {
    try {
      const response = await this.alb.makeRequest(
        "POST",
        "/users",
        userData,
        headers
      );
      return response.data;
    } catch (error) {
      throw new RestClientException(
        "Failed to create user",
        error.response?.status || 500,
        "USER_CREATION_ERROR",
        { originalError: error.message }
      );
    }
  }

  async updateUser(userId, userData, headers = {}) {
    try {
      const response = await this.alb.makeRequest(
        "PUT",
        `/users/${userId}`,
        userData,
        headers
      );
      return response.data;
    } catch (error) {
      throw new RestClientException(
        `Failed to update user with ID: ${userId}`,
        error.response?.status || 500,
        "USER_UPDATE_ERROR",
        { originalError: error.message }
      );
    }
  }

  async deleteUser(userId, headers = {}) {
    try {
      const response = await this.alb.makeRequest(
        "DELETE",
        `/users/${userId}`,
        null,
        headers
      );
      return response.data;
    } catch (error) {
      throw new RestClientException(
        `Failed to delete user with ID: ${userId}`,
        error.response?.status || 500,
        "USER_DELETION_ERROR",
        { originalError: error.message }
      );
    }
  }
}

const userConnector = new UserConnector([USER_SERVICE]);
module.exports = userConnector;

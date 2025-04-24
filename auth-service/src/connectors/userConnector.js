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
        `/v1/get-by-id`,
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

  async createUserByIdentifier(userData, headers = {}) {
    try {
      const response = await this.alb.makeRequest(
        "POST",
        "/v1/identifier",
        userData,
        headers
      );
      return response.data;
    } catch (error) {
      throw new RestClientException(`Failed to create user ${userData.identifier}`);
    }
  }

  async updateUserByIdentifier(userData, headers = {}) {
    try {
      const response = await this.alb.makeRequest(
        "PUT",
        `/v1/identifier`,
        userData,
        headers
      );
      return response.data.data;
    } catch (error) {
      throw new RestClientException(`Failed to update user ${userData.identifier}`);
    }
  }
}

const userConnector = new UserConnector([USER_SERVICE]);
module.exports = userConnector;

const axios = require("axios");
const RestClientException = require("../exceptions/RestClientException.js");
const { REST_CLIENT_EXCEPTION } = require("../exceptions/exceptionCodes");
const { getAuthorizationToken } = require("../utils/contextUtils.js");
const { generateToken } = require("../utils/userUtils.js");
const { USER_CATEGORIES } = require("../constants/userConstants.js");

class RestClient {
  constructor(configs) {
    this.axiosInstance = axios.create(configs);
  }

  async makeRequest(type, url, data, headers, pageNumber, pageSize) {
    let URL = url;
    if (pageNumber && pageSize) {
      URL = `${url}?page=${pageNumber}&page_size=${pageSize}`;
    }

    let token = getAuthorizationToken();
      if (!token) {
        token = generateToken({
          category: USER_CATEGORIES.REGISTERD,
          identifier: 'auth-service',
        });
      }

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    };
    try {
      return await this.axiosInstance({
        url: URL,
        data,
        method: type,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      });
    } catch (error) {
      throw new RestClientException(error, REST_CLIENT_EXCEPTION);
    }
  }
}

module.exports = RestClient;

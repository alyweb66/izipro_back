import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request`);

class Request extends CoreDatamapper {
  tableName = 'request';

  viewName = 'getRequestConversation';

  viewNameByConversation = 'getRequestByConversation';

  QueryFunc = 'getRequestByJob';

  QueryFuncByConversation = 'getMyConversationRequest';

  QuerySubFunc = 'getRequestSubscription';

  /**
   * get all requests by user id
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} offset - The offset of the request.
   * @param {number} limit - The limit of the request.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRequestByUserId(userId, offset, limit = null) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewNameByConversation} called`);

    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE user_id = $1 AND deleted_at IS NULL OFFSET $2 LIMIT $3`,
      values: [userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

    return request;
  }

  /**
   *  get the request by request id
   *
   * @param {number} requestId - The ID of the request to find.
   * @returns {Promise<object>} A promise that resolves to an object of request.
   * @throws {Error} If there is an issue with the database query
   */
  async getRequestByRequestId(requestId) {
    debug(`Finding request by request id: ${requestId}`);
    debug(`SQL function ${this.viewNameByConversation} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE id = $1`,
      values: [requestId],
    };
    const { rows } = await this.client.query(query);
    const request = rows[0];

    return request;
  }

  /**
   * get all conversation id of request by user id
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRequestsConvId(userId) {
    debug('Finding all conversation id of request by user id');
    debug(`SQL function ${this.tableName} called`);

    const query = {
      text: `SELECT conversation.id FROM "${this.tableName}" 
      JOIN conversation ON conversation.request_id = request.id
      WHERE request.user_id = $1`,
      values: [userId],
    };
    const { rows } = await this.client.query(query);
    const idArray = rows.map((row) => row.id);
    const request = idArray;

    return request;
  }

  /**
   * get all requests by job id
   *
   * @param {number} jobId - The ID of the job to find requests for.
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} offset - The offset of the request.
   * @param {number} limit - The limit of the request.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRequestByJobId(jobId, userId, offset, limit) {
    debug('Finding request by job id');
    debug(`SQL function ${this.QueryFunc} called`);

    try {
      const query = {
        text: `SELECT * FROM ${this.QueryFunc} ($1, $2, $3, $4)`,
        values: [jobId, userId, offset, limit],
      };
      const { rows } = await this.client.query(query);
      const requestsByJob = rows;

      return requestsByJob;
    } catch (error) {
      debug(error);
    }

    return null;
  }

  /**
   * get all requests by subscription and job id
   *
   * @param {number} jobId - The ID of the job to find requests for.
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} requestId - The ID of the request to find.
   * @param {number} offset - the offset of the request
   * @param {number} limit - the limit of the request
   * @returns {Promise<Array>} A promise that resolves to an object of request.
   * @throws {Error} If there is an issue with the database query.
   */
  async getSubscritpionRequest(jobId, userId, requestId, offset = 0, limit = 1) {
    debug('Finding subscription request by job id');
    debug(`SQL function ${this.QuerySubFunc} called`);

    const query = {
      text: `SELECT * FROM ${this.QuerySubFunc} ($1, $2, $4, $5)
      WHERE id = $3`,
      values: [jobId, userId, requestId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const job = rows;

    return job;
  }

  /**
   * get all requests by conversation
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} offset - The offset of the request.
   * @param {number} limit - The limit of the request.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query
   */
  async getRequestByConversation(userId, offset = 0, limit = 3) {
    debug('Finding request by user conversation');
    debug(`SQL function ${this.QueryFuncByConversation} called`);

    try {
      const query = {
        text: `SELECT * FROM ${this.QueryFuncByConversation}($1, $2, $3)`,
        values: [userId, offset, limit],
      };

      const { rows } = await this.client.query(query);

      return rows;
    } catch (error) {
      debug('error', error);
    }
    return null;
  }
}
export default Request;

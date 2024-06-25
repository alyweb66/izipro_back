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

  async getRequestByUserId(userId, offset, limit = null) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewNameByConversation} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE user_id = $1 AND deleted_at IS NULL OFFSET $2 LIMIT $3`,
      values: [userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

    return request;
  }

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
    console.log('request', request);

    return request;
  }

  async getRequestsConvId(userId) {
    debug('Finding all conversation id of request by user id');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT conversation.id FROM "${this.tableName}" 
      JOIN conversation ON conversation.request_id = request.id
      WHERE user_id = $1`,
      values: [userId],
    };
    const { rows } = await this.client.query(query);
    const idArray = rows.map((row) => row.id);
    const request = idArray;

    return request;
  }

  async getRequestByJobId(jobId, userId, offset, limit) {
    debug('Finding request by job id');
    debug(`SQL function ${this.QueryFunc} called`);
    // call sql function
    try {
      const query = {
        text: `SELECT * FROM ${this.QueryFunc} ($1, $2, $3, $4)`,
        values: [jobId, userId, offset, limit],
      };
      const { rows } = await this.client.query(query);
      const requestsByJob = rows;

      return requestsByJob;
    } catch (error) {
      console.log('error', error);
    }

    // Add the following return statement
    return null;
  }

  async getSubscritpionRequest(jobId, userId, requestId, offset = 0, limit = 1) {
    debug('Finding request by job id');
    debug(`SQL function ${this.QuerySubFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM ${this.QuerySubFunc} ($1, $2, $4, $5)
      WHERE id = $3`,
      values: [jobId, userId, requestId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const job = rows;

    return job;
  }

  async getRequestByConversation(userId, offset = 0, limit = 3) {
    debug('Finding request by user conversation');
    debug(`SQL function ${this.QueryFuncByConversation} called`);
    // call sql function
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

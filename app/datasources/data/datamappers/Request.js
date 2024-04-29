import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request`);

class Request extends CoreDatamapper {
  tableName = 'request';

  viewName = 'getRequest';

  viewNameByConversation = 'getRequestByConversation';

  QueryFunc = 'getRequestByJob';

  async getRequestByUserId(userIds, offset, limit) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewNameByConversation} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE user_id = $1 OFFSET $2 LIMIT $3`,
      values: [userIds, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const request = rows;
    console.log('request', request);

    return request;
  }

  async getRequestByJobId(jobId, userId, offset, limit) {
    debug('Finding request by job id');
    debug(`SQL function ${this.QueryFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM ${this.QueryFunc} ($1, $2, $3, $4)`,
      values: [jobId, userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const requestsByJob = rows;

    return requestsByJob;
  }

  async getSubscritpionRequest(jobId, userId, requestId, offset = 0, limit = 1) {
    debug('Finding request by job id');
    debug(`SQL function ${this.QueryFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM ${this.QueryFunc} ($1, $2, $4, $5)
      WHERE id = $3`,
      values: [jobId, userId, requestId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const job = rows;

    return job;
  }

  async getRequestByConversation(userId, offset = 0, limit = 3) {
    debug('Finding request by user conversation');
    debug(`SQL function ${this.viewNameByConversation} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE EXISTS (
        SELECT 1
        FROM json_array_elements(conversation) AS conv
        WHERE conv->>'user_1' = $1 OR conv->>'user_2' = $1
        ) OFFSET $2 LIMIT $3`,
      values: [userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

    return request;
  }
}
export default Request;

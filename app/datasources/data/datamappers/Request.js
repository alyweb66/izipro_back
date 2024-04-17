import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request`);

class Request extends CoreDatamapper {
  tableName = 'request';

  viewName = 'getRequest';

  QueryFunc = 'getRequestByJob';

  async getRequestByUserId(userId, offset, limit) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE user_id = $1 OFFSET $2 LIMIT $3`,
      values: [userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

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
}
export default Request;

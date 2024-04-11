import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request`);

class Request extends CoreDatamapper {
  tableName = 'request';

  viewName = 'getRequest';

  insertFunc = 'getRequestByJob';

  async getRequestByUserId(userId, offset, limit) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE user_id = $1 OFFSET $2 LIMIT $3`,
      values: [userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const user = rows;

    return user;
  }

  async getRequestByJobId(jobId, offset, limit) {
    debug('Finding request by job id');
    debug(`SQL function ${this.insertFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM ${this.insertFunc} ($1, $2, $3)`,
      values: [jobId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const job = rows;

    return job;
  }
}
export default Request;

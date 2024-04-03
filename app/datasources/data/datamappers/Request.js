import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request`);

class Request extends CoreDatamapper {
  tableName = 'request';

  viewName = 'getRequest';

  async getRequestByUserId(userId) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE user_id = $1`,
      values: [userId],
    };
    const { rows } = await this.client.query(query);
    const user = rows;
    console.log(user);

    return user;
  }
}
export default Request;

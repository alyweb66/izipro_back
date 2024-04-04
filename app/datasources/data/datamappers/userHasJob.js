import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasJob`);

class UserHasJob extends CoreDatamapper {
  tableName = 'user_has_job';

  insertFunc = 'insert_user_has_job';

  /**
   * create data in request_has_request_media.
  *
  * @param {string} value - value like { request_id: <integer>,
  media_ids: [<integer>, <integer>, ...]}.
  * @returns {Promise<object>} boolean.
  * @throws {Error} If user not found.
  */
  async createUserHasJob(userId, jobIds) {
    debug('create user_has_job');
    debug(`SQL function ${this.insertFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.insertFunc}" ($1, $2) `,
      values: [userId, jobIds],
    };
    const { rows } = await this.client.query(query);
    const requestJob = rows[0];

    return requestJob;
  }
}

export default UserHasJob;

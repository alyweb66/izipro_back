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

    // fetch new data to return
    if (rows[0].insert_user_has_job) {
      const selectQuery = {
        text: `SELECT * FROM ${this.tableName} WHERE user_id = $1;`,
        values: [userId],
      };
      const { rows: remainingRows } = await this.client.query(selectQuery);
      return remainingRows;
    }
    return false;
  }

  /**
   * delete data in user_has_job.
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} jobId - The ID of the job to find requests for.
   * @returns {Promise<object>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async deleteUserHasJob(userId, jobId) {
    debug('delete user_has_job');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `DELETE FROM ${this.tableName}
      WHERE user_id = $1 AND job_id = ANY($2); `,
      values: [userId, jobId],
    };
    await this.client.query(query);

    // fetch new data to return
    const selectQuery = {
      text: `SELECT * FROM ${this.tableName} WHERE user_id = $1;`,
      values: [userId],
    };
    const { rows: remainingRows } = await this.client.query(selectQuery);
    return remainingRows;
  }
}

export default UserHasJob;

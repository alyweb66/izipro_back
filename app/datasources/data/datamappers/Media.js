import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:media`);

class Media extends CoreDatamapper {
  tableName = 'request_media';

  insertFunc = 'insert_request_media';

  /**
   * create media data to a request.
  *
  * @param {string} media - media to a request.
  * @returns {Promise<object>} The found user.
  * @throws {Error} If user not found.
  */
  async createRequestMedia(media) {
    debug('create media to a request');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.insertFunc}" ($1) `,
      values: [JSON.stringify(media)],
    };
    const { rows } = await this.client.query(query);
    console.log('rows', rows);
    const requestMedia = rows;

    return requestMedia;
  }
}

export default Media;

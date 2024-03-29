import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request_has_media`);

class RequestHasMedia extends CoreDatamapper {
  tableName = 'request_has_request_media';

  insertFunc = 'insert_request_has_request_media';

  /**
   * create data in request_has_request_media.
  *
  * @param {string} value - value like { request_id: <integer>,
  media_ids: [<integer>, <integer>, ...]}.
  * @returns {Promise<object>} boolean.
  * @throws {Error} If user not found.
  */
  async createRequestHasMedia(requestId, mediaIds) {
    debug('create request_has_request_media');
    debug(`SQL function ${this.insertFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.insertFunc}" ($1, $2) `,
      values: [requestId, mediaIds],
    };
    const { rows } = await this.client.query(query);
    const requestMedia = rows[0];

    return requestMedia;
  }
}

export default RequestHasMedia;

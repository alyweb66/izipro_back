import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:message_has_media`);

class MessageHasMedia extends CoreDatamapper {
  tableName = 'message_has_media';

  insertFunc = 'insert_message_has_media';

  /**
   * create data in message_has_media.
  *
  * @param {string} value - value like { message_id: <integer>,
  media_ids: [<integer>, <integer>, ...]}.
  * @returns {Promise<object>} boolean.
  * @throws {Error} If user not found.
  */
  async createMessageHasMedia(messageId, mediaIds) {
    debug('create message_has_media');
    debug(`SQL function ${this.insertFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.insertFunc}" ($1, $2) `,
      values: [messageId, mediaIds],
    };
    const { rows } = await this.client.query(query);
    const requestMedia = rows[0];

    return requestMedia;
  }
}

export default MessageHasMedia;

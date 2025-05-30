import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:media`);

class Media extends CoreDatamapper {
  tableName = 'media';

  insertFunc = 'insert_media';

  /**
   * create media data to a request.
  *
  * @param {string} media - media to a request.
  * @returns {Promise<object>} return ids of media.
  * @throws {Error} If bad request.
  */
  async createMedia(media) {
    debug('create media');
    debug(`SQL function ${this.insertFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.insertFunc}" ($1) `,
      values: [JSON.stringify(media)],
    };
    const { rows } = await this.client.query(query);
    const requestMedia = rows;

    return requestMedia;
  }

  async getAllMediaNames() {
    debug('get all media names');
    const query = {
      text: `SELECT name FROM ${this.tableName}`,
    };
    const { rows } = await this.client.query(query);
    const mediaNames = rows.map((media) => media.name);

    return mediaNames;
  }
}

export default Media;

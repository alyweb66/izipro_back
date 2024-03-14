import Debug from 'debug';

import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Message`);

class Message extends CoreDatamapper {
  tableName = 'message';

  /**
   * Finds all messages by conversation_id.
   *
   * @param {integer} id - The conversation id.
   * @returns {Promise<object>} The found messages.
   * @throws {Error} If user not found.
   */
  async findByConversation(id) {
    debug(`Finding messages by conversation id ${id}`);
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE conversation_id = $1`,
      values: [id],
    };
    const { rows } = await this.client.query(query);
    const messages = rows;

    return messages;
  }
}

export default Message;

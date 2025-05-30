import Debug from 'debug';

import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Message`);

class Message extends CoreDatamapper {
  tableName = 'message';

  viewName = 'getMessageByUserConversation';

  /**
   * Finds all messages by conversation_id.
   *@function findByUserConversation
   * @param {integer} conversationId - The conversation id.
   * @param {integer} offset - The offset.
   * @param {integer} limit - The limit.
   * @returns {Promise<object>} The found messages.
   * @throws {Error} If user not found.
   */
  async findByUserConversation(conversationId, offset, limit) {
    debug(`Finding messages by conversation_id ${conversationId}`);
    debug(`SQL function ${this.viewName} called`);
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE conversation_id = $1 OFFSET $2 LIMIT $3`,
      values: [conversationId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const messages = rows;
    return messages;
  }

  /**
   * Finds all messages by conversation_id.
   *
   * @param {number} conversationId - The conversation id.
   * @returns {Promise<object>} The found messages.
   * @throws {Error} If user not found.
   */
  async findByConversationId(conversationId, offset, limit) {
    debug(`Finding messages by conversation_id ${conversationId}`);
    debug(`SQL function ${this.viewName} called`);
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE conversation_id = $1 ORDER BY created_at ASC OFFSET $2 LIMIT $3 `,
      values: [conversationId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const messages = rows;

    return messages;
  }
}

export default Message;

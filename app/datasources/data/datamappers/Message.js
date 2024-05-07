import Debug from 'debug';

import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Message`);

class Message extends CoreDatamapper {
  tableName = 'message';

  viewName = 'getMessageByUserConversation';

  /**
   * Finds all messages by conversation_id.
   *
   * @param {integer} id - The conversation id.
   * @returns {Promise<object>} The found messages.
   * @throws {Error} If user not found.
   */
  async findByUserConversation(userId, conversationId, offset, limit) {
    debug(`Finding messages by conversation_id ${conversationId} and user_id ${userId}`);
    debug(`SQL function ${this.viewName} called`);
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE conversation_id = $2 AND user_id = $1 OFFSET $3 LIMIT $4`,
      values: [userId, conversationId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const messages = rows;
    return messages;
  }

  async findByConversationId(conversationId, offset, limit) {
    debug(`Finding messages by conversation_id ${conversationId}`);
    debug(`SQL function ${this.viewName} called`);
    const query = {
      text: `SELECT * FROM "${this.viewName}" WHERE conversation_id = $1 ORDER BY created_at ASC OFFSET $2 LIMIT $3 `,
      values: [conversationId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const messages = rows;
    console.log('messages', messages);
    return messages;
  }
}

export default Message;

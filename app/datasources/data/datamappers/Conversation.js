import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Conversation`);

class Conversation extends CoreDatamapper {
  tableName = 'conversation';

  /**
 * Retrieves conversations for a given user ID.
 *
 * @param {number} userId - The ID of the user to find conversations for.
 * @returns {Promise<Array>} A promise that resolves to an array of conversation objects.
 * @throws {Error} If there is an issue with the database query.
 */
  async getConversationByUser(userId) {
    debug('Finding conversation by user id');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE user_1 = $1 OR user_2 = $1`,
      values: [userId],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

    return request;
  }

  /**
   * updates the updated_at field of a conversation.
   *
   * @param {number} conversationId  - The ID of the conversation to update
   * @returns {Promise<number>} A promise that resolves to the number of rows affected.
   * @throws {Error} If there is an issue with the database query.
   */
  async updateUpdatedAtConversation(conversationId) {
    debug('Updating updated_at conversation');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `UPDATE "${this.tableName}" SET updated_at = NOW() WHERE id = $1`,
      values: [conversationId],
    };
    const { rowCount } = await this.client.query(query);
    const request = rowCount;

    return request;
  }

  /**
 * Retrieves conversations for a given request ID.
 *
 * @param {number} requestId - The ID of the user to find conversations for.
 * @returns {Promise<Array>} A promise that resolves to an array of conversation objects.
 * @throws {Error} If there is an issue with the database query.
 */
  async getConversationByRequest(requestId) {
    debug('Finding conversation by user id');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE request_id = $1`,
      values: [requestId],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

    return request;
  }

  /**
   * Retrieves all conversation IDs where request_id is in the provided array of request IDs.
   *
   * @param {Array<number>} requestIds - An array of request IDs to find conversations for.
   * @returns {Promise<Array<number>>} A promise that resolves to an array of conversation IDs.
   * @throws {Error} If there is an issue with the database query.
   */
  async getConversationIdsByDeletedRequest() {
    debug('Finding conversation ids by request ids');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT conversation.id FROM "${this.tableName}" AS conversation
      JOIN request ON request.id = conversation.request_id
      WHERE request.deleted_at IS NOT NULL `,
    };
    const { rows } = await this.client.query(query);
    const conversationIds = rows.map((row) => row.id);

    return conversationIds;
  }
}

export default Conversation;

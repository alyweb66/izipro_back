import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasNotViewedConversation`);

class UserHasNotViewedConversation extends CoreDatamapper {
  tableName = 'user_has_notViewedConversation';

  /**
   * delete notViewedConversation
   *
   * @param {{user_id: number, conversation_id: number}} input - The ID of the user
   * and the conversation to find.
   * @returns {Promise<object[]>} A promise that resolves to an object of notViewedConversation.
   * @throws {Error} If there is an issue with the database query.
   */
  async deleteNotViewedConversation(input) {
    debug('delete notViewedConversation');
    // map the ids to placeholders
    const values = [input.user_id, input.conversation_id];

    const preparedQuery = {
      text: `
    DELETE FROM "${this.tableName}"
    WHERE user_id = $1 AND conversation_id = ANY($2::integer[])
    RETURNING *
  `,
      values,
    };

    const result = await this.client.query(preparedQuery);
    const { rows } = result;

    return rows;
  }

  /**
   * get user by conversation id
   *
   * @param {number} conversationId - The ID of the conversation to find.
   * @returns {Promise<object[]>} A promise that resolves to an object of user.
   * @throws {Error} If there is an issue with the database query.
   */
  async getUserByConversationId(conversationId) {
    debug('get user by conversation id');
    const query = {
      text: `
    SELECT user_id FROM "${this.tableName}"
    WHERE conversation_id = $1
  `,
      values: [conversationId],
    };

    const result = await this.client.query(query);
    const { rows } = result;

    return rows;
  }
}

export default UserHasNotViewedConversation;

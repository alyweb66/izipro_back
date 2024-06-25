import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasNotViewedConversation`);

class UserHasNotViewedConversation extends CoreDatamapper {
  tableName = 'user_has_notViewedConversation';

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
}

export default UserHasNotViewedConversation;

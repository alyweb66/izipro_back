import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Conversation`);

class Conversation extends CoreDatamapper {
  tableName = 'conversation';

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
}

export default Conversation;

import Debug from 'debug';
import DataLoader from 'dataloader';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Message`);

class Message extends CoreDatamapper {
  tableName = 'message';

  constructor(options) {
    super(options);
    this.findByUserIdsLoader = new DataLoader(async (users) => {
      const preparedQuery = {
        text: `
          SELECT *
          FROM "${this.tableName}"
          WHERE "user_id" = ANY($1)
        `,
        values: [users],
      };
      const messages = await this.cacheQuery(preparedQuery);
      const sortedMessages = users.map(
        (userId) => messages.filter(
          (message) => message.user_id === userId,
        ),
      );
      return sortedMessages;
    });
  }

  async findByUser(userId) {
    debug('add new user to dataLoader');
    const messages = await this.findByUserIdsLoader.load(userId);
    return messages;
  }
}

export default Message;

import Debug from 'debug';
import { GraphQLError } from 'graphql';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:notificationPush`);

class NotificationPush extends CoreDatamapper {
  tableName = 'notification_push';

  /**
   * delete a notification
   *
   * @param {number} userId  - The ID of the user
   * @param {string} endpoint - The endpoint of the notification
   * @return nothing
   * @throws {Error} If there is an issue with the database query
   */
  async deleteNotification(userId, endpoint) {
    debug('Deleting notification');
    debug(`SQL function ${this.tableName} called`);

    try {
      const query = {
        text: `DELETE FROM "${this.tableName}" WHERE user_id = $1 AND endpoint = $2`,
        values: [userId, endpoint],
      };
      await this.client.query(query);
    } catch (error) {
      debug('Error deleting notification:', error);
      throw new GraphQLError('Error deleting notification', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }
  }
}

export default NotificationPush;

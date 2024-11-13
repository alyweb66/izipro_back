import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:notification`);

class Notification extends CoreDatamapper {
  tableName = 'notification';

  /**
 * Retrieves all notifications for a given user or users.
 *
 * @param {number|number[]} userId - The ID of the user or an array of user IDs.
 * @returns {Promise<Object[]>} A promise that resolves to an array of notification objects.
 * @throws {Error} If there is an error executing the query.
 */
  async getAllNotifications(userId) {
    debug('get all notifications buy user_id');
    // check if the userId is an array
    const isArray = Array.isArray(userId);
    const query = {
      text: `
      SELECT 
      n.id, 
      n.user_id, 
      n.email_notification,
      u.denomination,
      u.first_name,
      u.last_name,
      u.role, 
      COALESCE(np.endpoint, '') AS endpoint, 
      COALESCE(np.public_key, '') AS public_key, 
      COALESCE(np.auth_token, '') AS auth_token
      FROM "${this.tableName}" n
      LEFT JOIN "notification_push" np ON np."user_id" = n."user_id" 
      LEFT JOIN "user" u ON u."id" = n."user_id"
      WHERE n.user_id ${isArray ? '= ANY($1::int[])' : '= $1'}
    `,
      values: [userId],
    };
    try {
      // Log the query and values for debugging
      debug('Executing query:', query.text);
      debug('With values:', query.values);

      const result = await this.client.query(query);
      const { rows } = result;

      // Log the result for debugging
      debug('Query result:', rows);

      return rows;
    } catch (error) {
      // Log the error for debugging
      debug('Query error:', error);
      throw error;
    }
  }
}

export default Notification;

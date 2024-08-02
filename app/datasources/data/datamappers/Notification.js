import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:notification`);

class Notification extends CoreDatamapper {
  tableName = 'notification';

  async getAllNotifications(userId) {
    debug('get all notifications buy user_id');
    // check if the userId is an array
    const isArray = Array.isArray(userId);
    const query = {
      text: `
      SELECT n.*, np.*
      FROM "${this.tableName}" n
      LEFT JOIN "notification_push" np ON np."user_id" = n."user_id" 
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
  /*   const result = await this.client.query(query);
    const { rows } = result;

    return rows; */
  }
}

export default Notification;

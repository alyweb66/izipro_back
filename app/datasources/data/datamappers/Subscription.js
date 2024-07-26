import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Subscription`);

class Subscription extends CoreDatamapper {
  tableName = 'subscription';

  insertFunc = 'insert_subscription';

  /**
   * create a subscription
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @param {string} subscriber - The subscriber type (
   * request, jobRequest, clientConversation, conversation ).
   *
   * @param {number} subscriberIds
   * @returns {Promise<object>} A promise that resolves to an object of subscription.
   * @throws {Error} If there is an issue with the database query
   */
  async createSubscription(userId, subscriber, subscriberIds) {
    debug('create subscription');
    debug(`SQL function ${this.insertFunc} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.insertFunc}" ($1, $2, $3) `,
      values: [userId, subscriber, subscriberIds],
    };
    const { rows } = await this.client.query(query);
    const subscription = rows[0];

    return subscription;
  }
}

export default Subscription;

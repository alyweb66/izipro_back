import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Subscription`);

class Subscription extends CoreDatamapper {
  tableName = 'subscription';

  insertFunc = 'insert_subscription';

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

import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasNotViewedRequest`);

class UserHasNotViewedRequest extends CoreDatamapper {
  tableName = 'user_has_notViewedRequest';

  async createNotViewedRequest(input) {
    debug('create notViewedRequest');
    // map the ids to placeholders
    const values = [input.user_id, input.request_id];

    const preparedQuery = {
      text: `
    INSERT INTO "${this.tableName}" (user_id, request_id)
    SELECT $1, unnest($2::integer[])
    RETURNING *
  `,
      values,
    };

    const result = await this.client.query(preparedQuery);
    const { rows } = result;

    return rows;
  }

  async deleteNotViewedRequest(input) {
    debug('delete notViewedRequest');
    // map the ids to placeholders
    const values = [input.user_id, input.request_id];

    const preparedQuery = {
      text: `
    DELETE FROM "${this.tableName}"
    WHERE user_id = $1 AND request_id = ANY($2::integer[])
    RETURNING *
  `,
      values,
    };

    const result = await this.client.query(preparedQuery);
    const { rows } = result;

    return rows;
  }
}

export default UserHasNotViewedRequest;

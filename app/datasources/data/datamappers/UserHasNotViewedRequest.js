import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasNotViewedRequest`);

class UserHasNotViewedRequest extends CoreDatamapper {
  tableName = 'user_has_notViewedRequest';

  /**
   * create a notViewedRequest
   *
   * @param {{user_id: number, request_id: number}} input - The ID of the user and the
   * request to find.
   * @returns {Promise<object[]>} A promise that resolves to an object of notViewedRequest.
   * @throws {Error} If there is an issue with the database query.
   */
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

  /**
   * delete notViewedRequest
   *
   * @param {{user_id: number, request_id: number}} input - The ID of the user and the
   * request to delete.
   * @returns {Promise<object[]>} A promise that resolves to an object of notViewedRequest.
   * @throws {Error} If there is an issue with the database query.
   */
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

  /**
   * get user's not viewed request
   *
   * @param {number} requestId - The ID of the user to find.
   * @returns {Promise<object[]>} A promise that resolves to an object of user.
   * @throws {Error} If there is an issue with the database query
   */
  async getUserNotViewedConv(requestId) {
    debug('get user not viewed request');
    const query = {
      text: `
     SELECT 
        "user"."id",
        "user"."email",
        "user"."first_name",
        "user"."last_name",
        "user_setting"."range",
        "user"."lng",
        "user"."lat",
        "user"."denomination"
      FROM 
        "${this.tableName}"
      LEFT JOIN 
        "user" ON "user"."id" = "user_has_notViewedRequest"."user_id"
      LEFT JOIN 
        "user_setting" ON "user_setting"."user_id" = "user"."id"
      WHERE 
        "request_id" = $1
      AND "user"."deleted_at" IS NULL;
  `,
      values: [requestId],
    };

    const result = await this.client.query(query);
    const { rows } = result;

    return rows;
  }
}

export default UserHasNotViewedRequest;

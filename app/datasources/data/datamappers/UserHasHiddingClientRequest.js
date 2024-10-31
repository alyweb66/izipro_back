import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasHiddingClientRequest`);

class UserHasHiddingClientRequest extends CoreDatamapper {
  tableName = 'user_has_hiddingClientRequest';

  /**
   * Deletes a user hiding client request by request ID.
   *
   * @param {number} requestId - The ID of the request to delete.
   * @returns {Promise<number>} The number of rows affected by the delete operation.
   */
  async deleteUserHiddingClientRequest(requestId) {
    debug('delete user_has_hiddingClientRequest by request_id');
    // map the ids to placeholders
    const preparedQuery = {
      text: `
    DELETE FROM "${this.tableName}"
    WHERE request_id = $1 
  `,
      values: [requestId],
    };
    const result = await this.client.query(preparedQuery);
    const { rowCount } = result;

    return rowCount;
  }
}

export default UserHasHiddingClientRequest;

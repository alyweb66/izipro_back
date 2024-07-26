import Debug from 'debug';
import client from '../db/index.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:serverRequest`);

// class RefreshToken to get the userData for getUserByToken whithout use cache
class ServerRequest {
  tableName = 'user';

  /**
   * getRefreshTokenByUserId - Retrieves refresh token for a given user ID.
   *
   * @param {number} userId  - The ID of the user to find refresh token for.
   * @returns {Promise<object>} A promise that resolves to an object of refresh token.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRefreshTokenByUserId(userId) {
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE id = $1`,
      values: [userId],
    };
    const { rows } = await client.query(query);
    const refreshToken = rows[0];

    return refreshToken;
  }

  /**
   * updateLastLogin - Updates the last login time for a user.
   *
   * @param {number} userId - The ID of the user to update last login for.
   * @param {string} lastLoginTime - The time of the last login.
   * @returns nothing
   * @throws {Error} If there is an issue with the database query.
   */
  async updateLastLogin(userId, lastLoginTime) {
    debug('Updating last login');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `UPDATE "${this.tableName}" SET last_login = $1 WHERE id = $2`,
      values: [lastLoginTime, userId],
    };
    await client.query(query);
  }
}

export default ServerRequest;

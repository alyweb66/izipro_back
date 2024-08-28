import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:User`);

class User extends CoreDatamapper {
  tableName = 'user';

  /**
   * Finds a user by email.
   *
   * @param {string} email - The user email.
   * @returns {Promise<object>} The found user.
   * @throws {Error} If user not found.
   */
  async findUserByEmail(email) {
    debug('Finding user by email');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE email = $1`,
      values: [email],
    };
    const { rows } = await this.client.query(query);
    const user = rows[0];

    return user;
  }

  /**
   * find users by ids
   *
   * @param {[number]} ids - array of user ids
   * @returns {Promise<object[]>} The found users.
   * @throws {Error} If there is an issue with the database query.
   */
  async findUsersByIds(ids) {
    debug('Finding users by ids');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE id = ANY($1)`,
      values: [ids],
    };
    const { rows } = await this.client.query(query);
    const users = rows;

    return users;
  }

  /**
   * find users by siret
   *
   * @param {number} siret - The user siret.
   * @returns {Promise<boolean>} The found user.
   * @throws {Error} If user not found.
   */
  async findBySiret(siret) {
    debug('Finding users by siret');
    debug(`SQL function ${this.tableName} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE siret = $1`,
      values: [siret],
    };
    const { rows } = await this.client.query(query);
    const siretResult = rows;

    if (siretResult.length > 0 && siretResult[0].siret) {
      return true;
    }
    return false;
  }

  /**
 * Modifies the refresh token array for a user in the database.
 *
 * @param {number} userId - The ID of the user whose refresh token is to be modified.
 * @param {string} refreshToken - The refresh token to be added, replaced, or removed.
 * @param {string} action - The action to perform on the refresh token array.
 * Must be one of 'array_append', 'array_replace', or 'array_remove'.
 * @throws {Error} Throws an error if the action is not valid.
 * @returns {Promise<void>} A promise that resolves when the query is executed.
 */
  async modifyRefreshToken(userId, refreshToken, action, oldToken = null) {
    debug('Modifying refresh token');
    debug(`SQL function ${this.tableName} called with action: ${action}`);

    // Action list to validate the action
    const validActions = ['array_append', 'array_replace', 'array_remove'];

    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}`);
    }
    // Check if the refreshToken already exists in the array
    const checkQuery = {
      text: `SELECT refresh_token FROM "${this.tableName}" WHERE id = $1`,
      values: [userId],
    };

    const result = await this.client.query(checkQuery);
    const refreshTokens = result.rows[0].refresh_token;

    if (refreshTokens.includes(refreshToken)) {
      debug('Refresh token already exists, no action taken');
      return;
    }

    let query;
    if (action === 'array_replace') {
    // simulate array_replace with array_append and array_remove
      query = {
        text: `UPDATE "${this.tableName}" 
             SET refresh_token = array_append(array_remove(refresh_token, $3), $2)
             WHERE id = $1`,
        values: [userId, refreshToken, oldToken],
      };
    } else {
    // For array_append and array_remove
      query = {
        text: `UPDATE "${this.tableName}" 
             SET refresh_token = ${action}(refresh_token, $2)
             WHERE id = $1`,
        values: [userId, refreshToken],
      };
    }

    await this.client.query(query);
  }
}

export default User;

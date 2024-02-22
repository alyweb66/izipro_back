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
    debug('User found. Connexion successfull');

    return user;
  }
}

export default User;

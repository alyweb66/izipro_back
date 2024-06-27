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
}

export default User;

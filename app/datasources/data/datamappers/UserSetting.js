// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Setting`);

class UserSetting extends CoreDatamapper {
  tableName = 'user_setting';

  /**
   * update user setting
   *
   * @param {number} id - The ID of the user to update.
   * @param {{name: string, content: string, range: number, user_id: number}} inputData -
   * The data to update.
   * @returns {Promise<object>} A promise that resolves to an object of user setting.
   * @throws {Error} If there is an issue with the database query.
   */
  async updateUserSetting(id, inputData) {
    const fieldsAndPlaceholders = [];
    let indexPlaceholder = 1;
    const values = [];

    Object.entries(inputData).forEach(([prop, value]) => {
      fieldsAndPlaceholders.push(`"${prop}" = $${indexPlaceholder}`);
      indexPlaceholder += 1;
      values.push(value);
    });

    values.push(id);

    const preparedQuery = {
      text: `
        UPDATE "${this.tableName}" SET
        ${fieldsAndPlaceholders},
        updated_at = now()
        WHERE user_id = $${indexPlaceholder}
        RETURNING *
      `,
      values,
    };

    const result = await this.client.query(preparedQuery);
    const row = result.rows[0];
    return row;
  }
}

export default UserSetting;

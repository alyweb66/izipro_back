import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Job`);

class Job extends CoreDatamapper {
  tableName = 'job';

  /**
   * returns all jobs from a category
  *
  * @param {number} id - id of the entity
  * @returns {Promise<object[]>} The found jobs.
  */
  async findJobsByCategory(id) {
    debug(`find jobs by category with id ${id}`);
    const preparedQuery = {
      text: `
        SELECT *
        FROM "${this.tableName}"
        WHERE "category_id" = $1
      `,
      values: [id],
    };

    const { rows } = await this.client.query(preparedQuery);
    return rows;
  }
}

export default Job;

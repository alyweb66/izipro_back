import Debug from 'debug';
import DataLoader from 'dataloader';
// import { createHash } from 'crypto';

const debug = Debug(`${process.env.DEBUG_MODULE}:CoreDatamapper`);

class CoreDatamapper {
  tableName;

  clearCache() {
    this.cache.clear(); // Vide le cache
  }

  constructor(options) {
    this.client = options.client;
    this.cache = options.cache;
    // the function makes a query with an array of ids
    // to avoid being called several times for the same request with different ids at the same time
    this.findByPkLoader = new DataLoader(async (ids) => {
      const preparedQuery = {
        text: `
          SELECT *
          FROM "${this.tableName}"
          WHERE "id" = ANY($1)
        `,
        values: [ids],
      };
      // and record result in cache "cacheQuery"
      const records = await this.cacheQuery(preparedQuery);
      // used to put in the format requested by dataLoader
      const sortedRecords = ids.map(
        (id) => records.find(
          (record) => record.id === id,
        ),
      );
      return sortedRecords;
    });

    this.findByUserIdsLoader = new DataLoader(async (users) => {
      const preparedQuery = {
        text: `
            SELECT *
            FROM "${this.tableName}"
            WHERE "user_id" = ANY($1)
            `,
        values: [users],
      };
      const records = await this.cacheQuery(preparedQuery);
      // transforms the array that contains all the results into an array of arrays [[],[]...]
      const sortedRecords = users.map(
        (userId) => records.filter(
          (record) => record.user_id === userId,
        ),
      );
      return sortedRecords;
    });
  }

  /**
   * returns a single entity according to its id
  *
  * @param {number} id - id of the entity
  * @returns an entity
  */
  async findByPk(id) {
    debug('add new entity to dataLoader');
    // "load" allows you to add the value to the query table
    const record = await this.findByPkLoader.load(id);
    return record || null;
  }

  /**
 * Returns all entities according to their user_id(s)
 *
 * @param {number|number[]} userId - The ID or an array of IDs of the entity/entities
 * @returns {Promise<Object|Object[]>} -
 * A promise that resolves to an entity or an array of entities
 */
  async findByUser(userId) {
    debug('add new entities to dataLoader');
    if (Array.isArray(userId)) {
      const records = await this.findByUserIdsLoader.loadMany(userId);
      return records.map((record) => record || null);
    }
    const record = await this.findByUserIdsLoader.load(userId);

    return record || null;

    /*  const record = await this.findByUserIdsLoader.load(userId);
    return record || null; */
  }

  /**
   * returns all entities from a table
  *
  * @returns an array of entities
  */
  async findAll() {
    const preparedQuery = {
      text: `SELECT * FROM "${this.tableName}" 
      ${(this.tableName === 'category' || this.tableName === 'job') ? 'ORDER BY "name" ASC' : ''} `,
    };
    const result = await this.cacheQuery(preparedQuery);
    return result;
  }

  /**
   * create a new entity
   *
   * @param {Object} inputData
   * @returns the created entity
   */
  async create(inputData) {
    // contain column
    const fields = [];
    // contain $1 $2 etc
    const placeholders = [];
    // contain values
    const values = [];
    let indexPlaceholder = 1;
    // allows you to create a dynamically prepared query by
    // creating arrays of values to insert them into the query
    Object.entries(inputData).forEach(([prop, value]) => {
      fields.push(`"${prop}"`);
      placeholders.push(`$${indexPlaceholder}`);
      values.push(value);
      indexPlaceholder += 1;
    });

    const preparedQuery = {
      text: `
        INSERT INTO "${this.tableName}"
        (${fields})
        VALUES (${placeholders})
        RETURNING *
      `,
      values,
    };

    const result = await this.client.query(preparedQuery);
    const row = result.rows[0];

    return row;
  }

  /**
   * Modify an existing entity
   *
   * @param {number} id - id of the entity to modify
   * @param {Object} inputData - entity modifications
   * @returns an updated entity
   */
  async update(id, inputData) {
    const fieldsAndPlaceholders = [];
    let indexPlaceholder = 1;
    const values = [];

    Object.entries(inputData).forEach(([prop, value]) => {
      fieldsAndPlaceholders.push(`"${prop}" = $${indexPlaceholder}`);
      indexPlaceholder += 1;
      values.push(value);
    });

    // add the id to the values array
    values.push(id);

    const whereClause = this.tableName === 'notification' ? 'user_id' : 'id';

    const preparedQuery = {
      text: `
        UPDATE "${this.tableName}" SET
        ${fieldsAndPlaceholders},
        updated_at = now()
        WHERE ${whereClause} = $${indexPlaceholder}
        RETURNING *
      `,
      values,
    };

    const result = await this.client.query(preparedQuery);
    const row = result.rows[0];

    return row;
  }

  /**
   * delete an existing entity
   *
   * @param {number} id - id of the entity to modify
   * @returns an boolean
   */
  async delete(id) {
    const result = await this.client.query(`DELETE FROM "${this.tableName}" WHERE id = $1`, [id]);
    return !!result.rowCount;
  }

  /**
   * delete an existing entity
   *
   * @param {number} userId - id of the entity to modify
   * @returns an boolean
   */
  async deleteByUserId(userId) {
    const result = await this.client.query(`DELETE FROM "${this.tableName}" WHERE user_id = $1`, [userId]);
    return !!result.rowCount;
  }

  // function to create a cache key and configure cache
  //! cache is disabled
  cacheQuery(preparedQuery) {
    /* const cacheKey = createHash('sha1').update(JSON.stringify(preparedQuery)).digest('base64');
    debug(`cacheKey: ${cacheKey}`); */
    return this.cache.get(/* cacheKey */).then((/* entry */) => {
      /* if (entry) {
        debug('The key exists in the cache');
        debug('we return the data contained by the cache');
        // return Promise.resolve(JSON.parse(entry));
      } */
      debug(/* 'The key does not exist in the cache' */);
      return this.client.query(preparedQuery).then((results) => {
        debug('we retrieve the data from the db');
        /* if (results.rows) {
          debug('we add this data to the cache');
          // this.cache.set(cacheKey, JSON.stringify(results.rows), { ttl });
        } */
        debug('we return the data received from the db');
        return Promise.resolve(results.rows);
      });
    });
  }
}

export default CoreDatamapper;

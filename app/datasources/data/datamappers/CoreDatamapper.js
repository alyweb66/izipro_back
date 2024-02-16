import Debug from 'debug';
import DataLoader from 'dataloader';
import { createHash } from 'crypto';

const debug = Debug(`${process.env.DEBUG_MODULE}:CoreDatamapper`);

class CoreDatamapper {
  tableName;

  constructor(options) {
    this.client = options.client;
    this.cache = options.cache;
    this.findByPkLoader = new DataLoader(async (ids) => {
      const preparedQuery = {
        text: `
          SELECT *
          FROM "${this.tableName}"
          WHERE "id" = ANY($1)
        `,
        values: [ids],
      };
      const records = await this.cacheQuery(preparedQuery);
      // used to put in the format requested by dataLoader
      const sortedRecords = ids.map(
        (id) => records.find(
          (record) => record.id === id,
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
    const record = await this.findByPkLoader.load(id);
    return record || null;
  }

  /**
   * returns all entities from a table
   *
   * @returns an array of entities
   */
  async findAll(offset = 0, limit = 10) {
    const preparedQuery = {
      text: `SELECT * FROM "${this.tableName}" ORDER BY id OFFSET ${offset} LIMIT ${limit}`,
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
   * @param {Object} inputData - enity modifications
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

    values.push(id);

    const preparedQuery = {
      text: `
        UPDATE "${this.tableName}" SET
        ${fieldsAndPlaceholders},
        updated_at = now()
        WHERE id = $${indexPlaceholder}
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

  cacheQuery(preparedQuery, ttl) {
    const cacheKey = createHash('sha1').update(JSON.stringify(preparedQuery)).digest('base64');
    debug(`cacheKey: ${cacheKey}`);
    return this.cache.get(cacheKey).then((entry) => {
      if (entry) {
        debug('La clef existe dans la cache');
        debug('on renvoit les données contenues par la cache');
        return Promise.resolve(JSON.parse(entry));
      }
      debug('La clef n\'existe pas dans la cache');
      return this.client.query(preparedQuery).then((results) => {
        debug('on récupére les données depuis la db');
        if (results.rows) {
          debug('on ajoute ces données à la cache');
          this.cache.set(cacheKey, JSON.stringify(results.rows), { ttl });
        }
        debug('on renvoit les données reçues de la db');
        return Promise.resolve(results.rows);
      });
    });
  }
}

export default CoreDatamapper;

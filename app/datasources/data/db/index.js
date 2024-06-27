// database connection
import Debug from 'debug';
import pkg from 'pg';

const debug = Debug(`${process.env.DEBUG_MODULE}:database`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}


const { Pool } = pkg;
const pool = new Pool();
// Use the connection pool to connect to the database.
pool.connect().then(() => {
  debug('database client connected');
});

let queryCount = 0;
// Method: query allows executing SQL queries on the database.
// It logs the query parameters using the debug function and
// delegates the query to the original database client.
/**
 * A module that provides a helper function to execute SQL queries using the original client.
 * @module database
 */

export default {
  originalClient: pool,
  /**
   * Executes a SQL query using the original client.
   * @async
   * @function query
   * @param {...*} params - The parameters to be passed to the query.
   * @returns {Promise} A Promise that resolves with the result of the query.
   */
  async query(...params) {
    debugInDevelopment(...params);
    queryCount += 1;
    debug(`Req n°${queryCount}`);

    return this.originalClient.query(...params);
  },
};

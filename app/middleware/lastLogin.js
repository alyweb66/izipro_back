import debug from 'debug';
import ServerRequest from '../datasources/data/datamappers/serverRequest.js';
import logger from './logger.js';

const userInstance = new ServerRequest();

/**
 * updateLastLoginInDatabase - Updates the last login time in the database
 *
 * @param {number} userId - The user id
 * @param {string} lastLoginTime - The last login time in timestamp
 * @returns {Promise} - no return value
 * @Error - Returns an error if the update fails
 */
async function updateLastLoginInDatabase(userId, lastLoginTime) {
  try {
    await userInstance.updateLastLogin(userId, lastLoginTime);
  } catch (error) {
    debug('error', error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }
}

export default updateLastLoginInDatabase;

import debug from 'debug';
import ServerRequest from '../datasources/data/datamappers/serverRequest.js';
import logger from './logger.js';

const userInstance = new ServerRequest();

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

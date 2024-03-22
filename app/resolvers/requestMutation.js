import Debug from 'debug';
import {
  AuthenticationError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 *
 * @param {*} _ parent object
 * @param {*} param1 destructuring input from the mutation
 * @param {*} param2 destructuring dataSources from the context
 * @returns
 */
async function createRequest(_, { input }, { dataSources }) {
  debug('create request');
  debugInDevelopment('input', input);
  if (!dataSources.userData.id) {
    throw new AuthenticationError('Unauthorized');
  }
  return dataSources.dataDB.request.create(input);
}

export default {
  createRequest,
};

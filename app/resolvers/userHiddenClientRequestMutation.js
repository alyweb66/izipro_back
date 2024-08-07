import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:userHiddenClientRequestMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
/**
 * Creates a hidden client request for a user.
 *
 * @async
 * @function createHiddenClientRequest
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, request_id: number}} input -
 * The input object containing user and request details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the created hidden client request.
 * @throws {ApolloError} If the user is unauthorized
 * or if there is an error creating the hidden client request.
 */
async function createHiddenClientRequest(_, { input }, { dataSources }) {
  debug('create hidden client request');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new ApolloError('Unauthorized');
    }
    // create hidden client request
    const isCreatedHiddenClientRequest = await
    dataSources.dataDB.userHasHiddingClientRequest.create(
      input,
    );
    if (!isCreatedHiddenClientRequest) {
      throw new ApolloError('Error creating hidden client request');
    }

    return isCreatedHiddenClientRequest;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error creating hidden client request');
  }
}

export default { createHiddenClientRequest };

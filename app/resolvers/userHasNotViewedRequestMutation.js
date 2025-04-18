import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:UserHasViewedRequestMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
/**
 * Marks a request as not viewed for a user.
 *
 * @async
 * @function userHasNotViewedRequest
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, request_id: number[]}} input -
 * The input object containing user and request details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>} A promise that resolves
 *  to true if the request was successfully marked as not viewed.
 * @throws {ApolloError} If the user is unauthorized or
 * if there is an error marking the request as not viewed.
 */
async function userHasNotViewedRequest(_, { input }, { dataSources }) {
  debug('user has viewed request');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' , httpStatus: 401} });
    }

    const isCreatedNotViewedRequest = await
    dataSources.dataDB.userHasNotViewedRequest.createNotViewedRequest(
      input,
    );
    if (!isCreatedNotViewedRequest) {
      throw new GraphQLError('Error creating viewed request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    return true;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error creating viewed request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}
/**
 * Deletes a not viewed request for a user.
 *
 * @async
 * @function deleteNotViewedRequest
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, request_id: number[]}} input -
 * The input object containing user and request details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>} A promise that resolves
 *  to true if the request was successfully deleted.
 * @throws {ApolloError} If the user is unauthorized or if there is an error deleting the request.
 */
async function deleteNotViewedRequest(_, { input }, { dataSources }) {
  debug('delete viewed request');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' , httpStatus: 401} });
    }

    const isDeletedNotViewedRequest = await
    dataSources.dataDB.userHasNotViewedRequest.deleteNotViewedRequest(
      input,
    );
    if (!isDeletedNotViewedRequest) {
      throw new GraphQLError('Error deleting viewed request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    return true;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error deleting viewed request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

export default { userHasNotViewedRequest, deleteNotViewedRequest };

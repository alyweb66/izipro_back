import { GraphQLError } from 'graphql';
import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:UserHasJobMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * Creates a user job association.
 *
 * @async
 * @function createUserJob
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, job_id: number}} input - The input object containing user and job IDs.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the created user job association.
 * @throws {AuthenticationError} If the user is unauthorized.
 * @throws {ApolloError} If there is an error creating the user job association.
 */
async function createUserJob(_, { input }, { dataSources }) {
  debug('create user_has_job');
  debugInDevelopment('input', input);
  if (dataSources.userData.id !== input.user_id) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' } });
  }
  try {
    dataSources.dataDB.userHasJob.cache.clear();
    const userHasJob = await dataSources.dataDB.userHasJob.createUserHasJob(
      input.user_id,
      input.job_id,
    );

    if (!userHasJob) {
      throw new GraphQLError('Error creating user_has_job', { extensions: { code: 'BAD REQUEST' } });
    }

    debugInDevelopment(userHasJob);
    return userHasJob;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error creating user_has_job', { extensions: { code: 'BAD REQUEST' } });
  }
}

/**
 * Deletes a user job association.
 *
 * @async
 * @function deleteUserJob
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, job_id: number}} input - The input object containing user and job IDs.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the deleted user job association.
 * @throws {AuthenticationError} If the user is unauthorized.
 * @throws {ApolloError} If there is an error deleting the user job association.
 */
async function deleteUserJob(_, { input }, { dataSources }) {
  debug('delete user_has_job');
  debugInDevelopment('input', input);
  if (dataSources.userData.id !== input.user_id) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' } });
  }
  try {
    const userHasJob = await dataSources.dataDB.userHasJob.deleteUserHasJob(
      input.user_id,
      input.job_id,
    );

    if (!userHasJob) {
      throw new GraphQLError('Error deleting user_has_job', { extensions: { code: 'BAD REQUEST' } });
    }

    debugInDevelopment(userHasJob);
    return userHasJob;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error deleting user_has_job', { extensions: { code: 'BAD REQUEST' } });
  }
}
export default {
  createUserJob,
  deleteUserJob,
};

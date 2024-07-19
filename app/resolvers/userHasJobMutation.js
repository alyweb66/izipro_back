import { ApolloError, AuthenticationError } from 'apollo-server-core';
import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:UserHasJobMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function createUserJob(_, { input }, { dataSources }) {
  debug('create user_has_job');
  debugInDevelopment('input', input);
  if (dataSources.userData.id !== input.user_id) {
    throw new AuthenticationError('Unauthorized');
  }
  try {
    dataSources.dataDB.userHasJob.cache.clear();
    const userHasJob = await dataSources.dataDB.userHasJob.createUserHasJob(
      input.user_id,
      input.job_id,
    );

    if (!userHasJob) {
      throw new ApolloError('Error creating user_has_job');
    }

    debugInDevelopment(userHasJob);
    return userHasJob;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error creating user_has_job');
  }
}

async function deleteUserJob(_, { input }, { dataSources }) {
  debug('delete user_has_job');
  debugInDevelopment('input', input);
  if (dataSources.userData.id !== input.user_id) {
    throw new AuthenticationError('Unauthorized');
  }
  try {
    const userHasJob = await dataSources.dataDB.userHasJob.deleteUserHasJob(
      input.user_id,
      input.job_id,
    );

    if (!userHasJob) {
      throw new ApolloError('Error deleting user_has_job');
    }

    debugInDevelopment(userHasJob);
    return userHasJob;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error deleting user_has_job');
  }
}
export default {
  createUserJob,
  deleteUserJob,
};

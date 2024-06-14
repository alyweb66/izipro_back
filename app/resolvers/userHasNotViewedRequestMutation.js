import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:UserHasViewedRequestMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function userHasNotViewedRequest(_, { input }, { dataSources }) {
  debug('user has viewed request');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new ApolloError('Unauthorized');
    }
    // create hidden client request
    const isCreatedHiddenClientRequest = await
    dataSources.dataDB.userHasNotViewedRequest.createNotViewedRequest(
      input,
    );
    if (!isCreatedHiddenClientRequest) {
      throw new ApolloError('Error creating viewed request');
    }

    return true;
  } catch (error) {
    debugInDevelopment('Error creating viewed request', error);
    throw new ApolloError('Error creating viewed request');
  }
}

async function deleteNotViewedRequest(_, { input }, { dataSources }) {
  debug('delete viewed request');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new ApolloError('Unauthorized');
    }
    // delete hidden client request
    const isDeletedHiddenClientRequest = await
    dataSources.dataDB.userHasNotViewedRequest.deleteNotViewedRequest(
      input,
    );
    if (!isDeletedHiddenClientRequest) {
      throw new ApolloError('Error deleting viewed request');
    }

    return true;
  } catch (error) {
    debugInDevelopment('Error deleting viewed request', error);
    throw new ApolloError('Error deleting viewed request');
  }
}

export default { userHasNotViewedRequest, deleteNotViewedRequest };

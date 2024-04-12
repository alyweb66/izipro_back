import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:userHiddenClientRequestMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

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
    debugInDevelopment('Error creating hidden client request', error);
    throw new ApolloError('Error creating hidden client request');
  }
}

export default { createHiddenClientRequest };

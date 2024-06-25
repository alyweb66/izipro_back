import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:UserHasViewedConversationMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function deleteNotViewedConversation(_, { input }, { dataSources }) {
  debug('delete not viewed conversation');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new ApolloError('Unauthorized');
    }

    const isDeletedNotViewedConversation = await
    dataSources.dataDB.userHasNotViewedConversation.deleteNotViewedConversation(
      input,
    );
    if (!isDeletedNotViewedConversation) {
      throw new ApolloError('Error deleting viewed conversation');
    }

    return true;
  } catch (error) {
    debugInDevelopment('Error deleting viewed conversation', error);
    throw new ApolloError('Error deleting viewed conversation');
  }
}

export default { deleteNotViewedConversation };

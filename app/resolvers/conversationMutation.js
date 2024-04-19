import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:ConversationMutation`);

async function createConversation(_, { id, input }, { dataSources }) {
  debug('create conversation');

  try {
    if (dataSources.userData.id !== id) {
      throw new AuthenticationError('Unauthorized');
    }
    const conversation = await dataSources.dataDB.conversation.create(input);
    if (!conversation) {
      throw new ApolloError('Error creating conversation');
    }
    return conversation;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error creating conversation');
  }
}
debug('RequestResolver');
export default { createConversation };

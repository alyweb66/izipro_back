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
    // create a new variable to store the updated input object
    const updatedInput = { ...input, updated_at: new Date() };
    const conversation = await dataSources.dataDB.conversation.create(updatedInput);
    if (!conversation) {
      throw new ApolloError('Error creating conversation');
    }
    return conversation;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error creating conversation');
  }
}

async function updateConversation(_, { input }, { dataSources }) {
  debug('update conversation');

  try {
    // create a new variable to store the updated input object
    const conversation = await dataSources.dataDB.conversation.updateConversation(input.id);
    if (!conversation) {
      throw new ApolloError('Error updating conversation');
    }
    return true;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error updating conversation');
  }
}
export default { createConversation, updateConversation };

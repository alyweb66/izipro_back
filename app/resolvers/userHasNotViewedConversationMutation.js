import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:UserHasViewedConversationMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * Deletes a not viewed conversation for a user.
 *
 * @async
 * @function deleteNotViewedConversation
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, conversation_id: number[]}} input -
 * The input object containing user and conversation details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>} A promise that resolves to true
 * if the conversation was successfully deleted.
 * @throws {ApolloError} If the user is unauthorized
 * or if there is an error deleting the conversation.
 */
async function deleteNotViewedConversation(_, { input }, { dataSources }) {
  debug('delete not viewed conversation');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' , httpStatus: 401} });
    }

    const isDeletedNotViewedConversation = await
    dataSources.dataDB.userHasNotViewedConversation.deleteNotViewedConversation(
      input,
    );
    if (!isDeletedNotViewedConversation) {
      throw new GraphQLError('Error deleting viewed conversation', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    return true;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error deleting viewed conversation', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

export default { deleteNotViewedConversation };

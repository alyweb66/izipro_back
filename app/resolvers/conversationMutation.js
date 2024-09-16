import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:ConversationMutation`);

/**
 * Creates a new conversation based on the provided input.
 *
 * @async
 * @function createConversation
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.id - The ID of the user creating the conversation.
 * @param {{user_1: number, user_2: number, request_id: number}} args.input -
 * The input object containing the conversation details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the created conversation object.
 * @throws {ApolloError} If there is an error creating the conversation.
 */
async function createConversation(_, { id, input }, { dataSources }) {
  debug('create conversation');

  try {
    if (dataSources.userData.id !== id) {
      throw new GraphQLError('Access denied', { extensions: { code: 'UNAUTHORIZED' , httpStatus: 403} });
    }
    // create a new variable to store the updated input object
    const updatedInput = { ...input, updated_at: new Date() };
    const conversation = await dataSources.dataDB.conversation.create(updatedInput);
    if (!conversation) {
      throw new GraphQLError('No conversation', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }
    return conversation;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}

export default { createConversation };

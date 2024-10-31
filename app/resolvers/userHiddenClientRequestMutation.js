import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:userHiddenClientRequestMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
/**
 * Creates a hidden client request for a user.
 *
 * @async
 * @function createHiddenClientRequest
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {{user_id: number, request_id: number, isWithConversation?: Boolean}} input -
 * The input object containing user and request details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the created hidden client request.
 * @throws {ApolloError} If the user is unauthorized
 * or if there is an error creating the hidden client request.
 */
async function createHiddenClientRequest(_, { input }, { dataSources }) {
  debug('create hidden client request');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED', httpStatus: 401 } });
    }
    // Chedk if existing request
    dataSources.dataDB.request.findByPkLoader.clear(input.request_id);
    const request = await dataSources.dataDB.request.findByPk(input.request_id);

    const { isWithConversation, ...newInput } = input;

    let isCreatedHiddenClientRequest;
    if (request && request.id > 0) {
      // create hidden client request
      isCreatedHiddenClientRequest = await
      dataSources.dataDB.userHasHiddingClientRequest.create(
        newInput,
      );
      if (!isCreatedHiddenClientRequest) {
        throw new GraphQLError('Error creating hidden client request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
      }
    }

    if (
      isCreatedHiddenClientRequest
      && (!input.isWithConversation
        || input.isWithConversation === false)
    ) {
      return true;
    }
    // remove subcription for this client conversation
    dataSources.dataDB.subscription.findByUserIdsLoader.clear(input.user_id);
    const subscription = await dataSources.dataDB.subscription.findByUser(input.user_id);

    const userConversations = await
    dataSources.dataDB.conversation.getConversationByUser(input.user_id);

    const conversationToDelete = userConversations
      ?.find((conversation) => conversation.request_id === input.request_id)?.id;

    // remove request_id in the array of subscriber_id
    // for subscriber request and subscriber conversation
    const subscriberRequestIds = subscription
      ?.filter((sub) => sub.subscriber === 'clientConversation')
      .flatMap((sub) => sub.subscriber_id) || [];

    // remove the conversation id from the subscriberRequestIds
    const updatedSubscriberConversationIds = subscriberRequestIds
      ?.filter((id) => id !== conversationToDelete);

    // Update subscription for request and conversation and delete not viewed conversation
    await Promise.all([
      dataSources.dataDB.subscription.createSubscription(input.user_id, 'clientConversation', updatedSubscriberConversationIds),

      conversationToDelete
     && dataSources.dataDB.userHasNotViewedConversation.deleteNotViewedConversation({
       user_id: input.user_id,
       conversation_id: [conversationToDelete], // Convert Set back to Array
     }),
    ]);
    // create new

    return true;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error creating hidden client request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

export default { createHiddenClientRequest };

import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  /**
 * Retrieves all requests for a user with pagination.
 *
 * @async
 * @function requests
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} user.id - The ID of the user.
 * @param {number} args.offset - The offset for pagination.
 * @param {number} args.limit - The limit for pagination.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of requests.
 * @throws {ApolloError} If there is an error retrieving the requests.
 */
  async requests({ id }, { offset, limit }, { dataSources }) {
    try {
      debug(`get all request from user id: ${id}, offset ${offset}, limit ${limit}`);
      const requests = await dataSources.dataDB.request.getRequestByUserId(id, offset, limit);
      return requests;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all request from user id ');
    }
  },
  /**
 * Retrieves a specific request by its ID.
 *
 * @async
 * @function request
 * @param {number} user.id - The ID of the user.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.requestId - The ID of the request to retrieve.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the request object.
 * @throws {ApolloError} If there is an error retrieving the request.
 */
  async request({ id }, { requestId }, { dataSources }) {
    try {
      debug(`get request by id: ${id}`);
      const request = await dataSources.dataDB.request.getRequestByRequestId(requestId);
      return request;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get request by id ');
    }
  },
  /**
 * Retrieves all jobs for a user.
 *
 * @function jobs
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of jobs.
 * @throws {ApolloError} If there is an error retrieving the jobs.
 */
  jobs({ id }, _, { dataSources }) {
    try {
      dataSources.dataDB.userHasJob.findByUserIdsLoader.clear(id);
      debug(`get all jobs from user id: ${id}`);
      return dataSources.dataDB.userHasJob.findByUser(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all jobs from user id ');
    }
  },
  /**
 * Retrieves the settings for a user.
 *
 * @async
 * @function settings
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object, w
 * hich contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the settings object.
 * @throws {ApolloError} If there is an error retrieving the settings.
 */
  async settings({ id }, _, { dataSources }) {
    try {
      dataSources.dataDB.userSetting.findByUserIdsLoader.clear(id);
      debug(`get setting from user id: ${id}`);
      const setting = await dataSources.dataDB.userSetting.findByUser(id);
      return setting;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get setting from user id ');
    }
  },
  /**
 * Retrieves all requests by conversations for a user with pagination.
 *
 * @async
 * @function requestsConversations
 * @param {number} user.id - The ID of the user.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.offset - The offset for pagination.
 * @param {number} args.limit - The limit for pagination.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of requests.
 * @throws {ApolloError} If there is an error retrieving the requests.
 */
  async requestsConversations({ id }, { offset, limit }, { dataSources }) {
    try {
      debug(`get all requests by conversations from user id: ${id}`);
      const result = await dataSources.dataDB.request.getRequestByConversation(id, offset, limit);
      const requests = result.filter((request) => request.user_id !== id);
      return requests;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all requests by conversations from user id ');
    }
  },
  /**
 * Retrieves all messages from a conversation for a user with pagination.
 *
 * @async
 * @function messages
 * @param {number} user.id - The ID of the user.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.conversationId - The ID of the conversation.
 * @param {number} args.offset - The offset for pagination.
 * @param {number} args.limit - The limit for pagination.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of messages.
 * @throws {AuthenticationError} If the user is unauthorized.
 * @throws {ApolloError} If there is an error retrieving the messages.
 */
  async messages({ id }, { conversationId, offset, limit }, { dataSources }) {
    try {
      debug(`get all messages from conversation id: ${conversationId}`);
      if (dataSources.userData.id !== id) {
        throw new AuthenticationError('Unauthorized');
      }
      const messageDESC = await dataSources.dataDB.message.findByUserConversation(
        conversationId,
        offset,
        limit,
      );
      const messageASC = messageDESC.sort((a, b) => a.created_at - b.created_at);
      return messageASC;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all messages from conversation id ');
    }
  },
  /**
 * Retrieves all subscriptions for a user.
 *
 * @async
 * @function subscription
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of subscriptions.
 * @throws {ApolloError} If there is an error retrieving the subscriptions.
 */
  async subscription({ id }, _, { dataSources }) {
    try {
      debug(`get all subscription from user id: ${id}`);
      dataSources.dataDB.subscription.findByUserIdsLoader.clear(id);
      const sub = await dataSources.dataDB.subscription.findByUser(id);
      return sub;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all subscription from user id ');
    }
  },
  /**
 * Retrieves all requests that have not been viewed by the user.
 *
 * @async
 * @function userHasNotViewedRequest
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of not viewed requests.
 * @throws {ApolloError} If there is an error retrieving the requests.
 */
  async userHasNotViewedRequest({ id }, _, { dataSources }) {
    try {
      debug(`get all has viewed request from user id: ${id}`);
      dataSources.dataDB.userHasNotViewedRequest.findByUserIdsLoader.clear(id);
      const notViewed = await dataSources.dataDB.userHasNotViewedRequest.findByUser(id);
      return notViewed;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all has viewed request from user id ');
    }
  },
  /**
 * Retrieves all conversations that have not been viewed by the user.
 *
 * @async
 * @function userHasNotViewedConversation
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of not viewed conversations.
 * @throws {ApolloError} If there is an error retrieving the conversations.
 */
  async userHasNotViewedConversation({ id }, _, { dataSources }) {
    try {
      debug(`get all has not viewed conversation from user id: ${id}`);
      dataSources.dataDB.userHasNotViewedConversation.findByUserIdsLoader.clear(id);
      const notConvViewed = await dataSources.dataDB.userHasNotViewedConversation.findByUser(id);
      return notConvViewed;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all has not viewed conversation from user id ');
    }
  },
  /**
 * Retrieves all conversation request IDs for a user.
 *
 * @async
 * @function conversationRequestIds
 * @param {Object} user - The user object.
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Array>} A promise that resolves to an array of conversation request IDs.
 * @throws {ApolloError} If there is an error retrieving the conversation request IDs.
 */
  async conversationRequestIds({ id }, _, { dataSources }) {
    try {
      debug(`get all conversation id from user id: ${id}`);
      const conv = await dataSources.dataDB.request.getRequestsConvId(id);
      return conv;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all conversation id from user id ');
    }
  },
  /**
 * Retrieves all cookie consents for a user.
 *
 * @async
 * @function cookieConsents
 * @param {Object} user - The user object.
 * @param {number} user.id - The ID of the user.
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the first cookie consent object.
 * @throws {ApolloError} If there is an error retrieving the cookie consents.
 */
  async cookieConsents({ id }, _, { dataSources }) {
    try {
      debug(`get all cookie consents from user id: ${id}`);
      dataSources.dataDB.cookieConsents.findByUserIdsLoader.clear(id);
      const cookieConsents = await dataSources.dataDB.cookieConsents.findByUser(id);
      return cookieConsents[0];
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all cookie consents from user id ');
    }
  },

  /**
 * Retrieves the VAPID public key for a given user.
 *
 * @param {Object} param - The parameter object.
 * @param {string} param.id - The ID of the user.
 * @returns {string} The VAPID public key.
 */
  publicKey({ id }) {
    debug(`get the VAPID public key from user id: ${id}`);
    return process.env.VAPID_PUBLIC_KEY;
  },

  /**
 * Retrieves all notifications for a given user.
 *
 * @param {Object} param - The parameter object.
 * @param {number} param.id - The ID of the user.
 * @param {Object} _ - Unused parameter.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources object.
 * @returns {Promise<Array>} A promise that resolves to an array of notifications.
 * @throws {ApolloError} If there is an error retrieving the notifications.
 */
  async notification({ id }, _, { dataSources }) {
    try {
      debug(`get all notification from user id: ${id}`);
      // clear cache
      dataSources.dataDB.notification.findByUserIdsLoader.clear(id);
      const notification = await dataSources.dataDB.notification.findByUser(id);
      return notification[0];
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all notification from user id ');
    }
  },
};

export default UserResolver;

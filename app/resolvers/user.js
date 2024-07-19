import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
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
};

export default UserResolver;

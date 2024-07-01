import Debug from 'debug';
import {
  AuthenticationError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  async requests({ id }, { offset, limit }, { dataSources }) {
    debug(`get all request from user id: ${id}, offset ${offset}, limit ${limit}`);
    const requests = await dataSources.dataDB.request.getRequestByUserId(id, offset, limit);
    return requests;
  },
  async request({ id }, { requestId }, { dataSources }) {
    debug(`get request by id: ${id}`);
    const request = await dataSources.dataDB.request.getRequestByRequestId(requestId);
    return request;
  },
  async jobs({ id }, _, { dataSources }) {
    dataSources.dataDB.userHasJob.cache.clear();
    debug(`get all jobs from user id: ${id}`);
    const jobs = await dataSources.dataDB.userHasJob.findByUser(id);
    return jobs;
  },
  async settings({ id }, _, { dataSources }) {
    dataSources.dataDB.userSetting.cache.clear();
    debug(`get setting from user id: ${id}`);
    const setting = await dataSources.dataDB.userSetting.findByUser(id);
    return setting;
  },
  async requestsConversations({ id }, { offset, limit }, { dataSources }) {
    debug(`get all requests by conversations from user id: ${id}`);
    const result = await dataSources.dataDB.request.getRequestByConversation(id, offset, limit);
    // exclude request where user_id is the same as id
    const requests = result.filter((request) => request.user_id !== id);
    return requests;
  },
  async messages({ id }, { conversationId, offset, limit }, { dataSources }) {
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
  },
  async subscription({ id }, _, { dataSources }) {
    debug(`get all subscription from user id: ${id}`);
    const sub = await dataSources.dataDB.subscription.findByUser(id);
    return sub;
  },
  async userHasNotViewedRequest({ id }, _, { dataSources }) {
    debug(`get all has viewed request from user id: ${id}`);
    dataSources.dataDB.userHasNotViewedRequest.cache.clear();
    const notViewed = await dataSources.dataDB.userHasNotViewedRequest.findByUser(id);
    return notViewed;
  },
  async userHasNotViewedConversation({ id }, _, { dataSources }) {
    debug(`get all has not viewed conversation from user id: ${id}`);
    dataSources.dataDB.userHasNotViewedConversation.findByUserIdsLoader.clear(id);
    const notConvViewed = await dataSources.dataDB.userHasNotViewedConversation.findByUser(id);
    return notConvViewed;
  },
  async conversationRequestIds({ id }, _, { dataSources }) {
    debug(`get all conversation id from user id: ${id}`);
    const conv = await dataSources.dataDB.request.getRequestsConvId(id);
    return conv;
  },
};

export default UserResolver;

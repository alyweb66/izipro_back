import Debug from 'debug';
import {
  AuthenticationError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  requests({ id }, { offset, limit }, { dataSources }) {
    debug(`get all request from user id: ${id}, offset ${offset}, limit ${limit}`);
    return dataSources.dataDB.request.getRequestByUserId(id, offset, limit);
  },
  request({ id }, { requestId }, { dataSources }) {
    debug(`get request by id: ${id}`);
    return dataSources.dataDB.request.getRequestByRequestId(requestId);
  },
  jobs({ id }, _, { dataSources }) {
    dataSources.dataDB.userHasJob.cache.clear();
    debug(`get all jobs from user id: ${id}`);
    return dataSources.dataDB.userHasJob.findByUser(id);
  },
  settings({ id }, _, { dataSources }) {
    dataSources.dataDB.userSetting.cache.clear();
    debug(`get setting from user id: ${id}`);
    return dataSources.dataDB.userSetting.findByUser(id);
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
    console.log('messageASC', messageASC);
    return messageASC;
  },
  subscription({ id }, _, { dataSources }) {
    debug(`get all subscription from user id: ${id}`);
    return dataSources.dataDB.subscription.findByUser(id);
  },
  userHasNotViewedRequest({ id }, _, { dataSources }) {
    debug(`get all has viewed request from user id: ${id}`);
    return dataSources.dataDB.userHasNotViewedRequest.findByUser(id);
  },
  userHasNotViewedConversation({ id }, _, { dataSources }) {
    debug(`get all has viewed conversation from user id: ${id}`);
    return dataSources.dataDB.userHasNotViewedConversation.findByUser(id);
  },
  conversationRequestIds({ id }, _, { dataSources }) {
    debug(`get all conversation id from user id: ${id}`);
    return dataSources.dataDB.request.getRequestsConvId(id);
  },
};

export default UserResolver;

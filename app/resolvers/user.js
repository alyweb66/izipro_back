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
  requestsConversations({ id }, { offset, limit }, { dataSources }) {
    debug(`get all requests by conversations from user id: ${id}`);
    return dataSources.dataDB.request.getRequestByConversation(id, offset, limit);
  },
  async messages({ id }, { conversationId, offset, limit }, { dataSources }) {
    debug(`get all messages from conversation id: ${conversationId}`);
    if (dataSources.userData.id !== id) {
      throw new AuthenticationError('Unauthorized');
    }
    const messageDESC = await dataSources.dataDB.message.findByUserConversation(
      id,
      conversationId,
      offset,
      limit,
    );
    console.log('messageASC', messageDESC);
    const messageASC = messageDESC.sort((a, b) => a.created_at - b.created_at);
    return messageASC;
  },
  subscription({ id }, _, { dataSources }) {
    debug(`get all subscription from user id: ${id}`);
    return dataSources.dataDB.subscription.findByUser(id);
  },
};

export default UserResolver;

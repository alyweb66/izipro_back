import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  users(_, { ids, offset, limit }, { dataSources }) {
    try {
      debug(`get all users conversations where ids: ${ids}`);
      return dataSources.dataDB.user.findUsersByIds(ids, offset, limit);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all users conversations where ids');
    }
  },
  conversations(_, { offset, limit }, { dataSources }) {
    try {
      debug('get all conversations');
      return dataSources.dataDB.conversation.getConversationByUser(offset, limit);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all conversations');
    }
  },
  conversation(_, { id }, { dataSources }) {
    try {
      debug(`get conversation with id ${id}`);
      return dataSources.dataDB.conversation.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get conversation with id');
    }
  },
  messages(_, { conversationId, offset, limit }, { dataSources }) {
    try {
      debug('get all messages by conversation_id');
      return dataSources.dataDB.message.findByConversationId(conversationId, offset, limit);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all messages by conversation_id');
    }
  },
  message(_, { id }, { dataSources }) {
    try {
      debug(`get message with id ${id}`);
      return dataSources.dataDB.message.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get message with id');
    }
  },
  async user(_, __, { dataSources }) {
    try {
      if (!dataSources.userData) {
        throw new ApolloError('User not found', 'USER_NOT_FOUND');
      }
      debug(`get user with id ${dataSources.userData.id}`);
      // clear cache
      dataSources.dataDB.user.findByPkLoader.clear(dataSources.userData.id);
      const userData = await dataSources.dataDB.user.findByPk(dataSources.userData.id);
      return userData;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get user with id');
    }
  },

  request(_, { id }, { dataSources }) {
    try {
      debug(`get request with id ${id}`);
      return dataSources.dataDB.request.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get request with id');
    }
  },
  medias(_, __, { dataSources }) {
    try {
      debug('get all medias');
      return dataSources.dataDB.media.findAll();
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all medias');
    }
  },
  media(_, { id }, { dataSources }) {
    try {
      debug(`get media with id ${id}`);
      return dataSources.dataDB.media.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get media with id');
    }
  },
  categories(_, __, { dataSources }) {
    try {
      debug('get all categories');
      return dataSources.dataDB.category.findAll();
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all categories');
    }
  },
  category(_, { id }, { dataSources }) {
    try {
      debug(`get category with id ${id}`);
      return dataSources.dataDB.category.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get category with id');
    }
  },
  async jobs(_, { ids }, { dataSources }) {
    try {
      debug(`get job with id ${ids}`);
      dataSources.dataDB.job.cache.clear();
      const jobs = await dataSources.dataDB.job.findJobByPK(ids);
      return jobs;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get job with id');
    }
  },
  async requestsByJob(_, { ids, offset, limit }, { dataSources }) {
    try {
      if (ids.length === 0) {
        return null;
      }
      debug(`get all requests by job_id: ${ids}, offset ${offset}, limit ${limit}`);
      const result = await dataSources.dataDB.request.getRequestByJobId(
        ids,
        dataSources.userData.id,
        offset,
        limit,
      );
      return result;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get all request by job');
    }
  },

  async rules(_, __, { dataSources }) {
    try {
      debug('get all rules');
      const rules = await dataSources.dataDB.rules.findAll();
      return rules[0];
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error get rules');
    }
  },

};

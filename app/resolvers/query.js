import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  /* users(_, { ids, offset, limit }, { dataSources }) {
    debug(`get all users conversations where ids: ${ids}`);
    return dataSources.dataDB.user.findUsersByIds(ids, offset, limit);
  }, */
  conversations(_, { offset, limit }, { dataSources }) {
    debug('get all conversations');
    return dataSources.dataDB.conversation.getConversationByUser(offset, limit);
  },
  conversation(_, { id }, { dataSources }) {
    debug(`get conversation with id ${id}`);
    return dataSources.dataDB.conversation.findByPk(id);
  },
  messages(_, { conversationId, offset, limit }, { dataSources }) {
    debug('get all messages by conversation_id');
    return dataSources.dataDB.message.findByConversationId(conversationId, offset, limit);
  },
  message(_, { id }, { dataSources }) {
    debug(`get message with id ${id}`);
    return dataSources.dataDB.message.findByPk(id);
  },
  user(_, __, { dataSources }) {
    debug(`get user with id ${dataSources.userData.id}`);
    dataSources.dataDB.user.findByPkLoader.clear(dataSources.userData.id);
    return dataSources.dataDB.user.findByPk(dataSources.userData.id);
  },
  /* requests(_, { offset, limit }, { dataSources }) {
    debug('get all requests');
    return dataSources.dataDB.request.findAll(offset, limit);
  }, */
  request(_, { id }, { dataSources }) {
    debug(`get request with id ${id}`);
    return dataSources.dataDB.request.findByPk(id);
  },
  medias(_, __, { dataSources }) {
    debug('get all medias');
    return dataSources.dataDB.media.findAll();
  },
  media(_, { id }, { dataSources }) {
    debug(`get media with id ${id}`);
    return dataSources.dataDB.media.findByPk(id);
  },
  categories(_, __, { dataSources }) {
    debug('get all categories');
    return dataSources.dataDB.category.findAll();
  },
  category(_, { id }, { dataSources }) {
    debug(`get category with id ${id}`);
    return dataSources.dataDB.category.findByPk(id);
  },
  jobs(_, { ids }, { dataSources }) {
    debug(`get job with id ${ids}`);
    dataSources.dataDB.job.cache.clear();
    return dataSources.dataDB.job.findJobByPK(ids);
  },
  async requestsByJob(_, { ids, offset, limit }, { dataSources }) {
    debug(`get all requests by job_id: ${ids}, offset ${offset}, limit ${limit}`);
    const result = await dataSources.dataDB.request.getRequestByJobId(
      ids,
      dataSources.userData.id,
      offset,
      limit,
    );
    return result;
  },

  async rules(_, __, { dataSources }) {
    debug('get all rules');
    const rules = await dataSources.dataDB.rules.findAll();
    console.log('rules', rules[0]);
    return rules[0];
  },

};

import Debug from 'debug';

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
};

export default UserResolver;

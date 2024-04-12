import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  messages({ first_name: firstName, id }, _, { dataSources }) {
    debug(`get all messages from: ${firstName}`);
    return dataSources.dataDB.message.findByUser(id);
  },
  requests({ id }, { offset, limit }, { dataSources }) {
    debug(`get all request from user id: ${id}, offset ${offset}, limit ${limit}`);
    return dataSources.dataDB.request.getRequestByUserId(id, offset, limit);
  },
  jobs({ id }, _, { dataSources }) {
    debug(`get all jobs from user id: ${id}`);
    return dataSources.dataDB.userHasJob.findByUser(id);
  },
  settings({ id }, _, { dataSources }) {
    debug(`get setting from user id: ${id}`);
    return dataSources.dataDB.userSetting.findByUser(id);
  },
};

export default UserResolver;

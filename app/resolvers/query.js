import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  messages(_, { offset, limit }, { dataSources }) {
    debug('get all message');
    return dataSources.dataDB.message.findAll(offset, limit);
  },
  message(_, { id }, { dataSources }) {
    debug(`get message with id ${id}`);
    return dataSources.dataDB.message.findByPk(id);
  },
  users(_, { offset, limit }, { dataSources }) {
    debug('get all user');
    return dataSources.dataDB.user.findAll(offset, limit);
  },
  user(_, { id }, { dataSources }) {
    debug(`get user with id ${id}`);
    return dataSources.dataDB.user.findByPk(id);
  },
  requests(_, { offset, limit }, { dataSources }) {
    debug('get all requests');
    return dataSources.dataDB.request.findAll(offset, limit);
  },
  request(_, { id }, { dataSources }) {
    debug(`get request with id ${id}`);
    return dataSources.dataDB.request.findByPk(id);
  },
};

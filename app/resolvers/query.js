import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  messages(_, { offset, limit }, { dataSources }) {
    debug('get all message');
    return dataSources.dataDB.message.findAll(offset, limit);
  },
  users(_, { offset, limit }, { dataSources }) {
    debug('get all user');
    return dataSources.dataDB.user.findAll(offset, limit);
  },
};

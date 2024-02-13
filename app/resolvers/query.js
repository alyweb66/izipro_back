import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  message(_, { offset, limit }, { dataSources }) {
    debug('get all message');
    return dataSources.dataDB.message.findAll(offset, limit);
  },
};

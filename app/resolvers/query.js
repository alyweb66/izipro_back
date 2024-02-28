import Debug from 'debug';
import { ForbiddenError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  messages(_, { offset, limit }, { dataSources }) {
    debug('get all messages');
    return dataSources.dataDB.message.findAll(offset, limit);
  },
  message(_, { id }, { dataSources }) {
    debug(`get message with id ${id}`);
    return dataSources.dataDB.message.findByPk(id);
  },
  user(_, { id }, { dataSources }) {
    if (dataSources.userData.id !== id) {
      throw new ForbiddenError('Not authorized');
    }
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
  medias(_, { offset, limit }, { dataSources }) {
    debug('get all medias');
    return dataSources.dataDB.media.findAll(offset, limit);
  },
  media(_, { id }, { dataSources }) {
    debug(`get media with id ${id}`);
    return dataSources.dataDB.media.findByPk(id);
  },
};

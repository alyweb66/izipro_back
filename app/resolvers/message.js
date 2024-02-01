import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:message`);

const Message = {
  Message({
    id, content, userId, userId1,
  }, _, { dataSources }) {
    debug(`get all message of a user: ${content} ${userId} ${userId1}`);
    return dataSources.restoDB.restaurant.findByManager(id);
  },
};

export default Message;

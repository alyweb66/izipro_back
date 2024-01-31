import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:message`);

const Message = {
  Message({ id, firstname, lastname }, _, { dataSources }) {
    debug(`get all restaurants of manager: ${firstname} ${lastname}`);
    return dataSources.restoDB.restaurant.findByManager(id);
  },
};

export default Message;

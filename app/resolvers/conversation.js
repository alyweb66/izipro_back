import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:conversation`);

export default {
  messages({ id }, _, { dataSources }) {
    debug(`get all messages from conversation: ${id}`);
    return dataSources.dataDB.message.findByConversation(id);
  },

};

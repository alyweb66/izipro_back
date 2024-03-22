import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:conversation`);

const conversationResolver = {
  messages({ id }, _, { dataSources }) {
    debug(`get all messages from conversation: ${id}`);
    return dataSources.dataDB.message.findByConversation(id);
  },

};

export default conversationResolver;

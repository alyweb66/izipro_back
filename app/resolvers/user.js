import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  messages({ name, id }, _, { dataSources }) {
    debug(`get all message from: ${name}`);
    return dataSources.dataDB.message.findByUser(id);
  },
};

export default UserResolver;

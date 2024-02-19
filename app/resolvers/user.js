import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  messages({ first_name: firstName, id }, _, { dataSources }) {
    debug(`get all messages from: ${firstName}`);
    return dataSources.dataDB.message.findByUser(id);
  },
};

export default UserResolver;

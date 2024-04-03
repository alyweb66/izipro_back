import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:user`);

const UserResolver = {
  messages({ first_name: firstName, id }, _, { dataSources }) {
    debug(`get all messages from: ${firstName}`);
    return dataSources.dataDB.message.findByUser(id);
  },
  requests({ id }, _, { dataSources }) {
    debug(`get all request from user id: ${id}`);
    return dataSources.dataDB.request.getRequestByUserId(id);
  },
};

export default UserResolver;

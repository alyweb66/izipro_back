import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:message`);

const UserResolver = {
  user({ first_name: firstName, user_id: id }, _, { dataSources }) {
    debug(`get user from: ${firstName}`);
    return dataSources.dataDB.user.findByPk(id);
  },
};

export default UserResolver;

import Debug from 'debug';
import { ForbiddenError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:message`);

const UserResolver = {
  user({ first_name: firstName, user_id: id }, _, { dataSources }) {
    if (dataSources.userData.id !== id) {
      throw new ForbiddenError('Not authorized');
    }
    debug(`get user from: ${firstName}`);
    return dataSources.dataDB.user.findByPk(id);
  },
};

export default UserResolver;

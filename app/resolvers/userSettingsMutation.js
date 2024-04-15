import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:userSettingsMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function userSetting(_, { input }, { dataSources }) {
  debug('update user setting');
  debugInDevelopment('input', input);

  try {
    const userSettings = await dataSources.dataDB.userSetting.updateUserSetting(
      input.user_id,
      input,
    );

    if (!userSetting) {
      throw new ApolloError('Error updating user setting');
    }

    dataSources.dataDB.user.cache.clear();
    return userSettings;
  } catch (error) {
    throw new ApolloError('Error updating user setting');
  }
}

export default { userSetting };

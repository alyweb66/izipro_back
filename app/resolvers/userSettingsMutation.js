import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:userSettingsMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
/**
 * Updates the user's settings.
 *
 * @param {Object} _ - Unused parameter.
 * @param {Object} args - The arguments object.
 * @param {{name: string,
 * content: string,
 * range: number,
 * user_id: number}} args.input - The input object containing user settings.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources object.
 * @returns {Promise<Object>} - Returns the updated user settings object.
 * @throws {ApolloError} - Throws an error if updating user settings fails.
 */
async function userSetting(_, { input }, { dataSources }) {
  debug('update user setting');
  debugInDevelopment('input', input);

  try {
    const userSettings = await dataSources.dataDB.userSetting.updateUserSetting(
      input.user_id,
      input,
    );

    if (!userSetting) {
      throw new GraphQLError('Error updating user setting', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    // dataSources.dataDB.user.cache.clear();
    return userSettings;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error updating user setting', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

export default { userSetting };

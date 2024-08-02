import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:notificationPushMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * Creates a notification.
 *
 * @param {*} _ - The parent object (not used).
 * @param {Object} params - The parameters object.
 * @param {Object} params.input - The input object containing the notification details.
 * @param {number} params.input.user_id - The ID of the user.
 * @param {string} params.input.endpoint - The endpoint of the notification.
 * @param {string} params.input.auth_token - The authentication token for the notification.
 * @param {string} params.input.public_key - The public key for the notification.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>}
 * A promise that resolves to true if the notification is created successfully.
 * @throws {ApolloError} Throws an error if there is an issue creating the notification.
 */
async function createNotificationPush(_, { input }, { dataSources }) {
  debug('create notificationPush');
  debugInDevelopment('input', input);

  if (dataSources.userData.id !== input.user_id) {
    throw new ApolloError('Unauthorized');
  }

  try {
    const isCreatedNotification = await dataSources.dataDB.notification.findByUser(
      input.user_id,
    );

    // check if the isCreatedNotification value is the same than the input value
    if (isCreatedNotification.endpoint === input.endpoint
        && isCreatedNotification.auth_token === input.auth_token
        && isCreatedNotification.public_key === input.public_key) {
      return true;
    }

    const createdNotification = await dataSources.dataDB.notification.create(input.user_id);
    if (!createdNotification) {
      throw new ApolloError('Error creating notification');
    }
    return true;
  } catch (error) {
    debug('Error', error);
    throw new ApolloError('Error creating notification');
  }
}

/**
 * Deletes a notification.
 *
 * @param {Object} _ - Unused parameter.
 * @param {Object} params - The parameters object.
 * @param {Object} params.input - The input object containing notification details.
 * @param {number} params.input.id - The ID of the notification to delete.
 * @param {string} params.input.endpoint - The endpoint of the notification to delete.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources object.
 * @param {Object} context.dataSources.dataDB - The dataDB object.
 * @param {Object} context.dataSources.dataDB.notification - The notification data source.
 * @returns {Promise<boolean>} - Returns true if the notification was successfully deleted.
 * @throws {ApolloError} - Throws an error if the deletion fails.
 */
async function deleteNotificationPush(_, { input }, { dataSources }) {
  debug('delete notificationPush');

  try {
    await dataSources.dataDB.notification.deleteNotification(input.user_id, input.endpoint);
    return true;
  } catch (error) {
    debug('Error', error);
    throw new ApolloError('Error deleting notification');
  }
}

export default { createNotificationPush, deleteNotificationPush };

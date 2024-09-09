import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:notificationMutation`);

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
 * @param {boolean} params.input.email_notification - The email notification.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>}
 * A promise that resolves to true if the notification is created successfully.
 * @throws {ApolloError} Throws an error if there is an issue creating the notification.
 */
async function createNotification(_, { input }, { dataSources }) {
  debug('create notification');
  debugInDevelopment('input', input);

  if (dataSources.userData.id !== input.user_id) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' } });
  }

  try {
    const isCreatedNotification = await dataSources.dataDB.notification.findByUser(
      input.user_id,
    );

    if (isCreatedNotification) {
      throw new GraphQLError('User notification already exists', { extensions: { code: 'BAD REQUEST' } });
    }

    const createdNotification = await dataSources.dataDB.notification.create(input.user_id);
    if (!createdNotification) {
      throw new GraphQLError('Error creating notification', { extensions: { code: 'BAD REQUEST' } });
    }
    return true;
  } catch (error) {
    debug('Error', error);
    throw new GraphQLError('Error creating notification', { extensions: { code: 'BAD REQUEST' } });
  }
}

/**
 * Creates a notification.
 *
 * @param {*} _ - The parent object (not used).
 * @param {Object} params - The parameters object.
 * @param {Object} params.input - The input object containing the notification details.
 * @param {number} params.input.user_id - The ID of the user.
 * @param {boolean} params.input.email_notification - The email notification.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>}
 * A promise that resolves to true if the notification is created successfully.
 * @throws {ApolloError} Throws an error if there is an issue creating the notification.
 */
async function updateNotification(_, { input }, { dataSources }) {
  debug('update notification');
  debugInDevelopment('input', input);

  if (dataSources.userData.id !== input.user_id) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED' } });
  }

  try {
    const isCreatedNotification = await dataSources.dataDB.notification.findByUser(
      input.user_id,
    );

    if (!isCreatedNotification) {
      throw new GraphQLError('User notification does not exist', { extensions: { code: 'BAD REQUEST' } });
    }

    const updatedNotification = await dataSources.dataDB.notification.update(
      input.user_id,
      { email_notification: input.email_notification },
    );
    if (!updatedNotification) {
      throw new GraphQLError('Error updating notification', { extensions: { code: 'BAD REQUEST' } });
    }
    return true;
  } catch (error) {
    debug('Error', error);
    throw new GraphQLError('Error updating notification', { extensions: { code: 'BAD REQUEST' } });
  }
}

export default { createNotification, updateNotification };

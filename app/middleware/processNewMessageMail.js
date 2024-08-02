import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';
import { newMessageEmail } from './sendEmail.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:checkViewedBeforeSendEmail`);

/**
 * Check if the message has been viewed before sending an email
 *
 * @param {string} message - The message object containing conversation_id and request_id
 * @param {Object} dataSources - The data sources object containing the database access methods
 * @param {number} userId - An array of user IDs who have not viewed the conversation
 * @returns {Promise<boolean>} -
 * Returns false if the user has not viewed the conversation or if an error occurs
 * @throws {ApolloError} - Throws an error if there is an issue with the database query
 */
export default async function checkViewedBeforeSendEmail(
  message,
  dataSources,
  userId,
  emailNotification,
) {
  try {
    if (!emailNotification) {
      return;
    }
    /* const userId = await
    dataSources.dataDB.userHasNotViewedConversation.getUserByConversationId(
      message.conversation_id,
    ); */

    if (!userId) {
      return;
    }

    if (userId !== 0) {
      const userData = await dataSources.dataDB.user.findByPk(userId);

      const request = await dataSources.dataDB.request.findByPk(message.request_id);

      if (userData.id && userData.id !== 0) {
        newMessageEmail(userData, request, message);
      }
    }
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error check viewed before send email');
  }
}

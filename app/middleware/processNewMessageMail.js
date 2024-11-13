import Debug from 'debug';
import { GraphQLError } from 'graphql';
import { newMessageEmail } from './sendEmail.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:checkViewedBeforeSendEmail`);

/**
 * Check if the message has been viewed before sending an email
 *
 * @param {{id: number,
 * conversation_id: number,
 * content: string,
 * user_id: number,
 * created_at: string,
 * request_id: number,
 * }} message - The message object containing conversation_id and request_id
 * @param {Object} dataSources - The data sources object containing the database access methods
 * @param {boolean} emailNotification - The email notification status
 * @returns {Promise<boolean>} -
 * Returns false if the user has not viewed the conversation or if an error occurs
 * @throws {ApolloError} - Throws an error if there is an issue with the database query
 */
export default async function checkViewedBeforeSendEmail(
  message,
  dataSources,
  emailNotification,
) {
  try {
    if (!emailNotification) {
      return;
    }
    dataSources.dataDB.user.findByPkLoader.clear(message.user_id);
    const ownerMessageData = await dataSources.dataDB.user.findByPk(message.user_id);
    // get user id who has not viewed the conversation
    const userId = await
    dataSources.dataDB.userHasNotViewedConversation.getUserByConversationId(
      message.conversation_id,
    );
    console.log('userNotVieweedConv', userId);

    if (!userId) {
      return;
    }

    if (userId.length > 0) {
      const userData = await dataSources.dataDB.user.findByPk(userId[0].user_id);

      const request = await dataSources.dataDB.request.findByPk(message.request_id);
      console.log('userData', userData);

      if (userData.id && userData.id !== 0) {
        console.log('send email');

        newMessageEmail(userData, request, message, ownerMessageData);
      }
    }
  } catch (error) {
    debug('error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}

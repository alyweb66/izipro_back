import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';
import { newMessageEmail } from './sendEmail.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:checkViewedBeforeSendEmail`);

export default async function checkViewedBeforeSendEmail(message, dataSources) {
  try {
    const userId = await
    dataSources.dataDB.userHasNotViewedConversation.getUserByConversationId(
      message.conversation_id,
    );

    if (!userId) {
      return false;
    }

    if (userId.length > 0) {
      const userData = await dataSources.dataDB.user.findByPk(userId[0].user_id);

      const request = await dataSources.dataDB.request.findByPk(message.request_id);

      if (userData.id && userData.id !== 0) {
        newMessageEmail(userData, request, message);
      }
    }

    return false;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error check viewed before send email');
  }
}

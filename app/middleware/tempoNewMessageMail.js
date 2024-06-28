import { newMessageEmail } from './sendEmail.js';

export default async function checkViewedBeforeSendEmail(message, dataSources) {
  const userId = await
  dataSources.dataDB.userHasNotViewedConversation.getUserByConversationId(message.conversation_id);
console.log('userId', userId);
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
}

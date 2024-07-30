import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';
import pubsub from '../middleware/pubSub.js';
import checkViewedBeforeSendEmail from '../middleware/processNewMessageMail.js';
import sendPushNotification from '../middleware/webPush.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:messageMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * create a message
 *
 * @param {number} args.id - The ID of the user creating the message.
 * @param {{content: string,
 * user_id: number,
 * conversation_id:
 * number, media: Array}} args.input - The input object containing the message details.
  * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>} A promise that resolves to true
 * if the message was created successfully.
 * @throws {ApolloError} If there is an error creating the message.
 */
async function createMessage(_, { id, input }, { dataSources }) {
  debug('create message');

  debugInDevelopment('input', input);
  if (dataSources.userData.id !== id) {
    throw new AuthenticationError('Unauthorized');
  }
  try {
    const messageInput = { ...input };
    delete messageInput.media;

    // create message
    const isCreatedMessage = await dataSources.dataDB.message.create(messageInput);
    if (!isCreatedMessage) {
      throw new ApolloError('Error creating message');
    }

    // mapping the media array to createReadStream
    let isCreatedMessageMedia;
    if (input.media && input.media.length > 0 && input.media[0].file) {
      const ReadStreamArray = await Promise.all(input.media.map(async (upload) => {
        const fileUpload = upload.file;
        if (!fileUpload) {
          throw new Error('File upload not complete');
        }
        const { createReadStream, filename, mimetype } = await fileUpload.file;
        const readStream = createReadStream();
        const file = {
          filename,
          mimetype,
          buffer: readStream,
        };
        return file;
      }));

      // calling the handleUploadedFiles function to compress the images and save them
      const media = await handleUploadedFiles(ReadStreamArray);

      // create media
      const createMedia = await dataSources.dataDB.media.createMedia(media);
      if (!createMedia) {
        throw new ApolloError('Error creating media');
      }

      // get the media ids from the createMedia array
      const mediaIds = createMedia.map((obj) => obj.insert_media).flat();

      // create message_has_media
      const messageId = isCreatedMessage.id;
      isCreatedMessageMedia = await dataSources.dataDB.messageHasMedia.createMessageHasMedia(
        messageId,
        mediaIds,
      );

      if (!isCreatedMessageMedia
        || (isCreatedMessageMedia.insert_message_has_media === false)) {
        throw new ApolloError('Error creating message_has_media');
      }
    }

    await dataSources.dataDB.conversation.updateUpdatedAtConversation(
      input.conversation_id,
    );

    const message = await dataSources.dataDB.message.findByUserConversation(
      // dataSources.userData.id,
      input.conversation_id,
      0,
      1,
    );
    //* Notification push starting
    // get the user that has not viewed the conversation
    const targetUser = await
    dataSources.dataDB.userHasNotViewedConversation.getUserByConversationId(
      input.conversation_id,
    );

    // clear cache for the conversation
    dataSources.dataDB.notification.findByUserIdsLoader.clear(targetUser[0].user_id);
    // get the notification subscription of the target user
    const userNotification = await dataSources.dataDB.notification.findByUser(
      targetUser[0].user_id,
    );

    // send push notification to users that have not viewed the conversation
    if (userNotification) {
      userNotification.forEach((element) => {
        const subscription = {
          endpoint: element.endpoint,
          keys: {
            p256dh: element.public_key,
            auth: element.auth_token,
          },
        };

        const payload = JSON.stringify({
          title: 'Vous avez un nouveau message',
          message: 'Cliquez pour le consulter',
          // body: message[0].content, // Assurez-vous que `message[0].content`
          // contient le texte du message
          icon: process.env.LOGO_EMAIL_URL,
          // url: `https://yourwebsite.com/conversation/${input.conversation_id}`,
        });
        // Envoyer la notification push
        sendPushNotification(subscription, payload);
      });
    }
    //* Notification push ending

    // send email to users that have not viewed the conversation after 5 min
    setTimeout(() => {
      checkViewedBeforeSendEmail(message[0], dataSources, targetUser[0].user_id);
    }, 60000);

    debugInDevelopment('subscriptionResult', message);
    // publish the request to the client
    pubsub.publish('MESSAGE_CREATED', {
      messageAdded: message,
    });

    debug('created media undefined if no media', isCreatedMessageMedia);
    return true;
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

export default { createMessage };

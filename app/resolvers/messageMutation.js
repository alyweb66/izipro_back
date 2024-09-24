import Debug from 'debug';
import { GraphQLError } from 'graphql';
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
 * Create a message
 *
 * @param {Object} _ - Unused parameter.
 * @param {Object} args - The arguments object.
 * @param {number} args.id - The ID of the user creating the message.
 * @param {Object} args.input - The input object containing the message details.
 * @param {string} args.input.content - The content of the message.
 * @param {number} args.input.user_id - The ID of the user creating the message.
 * @param {number} args.input.conversation_id - The ID of the conversation.
 * @param {Array<Object>} args.input.media - An array of media objects.
 * @param {Object} context - The context object.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>} A promise that resolves to true
 * if the message was created successfully.
 * @throws {GraphQLError} If there is an error creating the message.
 */
async function createMessage(_, { id, input }, { dataSources }) {
  debug('create message');

  debugInDevelopment('input', input);
  if (dataSources.userData.id !== id) {
    throw new GraphQLError('Access denied', { extensions: { code: 'UNAUTHORIZED', httpStatus: 401 } });
  }
  try {
    const messageInput = { ...input };
    delete messageInput.media;

    // create message
    const isCreatedMessage = await dataSources.dataDB.message.create(messageInput);
    if (!isCreatedMessage) {
      throw new GraphQLError('No created message', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    // mapping the media array to createReadStream
    let isCreatedMessageMedia;

    if (input.media && input.media.length > 0) {
      const ReadStreamArray = await Promise.all(input.media.map(async (upload, index) => {
        if (!upload.file.promise) {
          throw new GraphQLError(`File upload not complete for media at index ${index}`, {
            extensions: { code: 'BAD_REQUEST', httpStatus: 400 },
          });
        }
        const fileUpload = await upload.file.promise;
        if (!fileUpload) {
          throw new GraphQLError('File upload not complete', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
        }
        const { createReadStream, filename, mimetype } = await fileUpload;
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
        throw new GraphQLError('Error creating media', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
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
        // remove message from database if media creation failed and no content
        if (!input.content) {
          await dataSources.dataDB.message.delete(messageId);
        }
        throw new GraphQLError('Error creating message_has_media', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
      }
    }

    // update conversation updated_at
    await dataSources.dataDB.conversation.updateUpdatedAtConversation(
      input.conversation_id,
    );

    // get the message
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

    // get the notification subscription of the target user
    const userNotification = await dataSources.dataDB.notification.getAllNotifications(
      targetUser[0].user_id,
    );

    // send push notification to users that have not viewed the conversation
    if (userNotification[0].endpoint) {
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
          body: 'Cliquez pour le consulter',
          // body: message[0].content, // Assurez-vous que `message[0].content`
          // contient le texte du message
          icon: process.env.LOGO_NOTIFICATION_URL,
          // url: `https://yourwebsite.com/conversation/${input.conversation_id}`,
          // badge: process.env.LOGO_NOTIFICATION_URL,
          tag: input.conversation_id,
          renotify: true,
        });
        // Envoyer la notification push
        sendPushNotification(subscription, payload);
      });
    }
    //* Notification push ending

    // send email to users that have not viewed the conversation after 5 min
    setTimeout(() => {
      checkViewedBeforeSendEmail(
        message[0],
        dataSources,
        userNotification[0].user_id,
        userNotification[0].email_notification,
      );
    }, 300000);

    debugInDevelopment('subscriptionResult', message);
    // publish the request to the client
    pubsub.publish('MESSAGE_CREATED', {
      messageAdded: message,
    });

    debug('created media undefined if no media', isCreatedMessageMedia);
    return true;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}

export default { createMessage };

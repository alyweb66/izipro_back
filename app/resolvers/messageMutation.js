import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';
import pubsub from '../middleware/pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:messageMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

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

    const subscriptionResult = await dataSources.dataDB.message.findByUserConversation(
      dataSources.userData.id,
      input.conversation_id,
      0,
      1,
    );

    debugInDevelopment('subscriptionResult', subscriptionResult);
    // publish the request to the client
    pubsub.publish('MESSAGE_CREATED', {
      messageAdded: subscriptionResult,
    });

    debug('created media undefined if no media', isCreatedMessageMedia);
    return true;
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

export default { createMessage };

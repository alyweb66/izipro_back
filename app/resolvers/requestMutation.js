import Debug from 'debug';
import { GraphQLError } from 'graphql';
/* import fs from 'fs';
import path from 'path';
import url from 'url'; */
import pubsub from '../middleware/pubSub.js';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';
import checkViewedBeforeSendRequestEmail from '../middleware/processNewClientRequestMail.js';
import sendPushNotification from '../middleware/webPush.js';

// __dirname not on module, this is the way to use it.
/* const fileName = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);
const directoryPath = path.join(dirname, '..', '..', 'public', 'media'); */

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
// function to delete the files from the public folder
/* function deleteFile(file) {
  const filePath = path.join(directoryPath, file);

  fs.unlink(filePath, (err) => {
    if (err) {
      debugInDevelopment(`Error deleting file: ${err}`);
    } else {
      debugInDevelopment(`File ${file} deleted successfully`);
    }
  });
} */

// function to create the request
/**
 * Creates a new request based on the provided input.
 *
 * @async
 * @function createRequest
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {{urgent: boolean,
 * title: string,
 * message: string,
 * city: string,
 * lng: number,
 * lat: number,
 * range: number,
 * user_id: number,
 * job_id: number,
 *  media: Array}} args.input - The input object containing the request details.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves
 * to the created request object with media and conversation.
 * @throws {AuthenticationError} If the user is not authorized to create the request.
 * @throws {ApolloError} If there is an error creating the request or associated media.
 */
async function createRequest(_, { input }, { dataSources }) {
  debug('create request');
  debugInDevelopment('input', input.media);

  if (dataSources.userData.id !== input.user_id) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED', httpStatus: 401 } });
  }
  try {
    const requestInput = { ...input };
    delete requestInput.media;

    // create request
    const isCreatedRequest = await dataSources.dataDB.request.create(requestInput);
    if (!isCreatedRequest) {
      throw new GraphQLError('Error creating request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    // mapping the media array to createReadStream
    const ReadStreamArray = await Promise.all(input.media.map(async (upload, index) => {
      if (!upload.file.promise) {
        throw new GraphQLError(`File upload not complete for media at index ${index}`, { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
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

    // create request_has_request_media
    const requestId = isCreatedRequest.id;
    const isCreatedRequestMedia = await dataSources.dataDB.requestHasMedia.createRequestHasMedia(
      requestId,
      mediaIds,
    );

    if (!isCreatedRequestMedia
      || (isCreatedRequestMedia.insert_request_has_media === false)) {
      throw new GraphQLError('Error creating request_has_media', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }
    // get the request with media and conversation
    const subscriptionResult = await dataSources.dataDB.request.getSubscritpionRequest(
      [isCreatedRequest.job_id],
      dataSources.userData.id,
      requestId,
    );

    // get subscription for request
    const subscription = await dataSources.dataDB.subscription.findByUser(dataSources.userData.id);

    // get the subscriber_id for request
    const subscriberIds = subscription
      .filter((sub) => sub.subscriber === 'request')
      .flatMap((sub) => sub.subscriber_id);

    // add request_id in the array of subscriber_id
    subscriberIds.push(requestId);

    // update subscription for request
    const isUpdatedSubscription = await dataSources.dataDB.subscription.createSubscription(
      dataSources.userData.id,
      'request',
      subscriberIds,
    );

    //* Notification push starting
    // get the user that has not viewed the request
    const targetUser = await
    dataSources.dataDB.userHasNotViewedRequest.getUserByRequestId(
      isCreatedRequest.id,
    );

    // filter only the id of the user
    const userId = targetUser.map((user) => user.user_id);

    // clear cache for the conversation
    dataSources.dataDB.notificationPush.findByUserIdsLoader.clear(userId);
    // get the notification subscription of the target users
    /* const usersNotification = await dataSources.dataDB.notificationPush.findByUser(
      userId,
    ); */
    // get the notification subscription of the target user
    const usersNotification = await dataSources.dataDB.notification.getAllNotifications(
      userId,
    );
    const flattenedNotifications = usersNotification.flat();

    // send push notification to users that have not viewed the conversation
    if (flattenedNotifications.length > 0 && flattenedNotifications[0].endpoint) {
      flattenedNotifications.forEach((element) => {
        const subscriptionPush = {
          endpoint: element.endpoint,
          keys: {
            p256dh: element.public_key,
            auth: element.auth_token,
          },
        };

        const payload = JSON.stringify({
          title: 'Vous avez une nouvelle demande',
          body: 'Cliquez pour la consulter',
          // body: message[0].content, // Assurez-vous que `message[0].content`
          icon: process.env.LOGO_NOTIFICATION_URL,
          // url: `https://yourwebsite.com/conversation/${input.conversation_id}`,
          // badge: process.env.LOGO_NOTIFICATION_URL,
          tag: input.conversation_id,
          renotify: true,
        });

        // Envoyer la notification push
        sendPushNotification(subscriptionPush, payload);
      });
    }
    //* Notification push ending

    // send email to users that have not viewed the request after 5 min
    setTimeout(() => {
      checkViewedBeforeSendRequestEmail(
        subscriptionResult[0],
        dataSources,
        flattenedNotifications,
      );
    }, 300000);

    debug('isUpdatedSubscription', isUpdatedSubscription);

    debugInDevelopment('subscriptionResult', subscriptionResult);
    // publish the request to the client
    pubsub.publish('REQUEST_CREATED', {
      requestAdded: subscriptionResult,
    });

    debug('created media', isCreatedRequestMedia.insert_request_has_media);
    return subscriptionResult[0];
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error create request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

// function to delete the request
/**
 * Deletes a request by marking it as deleted.
 *
 * @async
 * @function deleteRequest
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {{id: number, user_id: number}} args.input -
 * The input object containing the request details.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<boolean>} A promise that resolves to
 *  true if the request was successfully deleted.
 * @throws {AuthenticationError} If the user is not authorized to delete the request.
 * @throws {ApolloError} If there is an error deleting the request.
 */
async function deleteRequest(_, { input }, { dataSources }) {
  debug('delete request');
  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED', httpStatus: 401 } });
    }

    const newInput = { deleted_at: new Date() };

    const isDeletedRequest = await dataSources.dataDB.request.update(input.id, newInput);

    if (!isDeletedRequest) {
      throw new GraphQLError('Error deleting request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    // read the public folder and delete all the files
    /* fs.readdir(path.join(directoryPath), (err) => {
      if (err) {
        debugInDevelopment(`Error reading directory: ${err}`);
      } else {
        input.image_names.forEach((file) => {
          deleteFile(file);
        });
      }
    }); */

    return true;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error delete request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

export default {
  createRequest,
  deleteRequest,
};

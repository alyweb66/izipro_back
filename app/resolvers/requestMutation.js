import Debug from 'debug';
import { GraphQLError } from 'graphql';
/* import fs from 'fs';
import path from 'path';
import url from 'url'; */
// import { request } from 'express';
import pubsub from '../middleware/pubSub.js';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';
import checkViewedBeforeSendRequestEmail from '../middleware/processNewClientRequestMail.js';
import sendNotificationsPush from '../middleware/sendNotificationPush.js';

// __dirname not on module, this is the way to use it.
/* const fileName = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);
const directoryPath = path.join(dirname, '..', '..', 'public', 'media'); */

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:requestMutation`);

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
  debugInDevelopment('input', input);

  if (dataSources.userData.id !== input.user_id) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED', httpStatus: 401 } });
  }
  try {
    // stock the user data in a variable to not loose data in dataSource by clearing the cache
    const userDataSources = dataSources.userData;

    const requestInput = { ...input };
    delete requestInput.media;

    // create request
    const isCreatedRequest = await dataSources.dataDB.request.create(requestInput);
    if (!isCreatedRequest) {
      throw new GraphQLError('Error creating request', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    let requestId;
    let isCreatedRequestMedia;
    // mapping the media array to createReadStream
    if (input.media && input.media.length > 0) {
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
      const media = await handleUploadedFiles(ReadStreamArray, isCreatedRequest.id, dataSources);

      // create media
      const createMedia = await dataSources.dataDB.media.createMedia(media);
      if (!createMedia) {
        throw new GraphQLError('Error creating media', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
      }

      // get the media ids from the createMedia array
      const mediaIds = createMedia.map((obj) => obj.insert_media).flat();

      // create request_has_request_media
      requestId = isCreatedRequest.id;
      isCreatedRequestMedia = await dataSources.dataDB.requestHasMedia.createRequestHasMedia(
        requestId,
        mediaIds,
      );

      if (!isCreatedRequestMedia
        || (isCreatedRequestMedia.insert_request_has_media === false)) {
        throw new GraphQLError('Error creating request_has_media', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
      }
    }

    // get the request with media and conversation
    const subscriptionResult = await dataSources.dataDB.request.getSubscritpionRequest(
      [isCreatedRequest.job_id],
      dataSources.userData.id,
      isCreatedRequest.id,
    );

    dataSources.dataDB.subscription.findByUserIdsLoader.clear(dataSources.userData.id);
    // get subscription for request
    const subscription = await dataSources.dataDB.subscription.findByUser(userDataSources.id);

    // get the subscriber_id for request
    const subscriberIds = subscription
      .filter((sub) => sub.subscriber === 'request')
      .flatMap((sub) => sub.subscriber_id);

    // add request_id in the array of subscriber_id
    subscriberIds.push(isCreatedRequest.id);

    // update subscription for request
    const isUpdatedSubscription = await dataSources.dataDB.subscription.createSubscription(
      userDataSources.id,
      'request',
      subscriberIds,
    );

    // send notification to users that have not viewed the request
    const { notifications } = await
    sendNotificationsPush(isCreatedRequest.id, dataSources);

    console.log('notifications', notifications);

    // send email to users that have not viewed the request after 5 min
    setTimeout(() => {
      checkViewedBeforeSendRequestEmail(
        subscriptionResult[0],
        dataSources,
        notifications,
      );
    }, 300000);

    debug('isUpdatedSubscription', isUpdatedSubscription);

    debugInDevelopment('subscriptionResult', subscriptionResult);
    // publish the request to the client
    pubsub.publish('REQUEST_CREATED', {
      requestAdded: subscriptionResult,
    });
    if (input.media && input.media.length > 0) {
      debug('created media', isCreatedRequestMedia.insert_request_has_media);
    }
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
 * The input object containing the id of the request.
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

    // get all subscription for the user
    dataSources.dataDB.subscription.findByUserIdsLoader.clear(input.user_id);
    const subscription = await dataSources.dataDB.subscription.findByUser(input.user_id);

    // remove request_id in the array of subscriber_id
    // for subscriber request and subscriber conversation
    if (subscription.length === 0) {
      return true;
    }

    const subscriberRequestIds = subscription
      ?.filter((sub) => sub.subscriber === 'request')
      .flatMap((sub) => sub.subscriber_id) || [];

    const subscriberConversationIds = subscription
      ?.filter((sub) => sub.subscriber === 'conversation')
      .flatMap((sub) => sub.subscriber_id) || [];

    // get all conversation id for the request
    const requestConversation = await dataSources.dataDB.conversation
      .getConversationByRequest(input.id);

    const requestConversationids = requestConversation?.map(
      (conversation) => conversation.id,
    ) || [];

    const newSubscriberConversationIds = subscriberConversationIds?.filter(
      (id) => !requestConversationids?.includes(id),
    );
    const newSubscriberRequestIds = subscriberRequestIds?.filter((id) => id !== input.id);

    // Update subscription for request and conversation
    await Promise.all([
      dataSources.dataDB.subscription.createSubscription(input.user_id, 'request', newSubscriberRequestIds),
      dataSources.dataDB.subscription.createSubscription(input.user_id, 'conversation', newSubscriberConversationIds),
      dataSources.dataDB.userHasNotViewedConversation.deleteNotViewedConversation({
        user_id: input.user_id,
        conversation_id: requestConversationids, // Convert Set back to Array
      }),
      // dataSources.dataDB.userHasHiddingClientRequest.deleteUserHiddingClientRequest(input.id),
      dataSources.dataDB.userHasNotViewedRequest.deleteNotViewedRequestById(input.id),
    ]);
    // remove request

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

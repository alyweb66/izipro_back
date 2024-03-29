import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function createRequest(_, { input }, { dataSources }) {
  debug('create request');
  debugInDevelopment('input', input.media);
  if (dataSources.userData.id !== input.user_id) {
    throw new AuthenticationError('Unauthorized');
  }
  try {
    const requestInput = { ...input };
    delete requestInput.media;

    // create request
    const isCreatedRequest = await dataSources.dataDB.request.create(requestInput);
    if (!isCreatedRequest) {
      throw new ApolloError('Error creating request');
    }

    // mapping the media array to createReadStream
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
    const result = await handleUploadedFiles(ReadStreamArray);

    const mediaInput = result.map((media) => ({
      ...media,
      user_id: input.user_id,
    }));

    // create media
    const createMedia = await dataSources.dataDB.media.createRequestMedia(mediaInput);
    if (!createMedia) {
      throw new ApolloError('Error creating media');
    }

    // get the media ids from the createMedia array
    const mediaIds = createMedia.map((obj) => obj.insert_request_media).flat();

    // create request_has_request_media
    const requestId = isCreatedRequest.id;
    const isCreatedRequestMedia = await dataSources.dataDB.requestHasMedia.createRequestHasMedia(
      requestId,
      mediaIds,
    );
    debug('created media', isCreatedRequestMedia.insert_request_has_request_media);
    if (!isCreatedRequestMedia
       || (isCreatedRequestMedia.insert_request_has_request_media === false)) {
      throw new ApolloError('Error creating request_has_request_media');
    }
    return isCreatedRequest;
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

export default {
  createRequest,
};

import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';
import handleUploadedFiles from '../middleware/media.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 *
 * @param {*} _ parent object
 * @param {*} param1 destructuring input from the mutation
 * @param {*} param2 destructuring dataSources from the context
 * @returns
 */
async function createRequest(_, { input }, { dataSources }) {
  debug('create request');
  debugInDevelopment('input', input.media);
  if (dataSources.userData.id !== input.user_id) {
    throw new AuthenticationError('Unauthorized');
  }
  try {
    const requestInput = { ...input };
    delete requestInput.media;
    const isCreatedRequest = await dataSources.dataDB.request.create(requestInput);
console.log('isCreatedRequest', isCreatedRequest);
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

    const createMedia = await dataSources.dataDB.media.createRequestMedia(mediaInput);
    if (!createMedia) {
      throw new ApolloError('Error creating media');
    }
console.log('createMedia', createMedia[0]);
    const requestHasMedia = createMedia.map((media) => ({
      request_media_id: media.id,
    }));

    const requestId = {
      request_id: isCreatedRequest.id,
    };
console.log('requestId', requestId, 'requestHasMedia', requestHasMedia);
    const isCreatedRequestMedia = await dataSources.dataDB.request.create(
      requestHasMedia,
      requestId,
    );
    console.log('isCreatedRequestMedia', isCreatedRequestMedia);
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

export default {
  createRequest,
};

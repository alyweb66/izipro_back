import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';
import fs from 'fs';
import path from 'path';
import url from 'url';
import pubsub from '../middleware/pubSub.js';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';

// __dirname not on module, this is the way to use it.
const fileName = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);
const directoryPath = path.join(dirname, '..', '..', 'public', 'media');

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
// function to delete the files from the public folder
function deleteFile(file) {
  const filePath = path.join(directoryPath, file);

  fs.unlink(filePath, (err) => {
    if (err) {
      debugInDevelopment(`Error deleting file: ${err}`);
    } else {
      debugInDevelopment(`File ${file} deleted successfully`);
    }
  });
}

// function to create the request
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
    if (!isCreatedRequestMedia
      || (isCreatedRequestMedia.insert_request_has_request_media === false)) {
      throw new ApolloError('Error creating request_has_request_media');
    }
    const subscriptionResult = await dataSources.dataDB.request.getSubscritpionRequest(
      [isCreatedRequest.job_id],
      dataSources.userData.id,
      requestId,
    );
    debugInDevelopment('subscriptionResult', subscriptionResult);
    pubsub.publish('REQUEST_CREATED', {
      requestAdded: subscriptionResult,
    });
    debug('created media', isCreatedRequestMedia.insert_request_has_request_media);
    return isCreatedRequest;
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

// function to delete the request
async function deleteRequest(_, { input }, { dataSources }) {
  debug('delete request');
  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new AuthenticationError('Unauthorized');
    }

    const isDeletedRequest = await dataSources.dataDB.request.delete(input.id);

    if (!isDeletedRequest) {
      throw new ApolloError('Error deleting request');
    }

    // read the public folder and delete all the files
    fs.readdir(path.join(directoryPath), (err) => {
      if (err) {
        debugInDevelopment(`Error reading directory: ${err}`);
      } else {
        input.image_names.forEach((file) => {
          deleteFile(file);
        });
      }
    });

    return true;
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

export default {
  createRequest,
  deleteRequest,
};

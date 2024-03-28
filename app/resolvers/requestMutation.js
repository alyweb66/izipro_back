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
  debugInDevelopment('input', input);
  if (dataSources.userData.id !== input.user_id) {
    throw new AuthenticationError('Unauthorized');
  }
  try {
    const { file } = input.media[0].file;
    const {
      createReadStream, filename, mimetype, encoding,
    } = await file;
    console.log('file', createReadStream, filename, mimetype, encoding);
    const requestInput = { ...input };
    delete requestInput.media;
    const isCreatedRequest = dataSources.dataDB.request.create(requestInput);

    if (!isCreatedRequest) {
      throw new ApolloError('Error creating request');
    }
    handleUploadedFiles(input.media);
  } catch (error) {
    debug('error', error);
    throw new Error(error);
  }
}

export default {
  createRequest,
};

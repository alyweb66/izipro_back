import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';
import { contactSendEmail } from '../middleware/sendEmail.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:contactMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function contactEmail(_, { input }) {
  debug('contact email');
  debugInDevelopment('input', input);

  try {
    contactSendEmail(input);

    return true;
  } catch (error) {
    debug('Error', error);
    throw new ApolloError('Error creating contact');
  }
}

export default { contactEmail };

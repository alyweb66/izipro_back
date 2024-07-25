import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';
import { contactSendEmail } from '../middleware/sendEmail.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:contactMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * Sends a contact email based on the provided input.
 *
 * @async
 * @function contactEmail
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {{first_name: string,
 * last_name: string, email: string, enterprise: string, description: string}}
 *  args.input - The input object containing the contact email details.
 * @returns {Promise<boolean>} A promise that resolves to true if the email was sent successfully.
 * @throws {ApolloError} If there is an error sending the contact email.
 */
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

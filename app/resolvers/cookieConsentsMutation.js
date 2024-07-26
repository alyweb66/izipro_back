import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:cookieConsentsMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * create cookie consents
 *
 * @param {number} args.id - The ID of the user creating the cookie consents.
 * @param {{id: number,
 * cookies_necessary: boolean,
 * cookies_analytics: boolean,
 * cookies_marketing: boolean}} args.input -
 * The input object containing the cookie consents details.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the created cookie consents object.
 * @throws {ApolloError} If there is an error creating the cookie consents.
 */
async function createCookieConsents(_, { id, input }, { dataSources }) {
  debug('create cookie consents');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== id) {
      throw new ApolloError('Unauthorized');
    }
    const newInput = { ...input, user_id: id };
    // create cookie consents
    const isCreatedCookieConsents = await
    dataSources.dataDB.cookieConsents.create(
      newInput,
    );
    if (!isCreatedCookieConsents) {
      throw new ApolloError('Error creating cookie consents');
    }

    return isCreatedCookieConsents;
  } catch (error) {
    debug('Error', error);
    throw new ApolloError('Error creating cookie consents');
  }
}

/**
 *
 * @param {number} args.id - The ID of the user updating the cookie consents.
 * @param {{id: number,
 * cookies_necessary: boolean,
* cookies_analytics: boolean,
* cookies_marketing: boolean}} args.input -
* The input object containing the cookie consents details.
* @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the updated cookie consents object.
 * @throws {ApolloError} If there is an error updating the cookie consents.
 */
async function updateCookieConsents(_, { id, input }, { dataSources }) {
  debug('update cookie consents');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== id) {
      throw new ApolloError('Unauthorized');
    }

    const { id: cookieId, ...rest } = input;

    const isUpdatedCookieConsents = await
    dataSources.dataDB.cookieConsents.update(
      cookieId,
      { ...rest },
    );

    if (!isUpdatedCookieConsents) {
      throw new ApolloError('Error updating cookie consents');
    }

    return isUpdatedCookieConsents;
  } catch (error) {
    debug('Error', error);
    throw new ApolloError('Error updating cookie consents');
  }
}

export default { createCookieConsents, updateCookieConsents };

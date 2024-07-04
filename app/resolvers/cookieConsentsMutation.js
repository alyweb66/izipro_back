import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:cookieConsentsMutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

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
    debugInDevelopment('Error creating cookie consents', error);
    throw new ApolloError('Error creating cookie consents');
  }
}

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
console.log(isUpdatedCookieConsents);
    return isUpdatedCookieConsents;
  } catch (error) {
    debugInDevelopment('Error updating cookie consents', error);
    throw new ApolloError('Error updating cookie consents');
  }
}

export default { createCookieConsents, updateCookieConsents };

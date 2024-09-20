import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:Subscription`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * create Subscription
 * @async
 *@function createSubscription
 * @param {object} _ The parent object, which is not used in this resolver.
 * @param {{user_id: number, subscriber: string, subscriber_id: array}} args.input
 * The input object containing the subscription details.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the created subscription object.
 * @throws {ApolloError} If the user is not authorized to create the subscription.
 */
async function createSubscription(_, { input }, { dataSources }) {
  debug('create subscription');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHORIZED', httpStatus: 401 } });
    }

    const subscription = await dataSources.dataDB.subscription.createSubscription(
      input.user_id,
      input.subscriber,
      input.subscriber_id,
    );

    if (!subscription) {
      throw new GraphQLError('Error creating subscription', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
    }

    return subscription;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError('Error creating subscription', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
  }
}

export default { createSubscription };

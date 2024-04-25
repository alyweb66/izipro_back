import Debug from 'debug';
import {
  AuthenticationError, ApolloError,
} from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:Subscription`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

async function createSubscription(_, { input }, { dataSources }) {
  debug('create subscription');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData.id !== input.user_id) {
      throw new AuthenticationError('Unauthorized');
    }
    /* const actualValue = await dataSources.dataDB.subscription.findByUser(input.user_id);
    console.log('actualValue', actualValue);
    const subscriptionIds = [];
    if (actualValue.lenght > 0) {
    // compare value and remove the same value

      actualValue.subscriber_id.forEach((id) => {
        const isSubscribed = input.subscriber_id.some(
          (value) => value === id,
        );
        console.log('isSubscribed', isSubscribed);

        if (!isSubscribed) {
          console.log('setting subscriptionJob');
          subscriptionIds.push(id);
        // setSubscriptionStore((prevState: SubscriptionProps[] | null) =>
        // [...(prevState || []), job.job_id]);
        }
      });
    }
    console.log('subscriptionIds', subscriptionIds);
    const newSubscription = subscriptionIds.length > 0 ? subscriptionIds : input.subscriber_id; */

    const subscription = await dataSources.dataDB.subscription.createSubscription(
      input.user_id,
      input.subscriber,
      input.subscriber_id,
    );
    if (!subscription) {
      throw new ApolloError('Error creating subscription');
    }
    return subscription;
  } catch (error) {
    debug('error', error);
    throw new ApolloError('Error creating subscription');
  }
}
export default { createSubscription };

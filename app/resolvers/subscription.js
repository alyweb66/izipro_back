import Debug from 'debug';
import { withFilter } from 'graphql-subscriptions';
import pubsub from '../middleware/pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:subscription`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

const Subscription = {
  /* messageAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('MESSAGE_ADDED'),
      (payload, variables) => payload.conversationId === variables.conversationId,
    ),
  }, */

  requestAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('REQUEST_CREATED'),
      (payload, variables) => {
        debugInDevelopment('requestAdded subscription: payload', payload, 'variables', variables);
        return payload.requestAdded.some((request) => variables.ids.includes(request.job_id));
      },
    ),
  },

};

export default Subscription;

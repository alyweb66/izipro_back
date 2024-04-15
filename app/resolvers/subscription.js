import Debug from 'debug';
import { withFilter } from 'graphql-subscriptions';
import pubsub from '../middleware/pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:subscription`);

debug('subscription');

const Subscription = {
  /* messageAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('MESSAGE_ADDED'),
      (payload, variables) => payload.conversationId === variables.conversationId,
    ),
  }, */

  requestAdded: {
    subscribe: () => pubsub.asyncIterator(['REQUEST_CREATED']),
  },

};

export default Subscription;

import Debug from 'debug';
import { PubSub, withFilter } from 'graphql-subscriptions';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:subscription`);

const pubsub = new PubSub();

debug('subscription');

const Subscription = {
  messageAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('MESSAGE_ADDED'),
      (payload, variables) => payload.conversationId === variables.conversationId,
    ),
  },
};

export default Subscription;

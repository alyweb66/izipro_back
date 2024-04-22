import Debug from 'debug';
import { withFilter } from 'graphql-subscriptions';
import pubsub from '../middleware/pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:subscription`);

function debugInDevelopment(...args) {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', ...args);
  }
}

const Subscription = {
  messageAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('MESSAGE_CREATED'),
      (payload, variables) => payload.messageAdded.some(
        (message) => {
          const isMessageForConversation = variables.conversation_ids.includes(
            message.conversation_id,
          );
          if (isMessageForConversation) {
            debugInDevelopment('messageAdded subscription: payload', payload, 'variables', variables);
          }
          return isMessageForConversation;
        },
      ),
    ),
  },

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

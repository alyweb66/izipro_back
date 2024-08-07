import { PubSub } from 'graphql-subscriptions';
// need to do this to use the PubSub class
// without this, the PubSub class will not be
// available to the resolvers
const pubSub = new PubSub();

export default pubSub;

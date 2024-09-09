import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:query`);

export default {
  /**
 * Retrieves users based on provided IDs, offset, and limit.
 *
 * @function users
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {Array<number>} args.ids - The IDs of the users to retrieve.
 * @param {number} args.offset - The offset for the query.
 * @param {number} args.limit - The limit for the query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of users.
 * @throws {ApolloError} If there is an error retrieving users.
 */
  users(_, { ids, offset, limit }, { dataSources }) {
    try {
      debug(`get all users conversations where ids: ${ids}`);
      return dataSources.dataDB.user.findUsersByIds(ids, offset, limit);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get all users conversations where ids', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves all conversations with pagination.
 *
 * @function conversations
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.offset - The offset for the query.
 * @param {number} args.limit - The limit for the query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of conversations.
 * @throws {ApolloError} If there is an error retrieving conversations.
 */
  conversations(_, { offset, limit }, { dataSources }) {
    try {
      debug('get all conversations');
      return dataSources.dataDB.conversation.getConversationByUser(offset, limit);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get all conversations', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves a conversation by its ID.
 *
 * @function conversation
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.id - The ID of the conversation to retrieve.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Object>} A promise that resolves to the conversation object.
 * @throws {ApolloError} If there is an error retrieving the conversation.
 */
  conversation(_, { id }, { dataSources }) {
    try {
      debug(`get conversation with id ${id}`);
      return dataSources.dataDB.conversation.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get conversation with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves messages by conversation ID with pagination.
 *
 * @function messages
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.conversationId - The ID of the conversation to retrieve messages for.
 * @param {number} args.offset - The offset for the query.
 * @param {number} args.limit - The limit for the query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of messages.
 * @throws {ApolloError} If there is an error retrieving messages.
 */
  messages(_, { conversationId, offset, limit }, { dataSources }) {
    try {
      debug('get all messages by conversation_id');
      return dataSources.dataDB.message.findByConversationId(conversationId, offset, limit);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get all messages by conversation_id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves a message by its ID.
 *
 * @function message
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.id - The ID of the message to retrieve.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Object>} A promise that resolves to the message object.
 * @throws {ApolloError} If there is an error retrieving the message.
 */
  message(_, { id }, { dataSources }) {
    try {
      debug(`get message with id ${id}`);
      return dataSources.dataDB.message.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get message with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves the current user.
 *
 * @async
 * @function user
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {ApolloError} If there is an error retrieving the user.
 */
  async user(_, __, { dataSources }) {
    try {
      if (!dataSources.userData) {
        throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      debug(`get user with id ${dataSources.userData.id}`);
      // clear cache
      dataSources.dataDB.user.findByPkLoader.clear(dataSources.userData.id);
      const userData = await dataSources.dataDB.user.findByPk(dataSources.userData.id);
      return userData;
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get user with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves a request by its ID.
 *
 * @function request
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.id - The ID of the request to retrieve
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Object>} A promise that resolves to the request object.
 * @throws {ApolloError} If there is an error retrieving the request.
 */
  request(_, { id }, { dataSources }) {
    try {
      debug(`get request with id ${id}`);
      return dataSources.dataDB.request.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get request with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves all media.
 *
 * @function medias
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of media.
 * @throws {ApolloError} If there is an error retrieving media.
 */
  medias(_, __, { dataSources }) {
    try {
      debug('get all medias');
      return dataSources.dataDB.media.findAll();
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get all medias', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves a media item by its ID.
 *
 * @function media
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.id - The ID of the media item to retrieve.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Object>} A promise that resolves to the media object.
 * @throws {ApolloError} If there is an error retrieving the media item.
 */
  media(_, { id }, { dataSources }) {
    try {
      debug(`get media with id ${id}`);
      return dataSources.dataDB.media.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get media with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves all categories.
 *
 * @function categories
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of categories.
 * @throws {ApolloError} If there is an error retrieving categories.
 */
  categories(_, __, { dataSources }) {
    try {
      debug('get all categories');
      return dataSources.dataDB.category.findAll();
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get all categories', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves a category by its ID.
 *
 * @function category
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {number} args.id - The ID of the category to retrieve.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Object>} A promise that resolves to the category object.
 * @throws {ApolloError} If there is an error retrieving the category.
 */
  category(_, { id }, { dataSources }) {
    try {
      debug(`get category with id ${id}`);
      return dataSources.dataDB.category.findByPk(id);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get category with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves jobs by their IDs.
 *
 * @async
 * @function jobs
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {Array<number>} args.ids - The IDs of the jobs to retrieve.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of jobs.
 * @throws {ApolloError} If there is an error retrieving jobs.
 */
  async jobs(_, { ids }, { dataSources }) {
    try {
      debug(`get job with id ${ids}`);
      dataSources.dataDB.job.cache.clear();
      const jobs = await dataSources.dataDB.job.findJobByPK(ids);
      return jobs;
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get job with id', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves requests by job IDs with pagination.
 *
 * @async
 * @function requestsByJob
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} args - The arguments provided to the field in the GraphQL query.
 * @param {Array<number>} args.ids - The IDs of the jobs to retrieve requests for.
 * @param {number} args.offset - The offset for the query.
 * @param {number} args.limit - The limit for the query.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @returns {Promise<Array>} A promise that resolves to an array of requests.
 * @throws {ApolloError} If there is an error retrieving requests.
 */
  async requestsByJob(_, { ids, offset, limit }, { dataSources }) {
    try {
      if (ids.length === 0) {
        return null;
      }
      debug(`get all requests by job_id: ${ids}, offset ${offset}, limit ${limit}`);
      const result = await dataSources.dataDB.request.getRequestByJobId(
        ids,
        dataSources.userData.id,
        offset,
        limit,
      );
      return result;
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get all request by job', { extensions: { code: 'BAD REQUEST' } });
    }
  },
  /**
 * Retrieves all rules from the data source.
 *
 * @async
 * @function rules
 * @param {Object} _ - The parent object, which is not used in this resolver.
 * @param {Object} __ - The arguments provided to the field in the GraphQL query,
 *  which are not used in this resolver.
 * @param {Object} context - The context object,
 * which contains dataSources and other contextual information.
 * @param {Object} context.dataSources - The data sources available in the context.
 * @returns {Promise<Object>} A promise that resolves to the first rule object.
 * @throws {ApolloError} If there is an error retrieving the rules.
 */
  async rules(_, __, { dataSources }) {
    try {
      debug('get all rules');
      const rules = await dataSources.dataDB.rules.findAll();
      return rules[0];
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error get rules', { extensions: { code: 'BAD REQUEST' } });
    }
  },

};

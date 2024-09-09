import Debug from 'debug';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:category`);

const categoryResolver = {
  /**
   * Retrieves all jobs for a given category ID.
   *
   * @param {Object} parent - The parent object,
   * which contains the result returned from the resolver on the parent field.
   * @param {number} parent.id - The ID of the category.
   * @param {Object} args - The arguments provided to the field in the GraphQL query.
   * @param {Object} context - The context object,
   * which contains dataSources and other contextual information.
   * @param {Object} context.dataSources - The data sources available in the context.
   * @returns {Promise<Array>} A promise that resolves to an array of jobs.
   * @throws {ApolloError} If there is an error retrieving the jobs.
   */
  jobs({ id }, _, { dataSources }) {
    try {
      debug(`get all jobs from category: ${id}`);
      return dataSources.dataDB.job.findJobsByCategory(id);
    } catch (error) {
      debug('error', error);
      throw new GraphQLError(error, { extensions: { code: 'BAD REQUEST' } });
    }
  },
};
debug('categoryResolver');
export default categoryResolver;

import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:category`);

const categoryResolver = {
  jobs({ id }, _, { dataSources }) {
    try {
      debug(`get all jobs from category: ${id}`);
      return dataSources.dataDB.job.findJobsByCategory(id);
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error creating contact');
    }
  },
};
debug('categoryResolver');
export default categoryResolver;

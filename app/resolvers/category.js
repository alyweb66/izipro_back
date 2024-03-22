import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:category`);

const categoryResolver = {
  jobs({ id }, _, { dataSources }) {
    debug(`get all jobs from category: ${id}`);
    return dataSources.dataDB.job.findJobsByCategory(id);
  },
};
debug('categoryResolver');
export default categoryResolver;

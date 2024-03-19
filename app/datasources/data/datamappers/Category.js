// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Category`);

class Category extends CoreDatamapper {
  tableName = 'category';
}

export default Category;

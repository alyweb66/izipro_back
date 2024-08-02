// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Category`);

class Rules extends CoreDatamapper {
  tableName = 'rules';
}

export default Rules;

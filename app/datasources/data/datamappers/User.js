// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:User`);

class User extends CoreDatamapper {
  tableName = 'user';
}

export default User;

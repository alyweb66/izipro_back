// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:UserHasHiddingClientRequest`);

class UserHasHiddingClientRequest extends CoreDatamapper {
  tableName = 'user_has_hiddingClientRequest';
}

export default UserHasHiddingClientRequest;

// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Conversation`);

class Conversation extends CoreDatamapper {
  tableName = 'conversation';
}

export default Conversation;

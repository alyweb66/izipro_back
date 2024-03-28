import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request_has_media`);

class RequestHasMedia extends CoreDatamapper {
  tableName = 'request_has_request_media';
}

export default RequestHasMedia;

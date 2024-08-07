// import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

// const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:Category`);

class CookieConsents extends CoreDatamapper {
  tableName = 'cookie_consents';
}

export default CookieConsents;

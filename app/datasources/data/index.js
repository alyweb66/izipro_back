import client from './db/index.js';

import MessageDataMapper from './datamappers/Message.js';
import UserDataMapper from './datamappers/User.js';

class DataDB {
  constructor(options) {
    const newOptions = { ...options };
    newOptions.client = client;
    this.message = new MessageDataMapper(newOptions);
    this.user = new UserDataMapper(newOptions);
  }
}

export default DataDB;

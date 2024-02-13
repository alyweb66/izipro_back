import client from './db/index.js';

import MessageDataMapper from './datamappers/Message.js';

class DataDB {
  constructor(options) {
    const newOptions = { ...options };
    newOptions.client = client;
    this.message = new MessageDataMapper(newOptions);
  }
}

export default DataDB;

import client from './db/index.js';

import MessageDataMapper from './datamappers/Message.js';
import UserDataMapper from './datamappers/User.js';
import RequestDataMapper from './datamappers/Request.js';
import MediaDataMapper from './datamappers/Media.js';

class DataDB {
  constructor(options) {
    const newOptions = { ...options };
    newOptions.client = client;
    this.message = new MessageDataMapper(newOptions);
    this.user = new UserDataMapper(newOptions);
    this.request = new RequestDataMapper(newOptions);
    this.media = new MediaDataMapper(newOptions);
  }
}

export default DataDB;

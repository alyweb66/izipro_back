import requestMutation from './requestMutation.js';
import userMutation from './userMutation.js';
import userHasJobMutation from './userHasJobMutation.js';

export default {
  ...requestMutation,
  ...userMutation,
  ...userHasJobMutation,

};

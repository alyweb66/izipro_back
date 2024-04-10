import requestMutation from './requestMutation.js';
import userMutation from './userMutation.js';
import userHasJobMutation from './userHasJobMutation.js';
import userSettingsMutation from './userSettingsMutation.js';

export default {
  ...requestMutation,
  ...userMutation,
  ...userHasJobMutation,
  ...userSettingsMutation,

};

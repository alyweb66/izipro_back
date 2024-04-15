import requestMutation from './requestMutation.js';
import userMutation from './userMutation.js';
import userHasJobMutation from './userHasJobMutation.js';
import userSettingsMutation from './userSettingsMutation.js';
import userHiddenClientRequestMutation from './userHiddenClientRequestMutation.js';

export default {
  ...requestMutation,
  ...userMutation,
  ...userHasJobMutation,
  ...userSettingsMutation,
  ...userHiddenClientRequestMutation,

};

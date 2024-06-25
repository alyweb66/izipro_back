import { readFileSync } from 'fs';
import path from 'path';
import url from 'url';

// __dirname not on module, this is the way to use it.
const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const Message = readFileSync(path.join(dirname, './Message.gql'), 'utf8');
const Query = readFileSync(path.join(dirname, './Query.gql'), 'utf8');
const User = readFileSync(path.join(dirname, './User.gql'), 'utf8');
const Request = readFileSync(path.join(dirname, './Request.gql'), 'utf8');
const Media = readFileSync(path.join(dirname, './Media.gql'), 'utf8');
const Conversation = readFileSync(path.join(dirname, './Conversation.gql'), 'utf8');
const Category = readFileSync(path.join(dirname, './Category.gql'), 'utf8');
const Job = readFileSync(path.join(dirname, './Job.gql'), 'utf8');
const Mutation = readFileSync(path.join(dirname, './Mutation.gql'), 'utf8');
const UserMutation = readFileSync(path.join(dirname, './UserMutation.gql'), 'utf8');
const RequestMutation = readFileSync(path.join(dirname, './RequestMutation.gql'), 'utf8');
const UserHasJobMutation = readFileSync(path.join(dirname, './UserHasJobMutation.gql'), 'utf8');
const Subscription = readFileSync(path.join(dirname, './Subscription.gql'), 'utf8');
const UserHasJob = readFileSync(path.join(dirname, './UserHasJob.gql'), 'utf8');
const UserSettings = readFileSync(path.join(dirname, './UserSettings.gql'), 'utf8');
const UserSettingsMutation = readFileSync(path.join(dirname, './UserSettingsMutation.gql'), 'utf8');
const UserHasHiddenClientRequest = readFileSync(path.join(dirname, './UserHasHiddenClientRequest.gql'), 'utf8');
const UserHasHiddenClientRequestMutation = readFileSync(path.join(dirname, './UserHasHiddenClientRequestMutation.gql'), 'utf8');
const ConversationMutation = readFileSync(path.join(dirname, './ConversationMutation.gql'), 'utf8');
const MessageMutation = readFileSync(path.join(dirname, './MessageMutation.gql'), 'utf8');
const SubscriptionMutation = readFileSync(path.join(dirname, './SubscriptionMutation.gql'), 'utf8');
const UserHasNotViewedRequest = readFileSync(path.join(dirname, './UserHasNotViewedRequest.gql'), 'utf8');
const UserHasNotViewedRequestMutation = readFileSync(path.join(dirname, './UserHasNotViewedRequestMutation.gql'), 'utf8');
const UserHasNotViewedConversation = readFileSync(path.join(dirname, './UserHasNotViewedConversation.gql'), 'utf8');
const UserHasNotViewedConversationMutation = readFileSync(path.join(dirname, './UserHasNotViewedConversationMutation.gql'), 'utf8');

const schema = `#graphql
scalar validateEmail
scalar validatePassword
scalar validatePostalCode
scalar validateSiret
    ${Message}
    ${User}
    ${Request}
    ${Media}
    ${Conversation}
    ${Category}
    ${Job}
    ${Query}
    ${Mutation}
    ${UserMutation}
    ${RequestMutation}
    ${UserHasJobMutation}
    ${UserHasJob}
    ${UserSettings}
    ${UserSettingsMutation}
    ${UserHasHiddenClientRequest}
    ${UserHasHiddenClientRequestMutation}
    ${ConversationMutation}
    ${MessageMutation}
    ${SubscriptionMutation}
    ${UserHasNotViewedRequest}
    ${UserHasNotViewedRequestMutation}
    ${Subscription}
    ${UserHasNotViewedConversation}
    ${UserHasNotViewedConversationMutation}
`;

export default schema;

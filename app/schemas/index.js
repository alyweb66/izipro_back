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

const schema = `#graphql
    ${Message}
    ${User}
    ${Request}
    ${Media}
    ${Query}
`;

export default schema;

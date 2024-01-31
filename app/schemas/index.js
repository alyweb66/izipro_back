import { readFileSync } from 'fs';
import path from 'path';
import url from 'url';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const Message = readFileSync(path.join(dirname, './Message.gql'), 'utf8');

const schema = `#graphql
    ${Message}
`;

export default schema;

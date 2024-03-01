// server creating
// Environment
import 'dotenv/config.js';
import Debug from 'debug';
// Modules import
import { ApolloServer } from '@apollo/server';

// eslint-disable-next-line import/extensions
import { startStandaloneServer } from '@apollo/server/standalone';
// module to use cache
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
import typeDefs from './app/schemas/index.js';
import resolvers from './app/resolvers/index.js';
import getUserByToken from './app/middleware/getUserByToken.js';
import refreshToken from './app/middleware/refreshToken.js';
// class DataDB from dataSources
import DataDB from './app/datasources/data/index.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);
function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

// The ApolloServer constructor requires two parameters: schema
// definition and set of resolvers.
const server = new ApolloServer({
  cors: {
    origin: ' https://sandbox.embed.apollographql.com', // Allow only this origin
    credentials: true, // Allow cookies to be sent
  },
  typeDefs,
  resolvers,
  debug: process.env.NODE_ENV !== 'production',
  cache: new InMemoryLRUCache({
    maxSize: 2 ** 20 * 100,
    clearOnMutation: true,
  }),
});
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs ApolloServer instance as middleware
//  3. prepares app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  // Context declaration
  context: async ({ req, res }) => {
    // Get the user token from the headers.
    let userData = null;

    const { cache } = server;
    const dataSources = {
      dataDB: new DataDB({ cache }),
      userData,
    };

    if (typeof req.headers.cookie !== 'undefined' && req.headers.cookie !== null && req.headers.cookie !== '') {
      debug('cookie in headers');
      userData = await getUserByToken(req, res, dataSources);
      // if (userData === null) {
      // refreshToken(req, res, dataSources);
      // After refreshing the token, get the user data again
      // userData = getUserByToken(req, res, dataSources);
      // }
    } else {
      debug('no cookie in headers');
    }
    console.log('serveur userdata', userData);

    // Update userData in dataSources
    dataSources.userData = userData;

    return {
      res,
      req,
      dataSources,
    };
  },
  listen: { port: process.env.PORT ?? 3000 },
});

debugInDevelopment('⚠️   Warning:  DEVELOPMENT MODE ON');
debug(`🚀  Server ready at: ${url}`);

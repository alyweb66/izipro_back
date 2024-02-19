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

// class DataDB from dataSources
import DataDB from './app/datasources/data/index.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);

// The ApolloServer constructor requires two parameters: schema
// definition and set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new InMemoryLRUCache({
    maxSize: 2 ** 20 * 100,
  }),
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs ApolloServer instance as middleware
//  3. prepares app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  // Context declaration
  context: async () => {
    const { cache } = server;
    return {
      dataSources: {
        dataDB: new DataDB({ cache }),
      },
    };
  },
  listen: { port: process.env.PORT ?? 3000 },
});

debug(`🚀  Server ready at: ${url}`);

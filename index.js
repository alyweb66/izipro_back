// server creating
// Environment
import 'dotenv/config.js';
import Debug from 'debug';
// Modules import
import { ApolloServer } from '@apollo/server';
// eslint-disable-next-line import/extensions
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
// import { PubSub } from 'graphql-subscriptions';
import http from 'http';

// eslint-disable-next-line import/extensions
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
// import { WebSocketServer } from 'ws';
// eslint-disable-next-line import/extensions
// import { useServer } from 'graphql-ws/lib/use/ws';

// eslint-disable-next-line import/extensions
// import { startStandaloneServer } from '@apollo/server/standalone';
// module to use cache
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
import typeDefs from './app/schemas/index.js';
import resolvers from './app/resolvers/index.js';
import getUserByToken from './app/middleware/getUserByToken.js';

// class DataDB from dataSources
import DataDB from './app/datasources/data/index.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);

const app = express();

app.use(express.json());

// The `listen` method launches a web server.
const httpServer = http.createServer(app);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

// The ApolloServer constructor requires two parameters: schema
// definition and set of resolvers.
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// create a new instance of ApolloServer
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server.

  ],
  cache: new InMemoryLRUCache({
    maxSize: 2 ** 20 * 100,
    clearOnMutation: true,
  }),
});

await server.start();

app.use(
  '/',
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
  // bodyParser.json({ limit: '50mb' }),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      // Get the user token from the headers.
      let userData = null;

      const { cache } = server;
      const dataSources = {
        dataDB: new DataDB({ cache }),
        userData,
      };

      if (req.headers.cookie !== undefined) {
        debug('cookie in headers');
        userData = await getUserByToken(req, res, dataSources);
        // Update userData in dataSources
        dataSources.userData = userData;
      } else {
        debug('no cookie in headers');
        dataSources.userData = null;
        debugInDevelopment('dataSources', dataSources);
      }

      return {
        res,
        req,
        dataSources,
      };
    },
  }),
);

await new Promise((resolve) => { httpServer.listen({ port: process.env.PORT || 4000 }, resolve); });
debugInDevelopment('⚠️   Warning:  DEVELOPMENT MODE ON');
debug(`🚀  Server ready at: http://localhost:${httpServer.address().port}`);

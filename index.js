// server creating
// Environment
import 'dotenv/config.js';
import Debug from 'debug';
// Modules import
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { ApolloServer } from '@apollo/server';
// eslint-disable-next-line import/extensions
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
// import { PubSub } from 'graphql-subscriptions';
import http from 'http';
import path from 'path';
import url from 'url';

// eslint-disable-next-line import/extensions
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
// eslint-disable-next-line import/extensions
import { useServer } from 'graphql-ws/lib/use/ws';

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
import serverLogout from './app/middleware/serverLogout.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

const app = express();

app.use(express.json());

// __dirname not on module, this is the way to use it.
const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use('/public', express.static(path.join(dirname, 'public')));

// middleware to handle file uploads
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

// The `listen` method launches a web server.
const httpServer = http.createServer(app);

// The ApolloServer constructor requires two parameters: schema
// definition and set of resolvers.
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/subscriptions',
});

// Handle incoming connections
wsServer.on('connection', (ws) => {
  console.log('A new client Connected!');
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
});

/* // Log mutation or query data
const logMutationData = (req, res, next) => {
  if (req.method === 'POST') {
    console.log('Mutation data:', req.body);
  }
  next();
};
app.use(logMutationData); */

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);

// create a new instance of ApolloServer
const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
  cache: new InMemoryLRUCache({
    maxSize: 2 ** 20 * 100,
    clearOnMutation: true,
  }),
});
app.use((req, res, next) => {
  console.log('Request headers:', req.headers);
  next();
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
        serverLogout(null, null, { res });
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
debug(`🚀  Subscription ready at: ws//localhost:${httpServer.address().port}/subscriptions`);

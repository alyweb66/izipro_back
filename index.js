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
import cookie from 'cookie';

import typeDefs from './app/schemas/index.js';
import resolvers from './app/resolvers/index.js';
import getUserByToken from './app/middleware/getUserByToken.js';
// class DataDB from dataSources
import DataDB from './app/datasources/data/index.js';
// import serverLogout from './app/middleware/serverLogout.js';
import logger from './app/middleware/logger.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

const app = express();

app.use(express.json());

/* // Middleware pour enregistrer les requêtes HTTP
app.use((req, res, next) => {
  logger.http({
    message: 'HTTP Request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
}); */

// __dirname not on module, this is the way to use it.
const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Initialize cache and dataSources once
const cache = new InMemoryLRUCache({
  maxSize: 2 ** 20 * 100,
  clearOnMutation: true,
});
const dataSources = { dataDB: new DataDB({ cache }) };

// middleware to handle file uploads
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

// Middleware to get user data from token
app.use(async (req, res, next) => {
  if (!req.userData) {
    try {
      if (req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        if (cookies['auth-token']) {
          req.userData = await getUserByToken(req, res, dataSources);
        } else {
          req.userData = null;
        }
      } else {
        req.userData = null;
      }

      // Attach userData to dataSources
      dataSources.userData = req.userData;
    } catch (error) {
      debug('error', error);
      req.userData = null;
    }
  }
  next();
});
// Authentication Middleware
const authenticate = (req, res, next) => {
  if (!req.userData) {
    return res.status(403).send('Access denied');
  }
  return next();
};

// Protect static files route with authentication
app.use('/public', authenticate, express.static(path.join(dirname, 'public')));
app.use('/logo', express.static(path.join(dirname, 'logo')));
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
  // serves expressMiddleware at a different path
  path: '/subscriptions',
});

// Log incoming connections
/* wsServer.on('connection', (ws) => {
  console.log('A new client Connected!');
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
}); */

// Log mutation or query data
/* const logMutationData = (req, res, next) => {
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
    // Plugin personnalisé pour la gestion des erreurs
    {
      async requestDidStart() {
        return {
          async willSendResponse({ response, errors }) {
            if (errors) {
              errors.forEach((error) => {
                logger.error({
                  message: error.message,
                  stack: error.stack,
                  extensions: error.extensions,
                });
              });
            }
          },
        };
      },
    },
  ],
  cache,
});
/* app.use((req, res, next) => {
  console.log('Request headers:', req.headers);
  next();
}); */
await server.start();

app.use(
  '/',
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
  // bodyParser.json({ limit: '50mb' }),
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ res, req, dataSources })
    // let userData = null;
    //  const { cache } = server;
    /* const dataSources = {
        dataDB: new DataDB({ cache }),
        userData: req.userData,
      }; */

    /* // Get the user token from the headers.
      if (req.headers.cookie !== undefined) {
        debug('cookie in headers');
        userData = await getUserByToken(req, res, dataSources);
        // Update userData in dataSources
        dataSources.userData = userData;
      } else {
        debug('no cookie in headers');

        dataSources.userData = null;
        debugInDevelopment('dataSources', dataSources);
      } */

    ,
  }),
);

/* // Middleware to handle errors
//* add next to the parameters to make it an error handler even if it's not used
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log('handling error', err);
  logger.error({
    stack: err,
    name: err.name,

  });
  res.status(500).send('Something broke!');
}); */

await new Promise((resolve) => {
  httpServer.listen({ port: process.env.PORT || 4000 }, resolve);
  logger.info(`Server running on port ${process.env.PORT || 4000}`);
});
logger.info('⚠️   Warning:  DEVELOPMENT MODE ON');
logger.info(`🚀  Server ready at: http://localhost:${httpServer.address().port}`);
logger.info(`🚀  Subscription ready at: ws//localhost:${httpServer.address().port}/subscriptions`);

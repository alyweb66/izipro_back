// server creating
// Environment
import Debug from 'debug';
// Modules import
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { ApolloServer } from '@apollo/server';
// eslint-disable-next-line import/extensions
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
// import { PubSub } from 'graphql-subscriptions';
//* import fs, https for HTTPS server
// import fs from 'fs';
// import https from 'https';
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
import updateLastLoginInDatabase from './app/middleware/lastLogin.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);

const app = express();

//* HTTPS server
// Chemins vers les fichiers de certificat et de clé
/* const key = fs.readFileSync('./server.key');
const cert = fs.readFileSync('./server.cert'); */

app.use(express.json());

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
      // return next(error);
    }
  }
  next();
});

//* middleware to update last login using a Map to limit database calls
// record the last connection in the last 12 hours using a Map
// each time a user makes a request, the last connection time is updated
// the last connection time is updated in the database every 12 hours
const activeUsers = new Map();
// verify interval in milliseconds (12 hours)
const checkInterval = 12 * 60 * 60 * 1000;
// minimum interval to update the last login time in the database (1 minute)
const minUpdateInterval = 60 * 1000;

app.use((req, res, next) => {
  if (req.userData && req.userData.id) {
    const userId = req.userData.id;
    const now = Date.now();
    if (!activeUsers.has(userId) || (now - activeUsers.get(userId)) > minUpdateInterval) {
      activeUsers.set(userId, now);
    }
  }
  next();
});

// configure the interval to update the last login time in the database
setInterval(() => {
  const now = Date.now();
  try {
    activeUsers.forEach((lastActiveTime, userId) => {
      if ((now - lastActiveTime) <= checkInterval) {
        updateLastLoginInDatabase(userId, new Date(lastActiveTime));
      }
    });
    // Clear the map after updating the database
    activeUsers.clear();
  } catch (error) {
    debug('error', error);
  }
}, checkInterval);
//* end of middleware to update last login

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
//* HTTPS server
// const httpServer = https.createServer({ key, cert }, app);
//* HTTP server
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

//* Log incoming connections
/* wsServer.on('connection', (ws) => {
  console.log('A new client Connected!');
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
}); */

//* Log mutation or query data
const logMutationData = (req, res, next) => {
  if (req.method === 'POST') {
    console.log('Mutation data:', req.body);
  }
  next();
};
app.use(logMutationData);

//* log request headers
/* app.use((req, res, next) => {
  console.log('Request headers:', req.headers);
  next();
}); */

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
          async willSendResponse({ errors }) {
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

await server.start();

app.use(
  '/',
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
  // bodyParser.json({ limit: '50mb' }),
  expressMiddleware(server, {
    context: async ({ req, res }) => ({ res, req, dataSources }),
  }),
);

await new Promise((resolve) => {
  httpServer.listen({ port: process.env.PORT || 4000 }, resolve);
  logger.info(`Server running on port ${process.env.PORT || 4000}`);
});
logger.info('⚠️   Warning:  DEVELOPMENT MODE ON');
logger.info(`🚀  Server ready at: http://localhost:${httpServer.address().port}`);
logger.info(`🚀  Subscription ready at: ws//localhost:${httpServer.address().port}/subscriptions`);

/* eslint-disable import/extensions */
// server creating
// Environment
import Debug from "debug";
// Modules import
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { ApolloServer } from "@apollo/server";
import { GraphQLError } from "graphql";
// eslint-disable-next-line import/extensions
import { expressMiddleware } from "@apollo/server/express4";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import express from "express";
//* import fs, https for HTTPS server
import fs from "fs";
// import https from 'https';
import http from "http";
import path from "path";
import url from "url";

// eslint-disable-next-line import/extensions
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";

// eslint-disable-next-line import/extensions
import { useServer } from "graphql-ws/use/ws";

// module to use cache
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
import cookie from "cookie";
import typeDefs from "./app/schemas/index.js";
import resolvers from "./app/resolvers/index.js";
import getUserByToken from "./app/middleware/getUserByToken.js";
import sheduleCleanData from "./app/middleware/cleanOldData.js";
import DataDB from "./app/datasources/data/index.js";
import logger from "./app/middleware/logger.js";
import updateLastLoginInDatabase from "./app/middleware/lastLogin.js";
import { generateAltchaChallenge } from "./app/middleware/altcha.js";

const debug = Debug(`${process.env.DEBUG_MODULE}:httpserver`);

const app = express();

//* VAPID keys for web push notifications
/* const vapidKeys = webPush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey); */
//* VAPID keys for web push notifications

// Trust the first proxy for the IP address and the X-Forwarded-Proto header
// to use express rate limit
app.set("trust proxy", "loopback");

//* HTTPS server
// Chemins vers les fichiers de certificat et de clé
/* const key = fs.readFileSync('./server.key');
const cert = fs.readFileSync('./server.cert'); */
//* HTTPS server

app.use(express.json());

// __dirname not on module, this is the way to use it.
const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Verify if /public/media exists and create it if it doesn't
const mediaPath = path.join(dirname, "public/media");

fs.promises
  .mkdir(mediaPath, { recursive: true })
  .then(() => debug(" public/media folder id ready"))
  .catch((err) =>
    console.error("Error to create directoy:", err)
  );

// Initialize cache and dataSources once
const cache = new InMemoryLRUCache({
  maxSize: 2 ** 20 * 100,
  clearOnMutation: true,
});
const dataSources = { dataDB: new DataDB({ cache }) };

// middleware to handle file uploads
app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));

// Rate limiter middleware for ddos protection
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 10 minutes
  max: 1000, // limit each IP to 1000 requests per windows
  message: "Too many requests from this IP, please try again after 5 minutes",
  headers: true,
});

app.use(limiter);

// List of operations that do not require a token
const allowedOperations = [
  "Login",
  "Rules",
  "ForgotPassword",
  "ResetPassword",
  "ValidateForgotPassword",
  "ConfirmRegisterEmail",
  "Register",
  "ProRegister",
  "ContactEmail",
];

// Middleware to get user data from token
app.use(async (req, res, next) => {
  // create and initialize req.authenticateError to false
  // req.authenticateError = false;
  // check if the request is an OPTIONS request to limit the number of database calls
  // OPTIONS is the first request made by the browser to check if the server accepts the request
  if (
    req.method === "OPTIONS" ||
    req.path.startsWith("/.well-known/acme-challenge")
  ) {
    dataSources.userData = null;
    return next();
  }

  if (!req.userData) {
    try {
      if (req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        if (cookies["auth-token"] && req.body.operationName !== "Login") {
          req.userData = await getUserByToken(req, res, dataSources);

          if (!req.userData) {
            setTimeout(() => {
              req.authError = true;
              req.userData = null;
            }, 1000);
          }
        } else if (!allowedOperations.includes(req.body.operationName)) {
          req.authError = true;
          req.userData = null;
        }
      } else if (!allowedOperations.includes(req.body.operationName)) {
        req.authError = true;
        req.userData = null;
      }

      // Attach userData to dataSources
      dataSources.userData = req.userData;

      // next();
    } catch (error) {
      debug("error", error);
      logger.error({
        message: error.message,
        stack: error.stack,
        extensions: error.extensions,
      });
      // res.status(401).send('Authentication error');
      next(error);
      req.userData = null;
    }
  }

  return next();
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

//* Middleware to update the last login time in the database
app.use((req, res, next) => {
  if (req.userData && req.userData.id) {
    const userId = req.userData.id;
    const now = Date.now();
    if (
      !activeUsers.has(userId) ||
      now - activeUsers.get(userId) > minUpdateInterval
    ) {
      activeUsers.set(userId, now);
    }
  }
  next();
});

// check and clean old data
sheduleCleanData(dataSources);

// configure the interval to update the last login time in the database
setInterval(() => {
  const now = Date.now();
  try {
    activeUsers.forEach((lastActiveTime, userId) => {
      if (now - lastActiveTime <= checkInterval) {
        updateLastLoginInDatabase(userId, new Date(lastActiveTime));
      }
    });
    // Clear the map after updating the database
    activeUsers.clear();
  } catch (error) {
    debug("error", error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }
}, checkInterval);
//* end of middleware to update last login

// Authentication Middleware
const authenticate = (req, res, next) => {
  if (!req.userData) {
    return res.status(403).send("Access denied");
  }
  return next();
};

// Protect static files route with authentication
app.use("/public", authenticate, express.static(path.join(dirname, "public")));
// Access to letsencrypt challenge folder for SSL certificate
app.use(
  "/.well-known/acme-challenge",
  express.static(path.join(dirname, ".well-known/acme-challenge"))
);
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
  path: "/subscriptions",
});

//* Log incoming connections subscribers
/* wsServer.on('connection', (ws) => {
  console.log('A new client Connected!');
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
}); */

//* Log mutation or query data
/* const logMutationData = (req, res, next) => {
  if (req.method === 'POST') {
    console.log('Mutation data:', req.body);
  }
  next();
};
app.use(logMutationData); */

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
  formatError: (err) => {
    // Check if the error is a GraphQLError
    if (err.extensions && err.extensions.code) {
      return {
        message: err.message,
        code: err.extensions.code,
        httpStatus: err.extensions.httpStatus || 500,
        path: err.path,
        locations: err.locations,
      };
    }

    // Return the error if it is not a GraphQLError
    return err;
  },
  plugins: [
    // Disable the Apollo Studio landing page
    ApolloServerPluginLandingPageDisabled(),
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
    // custom plugin to log errors
    {
      async requestDidStart() {
        return {
          async didEncounterErrors(ctx) {
            const { errors } = ctx;

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

//* add s to http://localhost:5173 if https enabled in local
app.use((req, res, next) => {
  if (req.path.startsWith("/.well-known/acme-challenge")) {
    next(); // Ignore ignore restrictions for Let's Encrypt
  } else {
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          "http://localhost:5173",
          "http://localhost:5174",
        ];
        if (process.env.NODE_ENV !== "development") {
          allowedOrigins.push(process.env.CORS_ORIGIN);
        }
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      exposedHeaders: ["X-Session-ID"],
    })(req, res, next);
  }
});
// Route pour récupérer un challenge ALTCHA
app.get("/altcha-challenge", async (req, res) => {
  try {
    const challenge = await generateAltchaChallenge();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: "Error during generate challenge" });
  }
});
// use the applyMiddleware method to connect ApolloServer to Express
app.use(
  // bodyParser.json({ limit: '50mb' }),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      // if error from cookie control
      if (req.authError) {
        const error = new GraphQLError("No token provided", {
          extensions: {
            code: "UNAUTHENTICATED",
            http: {
              status: 401,
            },
          },
        });
        debug("error", error);
        // Log the error
        logger.error({
          message: error.message,
          stack: error.stack,
          extensions: error.extensions,
        });

        throw error;
      }

      // put sessionId of browser in headers
      const cookies = cookie.parse(req.headers.cookie || "");
      const sessionId = cookies["session-id"] || "";

      // Add the session ID to the response header if it exists
      if (sessionId && !allowedOperations.includes(req.body.operationName)) {
        res.setHeader("X-Session-ID", sessionId);
      } else {
        debug("No sessionId found in cookies");
      }

      // input authentifield user data in context
      return {
        req,
        res,
        dataSources,
      };
    },
  })
);

await new Promise((resolve) => {
  httpServer.listen({ port: process.env.PORT || 4000 }, resolve);
  logger.info(`Server running on port ${process.env.PORT || 4000}`);
});
logger.info("⚠️   Warning:  DEVELOPMENT MODE ON");
logger.info(
  `🚀  Server ready at: http://localhost:${httpServer.address().port}`
);
logger.info(
  `🚀  Subscription ready at: ws//localhost:${
    httpServer.address().port
  }/subscriptions`
);

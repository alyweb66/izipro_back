import winston from 'winston';

const {
  combine,
  json,
  timestamp,
  colorize,
  printf,
} = winston.format;

const logger = winston.createLogger({
  level: 'error',
  // ! Please note the order of the methods is important
  // ! the final format must be the last one provided
  // (json, simple…)
  format: combine(
    timestamp(),
    json(),
  ),
  defaultMeta: { service: 'izipro' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    /*  new winston.transports.File({
      filename: 'logs/http.log',
      level: 'http',
    }), */
    new winston.transports.File({
      filename: 'logs/infoServer.log',
      level: 'info',

    }),
  ],
});

const consoleErrorFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, timestamp, name, stack,
}) => `[${timestamp}] ${level}(${name}) - ${stack}`);

/* const consoleHttpFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, timestamp, message, method, ip, os,
}) => `[${timestamp}] ${level} - ${ip} ${os} ${method} ${message}`); */

const consoleServerStartFormat = printf(({
  level, timestamp: serverTimestamp, message,
}) => `[${serverTimestamp}] ${level} - ${message}`);

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    level: 'error',
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:ss' }),
      consoleErrorFormat,
    ),
  }));
  /* logger.add(new winston.transports.Console({
    level: 'http',
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:ss' }),
      consoleHttpFormat,
    ),
  })); */
  logger.add(new winston.transports.Console({
    level: 'info',
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleServerStartFormat,
    ),
  }));
}

export default logger;

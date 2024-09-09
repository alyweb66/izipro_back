import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD', // Rotation quotidienne
      zippedArchive: true, // Compresser les anciens fichiers de log
      maxSize: '20m', // Taille max de chaque fichier
      maxFiles: '14d', // Garder les logs pour 14 jours
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
  ],
});

const consoleErrorFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, timestamp, stack, extensions,
}) => {
  // Construire le message de log avec les informations supplémentaires
  let logMessage = `[${timestamp}] ${level} - ${stack} -`;

  if (extensions) {
    logMessage += ` | extensions: ${JSON.stringify(extensions)}`;
  }

  return logMessage;
});

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

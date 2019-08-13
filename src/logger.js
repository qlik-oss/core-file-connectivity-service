const winston = require('winston');

const specLogger = winston.format((info) => ({
  logseverity: info.level.toUpperCase(),
  timestamp: new Date(Date.now()).toISOString(),
  message: info.message,
}));

/**
 * Class providing a shared logger instance to be used in all files.
 */
class Logger {
  /**
   * Gets the shared logger instance.
   * @returns {object} The logger object, winston API.
   */
  static get() {
    if (!Logger.logger) {
      Logger.logger = winston.createLogger({
        transports: [
          new winston.transports.Console({
            level: process.env.OUTHAUL_LOG_LEVEL || 'info',
            humanReadableUnhandledException: true,
            format: winston.format.combine(specLogger(), winston.format.json()),
          }),
        ],
      });
    }
    return Logger.logger;
  }
}

module.exports = Logger;

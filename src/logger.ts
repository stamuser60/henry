import { createLogger, LogLevel } from '@stamscope/jslogger';
import { HENRY_LOG_LEVEL } from './config';

const logger = createLogger({ serviceName: 'Henry' });

/**
 * Returns the logger for the application.
 * @param level: log level that we want to see.
 */
function getLogLevel(level: string): LogLevel {
  const levels = ['info', 'error', 'warn', 'silly', 'verbose', 'debug'];
  if (levels.includes(level)) {
    return level as LogLevel;
  }
  logger.warn(`LOG_LEVEL can be only one of ${levels}, received ${level}`);
  return 'info';
}
if (HENRY_LOG_LEVEL) {
  logger.level = getLogLevel(HENRY_LOG_LEVEL);
}

export default logger;

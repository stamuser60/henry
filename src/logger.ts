import { createLogger, LogLevel } from '@stamscope/jslogger';
import { CPR_LOG_LEVEL } from './config';

const logger = createLogger({ serviceName: 'MPP' });

function getLogLevel(level: string): LogLevel {
  const levels = ['info', 'error', 'warn', 'silly', 'verbose', 'debug'];
  if (levels.includes(level)) {
    return level as LogLevel;
  }
  logger.warn(`LOG_LEVEL can be only one of ${levels}, received ${level}`);
  return 'info';
}
if (CPR_LOG_LEVEL) {
  logger.level = getLogLevel(CPR_LOG_LEVEL);
}

export default logger;

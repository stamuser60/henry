export function getEnv(name: string, defaultValue?: string): string {
  const errMsg = `Please define ${name}`;
  const env = process.env[name];
  if (!env) {
    if (defaultValue) {
      return defaultValue;
    }
    throw Error(errMsg);
  }
  return env;
}

export const CPR_LOG_LEVEL = getEnv('CPR_LOG_LEVEL', 'info');

export const ALERT_KAFKA_CONN = getEnv('ALERT_KAFKA_CONN');
export const ALERT_KAFKA_TOPIC = getEnv('ALERT_KAFKA_TOPIC');
export const ALERT_KAFKA_GROUP_ID = getEnv('ALERT_KAFKA_GROUP_ID');
export const INFO_KAFKA_CONN = getEnv('INFO_KAFKA_CONN');
export const INFO_KAFKA_TOPIC = getEnv('INFO_KAFKA_TOPIC');
export const INFO_KAFKA_GROUP_ID = getEnv('INFO_KAFKA_GROUP_ID');

export const SQL_DB_HOST = getEnv('SQL_DB_HOST');
export const SQL_DB_PORT = parseInt(getEnv('SQL_DB_PORT'));
export const SQL_DB_USERNAME = getEnv('SQL_DB_USERNAME');
export const SQL_DB_PASSWORD = getEnv('SQL_DB_PASSWORD');
export const SQL_DB_DATABASE = getEnv('SQL_DB_DATABASE');
export const SQL_INSERT_RETRY_INTERVAL_MS = parseInt(getEnv('SQL_INSERT_RETRY_INTERVAL_MS', '1000'));

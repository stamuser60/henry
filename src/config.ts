function getEnv(name: string, defaultValue?: string): string {
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

function getEnv(name: string, errMsg?: string): string {
  if (typeof errMsg === 'undefined') {
    errMsg = `Please define ${name}`;
  }
  const env = process.env[name];
  if (!env) {
    throw Error(errMsg);
  }
  return env;
}

export const CPR_KAFKA_CONN = getEnv('CPR_KAFKA_CONN');
export const CPR_KAFKA_TOPIC = getEnv('CPR_KAFKA_TOPIC');
export const CPR_KAFKA_GROUP_ID = getEnv('CPR_KAFKA_GROUP_ID');

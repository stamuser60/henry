/**
 * Responsible for running the application is server.ts file
 */

import app from './server';
import logger from '../logger';
import { startConsumingAlerts } from '../api/kafka';

startConsumingAlerts();

const PORT = process.env.APP_PORT || 4000;
app.listen(PORT, function() {
  logger.info(`Listening on port ${PORT}`);
});
